#!/usr/bin/env python3
"""
Build the complete Gemini 3.8 TTS child-voice audio track and synchronized word-level
subtitle timeline for "Rear Window: Behind the Scenes" (4th Grade English Festival).

Features:
- Uses Gemini 3.8 TTS (`gemini-3.8-flash-tts`) via the official `google-genai` SDK.
- Assigns 13 distinct 9-to-10-year-old child vocal personas across the cast (combining
  custom designed voices, regional accents, distinct studio timbres, and per-character
  WSOLA vocal-tract/pitch shifting `pitch_semitones`).
- Applies bespoke acting intentions (`speech_metadata.style`) and inline vocal tags
  (`<gasp>`, `<sigh>`, `<laugh>`, `<chuckle>`, `<sob>`, `<whispering>`, `<pant>`,
  `<cheer>`, `<short pause>`) to every single line in `script-data.js`.
- Generates ensemble multi-voice layers (`l071_x0..2.wav`, `l125_x0..2.wav`) for `CAST` lines
  and stage vocal SFX clips (`sfx_11_laugh.wav`, `sfx_98_laugh_*.wav`, `sfx_105_cheer_*.wav`,
  `sfx_126_finale_*.wav`).
- Computes acoustic energy & pause-aware word-level subtitle timestamps (`words: [{w, s, e}]`)
  directly from each 24kHz PCM waveform using NumPy so on-screen subtitles synchronize
  with speech onset, internal pauses, and speech offset.

Usage:
    /home/fabian/.gemini/config/plugins/gemini-tts-studio/.venv/bin/python tools/build_video_audio.py --force
"""

from __future__ import annotations

import concurrent.futures
import io
import json
import os
import re
import sys
import time
import wave
from pathlib import Path
from typing import Any

import numpy as np

# Import WSOLA pitch/formant shifting & Gemini client helpers from our gemini-tts-studio plugin
PLUGIN_SERVER_DIR = "/home/fabian/.gemini/config/plugins/gemini-tts-studio/server"
if PLUGIN_SERVER_DIR not in sys.path:
    sys.path.insert(0, PLUGIN_SERVER_DIR)

from mcp_server import (  # noqa: E402
    extract_interaction_audio_bytes,
    get_genai_client,
    load_catalog,
    save_catalog,
    write_audio_file,
)

ROOT = Path(__file__).resolve().parent.parent
SCRIPT_JS = ROOT / "script-data.js"
VIDEO_DIR = ROOT / "video"
AUDIO_DIR = VIDEO_DIR / "audio"
OUT_JS = VIDEO_DIR / "timeline-data.js"
PROJECT_CATALOG = ROOT / ".tts-voices.json"

MODEL_ID = "gemini-3.8-flash-tts"

# ---------------------------------------------------------------------------
# 1. Distinctive 9–10 Year Old Child Voice Profiles for all 13 Characters
# ---------------------------------------------------------------------------
# Why mix our custom `voice_...` IDs with distinct Studio Voices + varied `pitch_semitones`?
# Because each base voice has a unique vocal tract, cadence, and accent (US, UK, AU),
# and the per-character WSOLA shift (+2.1 to +3.3 semitones) places every actor cleanly
# into the 9–10 year old child frequency range while keeping every classmate unmistakable!
CHARACTER_PROFILES: dict[str, dict[str, Any]] = {
    "ASSISTANT_DIRECTOR": {
        "voice_id": "voice_h4trbfd9zqeg",
        "display_name": "Luciana Peña (9yo Girl - Assistant Director)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.8,
        "default_style": "bright, expressive 9-year-old girl in a school play",
    },
    "CEREMONY_MASTER": {
        "voice_id": "voice_0hkdrp9y5zo8",
        "display_name": "Valeria Ortiz (10yo Girl - Ceremony Master, British Accent)",
        "language_code": "en-GB",
        "gender": "female",
        "pitch_semitones": 2.5,
        "default_style": "cheerful 10-year-old British girl presenter on stage",
    },
    "DIRECTOR": {
        "voice_id": "Puck",
        "display_name": "Director (10yo Boy - Movie Director with Megaphone)",
        "language_code": "en-US",
        "gender": "male",
        "pitch_semitones": 3.1,
        "default_style": "energetic 10-year-old boy acting as a dramatic Hollywood director",
    },
    "MAKEUP_MASTER": {
        "voice_id": "Leda",
        "display_name": "Makeup Master (9yo Girl - Bubbly & Perfectionist)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.9,
        "default_style": "bubbly, fast-talking 9-year-old girl makeup artist",
    },
    "JEFF": {
        "voice_id": "Fenrir",
        "display_name": "Jeff / Jessy (10yo Boy - Observant Photographer)",
        "language_code": "en-US",
        "gender": "male",
        "pitch_semitones": 3.3,
        "default_style": "curious, observant 10-year-old boy actor",
    },
    "LISA": {
        "voice_id": "Aoede",
        "display_name": "Lisa (9yo Girl - Warm & Encouraging Co-Star)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.6,
        "default_style": "warm, sweet 9-year-old girl co-star",
    },
    "THORWALD": {
        "voice_id": "voice_h1gy5gzssuj6",
        "display_name": "Thorwald (10yo Girl - Nervous Villain)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.1,
        "default_style": "10-year-old girl in a school play",
    },
    "DETECTIVE": {
        "voice_id": "Zephyr",
        "display_name": "Detective (10yo Boy - Playful & Fast Runner)",
        "language_code": "en-US",
        "gender": "neutral",
        "pitch_semitones": 2.4,
        "default_style": "playful, quick-witted 10-year-old kid playing a tough detective",
    },
    "MISS_LONELYHEARTS": {
        "voice_id": "Callirrhoe",
        "display_name": "Miss Lonelyhearts (9yo Girl - Sensitive & Heartfelt)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.7,
        "default_style": "gentle, sensitive 9-year-old girl actress",
    },
    "ARTIST": {
        "voice_id": "voice_iwep4fvs5h5t",
        "display_name": "Artist (10yo Kid - Gentle British Musician & Sculptor)",
        "language_code": "en-GB",
        "gender": "neutral",
        "pitch_semitones": 2.6,
        "default_style": "thoughtful, artistic 10-year-old British child",
    },
    "CAMERA_MAN": {
        "voice_id": "Autonoe",
        "display_name": "Camera Man (10yo Kid - Enthusiastic Clapperboard Operator)",
        "language_code": "en-US",
        "gender": "neutral",
        "pitch_semitones": 2.3,
        "default_style": "enthusiastic, snappy 10-year-old camera operator",
    },
    "PROP_MASTER": {
        "voice_id": "voice_yyr9ja4jabg3",
        "display_name": "Prop Master (9yo Girl - Resourceful Australian Kid)",
        "language_code": "en-AU",
        "gender": "female",
        "pitch_semitones": 2.7,
        "default_style": "upbeat, resourceful 9-year-old Australian child",
    },
    "CAST": {
        "voice_id": "voice_k2npo4auo7xa",
        "display_name": "All Cast (4th Grade Ensemble)",
        "language_code": "en-US",
        "gender": "female",
        "pitch_semitones": 2.8,
        "default_style": "joyful 9-year-old school child cheering with classmates",
    },
}

