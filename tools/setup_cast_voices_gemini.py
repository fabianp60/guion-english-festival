#!/usr/bin/env python3
"""
Design and register persistent Gemini 3.8 TTS child voice profiles (9-10 years old, 4th Grade)
for all 13 characters of 'Rear Window: Behind the Scenes' using the gemini-tts-studio MCP engine.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import shutil
import sys

PLUGIN_DIR = Path.home() / ".gemini" / "config" / "plugins" / "gemini-tts-studio"
sys.path.insert(0, str(PLUGIN_DIR))

from server.mcp_server import (  # noqa: E402
    load_catalog,
    tts_design_voice,
    tts_manage_catalog,
    tts_synthesize,
)

PROJECT_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = PROJECT_DIR / "video" / "audio"
PREVIEW_DIR = AUDIO_DIR / "previews"
PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

PROFILES = [
    {
        "alias": "CEREMONY_MASTER",
        "display_name": "Valeria (10yo 4th Grader - Ceremony Master)",
        "language_code": "en-GB",
        "gender": "female",
        "pitch_semitones": 2.7,
        "prompt": (
            "A bright, high-pitched, cheerful young female presenter in her early 20s "
            "with a charming British accent, speaking with lively warmth and clear stage diction."
        ),
        "default_style": (
            "high-pitched 10-year-old child voice presenting a school play, "
            "welcoming, cheerful and enthusiastic with a big smile"
        ),
    },
    {
        "alias": "DIRECTOR",
        "display_name": "Director (10yo 4th Grader - Movie Director)",
        "language_code": "en-US",
        "gender": "neutral",
        "pitch_semitones": 2.8,
        "prompt": (
            "A high-pitched, energetic, youthful voice in their early 20s with a crisp "
            "American English accent, speaking with playful theatrical authority and bright stage energy."
        ),
        "default_style": (
            "high-pitched 10-year-old boy child voice acting as a movie director "
            "in a school play, proud, energetic and lively"
        ),
    },
    {
        "alias": "MAKEUP_MASTER",
        "display_name": "Makeup Master (9yo 4th Grader)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 3.0,
        "prompt": (
            "A very high-pitched, bubbly, expressive young female voice in her early 20s "
            "with an American English accent, speaking with lively, playful, perfectionist energy."
        ),
        "default_style": (
            "high-pitched 9-year-old child voice in a school play, bubbly, expressive and perfectionist"
        ),
    },
    {
        "alias": "JEFF",
        "display_name": "Jeff (10yo 4th Grader - Photographer)",
        "language_code": "en-US",
        "gender": "neutral",
        "pitch_semitones": 2.7,
        "prompt": (
            "A bright, youthful, high-pitched voice in their early 20s with a clear "
            "American English accent, speaking with curious, observant, and friendly conversational energy."
        ),
        "default_style": (
            "high-pitched 10-year-old boy child voice in a school play, curious, observant and friendly"
        ),
    },
    {
        "alias": "LISA",
        "display_name": "Lisa (9yo 4th Grader - Co-Star)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.9,
        "prompt": (
            "A sweet, bright, high-pitched young female voice in her early 20s with a warm "
            "American English accent, speaking with encouraging, playful kindness."
        ),
        "default_style": (
            "high-pitched 9-year-old girl child voice in a school play, warm, playful and encouraging"
        ),
    },
    {
        "alias": "THORWALD",
        "display_name": "Thorwald (10yo 4th Grader - Nervous Villain)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.4,
        "prompt": (
            "A youthful, expressive female voice in her early 20s with an American English accent, "
            "capable of switching between playful dramatic mystery acting and shy, gentle sincerity."
        ),
        "default_style": (
            "10-year-old child voice in a school play pretending to sound like a tough mystery villain, "
            "slightly dramatic"
        ),
    },
    {
        "alias": "DETECTIVE",
        "display_name": "Detective (10yo 4th Grader)",
        "language_code": "en-US",
        "gender": "neutral",
        "pitch_semitones": 2.7,
        "prompt": (
            "A crisp, upbeat, high-pitched youthful voice in their early 20s with a lively "
            "American English accent, speaking with quick, witty, playful detective energy."
        ),
        "default_style": (
            "high-pitched 10-year-old boy child voice acting as a funny detective in a school play, "
            "upbeat and playful"
        ),
    },
    {
        "alias": "MISS_LONELYHEARTS",
        "display_name": "Miss Lonelyhearts (9yo 4th Grader)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.8,
        "prompt": (
            "A soft, gentle, high-pitched young female voice in her early 20s with a clear "
            "American English accent, speaking with tender, heartfelt, and poetic sensitivity."
        ),
        "default_style": (
            "high-pitched 9-year-old girl child voice in a school play, gentle, sensitive and heartfelt"
        ),
    },
    {
        "alias": "ARTIST",
        "display_name": "Artist (10yo 4th Grader)",
        "language_code": "en-GB",
        "gender": "neutral",
        "pitch_semitones": 2.7,
        "prompt": (
            "A warm, high-pitched, youthful voice in their early 20s with a gentle British accent, "
            "speaking with thoughtful, artistic, and calm musicality."
        ),
        "default_style": (
            "high-pitched 10-year-old child voice in a school play, gentle, artistic and thoughtful"
        ),
    },
    {
        "alias": "CAMERA_MAN",
        "display_name": "Camera Man (10yo 4th Grader)",
        "language_code": "en-US",
        "gender": "neutral",
        "pitch_semitones": 2.8,
        "prompt": (
            "A bright, energetic, high-pitched youthful announcer voice in their early 20s "
            "with a clear American English accent, speaking with snappy, enthusiastic stage presence."
        ),
        "default_style": (
            "high-pitched 10-year-old boy child voice with a clapperboard in a school play, "
            "energetic and clear"
        ),
    },
    {
        "alias": "PROP_MASTER",
        "display_name": "Prop Master (9yo 4th Grader)",
        "language_code": "en-AU",
        "gender": "female",
        "pitch_semitones": 2.8,
        "prompt": (
            "A cheerful, high-pitched, upbeat young female voice in her early 20s with a bright "
            "Australian accent, speaking with resourceful, comedic enthusiasm."
        ),
        "default_style": (
            "high-pitched 9-year-old child voice in a school play, cheerful, resourceful and upbeat"
        ),
    },
    {
        "alias": "CAST",
        "display_name": "All Cast (9-10yo 4th Graders)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.9,
        "prompt": (
            "A bright, high-pitched, joyful young female voice in her early 20s with an American "
            "English accent, speaking with infectious celebratory group enthusiasm."
        ),
        "default_style": (
            "enthusiastic 9-to-10-year-old school children cheering together in a 4th grade play, "
            "joyful and loud"
        ),
    },
]


def _design_one(p: dict) -> tuple[str, str, float]:
    prev_file = str(PREVIEW_DIR / f"{p['alias'].lower()}_preview.wav")
    res = tts_design_voice(
        alias=p["alias"],
        prompt=p["prompt"],
        language_code=p["language_code"],
        gender=p["gender"],
        display_name=p["display_name"],
        default_style=p["default_style"],
        pitch_semitones=p["pitch_semitones"],
        preview_output_path=prev_file,
    )
    return p["alias"], res["voice_id"], res["preview_duration_sec"]


def main() -> None:
    luciana_prev = AUDIO_DIR / "luciana_voice_preview.wav"
    if luciana_prev.is_file():
        shutil.copy2(luciana_prev, PREVIEW_DIR / "assistant_director_preview.wav")

    # Design all 12 remaining characters sequentially/in small batches to avoid catalog race conditions
    for p in PROFILES:
        alias, vid, dur = _design_one(p)
        print(f"✓ {alias:<18} -> {vid} (preview: {dur}s)", flush=True)

    # Sync LUCIANA alias with ASSISTANT_DIRECTOR
    cat = load_catalog()
    ad = cat["ASSISTANT_DIRECTOR"]
    tts_manage_catalog(
        action="set",
        alias="LUCIANA",
        voice_id=ad["voice_id"],
        default_style=ad["default_style"],
        pitch_semitones=ad["pitch_semitones"],
        description="Luciana Peña (9yo 4th Grader - Assistant Director)",
    )

    # Regenerate the 2 previously generated script audios with the new 9-10yo child voices
    r1 = tts_synthesize(
        voice="ASSISTANT_DIRECTOR",
        style="worried and urgent, pointing up at the ceiling",
        text="<gasp> Director! <short pause> The lights are flickering!",
        output_path=str(AUDIO_DIR / "luciana_line1_l004_gemini.wav"),
    )
    print(f"✓ Updated Luciana Line 1 (l004): {r1['output_path']} ({r1['duration_sec']}s)", flush=True)

    r2 = tts_synthesize(
        voice="CEREMONY_MASTER",
        style="welcoming, cheerful and enthusiastic with a big smile",
        text=(
            "Good evening, everyone! Welcome to Stage 18 — <chuckle> well, our classroom's "
            "version of it! <short pause> Tonight, our 4th graders take you behind the scenes "
            "of a real 1954 film shoot. Please welcome our cast!"
        ),
        output_path=str(AUDIO_DIR / "script_line1_l001_gemini.wav"),
    )
    print(f"✓ Updated Script Line 1 (l001): {r2['output_path']} ({r2['duration_sec']}s)", flush=True)

    # Export project-level catalog copy
    shutil.copy2(
        Path.home() / ".config" / "gemini-tts-studio" / "voices_catalog.json",
        PROJECT_DIR / ".tts-voices.json",
    )
    print("ALL 13 CHILD VOICE PROFILES CREATED & AUDIOS UPDATED!")


if __name__ == "__main__":
    main()
