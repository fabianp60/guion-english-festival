#!/usr/bin/env python3
"""
Synthesize the remaining 67 dialogue lines + 9 stage SFX clips in 6 batched API calls
to respect the Google AI Studio Free Tier quota (10 RPD / 3 RPM per model).
Automatically falls back from `gemini-3.8-flash-lite-tts` to `gemini-3.1-flash-tts-preview`
if daily quota on the primary model is reached.
"""

from __future__ import annotations

import base64
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, "/home/fabian/.gemini/config/plugins/gemini-tts-studio/server")

from build_video_audio import CHARACTER_PROFILES, LINE_ACTING_MAP, STAGE_SFX_CLIPS, parse_lines  # noqa: E402
from mcp_server import resolve_api_key  # noqa: E402

AUDIO_DIR = ROOT / "video" / "audio"
MODELS = ["gemini-3.8-flash-lite-tts", "gemini-3.1-flash-tts-preview"]


def build_single_speaker_payload(voice_id: str, items: list[tuple[str, str]], model: str) -> dict:
    content = []
    for idx, (style, text) in enumerate(items):
        suffix = " <long pause>" if idx < len(items) - 1 else ""
        content.append({
            "type": "text",
            "text": text + suffix,
            "annotations": [{"type": "speech_metadata", "style": style}],
        })
    return {
        "model": model,
        "input": [{"type": "user_input", "content": content}],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": voice_id}]},
    }


def build_two_speaker_payload(
    speakers_cfg: list[dict[str, str]],
    items: list[tuple[str, str, str]],
    model: str,
) -> dict:
    content = []
    for idx, (spk, style, text) in enumerate(items):
        suffix = " <long pause>" if idx < len(items) - 1 else ""
        content.append({
            "type": "text",
            "text": text + suffix,
            "annotations": [
                {
                    "type": "speech_metadata",
                    "speaker": spk,
                    "style": style,
                }
            ],
        })
    return {
        "model": model,
        "input": [{"type": "user_input", "content": content}],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": {"speakers": speakers_cfg}},
    }


def call_interactions_api(payload_fn, out_path: Path, api_key: str, model_idx: int = 0) -> int:
    if out_path.exists() and out_path.stat().st_size > 10000:
        print(f"[SKIP] {out_path.name} already exists ({out_path.stat().st_size} bytes)", flush=True)
        return model_idx

    url = "https://generativelanguage.googleapis.com/v1beta/interactions"
    while model_idx < len(MODELS):
        model = MODELS[model_idx]
        payload = payload_fn(model)
        for attempt in range(1, 5):
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "x-goog-api-key": api_key,
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            try:
                t0 = time.time()
                with urllib.request.urlopen(req, timeout=90) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                audio_b64 = None
                for step in body.get("steps", []):
                    for c in step.get("content", []):
                        if c.get("type") == "audio" and c.get("data"):
                            audio_b64 = c["data"]
                if not audio_b64 and body.get("output_audio", {}).get("data"):
                    audio_b64 = body["output_audio"]["data"]
                if not audio_b64:
                    raise RuntimeError(f"No audio data in response: {list(body.keys())}")
                wav_bytes = base64.b64decode(audio_b64)
                out_path.write_bytes(wav_bytes)
                elapsed = time.time() - t0
                print(
                    f"[OK] {out_path.name} via {model} in {elapsed:.1f}s ({len(wav_bytes)} bytes)",
                    flush=True,
                )
                return model_idx
            except urllib.error.HTTPError as e:
                err_txt = e.read().decode("utf-8", errors="replace")
                print(f"[HTTP {e.code}] {out_path.name} ({model}, attempt {attempt}): {err_txt[:220]}", flush=True)
                if e.code == 429:
                    if "per day" in err_txt.lower() or "per_day" in err_txt.lower():
                        print(f"Switching model from {model} due to daily limit...", flush=True)
                        model_idx += 1
                        break
                    else:
                        print("Waiting 24s for RPM window...", flush=True)
                        time.sleep(24)
                else:
                    time.sleep(5)
            except Exception as e:
                print(f"[ERR] {out_path.name} ({model}, attempt {attempt}): {e}", flush=True)
                time.sleep(5)
        else:
            model_idx += 1

    raise RuntimeError(f"Failed to synthesize {out_path.name} across all models.")