# Extra layered voices for CAST ensemble lines (71 and 125) so it genuinely sounds like a group of kids!
CAST_EXTRA_VOICES = [
    ("Puck", "excited 10-year-old boy shouting happily with the group", 3.1),
    ("Leda", "joyful 9-year-old girl cheering loudly with friends", 3.0),
    ("Aoede", "enthusiastic 10-year-old child cheering warmly on stage", 2.5),
]

# ---------------------------------------------------------------------------
# 2. Handcrafted Line-by-Line Acting Intention (`style`) & Inline Vocal Tags
# ---------------------------------------------------------------------------
# Format: line_id -> (speech_metadata_style, verbatim_transcript_with_inline_tags)
# Note: All spoken words in `verbatim_transcript_with_inline_tags` match `item["en"]`
# (with ALL-CAPS words normalized to normal case so TTS never spells them out, plus
# expressive `<...>` vocal tags at the exact emotional beats).
LINE_ACTING_MAP: dict[int, tuple[str, str]] = {
    # ================= SCENE 1 =================
    1: (
        "welcoming, cheerful and enthusiastic presenter smiling brightly at the parents in the audience",
        "Good evening, everyone! Welcome to Stage 18 <short pause> — well, <chuckle> our classroom's version of it! Tonight, our 4th graders take you behind the scenes of a real 1954 film shoot. Please welcome our cast!",
    ),
    3: (
        "loud, proud, booming and theatrical like a classic movie director announcing through a megaphone",
        "Welcome to Stage 18, Paramount Studios! Summer, 1954! Biggest indoor set ever built! Don't break anything!",
    ),
    4: (
        "urgent, worried and alert, pointing up at the ceiling lights to warn the Director",
        "<gasp> Director! The lights are flickering!",
    ),
    5: (
        "playful, amused and teasing, looking up at the flickering lights with a mysterious grin",
        "Ooh, spooky! <chuckle> That actually looks kind of perfect for a mystery movie.",
    ),
    6: (
        "bossy, brisk and urgent, snapping fingers in command",
        "Fix it! And find Thorwald's suitcase!",
    ),
    7: (
        "panicked at first, then suddenly having a bright, clever lightbulb moment and sounding proud",
        "<gasp> I have it — but it's empty! <short pause> Wait, I'll put rocks inside! Problem solved!",
    ),
    8: (
        "playful, confident and swaggering, showing off a funny tough-guy walk",
        "My tough-guy walk needs practice. <chuckle> Watch this!",
    ),
    9: (
        "boastful, puffing chest out and trying hard to sound like a tough, menacing Hollywood villain",
        "<laugh> Ha! I'm the scariest man in Hollywood! Nobody does menacing like me!",
    ),
    10: (
        "grinning, friendly and playfully teasing a classmate",
        "<chuckle> Big words, Thorwald! Let's see it in the scene later.",
    ),
    12: (
        "soft, gentle, caring and private, stepping close to check on a friend with genuine empathy",
        "You okay, Thorwald? <short pause> You seem quiet all of a sudden.",
    ),
    13: (
        "dropping the tough act, speaking softly, honestly and nervously with vulnerable insecurity",
        "<sigh> This is my first big villain scene. <short pause> What if I'm not scary enough?",
    ),
    14: (
        "warm, tender, comforting and reassuring, with a kind smile and a gentle hand on his shoulder",
        "Being nervous doesn't mean you can't do it. <short pause> Even brave people get scared sometimes.",
    ),
    15: (
        "forcing a brave smile and speaking louder to cover up nervousness with fake bravado",
        "Right! Of course! <chuckle> Scariest man in Hollywood, remember?",
    ),
    17: (
        "quiet, curious and thoughtful, muttering a realization to himself",
        "Interesting... <short pause> I should remember that.",
    ),
    18: (
        "focused, fussy and playfully bossy while powdering an actor's face",
        "Hold still! Almost done <short pause> — perfect for the close-up.",
    ),
    19: (
        "proud, satisfied and cheerful, admiring her finished makeup work",
        "There! Now you look ready for your close-up.",
    ),
    20: (
        "warm, sweet and deeply encouraging to her friend",
        "You'll be great. We're all here.",
    ),
    22: (
        "loud, crisp and official like a Hollywood clapperboard announcer",
        "Rear Window! Scene One, Take One!",
    ),
    23: (
        "commanding, dramatic and excited, building anticipation before shouting Action",
        "Places, everyone! <short pause> And Action!",
    ),
    25: (
        "dramatic movie-acting tone, whispering urgently while pointing through binoculars",
        "<gasp> Look! Miss Lonelyhearts is crying again.",
    ),
    26: (
        "dramatic movie-acting tone, scolding gently and playfully",
        "You shouldn't spy on people!",
    ),
    27: (
        "dramatic movie-acting tone, defensive, indignant and proud",
        "Spying? I'm a photographer! I observe!",
    ),
    28: (
        "funny, theatrical and slightly vain while trying to act scary",
        "Is my hair scary enough for the close-up?",
    ),
    29: (
        "hushed, dramatic movie-acting tone, suspicious and intrigued",
        "Wait... <short pause> what's Thorwald doing with that suitcase?",
    ),
    30: (
        "sharp, loud and decisive director calling Cut",
        "Cut!",
    ),

    # ================= SCENE 2 =================
    31: (
        "warm, gentle and inviting presenter speaking sincerely to the parents in the audience",
        "For this next scene, our Artist will really play — no pretending! <short pause> Parents, listen closely, this song is for you too.",
    ),
    33: (
        "clear, crisp and official clapperboard call",
        "Scene Two, Take One!",
    ),
    34: (
        "soft, gentle and hushed director setting a quiet emotional mood",
        "Scene Two. The artist and the lonely heart. <short pause> Action!",
    ),
    36: (
        "heartbroken, tearful and crying softly with a trembling voice",
        "<sob> Please... <short pause> stop. <sigh> That song reminds me of what I lost.",
    ),
    37: (
        "gentle, apologetic and soft-spoken with sincere kindness",
        "I'm sorry. <short pause> I didn't mean to make you cry.",
    ),
    38: (
        "sniffing softly, wiping away tears and speaking with a small, bittersweet smile",
        "<sigh> It's not your fault. Memories just come back.",
    ),
    39: (
        "warm, poetic, slow and thoughtful",
        "Sometimes music brings out what we hide inside.",
    ),
    40: (
        "gentle, curious and softly interested",
        "What are you making?",
    ),
    41: (
        "warm, proud and tender, holding up a clay sculpture with a sweet smile",
        "Look <short pause> — something beautiful. Like you.",
    ),
    42: (
        "deeply touched, emotional and grateful with hand over heart",
        "<gasp> That's the kindest thing anyone has said to me in a long time.",
    ),
    43: (
        "loud, enthusiastic and deeply moved director clapping proudly",
        "Cut! Beautiful!",
    ),
    44: (
        "laughing happily and wiping away pretend stage tears after a great scene",
        "<laugh> I couldn't stop crying! That song got to me!",
    ),
    45: (
        "laughing and cheerful, making a funny confession about playing the instrument",
        "<chuckle> I was trying to play happy music, <laugh> but my fingers kept playing sad notes!",
    ),
    46: (
        "dramatic, flustered and rushing over in comedic panic with a powder puff",
        "<gasp> Your tears ruined your makeup! Hold still!",
    ),
    47: (
        "worried, urgent and comedic panic over drying clay",
        "<gasp> My clay is drying out! I need more!",
    ),
    48: (
        "eager, energetic and heroic, jumping in to save the day",
        "I'll get clay from the prop room! Fastest runner here!",
    ),
    49: (
        "breathless, relieved and triumphant after catching a falling camera",
        "<gasp> Got it! <chuckle> And I still got the emotional shot!",
    ),
    50: (
        "gentle, observant and warm, noticing her friend is quiet",
        "You're quiet today. <short pause> Just observing again?",
    ),
    51: (
        "casual, calm and thoughtful, shrugging lightly",
        "<sigh> Just observing. That's what I do.",
    ),
    52: (
        "gentle, wise and heartfelt, sharing an important lesson",
        "Sometimes observing isn't enough. <short pause> Sometimes people need us to say something.",
    ),

    # ================= SCENE 2.5 =================
    53: (
        "playful, mischievous and excited presenter teasing a fun surprise for the parents",
        "Uh oh <chuckle> — looks like there's a music problem on set! Parents, get ready... <short pause> you might be asked to help solve it!",
    ),
    55: (
        "breathless, super excited and enthusiastic after running in with a speaker",
        "Director! We need music for the break! I have three ideas!",
    ),
    56: (
        "impatient, tired and slightly grumpy director giving in",
        "<sigh> Fine. Play something.",
    ),
    58: (
        "grumpy, loud and exasperated, covering ears over loud pop music",
        "No! Too much noise! This is Hollywood, not Broadway!",
    ),
    59: (
        "stiff, grumpy and deadpan, trying to sound tough with arms crossed",
        "Scary men don't dance.",
    ),
    60: (
        "playful, grinning and teasing while nudging a friend",
        "<chuckle> Come on, Thorwald, live a little!",
    ),
    61: (
        "firm, stubborn and deadpan serious",
        "No. I have a reputation.",
    ),
    62: (
        "giggling, upbeat and enthusiastic, pressing play on the next song",
        "<chuckle> Okay — try this one!",
    ),
    64: (
        "cool, upbeat and nodding along rhythmically to a rock beat with a bright smile",
        "Hm... <short pause> this has some style. Rough, <chuckle> but I like the energy.",
    ),
    66: (
        "exasperated, dramatic and pleading while trying to fix everyone's hair",
        "<sigh> Please don't sweat off all my hard work with this dancing!",
    ),
    67: (
        "bright, hopeful and excited, holding up the speaker for the whole room",
        "One more! For everyone <short pause> — even the parents!",
    ),
    69: (
        "thrilled, hyped and cheering, inviting the whole audience to stand up",
        "Now we're talking! This is cinema! Everyone up — parents too!",
    ),
    70: (
        "joyful, laughing and already dancing to the beat",
        "<laugh> This is my favorite one — come on, everybody!",
    ),
    71: (
        "joyful, loud and super enthusiastic, cheering and inviting the audience to dance",
        "<cheer> Come on, everyone! Dance with us!",
    ),
    73: (
        "out of breath from dancing, laughing and delighted",
        "<pant> Alright — back to work! <chuckle> But we're keeping that song for the ending!",
    ),

    # ================= SCENE 3 =================
    74: (
        "hushed, serious, dramatic and suspenseful presenter setting up the climax",
        "Now, the mood on set is about to change. <short pause> This next scene is the big one — the one every actor fears and dreams about. <short pause> Watch closely.",
    ),
    76: (
        "alone, trembling, anxious and genuinely scared, whispering in stage fright",
        "<heavy breath> This is it... <short pause> What if I'm too scary and everyone thinks I'm mean for real?",
    ),
    77: (
        "calm, warm, friendly and reassuring, speaking gently to comfort a nervous classmate",
        "Thorwald? You don't have to pretend with me — <chuckle> I saw you dancing earlier. You're not that scary. <short pause> And if you mess up, we help you. That's what we do here.",
    ),
    78: (
        "eager, hopeful and excited, holding up the clapperboard",
        "Can I call it this time, Director?",
    ),
    80: (
        "thrilled, proud and booming with official movie-set excitement",
        "Scene Three, Take One! <short pause> Action!",
    ),
    82: (
        "slow, low, spooky and menacing movie-villain acting",
        "You've been watching me.",
    ),
    83: (
        "trembling, breathless and acting terrified in the movie scene",
        "<gasp> I know what you did.",
    ),
    84: (
        "dramatic, menacing movie-villain voice that suddenly chokes and freezes mid-word in panic",
        "Then... <short pause> you must be Sil— <gasp>",
    ),
    86: (
        "breaking character, voice shaking with real fear, embarrassment and near tears",
        "<pant> I... I can't. <sigh> I'm sorry. What if they think I'm mean in real life too?",
    ),
    88: (
        "soft, gentle, calm and deeply caring director kneeling down to comfort a child",
        "Cut... <short pause> it's okay, Thorwald. Take a breath.",
    ),
    89: (
        "tender, empathetic, warm and comforting, sitting beside a scared friend to share a heartfelt truth",
        "I was scared my first time too. <short pause> Everyone gets scared sometimes. That's normal.",
    ),
    90: (
        "gentle, soothing, warm and reassuring",
        "Being scary in a play doesn't make you scary in real life. <short pause> You are ready.",
    ),
    91: (
        "warm, sincere, loving and encouraging",
        "I've watched you rehearse. You are brave, Thorwald.",
    ),
    92: (
        "eager, sweet and enthusiastic, proudly offering a lucky rock to help",
        "Take my lucky rock! It gives you courage!",
    ),
    93: (
        "cheerful, funny and lighthearted, grinning to make a nervous friend laugh",
        "<chuckle> And hey — I forgot my line twice today! You don't see me crying!",
    ),
    94: (
        "warm, humorous and inspiring, holding up a funny clay horse with a smile",
        "Look — I made a horse. <chuckle> It looked like a potato at first. I messed up. I kept going. That's what art is!",
    ),
    95: (
        "friendly, humble and encouraging, sitting down in solidarity",
        "<chuckle> I've dropped my camera three times today. We all make mistakes. <short pause> But we get back up.",
    ),
    96: (
        "soft, sincere, tender and deeply supportive",
        "We are all here for you, Thorwald. <short pause> On a film set, everyone matters.",
    ),
    97: (
        "warm, gentle, reassuring best-friend tone",
        "You don't have to be scary, Thorwald. Just play scary. <short pause> We're still friends after.",
    ),
    99: (
        "taking a deep steadying breath, speaking quietly but with newfound courage and determination",
        "<breath> Okay. I'm ready. <short pause> Let's try again.",
    ),
    100: (
        "proud, warm and commanding director cheering on the actor",
        "Scene Three, Take Two! <short pause> Action!",
    ),
    102: (
        "strong, dramatic, confident and triumphant theatrical villain delivery",
        "Then... <short pause> you must be silenced!",
    ),
    103: (
        "loud, dramatic and thrilling movie-acting panic",
        "<gasp> Help! Police! Help!",
    ),
    104: (
        "ecstatic, thrilled and jumping for joy",
        "<cheer> Cut! Cut! Perfect!",
    ),

    # ================= SCENE 4 =================
    106: (
        "overjoyed, laughing with huge relief and excitement",
        "<laugh> I did it! I actually did it!",
    ),
    107: (
        "playful, warm and cheerful, nudging her friend with a bright smile",
        "<chuckle> See? Rehearsal pays off!",
    ),
    109: (
        "delighted, laughing and pointing joyfully",
        "<laugh> Ha! Scary women do dance!",
    ),
    110: (
        "beaming with happiness, clapping and cheering",
        "Best take of the whole day, if you ask me!",
    ),
    111: (
        "warm, grinning and playfully proud of his friend",
        "<chuckle> Told you. Not so scary after all.",
    ),
    112: (
        "warm, smiling, relieved and proud presenter wrapping up the story for the audience",
        "What a day on set! Mistakes, songs, fear, and courage <short pause> — sounds like real Hollywood to me. Let's see how it all wraps up.",
    ),

    # ================= SCENE 5 (FINALE) =================
    114: (
        "warm, clear and heartfelt curtain-call delivery to the audience",
        "On a film set, everyone matters.",
    ),
    115: (
        "sincere, uplifting and gentle curtain-call delivery",
        "When one person is scared, we lift them up. <short pause> When one falls, we help them stand.",
    ),
    116: (
        "genuine, humble, brave and heartfelt curtain-call delivery",
        "Even villains get scared sometimes. <short pause> Real bravery is trying anyway.",
    ),
    117: (
        "bright, proud and clear curtain-call delivery to the parents",
        "That's what Rear Window was really about. <short pause> Not just a mystery — people working together.",
    ),
    118: (
        "sweet, beaming and joyful curtain-call delivery",
        "And helping each other look <short pause> — and feel — their best.",
    ),
    119: (
        "clear, proud, warm and confident curtain-call delivery smiling at the audience",
        "Every job matters here, <short pause> big or small.",
    ),
    120: (
        "tender, warm and radiant curtain-call delivery",
        "Even the smallest kindness makes a difference.",
    ),
    121: (
        "joyful, expressive and heartwarming curtain-call delivery",
        "Because in the end, the magic isn't on the screen. <short pause> The magic is here — in the chaos, <chuckle> the laughter, the teamwork.",
    ),
    122: (
        "grinning, playful and upbeat curtain-call delivery",
        "<chuckle> And the dancing. Don't forget the dancing!",
    ),
    123: (
        "proud, sincere and inspiring curtain-call delivery",
        "And sometimes, watching isn't enough <short pause> — you have to step in and help. That's the bravest thing.",
    ),
    124: (
        "proud, joyful and celebratory director addressing the whole cast and audience",
        "Everyone — that's a wrap! Great work, all of you!",
    ),
    125: (
        "joyful, loud and celebratory curtain-call shout with arms wide open",
        "<cheer> Thank you all!",
    ),
    127: (
        "radiant, proud and enthusiastic presenter thanking the parents at the grand finale",
        "And that's a wrap! Thank you for watching our 4th graders bring Hollywood to our classroom. <short pause> Let's give them one more round of applause!",
    ),
}

