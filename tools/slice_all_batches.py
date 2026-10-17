#!/usr/bin/env python3
"""
Precision Dynamic Programming (Viterbi) Batch Audio Slicer & WSOLA Pitch Shifter.
Automatically detects speech islands, removes isolated `<long pause>` breath artifacts,
partitions the remaining islands into the exact N turns using expected transcript length
and inter-turn silence gap duration, and writes each character's pitch-shifted WAV.
"""

from __future__ import annotations

import re
import sys
import wave
from pathlib import Path
from typing import Any

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, "/home/fabian/.gemini/config/plugins/gemini-tts-studio/server")

from build_video_audio import CHARACTER_PROFILES, LINE_ACTING_MAP, STAGE_SFX_CLIPS  # noqa: E402
from mcp_server import write_audio_file  # noqa: E402

AUDIO_DIR = ROOT / "video" / "audio"


def expected_weight(tagged_text: str) -> float:
    clean = re.sub(r"<[^>]+>", " ", tagged_text)
    words = [w for w in re.split(r"\s+", clean.strip()) if w]
    char_cnt = sum(len(w) for w in words)
    # Count vocal tags that take audible time
    laughs = len(re.findall(r"<(?:laugh|chuckle|cheer|sob|sigh|gasp)>", tagged_text))
    short_pauses = len(re.findall(r"<short pause>", tagged_text))
    return max(1.2, len(words) * 0.32 + char_cnt * 0.045 + laughs * 0.65 + short_pauses * 0.35)


