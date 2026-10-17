#!/usr/bin/env python3
"""
Build the audio track for the animated play (video/index.html).

- Reads every spoken line from ../script-data.js
- Generates one MP3 per line with a consistent neural voice per character (edge-tts)
- Captures word-level timestamps (WordBoundary) and aligns them to the on-screen words
- Writes video/timeline-data.js  ->  window.VIDEO_AUDIO = { "<lineId>": {...} }

Usage:
    python3 -m venv .venv-tts && .venv-tts/bin/pip install edge-tts
    .venv-tts/bin/python tools/build_video_audio.py           # only missing files
    .venv-tts/bin/python tools/build_video_audio.py --force   # regenerate everything
"""
import asyncio
import json
import os
import re
import sys

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT_JS = os.path.join(ROOT, "script-data.js")
VIDEO_DIR = os.path.join(ROOT, "video")
AUDIO_DIR = os.path.join(VIDEO_DIR, "audio")
OUT_JS = os.path.join(VIDEO_DIR, "timeline-data.js")

# Consistent voice per character: (voice, base rate, pitch)
VOICES = {
    "CEREMONY_MASTER":   ("en-GB-MaisieNeural",      "-4%", "+0Hz"),
    "ASSISTANT_DIRECTOR": ("en-US-AnaNeural",        "-6%", "+0Hz"),   # Luciana
    "DIRECTOR":          ("en-US-GuyNeural",         "+0%", "+6Hz"),
    "MAKEUP_MASTER":     ("en-US-JennyNeural",       "+0%", "+18Hz"),
    "JEFF":              ("en-US-AndrewNeural",      "-2%", "+14Hz"),
    "LISA":              ("en-US-EmmaNeural",        "-2%", "+16Hz"),
    "THORWALD":          ("en-US-ChristopherNeural", "-4%", "+4Hz"),
    "DETECTIVE":         ("en-US-BrianNeural",       "+4%", "+12Hz"),
    "MISS_LONELYHEARTS": ("en-US-AvaNeural",         "-6%", "+14Hz"),
    "ARTIST":            ("en-GB-RyanNeural",        "-4%", "+14Hz"),
    "CAMERA_MAN":        ("en-US-RogerNeural",       "+2%", "+14Hz"),
    "PROP_MASTER":       ("en-AU-NatashaNeural",     "+0%", "+16Hz"),
    "CAST":              ("en-US-AnaNeural",         "-4%", "+0Hz"),
}
# Extra voices layered on top for "all cast" lines (sounds like a group)
CAST_EXTRA = [
    ("en-US-JennyNeural", "-4%", "+18Hz"),
    ("en-US-AndrewNeural", "-4%", "+14Hz"),
    ("en-GB-MaisieNeural", "-4%", "+0Hz"),
]

FAST_WORDS = ("loud", "excited", "thrilled", "jumping", "rushing", "helpful")
SLOW_WORDS = ("quiet", "soft", "slow", "crying", "scared", "gentle", "fear", "sincere", "thoughtful", "lower")


def parse_lines():
    with open(SCRIPT_JS, encoding="utf-8") as f:
        text = f.read()
    head = re.compile(
        r'id:\s*(\d+),\s*\n\s*sceneId:\s*"([^"]+)",\s*\n\s*type:\s*"(\w+)",\s*\n\s*character:\s*"(\w+)"'
    )
    str_field = lambda name: re.compile(name + r':\s*"((?:[^"\\]|\\.)*)"')
    en_re, emo_re = str_field(r"\ben"), str_field(r"\bemotion")
    items = []
    matches = list(head.finditer(text))
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[m.end():end]
        en = en_re.search(block)
        emo = emo_re.search(block)
        items.append({
            "id": int(m.group(1)),
            "type": m.group(3),
            "character": m.group(4),
            "en": json.loads('"' + en.group(1) + '"') if en else "",
            "emotion": json.loads('"' + emo.group(1) + '"') if emo else "",
        })
    return items


def tts_text(en):
    # ALL-CAPS words (CUT, NOW, HELP...) -> Capitalized so the voice does not spell them out
    def fix(m):
        w = m.group(0)
        return w if w in ("I", "OK", "TV") else w.capitalize()
    return re.sub(r"\b[A-Z]{2,}\b", fix, en)