# Stage Vocal SFX Clips used by `video/soundtrack.js`
STAGE_SFX_CLIPS: list[dict[str, Any]] = [
    {
        "fname": "sfx_11_laugh.wav",
        "voice": "voice_h1gy5gzssuj6",  # Thorwald
        "pitch_st": 2.1,
        "style": "10-year-old girl pretending to laugh loudly and boastfully like a villain, then suddenly stopping and sighing",
        "text": "<laugh> Ha ha ha! <short pause> <sigh>",
    },
    {
        "fname": "sfx_98_laugh_a.wav",
        "voice": "voice_h4trbfd9zqeg",  # Luciana
        "pitch_st": 2.8,
        "style": "9-year-old girl laughing softly, warmly and encouragingly with friends",
        "text": "<chuckle> <laugh> Hehe!",
    },
    {
        "fname": "sfx_98_laugh_b.wav",
        "voice": "Puck",
        "pitch_st": 3.1,
        "style": "10-year-old boy chuckling warmly and kindly with classmates",
        "text": "<chuckle> Haha, yeah!",
    },
    {
        "fname": "sfx_105_cheer_a.wav",
        "voice": "voice_h4trbfd9zqeg",  # Luciana
        "pitch_st": 2.8,
        "style": "excited 9-year-old girl cheering joyfully for a friend",
        "text": "<cheer> Yaaay! Way to go, Thorwald!",
    },
    {
        "fname": "sfx_105_cheer_b.wav",
        "voice": "Puck",
        "pitch_st": 3.1,
        "style": "excited 10-year-old boy cheering loudly and clapping",
        "text": "<cheer> Good job! That was awesome!",
    },
    {
        "fname": "sfx_105_cheer_c.wav",
        "voice": "Leda",
        "pitch_st": 2.9,
        "style": "thrilled 9-year-old girl cheering for a classmate",
        "text": "<cheer> Bravooo! You did it!",
    },
    {
        "fname": "sfx_105_cheer_d.wav",
        "voice": "Fenrir",
        "pitch_st": 3.3,
        "style": "enthusiastic 10-year-old boy cheering happily",
        "text": "<cheer> Woohoo! Amazing take!",
    },
    {
        "fname": "sfx_126_finale_a.wav",
        "voice": "voice_h4trbfd9zqeg",
        "pitch_st": 2.8,
        "style": "joyful 9-year-old girl cheering at the curtain call finale",
        "text": "<cheer> Yaaay! <laugh> Thank you, everyone!",
    },
    {
        "fname": "sfx_126_finale_b.wav",
        "voice": "Puck",
        "pitch_st": 3.1,
        "style": "joyful 10-year-old boy cheering at the end of the school play",
        "text": "<cheer> Woohoo! Best show ever!",
    },
]