def main() -> None:
    api_key, _ = resolve_api_key()
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY")

    lines_by_id = {x["id"]: x for x in parse_lines() if x["type"] == "line"}

    def item_for_lid(lid: int, char_key: str) -> tuple[str, str]:
        base_style = CHARACTER_PROFILES[char_key]["default_style"]
        act_style, tagged = LINE_ACTING_MAP[lid]
        return f"{base_style}, {act_style}", tagged

    # 1. Batch 1: THORWALD (11 lines + sfx_11_laugh)
    b1_lids = [28, 59, 61, 76, 82, 84, 86, 99, 102, 106, 116]
    b1_items = [item_for_lid(lid, "THORWALD") for lid in b1_lids]
    sfx11 = STAGE_SFX_CLIPS[0]
    b1_items.append((sfx11["style"], sfx11["text"]))

    # 2. Batch 4: JEFF (11) + LISA (5)
    b4_jeff = [17, 25, 27, 29, 51, 77, 83, 97, 103, 111, 123]
    b4_lisa = [50, 70, 91, 107, 120]
    b4_items = [("JEFF", *item_for_lid(lid, "JEFF")) for lid in b4_jeff] + [
        ("LISA", *item_for_lid(lid, "LISA")) for lid in b4_lisa
    ]
    b4_speakers = [
        {"speaker": "JEFF", "voice": "Fenrir"},
        {"speaker": "LISA", "voice": "Aoede"},
    ]

    # 3. Batch 5: DIRECTOR (10) + MAKEUP_MASTER (4)
    b5_dir = [30, 34, 43, 56, 58, 73, 88, 100, 104, 124]
    b5_mkp = [46, 66, 90, 118]
    b5_items = [("DIRECTOR", *item_for_lid(lid, "DIRECTOR")) for lid in b5_dir] + [
        ("MAKEUP_MASTER", *item_for_lid(lid, "MAKEUP_MASTER")) for lid in b5_mkp
    ]
    b5_speakers = [
        {"speaker": "DIRECTOR", "voice": "Puck"},
        {"speaker": "MAKEUP_MASTER", "voice": "Leda"},
    ]

    # 4. Batch 6: CAMERA_MAN (7) + DETECTIVE (5)
    b6_cam = [33, 49, 69, 78, 80, 95, 117]
    b6_det = [48, 60, 93, 109, 122]
    b6_items = [("CAMERA_MAN", *item_for_lid(lid, "CAMERA_MAN")) for lid in b6_cam] + [
        ("DETECTIVE", *item_for_lid(lid, "DETECTIVE")) for lid in b6_det
    ]
    b6_speakers = [
        {"speaker": "CAMERA_MAN", "voice": "Autonoe"},
        {"speaker": "DETECTIVE", "voice": "Zephyr"},
    ]

    # 5. Batch 7: MISS_LONELYHEARTS (8) + ARTIST (6)
    b7_lon = [36, 38, 40, 42, 44, 52, 96, 114]
    b7_art = [37, 39, 41, 45, 94, 115]
    b7_items = [
        ("MISS_LONELYHEARTS", *item_for_lid(lid, "MISS_LONELYHEARTS")) for lid in b7_lon
    ] + [("ARTIST", *item_for_lid(lid, "ARTIST")) for lid in b7_art]
    b7_speakers = [
        {"speaker": "MISS_LONELYHEARTS", "voice": "Callirrhoe"},
        {"speaker": "ARTIST", "voice": "Orus"},
    ]

    # 6. Batch 8: Remaining 8 Stage SFX clips (GIRL=Leda, BOY=Puck)
    b8_items = [
        ("GIRL", STAGE_SFX_CLIPS[1]["style"], STAGE_SFX_CLIPS[1]["text"]),  # sfx_98_laugh_a
        ("BOY", STAGE_SFX_CLIPS[2]["style"], STAGE_SFX_CLIPS[2]["text"]),   # sfx_98_laugh_b
        ("GIRL", STAGE_SFX_CLIPS[3]["style"], STAGE_SFX_CLIPS[3]["text"]),  # sfx_105_cheer_a
        ("BOY", STAGE_SFX_CLIPS[4]["style"], STAGE_SFX_CLIPS[4]["text"]),   # sfx_105_cheer_b
        ("GIRL", STAGE_SFX_CLIPS[5]["style"], STAGE_SFX_CLIPS[5]["text"]),  # sfx_105_cheer_c
        ("BOY", STAGE_SFX_CLIPS[6]["style"], STAGE_SFX_CLIPS[6]["text"]),   # sfx_105_cheer_d
        ("GIRL", STAGE_SFX_CLIPS[7]["style"], STAGE_SFX_CLIPS[7]["text"]),  # sfx_126_finale_a
        ("BOY", STAGE_SFX_CLIPS[8]["style"], STAGE_SFX_CLIPS[8]["text"]),   # sfx_126_finale_b
    ]
    b8_speakers = [
        {"speaker": "GIRL", "voice": "Leda"},
        {"speaker": "BOY", "voice": "Puck"},
    ]

    jobs = [
        (
            AUDIO_DIR / "batch_1_thorwald.wav",
            lambda m: build_single_speaker_payload("voice_h1gy5gzssuj6", b1_items, m),
        ),
        (
            AUDIO_DIR / "batch_4_jeff_lisa.wav",
            lambda m: build_two_speaker_payload(b4_speakers, b4_items, m),
        ),
        (
            AUDIO_DIR / "batch_5_director_makeup.wav",
            lambda m: build_two_speaker_payload(b5_speakers, b5_items, m),
        ),
        (
            AUDIO_DIR / "batch_6_cameraman_detective.wav",
            lambda m: build_two_speaker_payload(b6_speakers, b6_items, m),
        ),
        (
            AUDIO_DIR / "batch_7_lonelyhearts_artist.wav",
            lambda m: build_two_speaker_payload(b7_speakers, b7_items, m),
        ),
        (
            AUDIO_DIR / "batch_8_sfx.wav",
            lambda m: build_two_speaker_payload(b8_speakers, b8_items, m),
        ),
    ]

    model_idx = 0
    for idx, (out_path, payload_fn) in enumerate(jobs):
        already_existed = out_path.exists() and out_path.stat().st_size > 10000
        model_idx = call_interactions_api(payload_fn, out_path, api_key, model_idx=model_idx)
        if not already_existed and idx < len(jobs) - 1:
            print("Sleeping 22s to respect 3 RPM Free Tier rate limit...", flush=True)
            time.sleep(22)

    print("ALL 6 BATCHES COMPLETE!", flush=True)


if __name__ == "__main__":
    main()