def adjust_rate(base, emotion):
    val = int(base.replace("%", ""))
    e = emotion.lower()
    if any(k in e for k in FAST_WORDS):
        val += 6
    if any(k in e for k in SLOW_WORDS):
        val -= 6
    return f"{val:+d}%"


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def align(en, boundaries):
    """Map edge-tts word boundaries (ms) onto the displayed tokens (split by whitespace)."""
    tokens = en.split()
    times = [None] * len(tokens)
    ti, consumed = 0, 0
    for b in boundaries:
        bn = norm(b["text"])
        if not bn:
            continue
        placed = False
        for look in range(ti, min(ti + 4, len(tokens))):
            tn = norm(tokens[look])
            start = consumed if look == ti else 0
            pos = tn.find(bn, start)
            if pos != -1:
                if look != ti:
                    ti, consumed = look, 0
                s, e = b["s"], b["e"]
                if times[ti] is None:
                    times[ti] = [s, e]
                else:
                    times[ti][1] = e
                consumed = pos + len(bn)
                if consumed >= len(tn):
                    ti, consumed = ti + 1, 0
                placed = True
                break
        if not placed:
            # unexpected token from TTS; attach to the current token
            if ti < len(tokens):
                if times[ti] is None:
                    times[ti] = [b["s"], b["e"]]
                else:
                    times[ti][1] = b["e"]
    # fill gaps (dashes etc.)
    last_end = 0
    for i, t in enumerate(times):
        if t is None:
            nxt = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), last_end + 150)
            times[i] = [last_end, max(last_end, nxt)]
        last_end = times[i][1]
    return [{"w": tok, "s": round(t[0]), "e": round(t[1])} for tok, t in zip(tokens, times)]


async def synth(text, voice, rate, pitch, path, want_words=True):
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary" and want_words:
                s = chunk["offset"] / 10000.0
                words.append({"text": chunk["text"], "s": s, "e": s + chunk["duration"] / 10000.0})
    dur = os.path.getsize(path) * 8 / 48000.0  # 48 kbps CBR mono mp3
    return words, dur


async def build_line(item, sem, force, cache):
    lid = str(item["id"])
    fname = f"l{item['id']:03d}.mp3"
    path = os.path.join(AUDIO_DIR, fname)
    voice, base, pitch = VOICES.get(item["character"], VOICES["CAST"])
    rate = adjust_rate(base, item["emotion"])
    text = tts_text(item["en"])
    key = f"{voice}|{rate}|{pitch}|{text}"
    if not force and lid in cache and cache[lid].get("key") == key and os.path.exists(path):
        return lid, cache[lid]
    async with sem:
        for attempt in range(4):
            try:
                words, dur = await synth(text, voice, rate, pitch, path)
                break
            except Exception as exc:  # network hiccup -> retry
                if attempt == 3:
                    raise
                await asyncio.sleep(1.5 * (attempt + 1))
        entry = {"file": f"audio/{fname}", "dur": round(dur, 3), "voice": voice,
                 "words": align(item["en"], words), "key": key}
        if item["character"] == "CAST":
            extras = []
            for k, (v, r, p) in enumerate(CAST_EXTRA):
                xf = f"l{item['id']:03d}_x{k}.mp3"
                _, xd = await synth(text, v, r, p, os.path.join(AUDIO_DIR, xf), want_words=False)
                extras.append({"file": f"audio/{xf}", "dur": round(xd, 3)})
            entry["extra"] = extras
    print(f"  ✓ line {lid:>3} {item['character']:<18} {entry['dur']:5.2f}s  {item['en'][:60]}")
    return lid, entry


async def main():
    force = "--force" in sys.argv
    os.makedirs(AUDIO_DIR, exist_ok=True)
    cache = {}
    if os.path.exists(OUT_JS) and not force:
        raw = open(OUT_JS, encoding="utf-8").read()
        m = re.search(r"window\.VIDEO_AUDIO\s*=\s*(\{.*\});", raw, re.S)
        if m:
            cache = json.loads(m.group(1))
    items = [i for i in parse_lines() if i["type"] == "dialogue" and i["en"]]
    print(f"Generating audio for {len(items)} spoken lines...")
    sem = asyncio.Semaphore(5)
    results = await asyncio.gather(*(build_line(i, sem, force, cache) for i in items))
    data = dict(results)
    total = sum(v["dur"] for v in data.values())
    with open(OUT_JS, "w", encoding="utf-8") as f:
        f.write("/* AUTO-GENERATED by tools/build_video_audio.py — do not edit by hand */\n")
        f.write("window.VIDEO_AUDIO = " + json.dumps(data, ensure_ascii=False) + ";\n")
    print(f"Done. {len(data)} lines, {total/60:.1f} min of speech -> {OUT_JS}")


if __name__ == "__main__":
    asyncio.run(main())