# ---------------------------------------------------------------------------
# 3. Parse `script-data.js`
# ---------------------------------------------------------------------------
def parse_lines() -> list[dict[str, Any]]:
    text = SCRIPT_JS.read_text(encoding="utf-8")
    head = re.compile(
        r'id:\s*(\d+),\s*\n\s*sceneId:\s*"([^"]+)",\s*\n\s*type:\s*"(\w+)",\s*\n\s*character:\s*"(\w+)"'
    )
    str_field = lambda name: re.compile(name + r':\s*"((?:[^"\\]|\\.)*)"')
    en_re, emo_re = str_field(r"\ben"), str_field(r"\bemotion")
    items = []
    matches = list(head.finditer(text))
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[m.end() : end]
        en = en_re.search(block)
        emo = emo_re.search(block)
        items.append(
            {
                "id": int(m.group(1)),
                "sceneId": m.group(2),
                "type": m.group(3),
                "character": m.group(4),
                "en": json.loads('"' + en.group(1) + '"') if en else "",
                "emotion": json.loads('"' + emo.group(1) + '"') if emo else "",
            }
        )
    return items


# ---------------------------------------------------------------------------
# 4. Acoustic Energy & Pause-Aware Word-Level Subtitle Alignment Engine
# ---------------------------------------------------------------------------
VOWEL_RE = re.compile(r"[aeiouy]+", re.I)
LEADING_TAG_RE = re.compile(r"^\s*<(gasp|laugh|chuckle|sigh|sob|pant|heavy breath|breath|cheer)>\s*", re.I)