def extract_speech_islands(
    wav_path: Path,
    min_silence_sec: float = 0.36,
    thresh_ratio: float = 0.042,
) -> tuple[int, bytes, list[dict[str, float]]]:
    with wave.open(str(wav_path), "rb") as wf:
        sr = wf.getframerate()
        raw = wf.readframes(wf.getnframes())
    pcm = np.frombuffer(raw, dtype=np.int16).astype(np.float32)
    win = int(sr * 0.02)
    hop = int(sr * 0.01)
    n_frames = max(1, (len(pcm) - win) // hop + 1)
    rms = np.array([np.sqrt(np.mean(pcm[i * hop : i * hop + win] ** 2)) for i in range(n_frames)])
    p85 = float(np.percentile(rms, 85)) if len(rms) else 1000.0
    thresh = max(p85 * thresh_ratio, 115.0)
    is_speech = rms > thresh

    min_sil_frames = int(min_silence_sec / 0.01)
    islands: list[dict[str, float]] = []
    in_seg = False
    seg_start = 0
    sil_count = 0

    for i, sp in enumerate(is_speech):
        if sp:
            if not in_seg:
                in_seg = True
                seg_start = i
            sil_count = 0
        else:
            if in_seg:
                sil_count += 1
                if sil_count >= min_sil_frames:
                    seg_end = i - sil_count + 1
                    dur = (seg_end - seg_start) * 0.01
                    if dur >= 0.20:
                        seg_rms = rms[seg_start:seg_end]
                        islands.append({
                            "s": round(seg_start * 0.01, 3),
                            "e": round(seg_end * 0.01, 3),
                            "dur": round(dur, 3),
                            "max_rms": float(np.max(seg_rms)) if len(seg_rms) else 0.0,
                            "mean_rms": float(np.mean(seg_rms)) if len(seg_rms) else 0.0,
                        })
                    in_seg = False
                    sil_count = 0
    if in_seg:
        seg_end = n_frames
        dur = (seg_end - seg_start) * 0.01
        if dur >= 0.20:
            seg_rms = rms[seg_start:seg_end]
            islands.append({
                "s": round(seg_start * 0.01, 3),
                "e": round(seg_end * 0.01, 3),
                "dur": round(dur, 3),
                "max_rms": float(np.max(seg_rms)) if len(seg_rms) else 0.0,
                "mean_rms": float(np.mean(seg_rms)) if len(seg_rms) else 0.0,
            })

    return sr, raw, islands


def filter_breath_artifacts(
    islands: list[dict[str, float]],
    target_n: int,
    allow_very_short_lines: bool = False,
) -> list[dict[str, float]]:
    if len(islands) <= target_n:
        return islands

    max_dur = 0.42 if allow_very_short_lines else 0.66
    filtered: list[dict[str, float]] = []
    for idx, isl in enumerate(islands):
        gap_before = isl["s"] - islands[idx - 1]["e"] if idx > 0 else 1.0
        gap_after = islands[idx + 1]["s"] - isl["e"] if idx < len(islands) - 1 else 1.0
        # An isolated short breath between two pauses (`<long pause>` gasp artifact)
        if isl["dur"] <= max_dur and gap_before >= 0.42 and gap_after >= 0.45:
            continue
        filtered.append(isl)

    if len(filtered) >= target_n:
        return filtered
    return islands


def align_islands_to_items(
    wav_path: Path,
    items_meta: list[dict[str, Any]],
    allow_very_short_lines: bool = False,
) -> tuple[int, bytes, list[tuple[float, float]]]:
    n_items = len(items_meta)
    sr, raw, raw_islands = extract_speech_islands(wav_path, min_silence_sec=0.36)
    islands = filter_breath_artifacts(raw_islands, n_items, allow_very_short_lines=allow_very_short_lines)

    # If still fewer islands than n_items, reduce min_silence_sec
    if len(islands) < n_items:
        sr, raw, raw_islands = extract_speech_islands(wav_path, min_silence_sec=0.22)
        islands = filter_breath_artifacts(raw_islands, n_items, allow_very_short_lines=True)

    m = len(islands)
    if m < n_items:
        raise RuntimeError(f"{wav_path.name}: Found only {m} islands for {n_items} items: {islands}")

    weights = np.array([expected_weight(it["text"]) for it in items_meta], dtype=np.float64)
    total_spoken = sum(isl["dur"] for isl in islands)
    expected_durs = total_spoken * (weights / np.sum(weights))

    # Dynamic Programming: dp[k][j] = min cost to cover items 0..k using islands 0..j
    INF = 1e18
    dp = np.full((n_items, m), INF, dtype=np.float64)
    parent = np.full((n_items, m), -1, dtype=np.int32)

    def group_cost(k: int, i: int, j: int) -> float:
        spoken_dur = sum(islands[x]["dur"] for x in range(i, j + 1))
        exp_d = expected_durs[k]
        rel_err = (spoken_dur - exp_d) / max(exp_d, 1.1)
        cost = 3.0 * (rel_err ** 2)

        # Penalize merging across large internal gaps
        for x in range(i, j):
            g = islands[x + 1]["s"] - islands[x]["e"]
            if g > 0.75:
                cost += 12.0 * (g ** 2)
            elif g > 0.35:
                cost += 2.5 * ((g - 0.30) ** 2)

        # Reward splitting at a large boundary gap after island j
        if j < m - 1:
            boundary_gap = islands[j + 1]["s"] - islands[j]["e"]
            cost -= 3.2 * min(boundary_gap, 2.2)
            if boundary_gap < 0.38:
                cost += 6.0 * ((0.45 - boundary_gap) ** 2)
        return cost

    for j in range(0, m - (n_items - 1)):
        dp[0, j] = group_cost(0, 0, j)

    for k in range(1, n_items):
        for j in range(k, m - (n_items - 1 - k)):
            best_c = INF
            best_i = -1
            for i in range(k, j + 1):
                prev = dp[k - 1, i - 1]
                if prev >= INF:
                    continue
                c = prev + group_cost(k, i, j)
                if c < best_c:
                    best_c = c
                    best_i = i
            dp[k, j] = best_c
            parent[k, j] = best_i

    # Backtrack from (n_items - 1, m - 1)
    bounds: list[tuple[float, float]] = []
    curr_j = m - 1
    for k in range(n_items - 1, -1, -1):
        curr_i = int(parent[k, curr_j]) if k > 0 else 0
        s_sec = islands[curr_i]["s"]
        e_sec = islands[curr_j]["e"]
        bounds.append((s_sec, e_sec))
        curr_j = curr_i - 1
    bounds.reverse()
    return sr, raw, bounds


def slice_batch(
    wav_path: Path,
    items_meta: list[dict[str, Any]],
    allow_very_short_lines: bool = False,
    dry_run: bool = False,
) -> None:
    if not wav_path.exists():
        print(f"[MISSING] {wav_path.name} not found yet.")
        return
    sr, raw, bounds = align_islands_to_items(
        wav_path, items_meta, allow_very_short_lines=allow_very_short_lines
    )
    print(f"=== {wav_path.name} ({len(items_meta)} items) ===")
    for it, (s_sec, e_sec) in zip(items_meta, bounds):
        out_path: Path = it["out_path"]
        pitch_st: float = it["pitch_st"]
        s_idx = max(0, int((s_sec - 0.04) * sr)) * 2
        e_idx = min(len(raw), int((e_sec + 0.06) * sr) * 2)
        chunk = raw[s_idx:e_idx]
        if dry_run:
            print(f"  [DRY] {out_path.name}: {s_sec:.2f}s .. {e_sec:.2f}s (dur={e_sec-s_sec:.2f}s) | {it['text'][:55]}")
        else:
            dur = write_audio_file(out_path, chunk, mime_type="audio/wav", sample_rate=sr, pitch_semitones=pitch_st)
            print(f"  [SAVED] {out_path.name}: {s_sec:.2f}s .. {e_sec:.2f}s (dur={dur:.2f}s, +{pitch_st}st) | {it['text'][:50]}")


def build_batch_manifests() -> list[tuple[Path, list[dict[str, Any]], bool]]:
    def line_item(lid: int, char_key: str, pitch_override: float | None = None) -> dict[str, Any]:
        pitch_st = pitch_override if pitch_override is not None else CHARACTER_PROFILES[char_key]["pitch_semitones"]
        _, tagged = LINE_ACTING_MAP[lid]
        return {
            "id": lid,
            "out_path": AUDIO_DIR / f"l{lid:03d}.wav",
            "pitch_st": pitch_st,
            "text": tagged,
        }

    # Batch 1: THORWALD (11 lines + sfx_11_laugh)
    b1_lids = [28, 59, 61, 76, 82, 84, 86, 99, 102, 106, 116]
    b1_meta = [line_item(lid, "THORWALD") for lid in b1_lids]
    b1_meta.append({
        "id": "sfx_11",
        "out_path": AUDIO_DIR / STAGE_SFX_CLIPS[0]["fname"],
        "pitch_st": STAGE_SFX_CLIPS[0]["pitch_st"],
        "text": STAGE_SFX_CLIPS[0]["text"],
    })

    # Batch 4: JEFF (11) + LISA (5)
    b4_meta = [line_item(lid, "JEFF") for lid in [17, 25, 27, 29, 51, 77, 83, 97, 103, 111, 123]] + [
        line_item(lid, "LISA") for lid in [50, 70, 91, 107, 120]
    ]

    # Batch 5: DIRECTOR (10) + MAKEUP_MASTER (4)
    b5_meta = [line_item(lid, "DIRECTOR") for lid in [30, 34, 43, 56, 58, 73, 88, 100, 104, 124]] + [
        line_item(lid, "MAKEUP_MASTER") for lid in [46, 66, 90, 118]
    ]

    # Batch 6: CAMERA_MAN (7) + DETECTIVE (5)
    b6_meta = [line_item(lid, "CAMERA_MAN") for lid in [33, 49, 69, 78, 80, 95, 117]] + [
        line_item(lid, "DETECTIVE") for lid in [48, 60, 93, 109, 122]
    ]

    # Batch 7: MISS_LONELYHEARTS (8) + ARTIST (6, using Orus shifted +3.1st)
    b7_meta = [line_item(lid, "MISS_LONELYHEARTS") for lid in [36, 38, 40, 42, 44, 52, 96, 114]] + [
        line_item(lid, "ARTIST", pitch_override=3.1) for lid in [37, 39, 41, 45, 94, 115]
    ]

    # Batch 8: Remaining 8 Stage SFX clips
    b8_meta = [
        {
            "id": clip["fname"],
            "out_path": AUDIO_DIR / clip["fname"],
            "pitch_st": clip["pitch_st"],
            "text": clip["text"],
        }
        for clip in STAGE_SFX_CLIPS[1:]
    ]

    return [
        (AUDIO_DIR / "batch_1_thorwald.wav", b1_meta, False),
        (AUDIO_DIR / "batch_4_jeff_lisa.wav", b4_meta, False),
        (AUDIO_DIR / "batch_5_director_makeup.wav", b5_meta, False),
        (AUDIO_DIR / "batch_6_cameraman_detective.wav", b6_meta, False),
        (AUDIO_DIR / "batch_7_lonelyhearts_artist.wav", b7_meta, False),
        (AUDIO_DIR / "batch_8_sfx.wav", b8_meta, True),
    ]


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    for wav_p, meta, short_ok in build_batch_manifests():
        slice_batch(wav_p, meta, allow_very_short_lines=short_ok, dry_run=dry)
