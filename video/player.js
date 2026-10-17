/* ==========================================================================
   ANIMATED PLAY VIDEO PLAYER ENGINE
   Synchronizes character acting, lip-sync, neural voice audio, and
   word-by-word highlighted subtitles across all 127 script entries.
   ========================================================================== */
(function () {
  "use strict";

  const LINES = SCRIPT_DATA.lines;
  const SCENES = SCRIPT_DATA.scenes;
  const CHARS = SCRIPT_DATA.characters;
  const AUDIO_MAP = window.VIDEO_AUDIO || {};
  const { LOOKS, POSES, EXPR, MOUTHS, PROP_SVG, buildCharacterSVG } = window.CAST_KIT;
  const { ALL_ACTORS, getStageStateForLine } = window.STAGE_DIRECTOR;

  // Identify lines that immediately precede a Luciana line (Cue lines)
  const CUE_LINE_IDS = new Set();
  LINES.forEach((l, idx) => {
    if (l.isLuciana && idx > 0) {
      CUE_LINE_IDS.add(LINES[idx - 1].id);
    }
  });

  // Player State
  const player = {
    lineIndex: 0, // 0..126
    isPlaying: false,
    waitingForLucianaPractice: false,
    playbackRate: 1.0,
    pauseOnLuciana: false,
    showSpanish: true,
    showPhonetics: true,
    activeWordIdx: -1,

    // Audio & Timers
    audioEl: new Audio(),
    extraAudios: [],
    stageTimer: null,
    stageStartMs: 0,
    stageDurationMs: 3200,
    rafId: null,

    // Interpolated Actor Positions
    actorCurrentPos: {},
    actorTargetState: {}
  };

  // DOM Elements
  let svgActorsLayer = null;
  let svgLightingOverlay = null;
  let svgFxLayer = null;
  let subtitleCardEl = null;

  // ================= STAGE SVG INITIALIZATION =================
  function initStageSVG() {
    svgActorsLayer = document.getElementById("svg-actors-layer");
    svgLightingOverlay = document.getElementById("svg-lighting-overlay");
    svgFxLayer = document.getElementById("svg-fx-layer");
    subtitleCardEl = document.getElementById("subtitle-card");

    if (!svgActorsLayer) return;

    // Build all 12 consistent character puppets inside the SVG stage
    svgActorsLayer.innerHTML = ALL_ACTORS.map((id) => buildCharacterSVG(id)).join("");

    // Initialize default positions
    ALL_ACTORS.forEach((id) => {
      player.actorCurrentPos[id] = { x: 960, y: 700, scale: 0.9 };
    });
  }

  // Apply pose, expression, props, and target position to every character on stage
  function applyStageChoreography(line, snapImmediately) {
    const stageState = getStageStateForLine(line);
    player.actorTargetState = stageState.actors;

    // Update top HUD badges
    const sceneObj = SCENES.find((s) => s.id === line.sceneId) || SCENES[0];
    const hudEn = document.getElementById("hud-scene-en");
    const hudEs = document.getElementById("hud-scene-es");
    if (hudEn) hudEn.textContent = sceneObj.title;
    if (hudEs) hudEs.textContent = sceneObj.titleEs;

    const modePill = document.getElementById("hud-mode-pill");
    if (modePill) {
      if (stageState.fx.filmMode) {
        modePill.textContent = "🔴 ON AIR — FILMING SCENE (1954 MOVIE)";
        modePill.classList.add("on-air-film");
      } else {
        modePill.textContent = "🎬 BACKSTAGE — REAL LIFE ON STAGE 18";
        modePill.classList.remove("on-air-film");
      }
    }

    // Update active scene tab button in topbar
    document.querySelectorAll(".scene-jump-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.sceneId === line.sceneId);
    });

    // Update lighting mood
    updateStageLighting(stageState.lighting, stageState.fx);

    // Configure each puppet
    ALL_ACTORS.forEach((id) => {
      const el = svgActorsLayer.querySelector(`.char[data-id="${id}"]`);
      if (!el) return;
      const st = stageState.actors[id];

      if (snapImmediately) {
        player.actorCurrentPos[id].x = st.x;
        player.actorCurrentPos[id].y = st.y;
        player.actorCurrentPos[id].scale = st.scale;
      }

      el.style.opacity = st.vis ? "1" : "0";

      // Tears, sweat, and makeup powder layers
      const tearsLayer = el.querySelector(".tears-layer");
      const sweatLayer = el.querySelector(".sweat-layer");
      const powderLayer = el.querySelector(".powder-layer");
      if (tearsLayer) tearsLayer.style.opacity = st.crying ? "1" : "0";
      if (sweatLayer) sweatLayer.style.opacity = st.sweat ? "1" : "0";
      if (powderLayer) powderLayer.style.opacity = st.powdered ? "1" : "0";

      // Stance classes (stand, sit, kneel, floor) & wheelchair
      el.classList.toggle("stance-sit", st.stance === "sit");
      el.classList.toggle("stance-kneel", st.stance === "kneel");
      el.classList.toggle("stance-floor", st.stance === "floor");
      el.classList.toggle("has-wheelchair", !!st.wheelchair);

      // Speaking highlight
      const isSpeaking =
        line.type === "dialogue" &&
        (line.character === id || (line.character === "CAST" && st.vis));
      el.classList.toggle("is-speaking", isSpeaking);

      // Arm Pose
      const poseObj = POSES[st.pose] || POSES.rest;
      const armL = el.querySelector(".arm-L");
      const foreL = el.querySelector(".fore-L");
      const armR = el.querySelector(".arm-R");
      const foreR = el.querySelector(".fore-R");
      const head = el.querySelector(".head");

      if (armL) armL.style.transform = `rotate(${poseObj.L[0]}deg)`;
      if (foreL) foreL.style.transform = `rotate(${poseObj.L[1]}deg)`;
      if (armR) armR.style.transform = `rotate(${-poseObj.R[0]}deg)`;
      if (foreR) foreR.style.transform = `rotate(${-poseObj.R[1]}deg)`;
      if (head) head.style.transform = `rotate(${poseObj.head || 0}deg)`;

      // Facial Expression
      const exprObj = EXPR[st.expr] || EXPR.neutral;
      const browL = el.querySelector(".brow-l");
      const browR = el.querySelector(".brow-r");
      const mouth = el.querySelector(".mouth");
      if (browL) browL.style.transform = `rotate(${exprObj.brow}deg)`;
      if (browR) browR.style.transform = `rotate(${-exprObj.brow}deg)`;
      if (mouth) {
        mouth.setAttribute("d", MOUTHS[exprObj.mouth] || MOUTHS.smile);
      }

      // Hand Props (default character prop or line override)
      const defaultProps = (LOOKS[id] && LOOKS[id].props) || {};
      const propLeftName = st.propL !== undefined && st.propL !== null ? st.propL : defaultProps.L;
      const propRightName = st.propR !== undefined && st.propR !== null ? st.propR : defaultProps.R;

      const propLEl = el.querySelector(".prop-L");
      const propREl = el.querySelector(".prop-R");
      if (propLEl) propLEl.innerHTML = propLeftName && PROP_SVG[propLeftName] ? PROP_SVG[propLeftName] : "";
      if (propREl) propREl.innerHTML = propRightName && PROP_SVG[propRightName] ? PROP_SVG[propRightName] : "";
    });

    // Sort SVG DOM elements by Y coordinate so foreground characters overlap properly
    const sortedIds = [...ALL_ACTORS].sort(
      (a, b) => (stageState.actors[a].y || 700) - (stageState.actors[b].y || 700)
    );
    sortedIds.forEach((id) => {
      const el = svgActorsLayer.querySelector(`.char[data-id="${id}"]`);
      if (el) svgActorsLayer.appendChild(el);
    });
  }

  function updateStageLighting(lighting, fx) {
    if (!svgLightingOverlay || !svgFxLayer) return;

    const colors = {
      warm:        "rgba(251, 191, 36, 0.06)",
      film:        "rgba(14, 165, 233, 0.14)",
      romantic:    "rgba(244, 114, 182, 0.12)",
      party:       "rgba(168, 85, 247, 0.16)",
      tension:     "rgba(15, 23, 42, 0.42)",
      thriller:    "rgba(30, 27, 75, 0.48)",
      celebration: "rgba(52, 211, 153, 0.10)",
      finale:      "rgba(253, 224, 71, 0.12)"
    };
    svgLightingOverlay.setAttribute("fill", colors[lighting] || colors.warm);

    // Special stage FX (musical notes, bubbles/confetti, flickering lights)
    let fxHtml = "";
    if (fx.musicNotes) {
      const notes = ["♪", "♫", "♬", "♩", "♪", "♫"];
      fxHtml += notes
        .map(
          (n, i) =>
            `<text class="floating-note" data-idx="${i}" x="${340 + i * 240}" y="${250 + (i % 2) * 60}" font-size="46" fill="#fde047" opacity="0.85">${n}</text>`
        )
        .join("");
    }
    if (fx.bubbles) {
      for (let i = 0; i < 24; i++) {
        const cx = 120 + ((i * 79) % 1680);
        const cy = 90 + ((i * 53) % 480);
        const r = 10 + (i % 4) * 6;
        const col = ["#fde047", "#f472b6", "#a855f7", "#38bdf8", "#4ade80"][i % 5];
        fxHtml += `<circle class="floating-bubble" data-idx="${i}" cx="${cx}" cy="${cy}" r="${r}" fill="${col}" fill-opacity="0.45" stroke="#fff" stroke-width="1.5"/>`;
      }
    }
    if (fx.cheers) {
      const callouts = [
        { text: "YAAAY! 🎉", x: 320, y: 310, bg: "#f59e0b" },
        { text: "GOOD JOB! 👏", x: 690, y: 260, bg: "#10b981" },
        { text: "BRAVOOO! 🌟", x: 1180, y: 270, bg: "#8b5cf6" },
        { text: "WAY TO GO! 🙌", x: 1520, y: 320, bg: "#ec4899" }
      ];
      callouts.forEach((c, i) => {
        fxHtml += `<g class="floating-note" data-idx="${i}" transform="translate(0,0)">
          <rect x="${c.x - 105}" y="${c.y - 28}" width="210" height="44" rx="22" fill="${c.bg}" stroke="#fff" stroke-width="2.5"/>
          <text x="${c.x}" y="${c.y + 1}" text-anchor="middle" fill="#fff" font-size="20" font-weight="900" font-family="Nunito, sans-serif">${c.text}</text>
        </g>`;
      });
    }
    svgFxLayer.innerHTML = fxHtml;
  }

  // ================= SUBTITLE RENDERING & WORD HIGHLIGHTING =================
  function renderSubtitles(line) {
    if (!subtitleCardEl) return;

    const charObj = CHARS[line.character] || CHARS.STAGE;
    const isLu = !!line.isLuciana;
    const isCue = CUE_LINE_IDS.has(line.id);

    subtitleCardEl.classList.toggle("is-luciana-turn", isLu);
    subtitleCardEl.classList.toggle("is-cue-for-luciana", isCue && !isLu);

    const words = (line.en || "").trim().split(/\s+/);
    const wordsHtml = words
      .map((w, i) => `<span class="sub-word" data-widx="${i}">${w}</span>`)
      .join(" ");

    let speakerBadgeText = `${charObj.avatar || "🎬"} ${charObj.shortName || charObj.name}`;
    if (isLu && !line.isLucianaEnsemble) {
      speakerBadgeText = `⭐ LUCIANA (#${line.lucianaOrder})`;
    } else if (isLu && line.isLucianaEnsemble) {
      speakerBadgeText = `🌟 ALL CAST + LUCIANA (#${line.lucianaOrder})`;
    } else if (line.type === "stage") {
      speakerBadgeText = `🎬 STAGE`;
    }

    subtitleCardEl.innerHTML = `
      <div class="sub-compact-main">
        <div class="sub-header-row">
          <span class="sub-speaker-pill">${speakerBadgeText}</span>
          ${line.emotion ? `<span class="sub-emotion-pill">(${line.emotion})</span>` : ""}
          ${isCue && !isLu ? `<span class="sub-cue-alert">👂 NEXT: LUCIANA!</span>` : ""}
        </div>

        <div class="sub-en-line" id="sub-en-words-row">
          ${wordsHtml}
        </div>
      </div>

      ${
        player.waitingForLucianaPractice && isLu
          ? `<div class="luciana-pause-controls">
              <span style="font-weight:800; color:#fde047; font-size:0.84rem;">🎤 ¡Tu turno! Di tu línea:</span>
              <button class="ctrl-btn" id="btn-sub-hear-lu">🔊 Oír</button>
              <button class="ctrl-btn ctrl-btn-play" id="btn-sub-continue-play">✅ Continuar ➡️</button>
             </div>`
          : ""
      }
    `;

    // Allow clicking any word in the subtitle to jump or hear
    subtitleCardEl.querySelectorAll(".sub-word").forEach((wordEl) => {
      wordEl.addEventListener("click", () => {
        if (!player.isPlaying) {
          playCurrentLine();
        }
      });
    });

    document.getElementById("btn-sub-hear-lu")?.addEventListener("click", () => {
      player.waitingForLucianaPractice = false;
      renderSubtitles(line);
      startAudioForLine(line, true);
    });

    document.getElementById("btn-sub-continue-play")?.addEventListener("click", () => {
      player.waitingForLucianaPractice = false;
      advanceToNextLine();
    });
  }

  function updateWordHighlightAtTime(line, elapsedMs) {
    const row = document.getElementById("sub-en-words-row");
    if (!row) return;
    const wordEls = row.querySelectorAll(".sub-word");
    if (!wordEls.length) return;

    const audioInfo = AUDIO_MAP[String(line.id)];
    let activeIdx = -1;

    if (audioInfo && Array.isArray(audioInfo.words) && audioInfo.words.length === wordEls.length) {
      // Exact neural TTS WordBoundary synchronization
      for (let i = 0; i < audioInfo.words.length; i++) {
        const w = audioInfo.words[i];
        if (elapsedMs >= w.s - 25 && elapsedMs <= w.e + 70) {
          activeIdx = i;
          break;
        }
        if (elapsedMs > w.e) {
          activeIdx = i;
        }
      }
    } else {
      // Proportional fallback for stage directions
      const progress = Math.min(1, Math.max(0, elapsedMs / Math.max(1, player.stageDurationMs)));
      activeIdx = Math.min(wordEls.length - 1, Math.floor(progress * wordEls.length));
    }

    if (activeIdx !== player.activeWordIdx) {
      player.activeWordIdx = activeIdx;
      wordEls.forEach((el, idx) => {
        el.classList.toggle("spoken-now", idx === activeIdx);
        el.classList.toggle("spoken-past", idx < activeIdx);
      });
    }
  }

  // ================= PLAYBACK & AUDIO ENGINE =================
  function stopCurrentAudio() {
    player.audioEl.pause();
    player.audioEl.onended = null;
    player.extraAudios.forEach((a) => a.pause());
    player.extraAudios = [];
    if (window.STAGE_SOUNDTRACK) {
      window.STAGE_SOUNDTRACK.stopAllMusicAndSfx();
    }
    if (player.stageTimer) {
      clearTimeout(player.stageTimer);
      player.stageTimer = null;
    }
  }

  function loadLine(index, autoPlay) {
    stopCurrentAudio();
    player.lineIndex = Math.max(0, Math.min(LINES.length - 1, index));
    player.activeWordIdx = -1;
    player.waitingForLucianaPractice = false;

    const line = LINES[player.lineIndex];
    applyStageChoreography(line, false);
    renderSubtitles(line);
    updateScrubberUI();
    updatePlayButtonUI();

    if (autoPlay) {
      playCurrentLine();
    }
  }

  function playCurrentLine() {
    const line = LINES[player.lineIndex];
    if (!line) return;

    player.isPlaying = true;
    updatePlayButtonUI();

    // If "Pause on Luciana's turn" is enabled, pause before speaking her line so she can say it first!
    if (line.isLuciana && player.pauseOnLuciana && !player.waitingForLucianaPractice) {
      player.waitingForLucianaPractice = true;
      renderSubtitles(line);
      return;
    }

    startAudioForLine(line, true);
  }

  function startAudioForLine(line, advanceWhenDone) {
    stopCurrentAudio();
    const audioInfo = AUDIO_MAP[String(line.id)];
    const customStageDurationMs = window.STAGE_SOUNDTRACK
      ? window.STAGE_SOUNDTRACK.triggerAudioForLine(line)
      : null;

    if (line.type === "dialogue" && audioInfo && audioInfo.file) {
      player.audioEl.src = audioInfo.file;
      player.audioEl.playbackRate = player.playbackRate;

      // Ensemble chorus extra voices if present
      if (Array.isArray(audioInfo.extra)) {
        player.extraAudios = audioInfo.extra.map((x) => {
          const a = new Audio(x.file);
          a.playbackRate = player.playbackRate;
          a.volume = 0.55;
          a.play().catch(() => {});
          return a;
        });
      }

      player.audioEl.onended = () => {
        // Highlight all words as completed briefly
        const row = document.getElementById("sub-en-words-row");
        if (row) {
          row.querySelectorAll(".sub-word").forEach((el) => {
            el.classList.remove("spoken-now");
            el.classList.add("spoken-past");
          });
        }
        if (advanceWhenDone && player.isPlaying) {
          player.stageTimer = setTimeout(() => {
            advanceToNextLine();
          }, 380);
        }
      };

      player.audioEl.play().catch((err) => {
        console.warn("Audio play blocked or failed:", err);
        player.isPlaying = false;
        updatePlayButtonUI();
      });
    } else {
      // Visual stage direction beat (with music / cheering / laughs when applicable)
      const wordCount = (line.en || "").split(/\s+/).length;
      const baseMs = customStageDurationMs || Math.max(2400, Math.min(5200, wordCount * 240));
      player.stageDurationMs = baseMs / player.playbackRate;
      player.stageStartMs = performance.now();

      player.stageTimer = setTimeout(() => {
        if (advanceWhenDone && player.isPlaying) {
          advanceToNextLine();
        }
      }, player.stageDurationMs);
    }
  }

  function advanceToNextLine() {
    if (player.lineIndex + 1 < LINES.length) {
      loadLine(player.lineIndex + 1, true);
    } else {
      player.isPlaying = false;
      updatePlayButtonUI();
    }
  }

  function togglePlayPause() {
    if (player.isPlaying) {
      player.isPlaying = false;
      stopCurrentAudio();
      updatePlayButtonUI();
    } else {
      playCurrentLine();
    }
  }

  function jumpToLucianaLine(direction) {
    const luIndices = LINES.map((l, idx) => (l.isLuciana ? idx : -1)).filter((idx) => idx !== -1);
    if (direction > 0) {
      const nextIdx = luIndices.find((idx) => idx > player.lineIndex);
      loadLine(nextIdx !== undefined ? nextIdx : luIndices[0], player.isPlaying);
    } else {
      const prevIndices = luIndices.filter((idx) => idx < player.lineIndex);
      loadLine(prevIndices.length ? prevIndices[prevIndices.length - 1] : luIndices[luIndices.length - 1], player.isPlaying);
    }
  }

  // ================= 60 FPS STAGE ANIMATION LOOP =================
  function animationFrameLoop(now) {
    const line = LINES[player.lineIndex];

    // 1. Update synchronized word highlight
    if (player.isPlaying && !player.waitingForLucianaPractice && line) {
      const audioInfo = AUDIO_MAP[String(line.id)];
      if (line.type === "dialogue" && audioInfo) {
        const elapsedMs = player.audioEl.currentTime * 1000;
        updateWordHighlightAtTime(line, elapsedMs);
      } else {
        const elapsedMs = now - player.stageStartMs;
        updateWordHighlightAtTime(line, elapsedMs);
      }
    }

    // 2. Smoothly interpolate character positions, breathing, lip-sync, and dancing
    const t = now * 0.001;
    const stageState = line ? getStageStateForLine(line) : null;

    ALL_ACTORS.forEach((id, idx) => {
      const el = svgActorsLayer ? svgActorsLayer.querySelector(`.char[data-id="${id}"]`) : null;
      if (!el) return;

      const cur = player.actorCurrentPos[id];
      const tgt = (player.actorTargetState && player.actorTargetState[id]) || cur;

      // Smooth X, Y, Scale interpolation
      cur.x += (tgt.x - cur.x) * 0.12;
      cur.y += (tgt.y - cur.y) * 0.12;
      cur.scale += (tgt.scale - cur.scale) * 0.12;

      const walkingDist = Math.abs(tgt.x - cur.x);
      const walkBob = walkingDist > 4 ? Math.abs(Math.sin(t * 14)) * -10 : 0;

      // Dance / Nod / Shake / Bow offsets
      let bounceY = Math.sin(t * 2.4 + idx) * 2.2 + walkBob;
      let rotDeg = 0;

      if (tgt.dance) {
        bounceY = Math.abs(Math.sin(t * 8.5 + idx * 0.7)) * -18;
        rotDeg = Math.sin(t * 4.25 + idx) * 5;
      } else if (tgt.nod) {
        bounceY = Math.abs(Math.sin(t * 6.5)) * -7;
      } else if (tgt.shake) {
        cur.x += Math.sin(t * 38) * 1.8;
      } else if (tgt.bow) {
        rotDeg = 18;
      }

      // Dynamic Character Acting Behaviors (act)
      const act = tgt.act || "";
      const legL = el.querySelector(".leg-l");
      const legR = el.querySelector(".leg-r");
      const foreLEl = el.querySelector(".fore-L");
      const foreREl = el.querySelector(".fore-R");
      const clapArm = el.querySelector(".clap-arm");
      const clackBurst = el.querySelector(".clack-burst");

      // Walking & Running Leg Swing
      const isWalking = walkingDist > 3;
      if (act === "sprintRun" || (isWalking && act === "sprintRun")) {
        const swing = Math.sin(t * 22) * 36;
        if (legL) legL.style.transform = `rotate(${swing.toFixed(1)}deg)`;
        if (legR) legR.style.transform = `rotate(${(-swing).toFixed(1)}deg)`;
        bounceY = -Math.abs(Math.sin(t * 22)) * 14;
      } else if (act === "toughWalk" || isWalking) {
        const speed = act === "toughWalk" ? 9 : 14;
        const amp = act === "toughWalk" ? 22 : 28;
        const swing = Math.sin(t * speed) * amp;
        if (legL) legL.style.transform = `rotate(${swing.toFixed(1)}deg)`;
        if (legR) legR.style.transform = `rotate(${(-swing).toFixed(1)}deg)`;
        if (act === "toughWalk") {
          rotDeg = Math.sin(t * 4.5) * 4; // swagger sway
        }
      } else if (act === "tapFoot") {
        if (legR) legR.style.transform = `rotate(${Math.sin(t * 16) > 0 ? -14 : 0}deg)`;
        if (legL) legL.style.transform = "";
      } else {
        if (legL && legL.style.transform) legL.style.transform = "";
        if (legR && legR.style.transform) legR.style.transform = "";
      }

      // Acting: Clapperboard Snap (CAMERA)
      if (clapArm) {
        if (act === "clapBoard") {
          const phase = (t * 2.2) % 2;
          if (phase < 1.3) {
            clapArm.style.transform = "rotate(-38deg)";
            if (clackBurst) clackBurst.setAttribute("opacity", "0");
          } else {
            clapArm.style.transform = "rotate(0deg)";
            if (clackBurst) {
              const burstOpac = phase < 1.6 ? "1" : "0";
              clackBurst.setAttribute("opacity", burstOpac);
            }
          }
        } else if (act === "clapOpen") {
          clapArm.style.transform = "rotate(-34deg)";
          if (clackBurst) clackBurst.setAttribute("opacity", "0");
        } else {
          clapArm.style.transform = "rotate(0deg)";
          if (clackBurst) clackBurst.setAttribute("opacity", "0");
        }
      }

      // Acting: Makeup Artist Powdering (MAKEUP)
      if (act === "powderLeft" || act === "powderRight") {
        const activeFore = act === "powderLeft" ? foreLEl : foreREl;
        if (activeFore) {
          const dapAngle = Math.sin(t * 16) * 22;
          activeFore.style.transform = `rotate(${dapAngle.toFixed(1)}deg)`;
        }
      }

      // Acting: Ukulele Strumming (ARTIST)
      if (act === "strumUkulele") {
        if (foreREl) {
          const strum = Math.sin(t * 18) * 20;
          foreREl.style.transform = `rotate(${(-40 + strum).toFixed(1)}deg)`;
        }
      }

      // Acting: Sculpting Clay (ARTIST)
      if (act === "sculptClay") {
        if (foreLEl) foreLEl.style.transform = `rotate(${(Math.sin(t * 11) * 16).toFixed(1)}deg)`;
        if (foreREl) foreREl.style.transform = `rotate(${(Math.cos(t * 11) * -16).toFixed(1)}deg)`;
      }

      // Acting: Wipe Tears (MISS_L)
      if (act === "wipeTears") {
        if (foreREl) {
          const wipe = Math.sin(t * 7) * 16;
          foreREl.style.transform = `rotate(${(-115 + wipe).toFixed(1)}deg)`;
        }
      }

      // Acting: Freeze & Tremble (THORWALD)
      if (act === "freezeTremble") {
        cur.x += (Math.random() - 0.5) * 3;
        bounceY += (Math.random() - 0.5) * 3;
        rotDeg += (Math.random() - 0.5) * 2.5;
      }

      // Acting: Clap Hands (Ensemble / Party)
      if (act === "clapHands") {
        const clap = Math.abs(Math.sin(t * 14)) * 18;
        if (foreLEl) foreLEl.style.transform = `rotate(${(50 - clap).toFixed(1)}deg)`;
        if (foreREl) foreREl.style.transform = `rotate(${(-50 + clap).toFixed(1)}deg)`;
      }

      // Acting: Air Guitar (JEFF / STELLA)
      if (act === "airGuitar") {
        if (foreREl) {
          const strum = Math.sin(t * 20) * 30;
          foreREl.style.transform = `rotate(${strum.toFixed(1)}deg)`;
        }
      }

      // Animated Tears Fall (crying)
      if (tgt.crying) {
        const tearL = el.querySelector(".tear-l");
        const tearR = el.querySelector(".tear-r");
        const dropY = (t * 36) % 18;
        if (tearL) tearL.style.transform = `translateY(${dropY.toFixed(1)}px)`;
        if (tearR) tearR.style.transform = `translateY(${dropY.toFixed(1)}px)`;
      }

      // Animated Sweat Drop (nervous/sweat)
      if (tgt.sweat) {
        const sweatDrop = el.querySelector(".sweat-drop");
        const dropY = (t * 22) % 14;
        if (sweatDrop) sweatDrop.style.transform = `translateY(${dropY.toFixed(1)}px)`;
      }

      // Animated Makeup Powder Puff Pulse on powdered face
      if (tgt.powdered) {
        const powderLayer = el.querySelector(".powder-layer");
        if (powderLayer) {
          const pScale = 0.95 + Math.sin(t * 10) * 0.12;
          powderLayer.style.transform = `scale(${pScale.toFixed(2)})`;
          powderLayer.style.transformOrigin = "0px -250px";
        }
      }

      el.setAttribute(
        "transform",
        `translate(${cur.x.toFixed(1)}, ${(cur.y + bounceY).toFixed(1)}) scale(${cur.scale.toFixed(3)}) rotate(${rotDeg.toFixed(1)})`
      );

      // Lip-sync mouth opening for active speaker
      const mouthOpenEl = el.querySelector(".mouth-open");
      const isSpeaker =
        player.isPlaying &&
        !player.waitingForLucianaPractice &&
        line &&
        line.type === "dialogue" &&
        (line.character === id || (line.character === "CAST" && tgt.vis));

      if (mouthOpenEl) {
        if (isSpeaker && !player.audioEl.paused) {
          const openRy = 3 + Math.abs(Math.sin(t * 21 + idx)) * 8.5;
          mouthOpenEl.setAttribute("ry", openRy.toFixed(1));
        } else {
          mouthOpenEl.setAttribute("ry", "0");
        }
      }
    });

    // 3. Flicker effect for Line 4 ("Director! The lights are flickering!")
    if (stageState && stageState.fx.flicker && svgLightingOverlay) {
      const flick = Math.sin(t * 28) > 0.2 ? "rgba(253, 224, 71, 0.22)" : "rgba(0, 0, 0, 0.58)";
      svgLightingOverlay.setAttribute("fill", flick);
    }

    // 4. Floating music notes & bubbles animation
    if (svgFxLayer) {
      svgFxLayer.querySelectorAll(".floating-note").forEach((n) => {
        const i = Number(n.dataset.idx || 0);
        const dy = Math.sin(t * 3 + i) * 18;
        n.setAttribute("transform", `translate(0, ${dy.toFixed(1)})`);
      });
      svgFxLayer.querySelectorAll(".floating-bubble").forEach((b) => {
        const i = Number(b.dataset.idx || 0);
        const dy = ((t * 35 + i * 25) % 420) - 180;
        b.setAttribute("transform", `translate(${Math.sin(t * 2 + i) * 14}, ${dy.toFixed(1)})`);
      });
    }

    player.rafId = requestAnimationFrame(animationFrameLoop);
  }

  // ================= UI & TRANSPORT CONTROLS =================
  function updatePlayButtonUI() {
    const btnPlay = document.getElementById("btn-play-toggle");
    if (btnPlay) {
      btnPlay.innerHTML = player.isPlaying ? "⏸️ Pausar Video" : "▶️ Reproducir Obra";
    }
  }

  function updateScrubberUI() {
    const pct = ((player.lineIndex + 1) / LINES.length) * 100;
    const fill = document.getElementById("scrubber-fill");
    if (fill) fill.style.width = `${pct}%`;

    const counter = document.getElementById("scrubber-counter");
    if (counter) {
      counter.textContent = `Diálogo ${player.lineIndex + 1} / ${LINES.length}`;
    }
  }

  function buildScrubberMarkers() {
    const track = document.getElementById("scrubber-track");
    if (!track) return;

    // Add glowing stars on the timeline where Luciana speaks
    LINES.forEach((line, idx) => {
      if (!line.isLuciana) return;
      const pct = ((idx + 0.5) / LINES.length) * 100;
      const dot = document.createElement("div");
      dot.className = "scrubber-marker-lu";
      dot.style.left = `${pct}%`;
      dot.title = `⭐ Línea #${line.lucianaOrder} de Luciana: "${line.en}"`;
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        loadLine(idx, true);
      });
      track.appendChild(dot);
    });

    // Click anywhere on timeline bar to seek
    const wrap = document.getElementById("scrubber-track-wrap");
    if (wrap) {
      wrap.addEventListener("click", (e) => {
        const rect = wrap.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const targetIndex = Math.floor(ratio * LINES.length);
        loadLine(targetIndex, player.isPlaying);
      });
    }
  }

  function buildCastModal() {
    const grid = document.getElementById("cast-modal-grid");
    if (!grid) return;

    grid.innerHTML = ALL_ACTORS.map((id) => {
      const charMeta = CHARS[id] || {};
      const isLu = id === "ASSISTANT_DIRECTOR";
      return `
        <div class="cast-preview-card ${isLu ? "is-lu" : ""}">
          <svg viewBox="-110 -375 220 390" style="width:115px; height:155px; margin:0 auto; display:block;">
            ${buildCharacterSVG(id).replace('style="opacity:0"', 'style="opacity:1"')}
          </svg>
          <div style="font-weight:900; font-size:0.9rem; color:${isLu ? "#fde047" : "#fff"};">
            ${isLu ? "⭐ LUCIANA PEÑA" : charMeta.shortName || id}
          </div>
          <div style="font-size:0.74rem; color:#cbd5e1; margin-top:2px;">
            ${charMeta.actors || ""}
          </div>
        </div>
      `;
    }).join("");
  }

  function attachControlEvents() {
    // Scene Jump Buttons
    document.querySelectorAll(".scene-jump-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sceneId = btn.dataset.sceneId;
        const firstLineIdx = LINES.findIndex((l) => l.sceneId === sceneId);
        if (firstLineIdx !== -1) {
          loadLine(firstLineIdx, true);
        }
      });
    });

    // Play / Pause
    document.getElementById("btn-play-toggle")?.addEventListener("click", togglePlayPause);

    // Prev / Next Line
    document.getElementById("btn-prev-line")?.addEventListener("click", () => {
      loadLine(player.lineIndex - 1, player.isPlaying);
    });
    document.getElementById("btn-next-line")?.addEventListener("click", () => {
      loadLine(player.lineIndex + 1, player.isPlaying);
    });

    // Prev / Next Luciana Line
    document.getElementById("btn-prev-lu")?.addEventListener("click", () => jumpToLucianaLine(-1));
    document.getElementById("btn-next-lu")?.addEventListener("click", () => jumpToLucianaLine(1));

    // Speed toggle
    document.getElementById("select-speed")?.addEventListener("change", (e) => {
      player.playbackRate = parseFloat(e.target.value) || 1.0;
      player.audioEl.playbackRate = player.playbackRate;
    });

    // Toggles
    document.getElementById("chk-pause-lu")?.addEventListener("change", (e) => {
      player.pauseOnLuciana = e.target.checked;
    });
    document.getElementById("chk-show-es")?.addEventListener("change", (e) => {
      player.showSpanish = e.target.checked;
      renderSubtitles(LINES[player.lineIndex]);
    });

    // Cast Modal
    const modal = document.getElementById("cast-modal-backdrop");
    document.getElementById("btn-open-cast")?.addEventListener("click", () => {
      modal?.classList.add("open");
    });
    document.getElementById("btn-close-cast")?.addEventListener("click", () => {
      modal?.classList.remove("open");
    });
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });

    // Keyboard shortcuts (Space = Play/Pause, Left/Right = Prev/Next line)
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        loadLine(player.lineIndex + 1, player.isPlaying);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        loadLine(player.lineIndex - 1, player.isPlaying);
      }
    });
  }

  function init() {
    initStageSVG();
    buildScrubberMarkers();
    buildCastModal();
    attachControlEvents();
    applyStageChoreography(LINES[0], true);
    loadLine(0, false);
    player.rafId = requestAnimationFrame(animationFrameLoop);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