def token_phonetic_weight(tok: str) -> float:
    """Estimate relative spoken duration weight of a display token."""
    clean = re.sub(r"[^a-zA-Z0-9']", "", tok)
    if not clean:
        # Pure punctuation token like "—"
        return 0.35
    vowels = len(VOWEL_RE.findall(clean))
    weight = (len(clean) ** 0.80) + 0.65 * max(1, vowels)
    # Words ending in elongated punctuation or exclamation hold slightly longer
    if tok.endswith(("!", "?", "...", "—")):
        weight += 0.55
    elif tok.endswith((".", ",", ";", ":")):
        weight += 0.25
    return max(1.0, weight)


def is_phrase_break_token(tok: str) -> bool:
    """Return True if a display token naturally precedes a prosodic pause."""
    if tok in ("—", "--", "..."):
        return True
    if tok.endswith((".", "!", "?", "...", "—", ";", ":")):
        return True
    if tok.endswith(",") and len(tok) > 3:
        return True
    return False


def align_words_from_wav(en: str, wav_path: Path, tagged_text: str = "") -> list[dict[str, Any]]:
    """
    Compute word-level subtitle timestamps `[{"w": tok, "s": start_ms, "e": end_ms}, ...]`
    synchronized to the actual speech energy envelope and internal prosodic pauses of `wav_path`.
    Guarantees `len(result) == len(en.split())` and monotonically increasing timestamps.
    """
    tokens = en.split()
    if not tokens:
        return []

    raw_bytes = wav_path.read_bytes()
    with wave.open(io.BytesIO(raw_bytes), "rb") as wf:
        sr = wf.getframerate() or 24000
        nframes = wf.getnframes()
        pcm = wf.readframes(nframes)

    samples = np.frombuffer(pcm, dtype=np.int16).astype(np.float32)
    total_ms = int(round((len(samples) / float(sr)) * 1000.0))
    if total_ms <= 50 or len(samples) < 240:
        step = max(1, total_ms // max(1, len(tokens)))
        return [{"w": tok, "s": i * step, "e": (i + 1) * step} for i, tok in enumerate(tokens)]

    # 10 ms frame RMS envelope
    hop = max(1, sr // 100)  # 240 samples = 10 ms at 24kHz
    n_frames = len(samples) // hop
    trimmed = samples[: n_frames * hop].reshape(n_frames, hop)
    rms = np.sqrt(np.mean(trimmed * trimmed, axis=1) + 1e-6)

    # Smooth RMS with a 3-frame (30ms) kernel
    kernel = np.array([0.25, 0.5, 0.25], dtype=np.float32)
    smooth_rms = np.convolve(rms, kernel, mode="same")

    peak_rms = float(np.max(smooth_rms)) if len(smooth_rms) else 1.0
    p15 = float(np.percentile(smooth_rms, 15)) if len(smooth_rms) else 0.0
    voice_thresh = max(peak_rms * 0.045, p15 * 1.35, 18.0)

    active_idx = np.where(smooth_rms > voice_thresh)[0]
    if len(active_idx) >= 2:
        speech_start_ms = int(active_idx[0] * 10)
        speech_end_ms = int((active_idx[-1] + 1) * 10)
    else:
        speech_start_ms = 40
        speech_end_ms = max(speech_start_ms + 200, total_ms - 40)

    speech_start_ms = max(15, min(speech_start_ms, int(total_ms * 0.25)))
    speech_end_ms = min(total_ms - 15, max(speech_end_ms, int(total_ms * 0.72)))

    # If the synthesis prompt begins with a non-verbal vocal tag (<gasp>, <laugh>, <sigh>, etc.),
    # look for the first brief energy dip after the tag so word #0 highlights when actual speech begins.
    lead_match = LEADING_TAG_RE.match(tagged_text or "")
    if lead_match and (speech_end_ms - speech_start_ms) > 650:
        tag_type = lead_match.group(1).lower()
        max_tag_ms = 520 if tag_type in ("laugh", "chuckle", "cheer", "sob", "heavy breath") else 340
        search_start_f = speech_start_ms // 10 + 6
        search_end_f = min(len(smooth_rms) - 5, (speech_start_ms + max_tag_ms) // 10)
        if search_end_f > search_start_f + 3:
            local_min_f = search_start_f + int(np.argmin(smooth_rms[search_start_f:search_end_f]))
            if smooth_rms[local_min_f] < peak_rms * 0.35:
                speech_start_ms = int(local_min_f * 10)

    if len(tokens) == 1:
        return [{"w": tokens[0], "s": speech_start_ms, "e": speech_end_ms}]

    # Group tokens into prosodic phrases separated by punctuation breaks
    phrases: list[list[int]] = []
    cur_phrase: list[int] = []
    for idx, tok in enumerate(tokens):
        cur_phrase.append(idx)
        if is_phrase_break_token(tok) and idx < len(tokens) - 1:
            # If the next token is a standalone dash "—", keep the break after the dash
            if tokens[idx + 1] in ("—", "--"):
                continue
            phrases.append(cur_phrase)
            cur_phrase = []
    if cur_phrase:
        phrases.append(cur_phrase)

    weights = [token_phonetic_weight(t) for t in tokens]
    total_weight = sum(weights)

    # Detect acoustic pause valleys between phrases if there are multiple phrases
    phrase_intervals: list[tuple[int, int]] = []
    if len(phrases) <= 1 or (speech_end_ms - speech_start_ms) < 500:
        phrase_intervals = [(speech_start_ms, speech_end_ms)]
        phrases = [list(range(len(tokens)))]
    else:
        phrase_weights = [sum(weights[i] for i in p) for p in phrases]
        cum_w = 0.0
        boundaries_ms: list[tuple[int, int]] = []  # (end_of_prev_phrase_ms, start_of_next_phrase_ms)
        span_ms = speech_end_ms - speech_start_ms
        last_assigned_ms = speech_start_ms

        for p_idx in range(len(phrases) - 1):
            cum_w += phrase_weights[p_idx]
            expected_ms = speech_start_ms + int(round((cum_w / total_weight) * span_ms))
            # Search window around expected_ms for an acoustic pause (low RMS valley)
            win_radius_ms = min(420, max(120, int(span_ms * 0.16)))
            w_start_ms = max(last_assigned_ms + 90, expected_ms - win_radius_ms)
            w_end_ms = min(speech_end_ms - 90 * (len(phrases) - 1 - p_idx), expected_ms + win_radius_ms)

            if w_end_ms > w_start_ms + 30:
                f0 = max(0, w_start_ms // 10)
                f1 = min(len(smooth_rms), w_end_ms // 10)
                if f1 > f0 + 2:
                    valley_f = f0 + int(np.argmin(smooth_rms[f0:f1]))
                    valley_rms = float(smooth_rms[valley_f])
                    # Measure width of pause around valley_f
                    pause_thresh = max(voice_thresh * 1.4, valley_rms * 1.55)
                    left_f = valley_f
                    while left_f > f0 and smooth_rms[left_f - 1] <= pause_thresh:
                        left_f -= 1
                    right_f = valley_f
                    while right_f < f1 - 1 and smooth_rms[right_f + 1] <= pause_thresh:
                        right_f += 1
                    p_end = int(left_f * 10)
                    p_next_start = int((right_f + 1) * 10)
                    # Cap pause gap so subtitles don't freeze too long or invert
                    if p_next_start - p_end > 450:
                        mid = (p_end + p_next_start) // 2
                        p_end = mid - 180
                        p_next_start = mid + 180
                    if p_end <= last_assigned_ms + 40:
                        p_end = expected_ms - 15
                        p_next_start = expected_ms + 15
                    boundaries_ms.append((p_end, max(p_end, p_next_start)))
                    last_assigned_ms = max(p_end, p_next_start)
                else:
                    boundaries_ms.append((expected_ms, expected_ms))
                    last_assigned_ms = expected_ms
            else:
                boundaries_ms.append((expected_ms, expected_ms))
                last_assigned_ms = expected_ms

        cur_s = speech_start_ms
        for b_end, b_next_s in boundaries_ms:
            phrase_intervals.append((cur_s, max(cur_s + 30, b_end)))
            cur_s = max(b_end, b_next_s)
        phrase_intervals.append((cur_s, max(cur_s + 30, speech_end_ms)))

    # Distribute words within each phrase interval and snap internal boundaries to micro-dips
    aligned: list[dict[str, Any]] = []
    for p_tokens, (p_start, p_end) in zip(phrases, phrase_intervals):
        p_span = max(len(p_tokens) * 20, p_end - p_start)
        p_weights = [weights[i] for i in p_tokens]
        p_total_w = sum(p_weights) or 1.0

        cum = 0.0
        word_s = p_start
        for local_i, tok_idx in enumerate(p_tokens):
            cum += p_weights[local_i]
            if local_i == len(p_tokens) - 1:
                word_e = p_end
            else:
                raw_e = p_start + int(round((cum / p_total_w) * p_span))
                # Snap to nearest local energy dip within +/- 30ms (consonant boundary)
                f_center = raw_e // 10
                f_lo = max((word_s + 30) // 10, f_center - 3)
                f_hi = min((p_end - 30) // 10, f_center + 3)
                if f_hi > f_lo and f_hi <= len(smooth_rms):
                    best_f = f_lo + int(np.argmin(smooth_rms[f_lo : f_hi + 1]))
                    word_e = int(best_f * 10)
                else:
                    word_e = raw_e
                word_e = max(word_s + 25, min(word_e, p_end - (len(p_tokens) - 1 - local_i) * 20))

            aligned.append(
                {
                    "w": tokens[tok_idx],
                    "s": int(word_s),
                    "e": int(max(word_s + 20, word_e)),
                }
            )
            word_s = int(max(word_s + 20, word_e))

    return aligned


# ---------------------------------------------------------------------------
# 5. Synchronize Catalogs & Synthesize All Audio Files
# ---------------------------------------------------------------------------
def update_voice_catalogs() -> None:
    """Update both the global user catalog and the project catalog with the 13 distinct child profiles."""
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    catalog = load_catalog()
    for char_id, prof in CHARACTER_PROFILES.items():
        existing = catalog.get(char_id, {})
        catalog[char_id] = {
            **existing,
            "voice_id": prof["voice_id"],
            "type": "prompted" if str(prof["voice_id"]).startswith("voice_") else "prebuilt_child_shifted",
            "display_name": prof["display_name"],
            "language_code": prof["language_code"],
            "gender": prof["gender"],
            "default_style": prof["default_style"],
            "pitch_semitones": prof["pitch_semitones"],
            "model": MODEL_ID,
            "updated_at": now_iso,
        }
    # Keep LUCIANA alias pointing to ASSISTANT_DIRECTOR
    catalog["LUCIANA"] = dict(catalog["ASSISTANT_DIRECTOR"])
    save_catalog(catalog)
    save_catalog(catalog, str(PROJECT_CATALOG))
    print(f"✓ Updated 13 child character profiles in global catalog & {PROJECT_CATALOG.name}", flush=True)


import base64
import httpx
from mcp_server import resolve_api_key

RESOLVED_API_KEY, _ = resolve_api_key()


def _single_api_call(text: str, voice_id: str, style: str, pitch_semitones: float, out_path: Path) -> float:
    """Perform a single Gemini 3.8 TTS request over HTTP/1.1 with strict 20s socket timeouts."""
    if not RESOLVED_API_KEY:
        raise RuntimeError("Missing GEMINI_API_KEY")

    payload = {
        "model": MODEL_ID,
        "input": [
            {
                "type": "user_input",
                "content": [
                    {
                        "type": "text",
                        "text": text,
                        "annotations": [
                            {
                                "type": "speech_metadata",
                                "style": style,
                            }
                        ],
                    }
                ],
            }
        ],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": voice_id}]},
    }

    timeout_cfg = httpx.Timeout(20.0, connect=8.0, read=20.0, write=10.0, pool=8.0)
    with httpx.Client(http2=False, timeout=timeout_cfg) as client:
        resp = client.post(
            "https://generativelanguage.googleapis.com/v1beta/interactions",
            headers={
                "x-goog-api-key": RESOLVED_API_KEY,
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if resp.status_code != 200:
            raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:240]}")
        data = resp.json()

    audio_bytes: bytes | None = None
    out_audio = data.get("output_audio") or data.get("outputAudio")
    if isinstance(out_audio, dict) and out_audio.get("data"):
        audio_bytes = base64.b64decode(out_audio["data"])
    else:
        for step in data.get("steps") or []:
            if step.get("type") == "model_output":
                for item in step.get("content") or []:
                    if item.get("type") == "audio" and item.get("data"):
                        audio_bytes = base64.b64decode(item["data"])
                        break
            if audio_bytes:
                break

    if not audio_bytes:
        raise RuntimeError("No audio data returned in interaction response")

    return write_audio_file(
        str(out_path),
        audio_bytes,
        mime_type="audio/wav",
        sample_rate=24000,
        pitch_semitones=pitch_semitones,
    )


def synthesize_with_retry(
    text: str,
    voice_id: str,
    style: str,
    pitch_semitones: float,
    out_path: Path,
    max_attempts: int = 6,
) -> float:
    """Call Gemini 3.8 TTS with strict socket timeout and exponential backoff."""
    for attempt in range(max_attempts):
        try:
            return _single_api_call(text, voice_id, style, pitch_semitones, out_path)
        except Exception as exc:
            if attempt == max_attempts - 1:
                raise
            err_str = str(exc)
            # Longer backoff on 429 rate limits
            base_wait = 6.0 if "429" in err_str else 2.5
            wait_s = base_wait * (attempt + 1)
            print(
                f"  [retry {attempt+1}/{max_attempts}] {out_path.name}: {type(exc).__name__}: {err_str[:120]} (waiting {wait_s:.1f}s)",
                flush=True,
            )
            time.sleep(wait_s)
    return 0.0


def get_wav_duration(wav_path: Path) -> float:
    with wave.open(io.BytesIO(wav_path.read_bytes()), "rb") as wf:
        sr = wf.getframerate() or 24000
        return round(wf.getnframes() / float(sr), 3)


def build_dialogue_item(item: dict[str, Any], force: bool, cache: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    lid = item["id"]
    lid_str = str(lid)
    char_id = item["character"]
    prof = CHARACTER_PROFILES.get(char_id, CHARACTER_PROFILES["CAST"])

    voice_id = prof["voice_id"]
    pitch_st = float(prof["pitch_semitones"])
    base_persona = prof["default_style"]

    if lid in LINE_ACTING_MAP:
        acting_style, tagged_text = LINE_ACTING_MAP[lid]
    else:
        acting_style = item.get("emotion") or "natural and expressive"
        tagged_text = item["en"]

    full_style = f"{base_persona}, {acting_style}"
    fname = f"l{lid:03d}.wav"
    out_path = AUDIO_DIR / fname
    cache_key = f"gemini38|{voice_id}|{pitch_st:.2f}|{full_style}|{tagged_text}"

    # If the WAV file already exists on disk (>1KB) and force is False, reuse it!
    wav_exists_valid = out_path.exists() and out_path.stat().st_size > 1000
    need_synth = force or not wav_exists_valid

    if need_synth:
        dur = synthesize_with_retry(
            text=tagged_text,
            voice_id=voice_id,
            style=full_style,
            pitch_semitones=pitch_st,
            out_path=out_path,
        )
        status_tag = "NEW"
    else:
        dur = get_wav_duration(out_path)
        status_tag = "CACHED"

    words = align_words_from_wav(item["en"], out_path, tagged_text=tagged_text)

    entry: dict[str, Any] = {
        "file": f"audio/{fname}",
        "dur": round(dur, 3),
        "voice": f"{char_id}:{voice_id}(+{pitch_st:.1f}st)",
        "style": acting_style,
        "words": words,
        "key": cache_key,
    }

    if char_id == "CAST":
        extras = []
        for k, (x_voice, x_persona, x_pitch) in enumerate(CAST_EXTRA_VOICES):
            xf = f"l{lid:03d}_x{k}.wav"
            x_path = AUDIO_DIR / xf
            x_style = f"{x_persona}, {acting_style}"
            if force or not (x_path.exists() and x_path.stat().st_size > 1000):
                xd = synthesize_with_retry(
                    text=tagged_text,
                    voice_id=x_voice,
                    style=x_style,
                    pitch_semitones=x_pitch,
                    out_path=x_path,
                )
            else:
                xd = get_wav_duration(x_path)
            extras.append({"file": f"audio/{xf}", "dur": round(xd, 3)})
        entry["extra"] = extras

    print(
        f"  ✓ [{status_tag:<6}] Line {lid:03d} | {char_id:<18} | {voice_id:<16} (+{pitch_st:.1f}st) | {dur:5.2f}s | {tagged_text[:52]}",
        flush=True,
    )
    return lid_str, entry


def build_stage_sfx(sfx: dict[str, Any], force: bool) -> None:
    out_path = AUDIO_DIR / sfx["fname"]
    if not force and out_path.exists() and out_path.stat().st_size > 1000:
        print(f"  ✓ [CACHED] SFX      | {sfx['fname']:<18}", flush=True)
        return
    dur = synthesize_with_retry(
        text=sfx["text"],
        voice_id=sfx["voice"],
        style=sfx["style"],
        pitch_semitones=float(sfx["pitch_st"]),
        out_path=out_path,
    )
    print(
        f"  ✓ [NEW   ] SFX      | {sfx['fname']:<18} | {sfx['voice']:<16} (+{sfx['pitch_st']:.1f}st) | {dur:5.2f}s | {sfx['text']}",
        flush=True,
    )


def write_timeline_js(results: dict[str, dict[str, Any]]) -> float:
    ordered_data = {k: results[k] for k in sorted(results.keys(), key=lambda x: int(x))}
    total_dur = sum(v["dur"] for v in ordered_data.values())
    OUT_JS.write_text(
        "/* AUTO-GENERATED by tools/build_video_audio.py (Gemini 3.8 TTS Child Voice Engine) — do not edit by hand */\n"
        + "window.VIDEO_AUDIO = "
        + json.dumps(ordered_data, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    return total_dur


def main() -> None:
    force = "--force" in sys.argv
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    update_voice_catalogs()

    cache: dict[str, Any] = {}
    if OUT_JS.exists():
        raw = OUT_JS.read_text(encoding="utf-8")
        m = re.search(r"window\.VIDEO_AUDIO\s*=\s*(\{.*\});", raw, re.S)
        if m:
            try:
                cache = json.loads(m.group(1))
            except Exception:
                cache = {}

    items = [i for i in parse_lines() if i["type"] == "dialogue" and i["en"]]
    print(
        f"Synthesizing {len(items)} dialogue lines + {len(STAGE_SFX_CLIPS)} stage SFX clips with {MODEL_ID} (workers=3, timeout=25s)...",
        flush=True,
    )

    results: dict[str, dict[str, Any]] = dict(cache) if not force else {}
    completed_count = 0

    # Process in controlled concurrent batches of 3 workers with incremental saves
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        future_map = {pool.submit(build_dialogue_item, item, force, cache): item["id"] for item in items}
        for fut in concurrent.futures.as_completed(future_map):
            lid_str, entry = fut.result()
            results[lid_str] = entry
            completed_count += 1
            if completed_count % 5 == 0 or completed_count == len(items):
                write_timeline_js(results)
                print(f"    [Progress: {completed_count}/{len(items)} dialogue lines saved to timeline-data.js]", flush=True)

        sfx_futures = [pool.submit(build_stage_sfx, sfx, force) for sfx in STAGE_SFX_CLIPS]
        for sf in concurrent.futures.as_completed(sfx_futures):
            sf.result()

    total_dur = write_timeline_js(results)
    print(f"\n🎉 Done! Generated {len(results)} dialogue lines ({total_dur/60.0:.1f} min) -> {OUT_JS}", flush=True)


if __name__ == "__main__":
    main()
