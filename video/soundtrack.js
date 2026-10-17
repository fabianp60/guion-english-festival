/* ==========================================================================
   STAGE SOUNDTRACK, MUSICAL NUMBERS & CROWD CHEERS ENGINE
   Provides real synthesized music for every musical scene in the script
   plus cheering/applause ("Yaaay!", "Good job!", "Bravooo!") and sound FX.
   ========================================================================== */
(function () {
  "use strict";

  let ctx = null;
  let activeIntervals = [];
  let activeNodes = [];
  let activeVoiceClips = [];

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function stopAllMusicAndSfx() {
    activeIntervals.forEach((id) => clearInterval(id));
    activeIntervals = [];
    activeNodes.forEach((n) => {
      try {
        n.stop();
      } catch (e) {}
      try {
        n.disconnect();
      } catch (e) {}
    });
    activeNodes = [];
    activeVoiceClips.forEach((a) => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch (e) {}
    });
    activeVoiceClips = [];
  }

  // Helper: play a single musical note with envelope
  function playNote(freq, startOffset, duration, type = "triangle", peakGain = 0.14) {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime + startOffset;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
    activeNodes.push(osc);
  }

  // Helper: synthesized drum kick + hi-hat beat
  function playDrumHit(startOffset, isKick, vol = 0.18) {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime + startOffset;

    if (isKick) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.16);
      activeNodes.push(osc);
    } else {
      // Snare / Hi-hat noise burst
      const bufferSize = c.sampleRate * 0.08;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = c.createBufferSource();
      noise.buffer = buffer;

      const filter = c.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1800, now);

      const gain = c.createGain();
      gain.gain.setValueAtTime(vol * 0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      noise.start(now);
      activeNodes.push(noise);
    }
  }

  // Helper: Clapperboard wooden snap ("Scene X, Take Y!")
  function playClapperSnap() {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.085);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.09);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  // Helper: Applause burst (multiple soft claps)
  function playApplauseClaps(durationSec = 4.0) {
    const c = getCtx();
    if (!c) return;
    const totalClaps = Math.floor(durationSec * 14);
    for (let i = 0; i < totalClaps; i++) {
      const offset = (i / 14) + Math.random() * 0.06;
      const bufferSize = Math.floor(c.sampleRate * 0.045);
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.35));
      }
      const src = c.createBufferSource();
      src.buffer = buffer;

      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1100 + Math.random() * 700;

      const gain = c.createGain();
      gain.gain.value = 0.055;

      src.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      src.start(c.currentTime + offset);
      activeNodes.push(src);
    }
  }

  // 1. ARTIST'S SLOW, SOFT UKULELE/HARP TUNE (Line 35 & softly under 36)
  function startArtistSong(volumeScale = 1.0) {
    // Gentle sentimental arpeggio in A minor / F major
    const melody = [
      [440.0, 0.45], [523.25, 0.45], [659.25, 0.55], [587.33, 0.5],
      [349.23, 0.45], [440.0, 0.45], [523.25, 0.55], [493.88, 0.5],
      [392.0, 0.45], [493.88, 0.45], [587.33, 0.55], [523.25, 0.65],
      [440.0, 0.9]
    ];
    let t = 0;
    melody.forEach(([freq, dur]) => {
      playNote(freq, t, dur * 1.15, "sine", 0.16 * volumeScale);
      playNote(freq * 0.5, t, dur * 1.2, "triangle", 0.08 * volumeScale);
      t += dur * 0.82;
    });
  }

  // 2. TREND/DANCE CLIP #1 — UPBEAT MODERN POP SYNTH (Line 57)
  function startDanceTrend1(volumeScale = 1.0) {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33, 523.25, 659.25];
    const step = 0.23;
    notes.forEach((f, idx) => {
      const t = idx * step;
      playNote(f, t, step * 0.85, "square", 0.09 * volumeScale);
      playNote(f * 0.5, t, step * 0.9, "triangle", 0.12 * volumeScale);
      playDrumHit(t, idx % 2 === 0, 0.18 * volumeScale);
    });
  }

  // 3. TREND/DANCE CLIP #2 — ROCK-STYLE GUITAR RIFF (Line 63 & background on 64)
  function startRockTrend2(volumeScale = 1.0) {
    // Energetic rock power-chord riff (E5 - G5 - A5 - B5 - A5 - G5 - E5)
    const riff = [
      [164.81, 0.25], [164.81, 0.25], [196.0, 0.3], [220.0, 0.35],
      [246.94, 0.3], [220.0, 0.25], [196.0, 0.3], [164.81, 0.45],
      [164.81, 0.25], [196.0, 0.25], [220.0, 0.3], [164.81, 0.5]
    ];
    let t = 0;
    riff.forEach(([freq, dur], idx) => {
      // Sawtooth + Fifth for rock guitar texture
      playNote(freq, t, dur * 0.92, "sawtooth", 0.095 * volumeScale);
      playNote(freq * 1.5, t, dur * 0.92, "sawtooth", 0.075 * volumeScale);
      playDrumHit(t, idx % 2 === 0, 0.22 * volumeScale);
      t += dur;
    });
  }

  // 4. TREND/DANCE CLIP #3 — CLASSIC CROWD-FAVORITE HIT (Lines 68, 72, 108, 126)
  function startCrowdFavorite3(volumeScale = 1.0, loops = 1) {
    // Joyful classic 1950s Rock & Roll / Twist celebration melody in C major
    const phrase = [
      [523.25, 0.22], [659.25, 0.22], [783.99, 0.22], [880.0, 0.25],
      [783.99, 0.22], [659.25, 0.22], [523.25, 0.30],
      [587.33, 0.22], [698.46, 0.22], [880.0, 0.22], [987.77, 0.25],
      [880.0, 0.22], [783.99, 0.32], [1046.5, 0.42]
    ];
    let t = 0;
    for (let l = 0; l < loops; l++) {
      phrase.forEach(([freq, dur], idx) => {
        playNote(freq, t, dur * 0.9, "triangle", 0.15 * volumeScale);
        playNote(freq * 0.5, t, dur * 0.95, "sine", 0.12 * volumeScale);
        playDrumHit(t, idx % 2 === 0, 0.16 * volumeScale);
        t += dur;
      });
    }
  }

  // Helper to play overlapping voice MP3 clips (cheers, laughs)
  function playVoiceClips(files, delaysMs, volume = 0.85) {
    files.forEach((file, i) => {
      const delay = delaysMs[i] || 0;
      const tid = setTimeout(() => {
        const a = new Audio(file);
        a.volume = volume;
        a.play().catch(() => {});
        activeVoiceClips.push(a);
      }, delay);
      activeIntervals.push(tid);
    });
  }

  /**
   * Triggered whenever a line starts in the animated player.
   * Returns a recommended minimum duration (in ms) for stage-direction lines
   * that feature music or cheering.
   */
  function triggerAudioForLine(line) {
    stopAllMusicAndSfx();
    const id = line.id;

    // Clapperboard sound before film takes
    if (id === 21 || id === 22 || id === 33 || id === 80 || id === 100) {
      playClapperSnap();
    }

    // Line 11: "THORWALD laughs loudly — but his smile fades..."
    if (id === 11) {
      playVoiceClips(["audio/sfx_11_laugh.wav"], [80], 0.9);
      return 3400;
    }

    // Line 35: "FILM SCENE BEGINS. ARTIST really plays a slow, soft tune."
    if (id === 35) {
      startArtistSong(1.0);
      return 5400;
    }
    // Line 36: Soft background ukulele while Miss Lonelyhearts cries
    if (id === 36) {
      startArtistSong(0.32);
    }

    // Line 57: "Trend/dance clip #1 plays — upbeat modern trend. Cast dances."
    if (id === 57) {
      startDanceTrend1(1.0);
      return 3600;
    }

    // Line 63: "Trend/dance clip #2 plays — rock-style trend. Cast head-bangs / air-guitars."
    if (id === 63) {
      startRockTrend2(1.0);
      return 4200;
    }
    // Line 64: Luciana comments while rock beat plays softly underneath
    if (id === 64) {
      startRockTrend2(0.25);
    }

    // Line 68: "Trend/dance clip #3 plays — classic crowd-favorite hit."
    if (id === 68) {
      startCrowdFavorite3(1.0, 1);
      return 4000;
    }
    // Line 69, 70, 71: Keep festive music softly underneath while Camera Man, Lisa & Cast invite parents to dance
    if (id === 69 || id === 70 || id === 71) {
      startCrowdFavorite3(0.28, 1);
    }
    // Line 72: "Full cast + audience dance, ~30–45 seconds..."
    if (id === 72) {
      startCrowdFavorite3(1.0, 2);
      playApplauseClaps(5.5);
      return 6400;
    }

    // Line 98: "Everyone laughs softly. THORWALD breathes, stands, holds the lucky rock tight."
    if (id === 98) {
      playVoiceClips(["audio/sfx_98_laugh_a.wav", "audio/sfx_98_laugh_b.wav"], [100, 450], 0.85);
      return 3600;
    }

    // Line 105: "Everyone cheers for THORWALD. He looks stunned, then breaks into a real smile."
    if (id === 105) {
      playApplauseClaps(5.2);
      playVoiceClips(
        [
          "audio/sfx_105_cheer_a.wav",
          "audio/sfx_105_cheer_b.wav",
          "audio/sfx_105_cheer_c.wav",
          "audio/sfx_105_cheer_d.wav"
        ],
        [60, 420, 880, 1350],
        0.95
      );
      return 5500;
    }

    // Line 108: "The classic song from the Playlist Problem starts softly. THORWALD taps his foot, then finally gives in and dances..."
    if (id === 108) {
      startCrowdFavorite3(0.85, 1);
      return 4500;
    }
    if (id === 109 || id === 110) {
      startCrowdFavorite3(0.25, 1);
    }

    // Line 126: "All cast bow together. Song #3 from the Playlist Problem plays again — bubbles or confetti fall..."
    if (id === 126) {
      startCrowdFavorite3(1.0, 2);
      playApplauseClaps(6.0);
      playVoiceClips(["audio/sfx_126_finale_a.wav", "audio/sfx_126_finale_b.wav"], [250, 950], 0.9);
      return 6500;
    }

    return null;
  }

  window.STAGE_SOUNDTRACK = {
    triggerAudioForLine,
    stopAllMusicAndSfx
  };
})();
