/* ==========================================================================
   STAGE 18 STUDIO — APPLICATION ENGINE
   Created for Luciana Peña — Assistant Director (MC)
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "luciana_stage18_progress_v1";

  // Application State
  const state = {
    activeTab: "my-lines",
    selectedLucianaOrder: 1,
    memoryLevel: 0, // 0: Full, 1: Hide Keywords, 2: First Letters, 3: Hide All English
    speechRate: 0.9, // 0.75 (Lento), 0.9 (Normal), 1.05 (Fluido)
    masteredLines: [], // array of lucianaOrder numbers (1..9)
    stars: 0,
    quizStreak: 0,

    // Teleprompter State
    tpIndex: 0, // index in lucianaLines array (0..8)
    tpPlaying: false,
    tpLoop: false,
    tpIncludeCue: true,
    tpShowPhonetic: true,
    tpShowSpanish: true,
    tpActiveWordIndex: -1,

    // Full Rehearsal State
    rehearsalScene: "all",
    rehearsalPlaying: false,
    rehearsalWaitingForLuciana: false,
    rehearsalCurrentLineId: null,
    rehearsalPauseOnLuciana: true,
    rehearsalShowEs: true,
    rehearsalOnlyLucianaScenes: false,

    // Games State
    activeGame: "cue-detective", // 'cue-detective' | 'word-builder' | 'meaning-match'
    gameScore: 0,
    currentQuestion: null,
    wordBuilderTarget: null,
    wordBuilderSelected: [],

    // Voice Recording State
    isRecording: false,
    mediaRecorder: null,
    recordedAudioUrl: null,
    recordedChunks: [],
    speechRecognitionText: ""
  };

  // Cached Derived Data
  const lucianaLines = SCRIPT_DATA.lines
    .filter((l) => l.isLuciana)
    .sort((a, b) => a.lucianaOrder - b.lucianaOrder);

  // Neural Audio (Gemini 3.8 TTS) + Web Speech Fallback
  let availableVoices = [];
  let activeUtterance = null;
  let karaokeTimer = null;
  let neuralAudioEl = new Audio();
  let neuralExtraAudios = [];
  let neuralRafId = null;

  function normTextForMatch(s) {
    return (s || "")
      .toLowerCase()
      .replace(/\(.*?\)/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findNeuralAudioInfo(text, options = {}) {
    const audioMap = window.VIDEO_AUDIO;
    if (!audioMap) return null;

    if (options.lineId && audioMap[String(options.lineId)]) {
      return audioMap[String(options.lineId)];
    }

    const targetNorm = normTextForMatch(text);
    if (!targetNorm || targetNorm.split(" ").length < 2) return null;

    // 1. Exact dialogue line match
    for (const l of SCRIPT_DATA.lines) {
      if (l.type === "dialogue" && normTextForMatch(l.en) === targetNorm) {
        if (audioMap[String(l.id)]) return audioMap[String(l.id)];
      }
    }

    // 2. Cue substring match (e.g. "...Biggest indoor set ever built! Don't break anything!")
    if (targetNorm.length >= 16) {
      for (const l of SCRIPT_DATA.lines) {
        if (l.type === "dialogue") {
          const lNorm = normTextForMatch(l.en);
          if (lNorm && (lNorm.includes(targetNorm) || targetNorm.includes(lNorm))) {
            if (audioMap[String(l.id)]) return audioMap[String(l.id)];
          }
        }
      }
    }

    return null;
  }

  // ================= INITIALIZATION =================
  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.masteredLines)) {
          state.masteredLines = parsed.masteredLines;
        }
        if (typeof parsed.stars === "number") {
          state.stars = parsed.stars;
        }
      }
    } catch (e) {
      console.warn("Could not load saved progress:", e);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          masteredLines: state.masteredLines,
          stars: state.stars
        })
      );
    } catch (e) {
      console.warn("Could not save progress:", e);
    }
    updateHeaderStats();
  }

  function addStars(amount) {
    state.stars += amount;
    saveProgress();
    const starEl = document.getElementById("star-count-display");
    if (starEl) {
      starEl.style.transform = "scale(1.35)";
      setTimeout(() => {
        starEl.style.transform = "scale(1)";
      }, 280);
    }
  }

  // ================= SOUND EFFECTS (WEB AUDIO API) =================
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    return audioCtx;
  }

  function playClapperSound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Sharp wood clack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  function playSuccessChime() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.08;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {}
  }

  // ================= SPEECH SYNTHESIS ENGINE =================
  function initVoices() {
    if (!("speechSynthesis" in window)) return;
    const updateVoices = () => {
      availableVoices = window.speechSynthesis.getVoices();
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }

  function pickVoiceForCharacter(characterId) {
    if (!availableVoices || availableVoices.length === 0) return null;
    const charObj = SCRIPT_DATA.characters[characterId] || SCRIPT_DATA.characters.ASSISTANT_DIRECTOR;
    const enVoices = availableVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
    const pool = enVoices.length > 0 ? enVoices : availableVoices;

    // Prefer high quality natural voices if present
    const preferredFemale = ["samantha", "victoria", "google us english", "aria", "jenny", "zira", "karen", "moira", "tessa"];
    const preferredMale = ["alex", "daniel", "david", "guy", "CHRISTOPHER", "google uk english male", "fred", "aaron"];

    const targetKeywords = charObj.voiceGender === "male" ? preferredMale : preferredFemale;
    for (const kw of targetKeywords) {
      const match = pool.find((v) => v.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) return match;
    }
    return pool[0];
  }

  function stopAllSpeech() {
    if (neuralRafId) {
      cancelAnimationFrame(neuralRafId);
      neuralRafId = null;
    }
    if (neuralAudioEl) {
      neuralAudioEl.pause();
      neuralAudioEl.onended = null;
      neuralAudioEl.onerror = null;
    }
    neuralExtraAudios.forEach((a) => {
      try {
        a.pause();
      } catch (e) {}
    });
    neuralExtraAudios = [];

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (karaokeTimer) {
      clearInterval(karaokeTimer);
      karaokeTimer = null;
    }
    document.querySelectorAll(".speaking-word, .active-karaoke").forEach((el) => {
      el.classList.remove("speaking-word", "active-karaoke");
    });
  }

  /**
   * Speaks English text using Gemini 3.8 TTS neural child voices (from window.VIDEO_AUDIO)
   * with synchronized word-by-word highlight callback, or falls back to Web Speech API
   * for isolated dictionary words/chunks.
   */
  function speakEnglish(text, options = {}) {
    stopAllSpeech();

    const neuralInfo = findNeuralAudioInfo(text, options);
    if (neuralInfo && neuralInfo.file) {
      const srcPath = neuralInfo.file.startsWith("video/") ? neuralInfo.file : `video/${neuralInfo.file}`;
      neuralAudioEl.src = srcPath;
      // Map app rate (0.68 slow, 0.9 normal, 1.02 fluent) to natural audio playbackRate
      const reqRate = options.rate || state.speechRate || 0.9;
      const playbackRate = reqRate < 0.78 ? 0.8 : reqRate > 0.98 ? 1.06 : 1.0;
      neuralAudioEl.playbackRate = playbackRate;

      if (Array.isArray(neuralInfo.extra)) {
        neuralExtraAudios = neuralInfo.extra.map((x) => {
          const exPath = x.file.startsWith("video/") ? x.file : `video/${x.file}`;
          const a = new Audio(exPath);
          a.playbackRate = playbackRate;
          a.volume = 0.55;
          a.play().catch(() => {});
          return a;
        });
      }

      const wordsMeta = Array.isArray(neuralInfo.words) ? neuralInfo.words : [];
      let lastWordIdx = -1;

      const updateHighlightLoop = () => {
        if (neuralAudioEl.paused) return;
        const elapsedMs = neuralAudioEl.currentTime * 1000;
        if (options.onWord && wordsMeta.length > 0) {
          let activeIdx = -1;
          for (let i = 0; i < wordsMeta.length; i++) {
            const w = wordsMeta[i];
            if (elapsedMs >= w.s - 25 && elapsedMs <= w.e + 70) {
              activeIdx = i;
              break;
            }
            if (elapsedMs > w.e) {
              activeIdx = i;
            }
          }
          if (activeIdx !== lastWordIdx && activeIdx >= 0) {
            lastWordIdx = activeIdx;
            options.onWord(activeIdx);
          }
        }
        neuralRafId = requestAnimationFrame(updateHighlightLoop);
      };

      neuralAudioEl.onended = () => {
        if (neuralRafId) cancelAnimationFrame(neuralRafId);
        neuralRafId = null;
        if (options.onWord) options.onWord(-1);
        if (options.onEnd) options.onEnd();
      };

      neuralAudioEl.onerror = () => {
        if (neuralRafId) cancelAnimationFrame(neuralRafId);
        neuralRafId = null;
        if (options.onWord) options.onWord(-1);
        if (options.onEnd) options.onEnd();
      };

      neuralAudioEl
        .play()
        .then(() => {
          if (options.onWord && wordsMeta.length > 0) {
            options.onWord(0);
            lastWordIdx = 0;
          }
          neuralRafId = requestAnimationFrame(updateHighlightLoop);
        })
        .catch(() => {
          if (options.onEnd) options.onEnd();
        });
      return;
    }

    if (!("speechSynthesis" in window)) {
      if (options.onEnd) options.onEnd();
      return;
    }

    const cleanText = text.replace(/—/g, ", ").replace(/\.\.\./g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtterance = utterance;

    const charId = options.characterId || "ASSISTANT_DIRECTOR";
    const charMeta = SCRIPT_DATA.characters[charId] || SCRIPT_DATA.characters.ASSISTANT_DIRECTOR;

    const chosenVoice = pickVoiceForCharacter(charId);
    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.lang = "en-US";
    utterance.rate = (options.rate || state.speechRate) * (charMeta.rate || 1.0);
    utterance.pitch = options.pitch || charMeta.pitch || 1.0;

    const words = text.trim().split(/\s+/);
    let currentWordIdx = 0;

    // Fallback timer for browsers where onboundary doesn't fire reliably (e.g., Linux Chrome)
    const approxDurationMs = Math.max(1400, (words.length / (utterance.rate * 2.3)) * 1000);
    const stepMs = approxDurationMs / Math.max(1, words.length);
    let boundaryFired = false;

    utterance.onstart = () => {
      if (options.onWord) options.onWord(0);
      karaokeTimer = setInterval(() => {
        if (!boundaryFired) {
          currentWordIdx++;
          if (currentWordIdx < words.length) {
            if (options.onWord) options.onWord(currentWordIdx);
          } else {
            clearInterval(karaokeTimer);
          }
        }
      }, stepMs);
    };

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        boundaryFired = true;
        // Map charIndex to word index
        const upToChar = cleanText.slice(0, event.charIndex);
        const wordIdx = upToChar.trim() ? upToChar.trim().split(/\s+/).length : 0;
        if (options.onWord) options.onWord(Math.min(wordIdx, words.length - 1));
      }
    };

    utterance.onend = () => {
      if (karaokeTimer) clearInterval(karaokeTimer);
      if (options.onWord) options.onWord(-1);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      if (karaokeTimer) clearInterval(karaokeTimer);
      if (options.onWord) options.onWord(-1);
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // ================= HEADER & NAVIGATION =================
  function updateHeaderStats() {
    const masteredCount = state.masteredLines.length;
    const totalCount = lucianaLines.length;
    const pct = Math.round((masteredCount / totalCount) * 100);

    const starDisplay = document.getElementById("star-count-display");
    if (starDisplay) starDisplay.textContent = state.stars;

    const progLabel = document.getElementById("mastery-progress-label");
    if (progLabel) {
      progLabel.textContent = `${masteredCount} de ${totalCount} diálogos dominados (${pct}%)`;
    }

    const progFill = document.getElementById("mastery-progress-fill");
    if (progFill) {
      progFill.style.width = `${pct}%`;
    }
  }

  function switchTab(tabId) {
    stopAllSpeech();
    state.rehearsalPlaying = false;
    state.tpPlaying = false;
    state.activeTab = tabId;

    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${tabId}`);
    });

    if (tabId === "my-lines") renderMyLinesStudio();
    if (tabId === "teleprompter") renderTeleprompter();
    if (tabId === "rehearsal") renderFullRehearsal();
    if (tabId === "games") renderGamesTab();
    if (tabId === "story") renderStoryTab();
  }

  // ================= TAB 1: MIS DIÁLOGOS (LUCIANA'S STUDIO) =================
  function renderMyLinesStudio() {
    const sidebarList = document.getElementById("luciana-lines-nav");
    const stageContainer = document.getElementById("luciana-coaching-stage");
    if (!sidebarList || !stageContainer) return;

    // Render Sidebar List
    sidebarList.innerHTML = lucianaLines
      .map((line) => {
        const isSelected = line.lucianaOrder === state.selectedLucianaOrder;
        const isMastered = state.masteredLines.includes(line.lucianaOrder);
        const sceneObj = SCRIPT_DATA.scenes.find((s) => s.id === line.sceneId);
        return `
          <button class="line-nav-item ${isSelected ? "active" : ""} ${isMastered ? "mastered" : ""}"
                  data-order="${line.lucianaOrder}">
            <div class="line-num-circle">${isMastered ? "✓" : line.lucianaOrder}</div>
            <div class="line-nav-info">
              <div class="line-nav-scene">${sceneObj ? sceneObj.number : ""} ${line.isLucianaEnsemble ? "• Grupal" : "• Tu línea"}</div>
              <div class="line-nav-preview">${line.en}</div>
            </div>
          </button>
        `;
      })
      .join("");

    sidebarList.querySelectorAll(".line-nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        stopAllSpeech();
        state.selectedLucianaOrder = parseInt(btn.dataset.order, 10);
        state.recordedAudioUrl = null;
        renderMyLinesStudio();
      });
    });

    // Current Line Object
    const line = lucianaLines.find((l) => l.lucianaOrder === state.selectedLucianaOrder) || lucianaLines[0];
    const sceneObj = SCRIPT_DATA.scenes.find((s) => s.id === line.sceneId);
    const cueChar = SCRIPT_DATA.characters[line.cueCharacter] || SCRIPT_DATA.characters.STAGE;
    const isMastered = state.masteredLines.includes(line.lucianaOrder);

    // Format English Words according to Memory Level
    const wordsHtml = formatLineWithMemoryMask(line);

    stageContainer.innerHTML = `
      <div class="coaching-top-bar">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span class="scene-pill">🎬 ${sceneObj ? sceneObj.titleEs : ""}</span>
          ${
            line.isLucianaEnsemble
              ? `<span class="ensemble-pill">🌟 Todos juntos en coro (All Cast)</span>`
              : `<span class="badge-star">⭐ Diálogo #${line.lucianaOrder} de Luciana</span>`
          }
        </div>
        <button id="btn-toggle-mastery" class="mastery-toggle-btn ${isMastered ? "mastered" : ""}">
          <span>${isMastered ? "✅ ¡Ya me lo aprendí!" : "⭕ Marcar como aprendido"}</span>
        </button>
      </div>

      <!-- CUE BOX: WHEN TO SPEAK -->
      <div class="cue-box">
        <div class="cue-header">
          <div class="cue-label">
            <span>👂 TU SEÑAL DE ENTRADA (¿Cuándo debes hablar?)</span>
          </div>
          <button id="btn-listen-cue" class="btn-mini-play">🔊 Escuchar pie + mi línea</button>
        </div>
        <div class="cue-quote">${cueChar.avatar} ${cueChar.shortName}: "${line.cueEn}"</div>
        <div class="cue-explanation">💡 ${line.cueEs}</div>
      </div>

      <!-- MEMORY PROGRESSIVE HIDE BAR -->
      <div class="memorization-bar">
        <div class="mem-label">🧠 Nivel de reto para tu memoria:</div>
        <div class="mem-buttons">
          <button class="mem-btn ${state.memoryLevel === 0 ? "active" : ""}" data-mem="0">1. Ver todo</button>
          <button class="mem-btn ${state.memoryLevel === 1 ? "active" : ""}" data-mem="1">2. Ocultar palabras clave</button>
          <button class="mem-btn ${state.memoryLevel === 2 ? "active" : ""}" data-mem="2">3. Solo iniciales</button>
          <button class="mem-btn ${state.memoryLevel === 3 ? "active" : ""}" data-mem="3">4. ¡De memoria!</button>
        </div>
      </div>

      <!-- SPOTLIGHT LINE CARD -->
      <div class="spotlight-card">
        <div class="emotion-badge">
          🎭 Actitud en escena: <strong>${line.emotion}</strong> (${line.emotionEs})
        </div>

        <div class="english-big-line" id="spotlight-en-words">
          ${wordsHtml}
        </div>
        <div style="font-size:0.78rem; color:var(--text-dim); margin-bottom:14px;">
          👆 <em>Tip: Haz clic sobre cualquier palabra en inglés para escucharla sola o destaparla.</em>
        </div>

        <div class="phonetic-box">
          <span class="phonetic-tag">Pronunciación</span>
          <span class="phonetic-text">${line.phonetic}</span>
        </div>

        <div class="spanish-translation-box">
          <span class="es-label">¿Qué estás diciendo en español?</span>
          <span class="es-text">«${line.es}»</span>
        </div>

        <div class="audio-actions-row">
          <button id="btn-play-normal" class="btn-action btn-primary-listen">
            🔊 Escuchar en Inglés
          </button>
          <button id="btn-play-slow" class="btn-action btn-slow-listen">
            🐢 Escuchar Lento (Paso a paso)
          </button>
          <button id="btn-record-self" class="btn-action btn-record-voice ${state.isRecording ? "recording" : ""}">
            🎤 ${state.isRecording ? "Detener Grabación" : "Grabar mi voz y comparar"}
          </button>
          ${
            state.recordedAudioUrl
              ? `<button id="btn-play-recorded" class="btn-action btn-cue-play">▶️ Escuchar mi grabación</button>`
              : ""
          }
        </div>
        ${
          state.speechRecognitionText
            ? `<div style="margin-top:12px; padding:10px 14px; background:rgba(16,185,129,0.15); border:1px solid var(--green); border-radius:10px; font-size:0.9rem;">
                🎙️ <strong>Escuchamos que dijiste:</strong> "${state.speechRecognitionText}"
               </div>`
            : ""
        }
      </div>

      <!-- STEP-BY-STEP CHUNKS -->
      <div class="chunks-section">
        <div class="section-subtitle">🧩 Practica por pedacitos (Haz clic en cada bloque para escucharlo y repetirlo):</div>
        <div class="chunks-grid">
          ${(line.chunks || [])
            .map(
              (chunk, idx) => `
            <div class="chunk-card" data-chunk-en="${chunk.en.replace(/"/g, "&quot;")}">
              <div class="chunk-step"><span>Paso ${idx + 1}</span> <span>🔊</span></div>
              <div class="chunk-en">${chunk.en}</div>
              <div class="chunk-pron">🗣️ ${chunk.pron}</div>
              <div class="chunk-es">🇪🇸 ${chunk.es}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- MEANING & ACTING COACHING -->
      <div class="understanding-grid">
        <div class="info-panel">
          <h4>💡 ¿Por qué dices esto en la historia?</h4>
          <p>${line.meaningContextEs}</p>
        </div>
        <div class="info-panel">
          <h4>🎬 Consejo de actuación para Luciana</h4>
          <p>${line.actingTipEs}</p>
        </div>
      </div>

      <!-- KEYWORDS DICTIONARY -->
      <div class="chunks-section">
        <div class="section-subtitle">📖 Palabras clave de tu frase (Tócalas para oír su pronunciación):</div>
        <div class="keywords-grid">
          ${(line.keywords || [])
            .map(
              (kw) => `
            <div class="kw-card" data-kw="${kw.word.replace(/"/g, "&quot;")}">
              <div class="kw-top">
                <span class="kw-word">🔊 ${kw.word}</span>
                <span class="kw-pron">${kw.pron}</span>
              </div>
              <div class="kw-meaning">= ${kw.meaning}</div>
              <div class="kw-tip">✨ ${kw.tip}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- FOOTER NAVIGATION -->
      <div class="coaching-footer-nav">
        <button id="btn-prev-line" class="btn-action btn-slow-listen" ${line.lucianaOrder <= 1 ? "disabled style='opacity:0.4;cursor:not-allowed'" : ""}>
          ⬅️ Diálogo Anterior
        </button>
        <span style="font-weight:800; color:var(--text-muted);">
          Diálogo ${line.lucianaOrder} de ${lucianaLines.length}
        </span>
        <button id="btn-next-line" class="btn-action btn-primary-listen" ${line.lucianaOrder >= lucianaLines.length ? "disabled style='opacity:0.4;cursor:not-allowed'" : ""}>
          Siguiente Diálogo ➡️
        </button>
      </div>
    `;

    attachStudioEvents(line);
  }

  function formatLineWithMemoryMask(line) {
    const words = line.en.trim().split(/\s+/);
    return words
      .map((word, idx) => {
        const cleanWord = word.replace(/[^a-zA-Z']/g, "");
        if (state.memoryLevel === 0) {
          return `<span class="word-token" data-word-idx="${idx}" data-word="${cleanWord}">${word}</span>`;
        }
        if (state.memoryLevel === 1) {
          // Hide every 2nd content word (>3 chars)
          const shouldMask = cleanWord.length > 3 && idx % 2 === 1;
          if (shouldMask) {
            return `<span class="word-token masked-word" data-word-idx="${idx}" data-word="${cleanWord}" title="Haz clic para ver">${word}</span>`;
          }
          return `<span class="word-token" data-word-idx="${idx}" data-word="${cleanWord}">${word}</span>`;
        }
        if (state.memoryLevel === 2) {
          // Show only first letter + underscores
          const firstChar = word.charAt(0);
          const restMasked = "_".repeat(Math.max(2, word.length - 1));
          return `<span class="word-token masked-word first-letter-shown" data-word-idx="${idx}" data-word="${cleanWord}" data-full="${word}">${firstChar}${restMasked}</span>`;
        }
        // Level 3: Hide all words until clicked or spoken
        return `<span class="word-token masked-word" data-word-idx="${idx}" data-word="${cleanWord}">${word}</span>`;
      })
      .join(" ");
  }

  function highlightSpokenWordInStudio(wordIndex) {
    const container = document.getElementById("spotlight-en-words");
    if (!container) return;
    const tokens = container.querySelectorAll(".word-token");
    tokens.forEach((t, idx) => {
      t.classList.toggle("speaking-word", idx === wordIndex);
      if (idx === wordIndex && t.dataset.full) {
        t.textContent = t.dataset.full;
        t.classList.add("revealed");
      } else if (idx === wordIndex) {
        t.classList.add("revealed");
      }
    });
  }

  function attachStudioEvents(line) {
    // Mastery button
    const btnMastery = document.getElementById("btn-toggle-mastery");
    if (btnMastery) {
      btnMastery.addEventListener("click", () => {
        const idx = state.masteredLines.indexOf(line.lucianaOrder);
        if (idx === -1) {
          state.masteredLines.push(line.lucianaOrder);
          playSuccessChime();
          addStars(15);
        } else {
          state.masteredLines.splice(idx, 1);
        }
        saveProgress();
        renderMyLinesStudio();
      });
    }

    // Memory level buttons
    document.querySelectorAll(".mem-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.memoryLevel = parseInt(btn.dataset.mem, 10);
        renderMyLinesStudio();
      });
    });

    // Individual word click (speak word & reveal if masked)
    document.querySelectorAll("#spotlight-en-words .word-token").forEach((token) => {
      token.addEventListener("click", () => {
        if (token.dataset.full) token.textContent = token.dataset.full;
        token.classList.add("revealed");
        const w = token.dataset.word || token.textContent;
        speakEnglish(w, { rate: 0.85, characterId: "ASSISTANT_DIRECTOR" });
      });
    });

    // Normal Play
    const btnNormal = document.getElementById("btn-play-normal");
    if (btnNormal) {
      btnNormal.addEventListener("click", () => {
        speakEnglish(line.en, {
          rate: state.speechRate,
          characterId: "ASSISTANT_DIRECTOR",
          onWord: highlightSpokenWordInStudio
        });
      });
    }

    // Slow Play
    const btnSlow = document.getElementById("btn-play-slow");
    if (btnSlow) {
      btnSlow.addEventListener("click", () => {
        speakEnglish(line.en, {
          rate: 0.68,
          characterId: "ASSISTANT_DIRECTOR",
          onWord: highlightSpokenWordInStudio
        });
      });
    }

    // Play Cue + Line
    const btnCue = document.getElementById("btn-listen-cue");
    if (btnCue) {
      btnCue.addEventListener("click", () => {
        const cueSpoken = line.cueEn.replace(/\(.*?\)/g, "").trim();
        speakEnglish(cueSpoken, {
          characterId: line.cueCharacter,
          rate: state.speechRate,
          onEnd: () => {
            setTimeout(() => {
              speakEnglish(line.en, {
                characterId: "ASSISTANT_DIRECTOR",
                rate: state.speechRate,
                onWord: highlightSpokenWordInStudio
              });
            }, 450);
          }
        });
      });
    }

    // Chunks click
    document.querySelectorAll(".chunk-card").forEach((card) => {
      card.addEventListener("click", () => {
        speakEnglish(card.dataset.chunkEn, {
          rate: 0.82,
          characterId: "ASSISTANT_DIRECTOR"
        });
      });
    });

    // Keywords click
    document.querySelectorAll(".kw-card").forEach((card) => {
      card.addEventListener("click", () => {
        speakEnglish(card.dataset.kw, {
          rate: 0.8,
          characterId: "ASSISTANT_DIRECTOR"
        });
      });
    });

    // Voice Recording
    const btnRecord = document.getElementById("btn-record-self");
    if (btnRecord) {
      btnRecord.addEventListener("click", () => {
        toggleVoiceRecording(line);
      });
    }

    const btnPlayRec = document.getElementById("btn-play-recorded");
    if (btnPlayRec && state.recordedAudioUrl) {
      btnPlayRec.addEventListener("click", () => {
        const audio = new Audio(state.recordedAudioUrl);
        audio.play();
      });
    }

    // Prev / Next buttons
    const btnPrev = document.getElementById("btn-prev-line");
    if (btnPrev && line.lucianaOrder > 1) {
      btnPrev.addEventListener("click", () => {
        stopAllSpeech();
        state.selectedLucianaOrder--;
        state.recordedAudioUrl = null;
        state.speechRecognitionText = "";
        renderMyLinesStudio();
      });
    }

    const btnNext = document.getElementById("btn-next-line");
    if (btnNext && line.lucianaOrder < lucianaLines.length) {
      btnNext.addEventListener("click", () => {
        stopAllSpeech();
        state.selectedLucianaOrder++;
        state.recordedAudioUrl = null;
        state.speechRecognitionText = "";
        renderMyLinesStudio();
      });
    }
  }

  // ================= MICROPHONE RECORDING & SPEECH RECOGNITION =================
  async function toggleVoiceRecording(line) {
    if (state.isRecording) {
      if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
        state.mediaRecorder.stop();
      }
      state.isRecording = false;
      renderMyLinesStudio();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.recordedChunks = [];
      state.speechRecognitionText = "";
      const recorder = new MediaRecorder(stream);
      state.mediaRecorder = recorder;
      state.isRecording = true;
      renderMyLinesStudio();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) state.recordedChunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(state.recordedChunks, { type: "audio/webm" });
        state.recordedAudioUrl = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        state.isRecording = false;
        addStars(5);
        renderMyLinesStudio();
      };

      recorder.start();
    } catch (err) {
      alert("Para grabar tu voz, permite el acceso al micrófono en el navegador.");
      state.isRecording = false;
      renderMyLinesStudio();
    }
  }

  // ================= TAB 2: TELEPROMPTER & KARAOKE VIDEO MODE =================
  function renderTeleprompter() {
    const container = document.getElementById("teleprompter-container");
    if (!container) return;

    const line = lucianaLines[state.tpIndex] || lucianaLines[0];
    const sceneObj = SCRIPT_DATA.scenes.find((s) => s.id === line.sceneId);
    const cueChar = SCRIPT_DATA.characters[line.cueCharacter] || SCRIPT_DATA.characters.STAGE;
    const words = line.en.trim().split(/\s+/);

    container.innerHTML = `
      <div class="teleprompter-wrapper">
        <div class="tp-top-controls">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="badge-star">🎥 MODO VIDEO SUBTITULADO (${state.tpIndex + 1} / ${lucianaLines.length})</span>
            <span class="scene-pill">${sceneObj ? sceneObj.titleEs : ""}</span>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <label class="toggle-switch-label">
              <input type="checkbox" id="tp-toggle-cue" ${state.tpIncludeCue ? "checked" : ""}>
              Oír compañero antes
            </label>
            <label class="toggle-switch-label">
              <input type="checkbox" id="tp-toggle-phon" ${state.tpShowPhonetic ? "checked" : ""}>
              Pronunciación
            </label>
            <label class="toggle-switch-label">
              <input type="checkbox" id="tp-toggle-es" ${state.tpShowSpanish ? "checked" : ""}>
              Significado en Español
            </label>
            <label class="toggle-switch-label">
              <input type="checkbox" id="tp-toggle-loop" ${state.tpLoop ? "checked" : ""}>
              🔁 Repetir continuo
            </label>
          </div>
        </div>

        <div class="tp-screen">
          <div class="tp-cue-banner" id="tp-cue-box">
            👂 <strong>Entras después de ${cueChar.shortName}:</strong> "${line.cueEn}"
          </div>

          <div class="emotion-badge">
            🎭 Actitud: ${line.emotion} (${line.emotionEs})
          </div>

          <div class="tp-main-en" id="tp-words-display">
            ${words.map((w, i) => `<span class="tp-word" data-tp-idx="${i}">${w}</span>`).join(" ")}
          </div>

          ${
            state.tpShowPhonetic
              ? `<div class="tp-phonetic">🗣️ ${line.phonetic}</div>`
              : ""
          }

          ${
            state.tpShowSpanish
              ? `<div class="tp-spanish">🇪🇸 «${line.es}»</div>`
              : ""
          }

          <div class="tp-stage-status" id="tp-status-indicator">
            ${state.tpPlaying ? "🔊 Reproduciendo con subtítulos sincronizados..." : "▶️ Pulsa Iniciar para escuchar y repetir como en un video"}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${lucianaLines
              .map(
                (l, idx) => `
              <button class="mem-btn ${idx === state.tpIndex ? "active" : ""}" data-tp-jump="${idx}">
                #${l.lucianaOrder}
              </button>
            `
              )
              .join("")}
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button id="tp-btn-play-one" class="btn-action btn-slow-listen">
              🔊 Repetir esta frase
            </button>
            <button id="tp-btn-play-all" class="btn-action btn-primary-listen">
              ${state.tpPlaying ? "⏹️ Detener Teleprompter" : "▶️ Reproducir Secuencia Completa"}
            </button>
          </div>
        </div>
      </div>
    `;

    // Events
    document.getElementById("tp-toggle-cue")?.addEventListener("change", (e) => {
      state.tpIncludeCue = e.target.checked;
    });
    document.getElementById("tp-toggle-phon")?.addEventListener("change", (e) => {
      state.tpShowPhonetic = e.target.checked;
      renderTeleprompter();
    });
    document.getElementById("tp-toggle-es")?.addEventListener("change", (e) => {
      state.tpShowSpanish = e.target.checked;
      renderTeleprompter();
    });
    document.getElementById("tp-toggle-loop")?.addEventListener("change", (e) => {
      state.tpLoop = e.target.checked;
    });

    container.querySelectorAll("[data-tp-jump]").forEach((btn) => {
      btn.addEventListener("click", () => {
        stopAllSpeech();
        state.tpPlaying = false;
        state.tpIndex = parseInt(btn.dataset.tpJump, 10);
        renderTeleprompter();
      });
    });

    document.getElementById("tp-btn-play-one")?.addEventListener("click", () => {
      state.tpPlaying = false;
      playTeleprompterSingleLine(line, false);
    });

    document.getElementById("tp-btn-play-all")?.addEventListener("click", () => {
      if (state.tpPlaying) {
        state.tpPlaying = false;
        stopAllSpeech();
        renderTeleprompter();
      } else {
        state.tpPlaying = true;
        playClapperSound();
        renderTeleprompter();
        runTeleprompterSequence();
      }
    });
  }

  function highlightTpWord(wordIdx) {
    const wordsEls = document.querySelectorAll("#tp-words-display .tp-word");
    wordsEls.forEach((el, idx) => {
      el.classList.toggle("active-karaoke", idx === wordIdx);
    });
  }

  function playTeleprompterSingleLine(line, autoAdvance) {
    const statusEl = document.getElementById("tp-status-indicator");
    const cueChar = SCRIPT_DATA.characters[line.cueCharacter] || SCRIPT_DATA.characters.STAGE;

    const speakLucianaTurn = () => {
      if (statusEl) statusEl.textContent = "⭐ ¡ESCUCHA Y REPITE CON LUCIANA!";
      speakEnglish(line.en, {
        characterId: "ASSISTANT_DIRECTOR",
        rate: state.speechRate,
        onWord: highlightTpWord,
        onEnd: () => {
          if (!autoAdvance || !state.tpPlaying) {
            if (statusEl) statusEl.textContent = "✅ ¡Muy bien! Ahora repítelo tú en voz alta.";
            return;
          }
          // Pause 2.2 seconds so Luciana can repeat out loud before advancing
          if (statusEl) statusEl.textContent = "🗣️ ¡Tu turno de repetirlo en voz alta! (Pasando al siguiente...)";
          setTimeout(() => {
            if (!state.tpPlaying) return;
            if (state.tpIndex + 1 < lucianaLines.length) {
              state.tpIndex++;
              renderTeleprompter();
              runTeleprompterSequence();
            } else if (state.tpLoop) {
              state.tpIndex = 0;
              renderTeleprompter();
              runTeleprompterSequence();
            } else {
              state.tpPlaying = false;
              playSuccessChime();
              addStars(10);
              renderTeleprompter();
            }
          }, 2400);
        }
      });
    };

    if (state.tpIncludeCue) {
      if (statusEl) statusEl.textContent = `👂 Escuchando primero a ${cueChar.shortName}...`;
      const cueSpoken = line.cueEn.replace(/\(.*?\)/g, "").trim();
      speakEnglish(cueSpoken, {
        characterId: line.cueCharacter,
        rate: state.speechRate,
        onEnd: () => {
          setTimeout(() => {
            if (autoAdvance && !state.tpPlaying) return;
            speakLucianaTurn();
          }, 400);
        }
      });
    } else {
      speakLucianaTurn();
    }
  }

  function runTeleprompterSequence() {
    if (!state.tpPlaying) return;
    const currentLine = lucianaLines[state.tpIndex] || lucianaLines[0];
    playTeleprompterSingleLine(currentLine, true);
  }

  // ================= TAB 3: ENSAYO CON COMPAÑEROS (FULL REHEARSAL) =================
  function renderFullRehearsal() {
    const container = document.getElementById("rehearsal-container");
    if (!container) return;

    const scenesToShow = SCRIPT_DATA.scenes.filter((s) => {
      if (state.rehearsalOnlyLucianaScenes && !s.hasLucianaLines) return false;
      if (state.rehearsalScene !== "all" && s.id !== state.rehearsalScene) return false;
      return true;
    });

    // Identify lines immediately preceding Luciana's lines so we can badge them as Cues
    const cueLineIds = new Set();
    SCRIPT_DATA.lines.forEach((l, idx) => {
      if (l.isLuciana && idx > 0) {
        // Find previous dialogue or stage line
        cueLineIds.add(SCRIPT_DATA.lines[idx - 1].id);
      }
    });

    container.innerHTML = `
      <div class="rehearsal-header-bar">
        <div class="scene-filter-pills">
          <button class="scene-filter-btn ${state.rehearsalScene === "all" ? "active" : ""}" data-scene="all">
            🎬 Todo el Guion
          </button>
          ${SCRIPT_DATA.scenes
            .map(
              (s) => `
            <button class="scene-filter-btn ${s.hasLucianaLines ? "has-luciana" : ""} ${state.rehearsalScene === s.id ? "active" : ""}"
                    data-scene="${s.id}">
              ${s.number}
            </button>
          `
            )
            .join("")}
        </div>

        <div class="rehearsal-controls">
          <label class="toggle-switch-label" title="Cuando llegue el turno de Luciana, el ensayo hace una pausa para que ella diga su diálogo antes de continuar">
            <input type="checkbox" id="reh-pause-luciana" ${state.rehearsalPauseOnLuciana ? "checked" : ""}>
            ⏸️ Pausar en el turno de Luciana
          </label>
          <label class="toggle-switch-label">
            <input type="checkbox" id="reh-only-luciana-scenes" ${state.rehearsalOnlyLucianaScenes ? "checked" : ""}>
            ⭐ Solo escenas donde sale Luciana
          </label>
          <label class="toggle-switch-label">
            <input type="checkbox" id="reh-show-es" ${state.rehearsalShowEs ? "checked" : ""}>
            🇪🇸 Mostrar Español
          </label>
          <button id="btn-start-rehearsal" class="btn-action btn-primary-listen">
            ${state.rehearsalPlaying ? "⏹️ Detener Ensayo" : "▶️ Iniciar Ensayo con Compañeros"}
          </button>
        </div>
      </div>

      <div class="script-timeline">
        ${scenesToShow
          .map((scene) => {
            const sceneLines = SCRIPT_DATA.lines.filter((l) => l.sceneId === scene.id);
            return `
              <div class="scene-header-card" id="anchor-${scene.id}">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <h3>🎬 ${scene.title}</h3>
                  ${
                    scene.hasLucianaLines
                      ? `<span class="badge-star">⭐ Luciana participa aquí (${scene.lucianaLineCount} líneas)</span>`
                      : `<span class="scene-pill">Observas desde el set</span>`
                  }
                </div>
                <div class="scene-title-es">${scene.titleEs}</div>
                <p>📖 <strong>Resumen de la escena:</strong> ${scene.summaryEs}</p>
              </div>

              ${sceneLines
                .map((line) => {
                  const char = SCRIPT_DATA.characters[line.character] || SCRIPT_DATA.characters.STAGE;
                  const isCue = cueLineIds.has(line.id);
                  const isPlayingNow = state.rehearsalCurrentLineId === line.id;

                  if (line.type === "stage") {
                    return `
                      <div class="dialogue-card stage-direction ${isPlayingNow ? "playing-now" : ""}" id="script-line-${line.id}">
                        <div class="char-avatar">🎬</div>
                        <div class="dialogue-body">
                          <div class="dialogue-meta">
                            <span class="char-name-badge" style="background:rgba(148,163,184,0.2); color:#cbd5e1;">ACCIÓN EN ESCENA</span>
                            ${line.isLucianaStage ? `<span class="luciana-turn-tag">⭐ ¡Atenta Luciana! Tú haces esta acción</span>` : ""}
                            ${isCue ? `<span class="cue-alert-tag">⚡ ¡PREPARADA! Hablas después de esto</span>` : ""}
                          </div>
                          <div class="dialogue-en" style="font-style:italic; font-weight:600; color:#e2e8f0;">${line.en}</div>
                          ${state.rehearsalShowEs ? `<div class="dialogue-es">🇪🇸 ${line.es}</div>` : ""}
                        </div>
                        <div class="dialogue-actions">
                          <button class="btn-mini-play" data-play-from="${line.id}">▶️ Ensayar desde aquí</button>
                        </div>
                      </div>
                    `;
                  }

                  return `
                    <div class="dialogue-card ${line.isLuciana ? "luciana-line" : ""} ${isCue ? "cue-before-luciana" : ""} ${isPlayingNow ? "playing-now" : ""}"
                         id="script-line-${line.id}">
                      <div class="char-avatar" style="border-color:${char.color}">${char.avatar}</div>
                      <div class="dialogue-body">
                        <div class="dialogue-meta">
                          <span class="char-name-badge" style="background:${char.color}33; color:#fff; border:1px solid ${char.color}">
                            ${char.shortName}
                          </span>
                          ${line.emotion ? `<span class="char-emotion">(${line.emotion} — ${line.emotionEs})</span>` : ""}
                          ${isCue ? `<span class="cue-alert-tag">👂 ¡ATENTA LUCIANA! Esta frase te da el pie</span>` : ""}
                          ${line.isLuciana ? `<span class="luciana-turn-tag">⭐ ¡TU TURNO DE HABLAR! (#${line.lucianaOrder})</span>` : ""}
                        </div>

                        <div class="dialogue-en">${line.en}</div>
                        ${line.phonetic ? `<div class="dialogue-phonetic">🗣️ Pronunciación: ${line.phonetic}</div>` : ""}
                        ${state.rehearsalShowEs ? `<div class="dialogue-es">🇪🇸 ${line.es}</div>` : ""}

                        ${
                          line.isLuciana
                            ? `<div class="rehearsal-turn-prompt ${state.rehearsalWaitingForLuciana && isPlayingNow ? "visible" : ""}" id="turn-prompt-${line.id}">
                                <div>
                                  <strong style="color:var(--gold-light); font-size:1.02rem;">🎤 ¡Es tu momento, Luciana!</strong>
                                  <div style="font-size:0.86rem; color:var(--text-muted);">Di tu línea en voz alta con emoción: <em>"${line.en}"</em></div>
                                </div>
                                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                  <button class="btn-action btn-slow-listen" data-hear-help="${line.id}">🔊 Escuchar ayuda</button>
                                  <button class="btn-action btn-primary-listen" data-continue-rehearsal="${line.id}">✅ ¡Ya la dije! Continuar obra ➡️</button>
                                </div>
                               </div>`
                            : ""
                        }
                      </div>

                      <div class="dialogue-actions">
                        <button class="btn-mini-play" data-speak-single="${line.id}">🔊 Oír</button>
                        <button class="btn-mini-play" data-play-from="${line.id}">▶️ Desde aquí</button>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            `;
          })
          .join("")}
      </div>
    `;

    attachRehearsalEvents();
  }

  function attachRehearsalEvents() {
    document.querySelectorAll(".scene-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        stopAllSpeech();
        state.rehearsalPlaying = false;
        state.rehearsalScene = btn.dataset.scene;
        renderFullRehearsal();
      });
    });

    document.getElementById("reh-pause-luciana")?.addEventListener("change", (e) => {
      state.rehearsalPauseOnLuciana = e.target.checked;
    });

    document.getElementById("reh-only-luciana-scenes")?.addEventListener("change", (e) => {
      state.rehearsalOnlyLucianaScenes = e.target.checked;
      renderFullRehearsal();
    });

    document.getElementById("reh-show-es")?.addEventListener("change", (e) => {
      state.rehearsalShowEs = e.target.checked;
      renderFullRehearsal();
    });

    document.getElementById("btn-start-rehearsal")?.addEventListener("click", () => {
      if (state.rehearsalPlaying) {
        stopAllSpeech();
        state.rehearsalPlaying = false;
        state.rehearsalWaitingForLuciana = false;
        state.rehearsalCurrentLineId = null;
        renderFullRehearsal();
      } else {
        const visibleLines = getVisibleRehearsalLines();
        if (visibleLines.length > 0) {
          playClapperSound();
          startRehearsalFromLine(visibleLines[0].id);
        }
      }
    });

    document.querySelectorAll("[data-speak-single]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lineId = parseInt(btn.dataset.speakSingle, 10);
        const lineObj = SCRIPT_DATA.lines.find((l) => l.id === lineId);
        if (lineObj) {
          speakEnglish(lineObj.en, {
            characterId: lineObj.character,
            rate: state.speechRate
          });
        }
      });
    });

    document.querySelectorAll("[data-play-from]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lineId = parseInt(btn.dataset.playFrom, 10);
        playClapperSound();
        startRehearsalFromLine(lineId);
      });
    });

    document.querySelectorAll("[data-hear-help]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lineId = parseInt(btn.dataset.hearHelp, 10);
        const lineObj = SCRIPT_DATA.lines.find((l) => l.id === lineId);
        if (lineObj) {
          speakEnglish(lineObj.en, {
            characterId: "ASSISTANT_DIRECTOR",
            rate: state.speechRate
          });
        }
      });
    });

    document.querySelectorAll("[data-continue-rehearsal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lineId = parseInt(btn.dataset.continueRehearsal, 10);
        state.rehearsalWaitingForLuciana = false;
        addStars(5);
        advanceRehearsalAfter(lineId);
      });
    });
  }

  function getVisibleRehearsalLines() {
    const allowedScenes = new Set(
      SCRIPT_DATA.scenes
        .filter((s) => {
          if (state.rehearsalOnlyLucianaScenes && !s.hasLucianaLines) return false;
          if (state.rehearsalScene !== "all" && s.id !== state.rehearsalScene) return false;
          return true;
        })
        .map((s) => s.id)
    );
    return SCRIPT_DATA.lines.filter((l) => allowedScenes.has(l.sceneId));
  }

  function startRehearsalFromLine(lineId) {
    stopAllSpeech();
    state.rehearsalPlaying = true;
    state.rehearsalWaitingForLuciana = false;
    state.rehearsalCurrentLineId = lineId;
    renderFullRehearsal();
    runRehearsalStep(lineId);
  }

  function runRehearsalStep(lineId) {
    if (!state.rehearsalPlaying) return;
    const lineObj = SCRIPT_DATA.lines.find((l) => l.id === lineId);
    if (!lineObj) {
      state.rehearsalPlaying = false;
      state.rehearsalCurrentLineId = null;
      renderFullRehearsal();
      return;
    }

    state.rehearsalCurrentLineId = lineId;

    // Update active styling and scroll into view smoothly
    document.querySelectorAll(".dialogue-card").forEach((card) => {
      card.classList.toggle("playing-now", card.id === `script-line-${lineId}`);
    });
    const activeCard = document.getElementById(`script-line-${lineId}`);
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Check if it's Luciana's turn and we should pause for her
    if (lineObj.isLuciana && state.rehearsalPauseOnLuciana) {
      state.rehearsalWaitingForLuciana = true;
      const promptEl = document.getElementById(`turn-prompt-${lineId}`);
      if (promptEl) promptEl.classList.add("visible");
      playSuccessChime();
      return;
    }

    // Speak the line (or stage direction briefly)
    speakEnglish(lineObj.en, {
      characterId: lineObj.character,
      rate: lineObj.type === "stage" ? 1.05 : state.speechRate,
      onEnd: () => {
        if (!state.rehearsalPlaying) return;
        setTimeout(() => {
          advanceRehearsalAfter(lineId);
        }, 450);
      }
    });
  }

  function advanceRehearsalAfter(lineId) {
    if (!state.rehearsalPlaying) return;
    const visibleLines = getVisibleRehearsalLines();
    const idx = visibleLines.findIndex((l) => l.id === lineId);
    if (idx !== -1 && idx + 1 < visibleLines.length) {
      const nextLine = visibleLines[idx + 1];
      runRehearsalStep(nextLine.id);
    } else {
      state.rehearsalPlaying = false;
      state.rehearsalCurrentLineId = null;
      playSuccessChime();
      addStars(15);
      renderFullRehearsal();
    }
  }

  // ================= TAB 4: JUEGOS DE ENTRADA Y COMPRENSIÓN =================
  function renderGamesTab() {
    const container = document.getElementById("games-container");
    if (!container) return;

    container.innerHTML = `
      <div class="games-selector-bar">
        <div class="game-type-card ${state.activeGame === "cue-detective" ? "active" : ""}" data-game="cue-detective">
          <div class="game-icon">🕵️‍♀️</div>
          <h3>1. ¿Cuándo entro a hablar?</h3>
          <p>Escucha a tus compañeros y adivina qué frase te toca responder a ti.</p>
        </div>
        <div class="game-type-card ${state.activeGame === "word-builder" ? "active" : ""}" data-game="word-builder">
          <div class="game-icon">🧩</div>
          <h3>2. Arma tu Guion</h3>
          <p>Ordena las palabras en inglés para formar tus diálogos sin equivocarte.</p>
        </div>
        <div class="game-type-card ${state.activeGame === "meaning-match" ? "active" : ""}" data-game="meaning-match">
          <div class="game-icon">💡</div>
          <h3>3. ¿Qué significa?</h3>
          <p>Demuestra que entiendes todo lo que dices en español y con qué emoción.</p>
        </div>
      </div>

      <div class="game-arena" id="game-arena-box"></div>
    `;

    container.querySelectorAll(".game-type-card").forEach((card) => {
      card.addEventListener("click", () => {
        stopAllSpeech();
        state.activeGame = card.dataset.game;
        state.currentQuestion = null;
        renderGamesTab();
      });
    });

    if (state.activeGame === "cue-detective") renderCueDetectiveGame();
    if (state.activeGame === "word-builder") renderWordBuilderGame();
    if (state.activeGame === "meaning-match") renderMeaningMatchGame();
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Game 1: Cue Detective
  function renderCueDetectiveGame() {
    const arena = document.getElementById("game-arena-box");
    if (!arena) return;

    const targetLine = lucianaLines[Math.floor(Math.random() * lucianaLines.length)];
    const distractors = shuffleArray(lucianaLines.filter((l) => l.id !== targetLine.id)).slice(0, 2);
    const options = shuffleArray([targetLine, ...distractors]);
    const cueChar = SCRIPT_DATA.characters[targetLine.cueCharacter] || SCRIPT_DATA.characters.STAGE;

    arena.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span class="badge-star">🕵️‍♀️ Reto de Señales de Entrada</span>
        <span style="font-weight:800; color:var(--gold-light);">🔥 Racha: ${state.quizStreak}</span>
      </div>

      <div class="quiz-question-box">
        <div style="font-size:0.82rem; color:var(--gold); font-weight:800; text-transform:uppercase; margin-bottom:6px;">
          Escucha lo que acaba de pasar en el escenario:
        </div>
        <div style="font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:8px;">
          ${cueChar.avatar} ${cueChar.shortName}: "${targetLine.cueEn}"
        </div>
        <div style="font-size:0.9rem; color:var(--text-muted); margin-bottom:12px;">
          (${targetLine.cueEs})
        </div>
        <button id="btn-game-listen-cue" class="btn-mini-play">🔊 Escuchar voz del compañero</button>
      </div>

      <h4 style="margin-bottom:12px; color:var(--text-main);">👉 ¿Qué debes decir tú justo después?</h4>

      <div class="quiz-options">
        ${options
          .map(
            (opt) => `
          <button class="quiz-option-btn" data-opt-id="${opt.id}">
            <div style="font-size:1.08rem; margin-bottom:3px;">"${opt.en}"</div>
            <div style="font-size:0.82rem; color:var(--text-dim);">🎭 (${opt.emotion}) — 🇪🇸 ${opt.es}</div>
          </button>
        `
          )
          .join("")}
      </div>

      <div id="quiz-feedback" style="margin-top:18px; display:none;"></div>
    `;

    document.getElementById("btn-game-listen-cue")?.addEventListener("click", () => {
      speakEnglish(targetLine.cueEn.replace(/\(.*?\)/g, ""), { characterId: targetLine.cueCharacter });
    });

    arena.querySelectorAll(".quiz-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosenId = parseInt(btn.dataset.optId, 10);
        const feedback = document.getElementById("quiz-feedback");
        arena.querySelectorAll(".quiz-option-btn").forEach((b) => (b.disabled = true));

        if (chosenId === targetLine.id) {
          btn.classList.add("correct");
          state.quizStreak++;
          playSuccessChime();
          addStars(10);
          speakEnglish(targetLine.en, { characterId: "ASSISTANT_DIRECTOR" });
          if (feedback) {
            feedback.style.display = "block";
            feedback.innerHTML = `
              <div style="padding:14px; background:rgba(16,185,129,0.18); border:1px solid var(--green); border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>🎉 <strong>¡Excelente, Luciana! (+10 ⭐)</strong> Entraste justo a tiempo.</div>
                <button id="btn-next-quiz" class="btn-action btn-primary-listen">Siguiente Pregunta ➡️</button>
              </div>
            `;
            document.getElementById("btn-next-quiz")?.addEventListener("click", renderCueDetectiveGame);
          }
        } else {
          btn.classList.add("wrong");
          state.quizStreak = 0;
          arena.querySelector(`[data-opt-id="${targetLine.id}"]`)?.classList.add("correct");
          if (feedback) {
            feedback.style.display = "block";
            feedback.innerHTML = `
              <div style="padding:14px; background:rgba(244,63,94,0.18); border:1px solid var(--coral); border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>💡 <strong>¡Casi!</strong> La respuesta correcta era: <em>"${targetLine.en}"</em></div>
                <button id="btn-next-quiz" class="btn-action btn-primary-listen">Intentar otra ➡️</button>
              </div>
            `;
            document.getElementById("btn-next-quiz")?.addEventListener("click", renderCueDetectiveGame);
          }
        }
      });
    });
  }

  // Game 2: Word Builder
  function renderWordBuilderGame() {
    const arena = document.getElementById("game-arena-box");
    if (!arena) return;

    if (!state.wordBuilderTarget) {
      state.wordBuilderTarget = lucianaLines[Math.floor(Math.random() * lucianaLines.length)];
      state.wordBuilderSelected = [];
    }

    const line = state.wordBuilderTarget;
    const targetWords = line.en.trim().split(/\s+/);
    if (!state.wordBuilderShuffled) {
      state.wordBuilderShuffled = shuffleArray(targetWords.map((w, idx) => ({ word: w, origIdx: idx })));
    }

    const isComplete = state.wordBuilderSelected.length === targetWords.length;
    const builtSentence = state.wordBuilderSelected.map((item) => item.word).join(" ");
    const isCorrect = isComplete && builtSentence === targetWords.join(" ");

    arena.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span class="badge-star">🧩 Ordena las palabras en Inglés</span>
        <button id="btn-wb-listen" class="btn-mini-play">🔊 Escuchar pista</button>
      </div>

      <div class="quiz-question-box">
        <div style="font-size:0.8rem; color:var(--teal); font-weight:800; text-transform:uppercase;">Significado en Español:</div>
        <div style="font-size:1.2rem; font-weight:800; color:#fff; margin-top:4px;">«${line.es}»</div>
        <div style="font-size:0.86rem; color:var(--gold-light); margin-top:4px;">🎭 Actitud: ${line.emotion} (${line.emotionEs})</div>
      </div>

      <div style="font-size:0.88rem; color:var(--text-muted); margin-bottom:8px;">
        👇 Toca las palabras en orden para armar tu frase (toca una palabra puesta arriba si quieres quitarla):
      </div>

      <div class="word-slots-area" id="wb-slots">
        ${
          state.wordBuilderSelected.length === 0
            ? `<span style="color:var(--text-dim); font-style:italic;">Tus palabras aparecerán aquí...</span>`
            : state.wordBuilderSelected
                .map(
                  (item, idx) => `
              <span class="word-chip" data-remove-idx="${idx}" style="background:var(--luciana-primary)">${item.word}</span>
            `
                )
                .join("")
        }
      </div>

      <div class="word-bank-area">
        ${state.wordBuilderShuffled
          .map((item, idx) => {
            const alreadyUsed = state.wordBuilderSelected.some((s) => s.origIdx === item.origIdx);
            return `
              <button class="word-chip ${alreadyUsed ? "used" : ""}" data-bank-idx="${idx}">
                ${item.word}
              </button>
            `;
          })
          .join("")}
      </div>

      ${
        isComplete
          ? isCorrect
            ? `<div style="padding:16px; background:rgba(16,185,129,0.2); border:2px solid var(--green); border-radius:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>🌟 <strong>¡PERFECTO! (+15 ⭐)</strong> Armaste la frase exacta: <em>"${line.en}"</em></div>
                <button id="btn-wb-next" class="btn-action btn-primary-listen">Siguiente Frase ➡️</button>
               </div>`
            : `<div style="padding:16px; background:rgba(244,63,94,0.2); border:2px solid var(--coral); border-radius:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>🤔 <strong>Hay palabras en otro orden.</strong> Toca las palabras de arriba para corregirlas o reinicia.</div>
                <button id="btn-wb-reset" class="btn-action btn-slow-listen">🔄 Reiniciar palabras</button>
               </div>`
          : ""
      }
    `;

    document.getElementById("btn-wb-listen")?.addEventListener("click", () => {
      speakEnglish(line.en, { characterId: "ASSISTANT_DIRECTOR" });
    });

    arena.querySelectorAll("[data-bank-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.bankIdx, 10);
        const item = state.wordBuilderShuffled[idx];
        speakEnglish(item.word.replace(/[^a-zA-Z']/g, ""), { rate: 0.95 });
        state.wordBuilderSelected.push(item);
        if (
          state.wordBuilderSelected.length === targetWords.length &&
          state.wordBuilderSelected.map((x) => x.word).join(" ") === targetWords.join(" ")
        ) {
          playSuccessChime();
          addStars(15);
          setTimeout(() => speakEnglish(line.en, { characterId: "ASSISTANT_DIRECTOR" }), 300);
        }
        renderWordBuilderGame();
      });
    });

    arena.querySelectorAll("[data-remove-idx]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const remIdx = parseInt(chip.dataset.removeIdx, 10);
        state.wordBuilderSelected.splice(remIdx, 1);
        renderWordBuilderGame();
      });
    });

    document.getElementById("btn-wb-reset")?.addEventListener("click", () => {
      state.wordBuilderSelected = [];
      renderWordBuilderGame();
    });

    document.getElementById("btn-wb-next")?.addEventListener("click", () => {
      state.wordBuilderTarget = null;
      state.wordBuilderShuffled = null;
      state.wordBuilderSelected = [];
      renderWordBuilderGame();
    });
  }

  // Game 3: Meaning Match
  function renderMeaningMatchGame() {
    const arena = document.getElementById("game-arena-box");
    if (!arena) return;

    const targetLine = lucianaLines[Math.floor(Math.random() * lucianaLines.length)];
    const distractors = shuffleArray(lucianaLines.filter((l) => l.id !== targetLine.id)).slice(0, 2);
    const options = shuffleArray([targetLine, ...distractors]);

    arena.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span class="badge-star">💡 ¿Qué estás diciendo realmente?</span>
        <button id="btn-mm-listen" class="btn-mini-play">🔊 Escuchar en Inglés</button>
      </div>

      <div class="quiz-question-box">
        <div style="font-size:0.82rem; color:var(--gold); font-weight:800; text-transform:uppercase; margin-bottom:6px;">
          Cuando dices esta línea en el escenario:
        </div>
        <div style="font-size:1.45rem; font-weight:900; color:#fff; margin-bottom:6px;">
          "${targetLine.en}"
        </div>
        <div style="font-size:0.95rem; color:var(--gold-light);">
          🗣️ ${targetLine.phonetic}
        </div>
      </div>

      <h4 style="margin-bottom:12px;">👉 ¿Qué significa en español y qué estás haciendo?</h4>

      <div class="quiz-options">
        ${options
          .map(
            (opt) => `
          <button class="quiz-option-btn" data-mm-id="${opt.id}">
            <div style="font-size:1.05rem; color:#5eead4; margin-bottom:4px;">«${opt.es}»</div>
            <div style="font-size:0.84rem; color:var(--text-muted);">🎭 Actitud: ${opt.emotionEs}</div>
          </button>
        `
          )
          .join("")}
      </div>

      <div id="mm-feedback" style="margin-top:18px; display:none;"></div>
    `;

    document.getElementById("btn-mm-listen")?.addEventListener("click", () => {
      speakEnglish(targetLine.en, { characterId: "ASSISTANT_DIRECTOR" });
    });

    arena.querySelectorAll(".quiz-option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosenId = parseInt(btn.dataset.mmId, 10);
        const feedback = document.getElementById("mm-feedback");
        arena.querySelectorAll(".quiz-option-btn").forEach((b) => (b.disabled = true));

        if (chosenId === targetLine.id) {
          btn.classList.add("correct");
          playSuccessChime();
          addStars(10);
          if (feedback) {
            feedback.style.display = "block";
            feedback.innerHTML = `
              <div style="padding:14px; background:rgba(16,185,129,0.18); border:1px solid var(--green); border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>🌟 <strong>¡Exacto! (+10 ⭐)</strong> ${targetLine.meaningContextEs}</div>
                <button id="btn-mm-next" class="btn-action btn-primary-listen">Siguiente ➡️</button>
              </div>
            `;
            document.getElementById("btn-mm-next")?.addEventListener("click", renderMeaningMatchGame);
          }
        } else {
          btn.classList.add("wrong");
          arena.querySelector(`[data-mm-id="${targetLine.id}"]`)?.classList.add("correct");
          if (feedback) {
            feedback.style.display = "block";
            feedback.innerHTML = `
              <div style="padding:14px; background:rgba(244,63,94,0.18); border:1px solid var(--coral); border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>💡 Significa: <strong>«${targetLine.es}»</strong></div>
                <button id="btn-mm-next" class="btn-action btn-primary-listen">Siguiente ➡️</button>
              </div>
            `;
            document.getElementById("btn-mm-next")?.addEventListener("click", renderMeaningMatchGame);
          }
        }
      });
    });
  }

  // ================= TAB 5: LA HISTORIA Y PERSONAJES =================
  function renderStoryTab() {
    const container = document.getElementById("story-container");
    if (!container) return;

    const charactersList = Object.values(SCRIPT_DATA.characters).filter((c) => c.id !== "STAGE");

    container.innerHTML = `
      <div class="coaching-stage" style="margin-bottom:24px;">
        <h2 style="font-size:1.5rem; color:var(--gold-light); margin-bottom:10px;">
          🎬 ¿De qué trata la obra "Rear Window: Behind the Scenes"?
        </h2>
        <p style="font-size:1.02rem; color:var(--text-main); margin-bottom:14px;">
          La obra nos lleva al verano de <strong>1954 en los famosos Estudios Paramount de Hollywood</strong> (en el Escenario 18).
          Los niños de 4° grado muestran dos mundos al mismo tiempo:
        </p>
        <div class="understanding-grid">
          <div class="info-panel" style="border-left:4px solid var(--gold);">
            <h4>🎥 1. Cuando dicen "¡ACTION!" (La Película)</h4>
            <p>
              Están grabando una película de misterio llamada <em>Rear Window (La Ventana Indiscreta)</em>.
              <strong>Jeff/Jessy</strong> es un fotógrafo en silla de ruedas que observa a sus vecinos con binoculares junto a <strong>Lisa</strong>,
              y descubre que el vecino <strong>Thorwald</strong> esconde algo misterioso en una maleta.
            </p>
          </div>
          <div class="info-panel" style="border-left:4px solid var(--luciana-border);">
            <h4>🎭 2. Cuando dicen "¡CUT!" (La Vida Real detrás de cámaras)</h4>
            <p>
              Al gritar "¡CORTE!", vemos lo que sienten los actores de verdad. <strong>Thorwald</strong> finge ser el hombre más rudo de Hollywood,
              pero en realidad tiene mucho miedo de equivocarse o de que todos crean que él es malo en la vida real.
              <strong>¡Ahí es donde brillas tú, Luciana!</strong> Como <em>Assistant Director</em>, eres la primera en notar que está nervioso y en darle ánimo y cariño.
            </p>
          </div>
        </div>

        <div class="cue-box" style="margin-top:10px;">
          <div class="cue-label">📏 REGLA DE ORO DEL ESCENARIO (Running Rule)</div>
          <div class="cue-quote" style="font-size:0.95rem; margin-top:4px;">"${SCRIPT_DATA.runningRule.en}"</div>
          <div class="cue-explanation">🇪🇸 ${SCRIPT_DATA.runningRule.es}</div>
        </div>
      </div>

      <!-- RESUMEN RÁPIDO DE TODAS LAS LÍNEAS DE LUCIANA PARA IMPRIMIR / REPASAR -->
      <div class="coaching-stage" style="margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
          <h3 style="font-size:1.3rem; color:#fff;">⭐ Resumen Rápido de Todas las Intervenciones de Luciana</h3>
          <button onclick="window.print()" class="btn-mini-play">🖨️ Imprimir Hoja de Repaso</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${lucianaLines
            .map((l) => {
              const sc = SCRIPT_DATA.scenes.find((s) => s.id === l.sceneId);
              const cueC = SCRIPT_DATA.characters[l.cueCharacter] || SCRIPT_DATA.characters.STAGE;
              return `
                <div style="background:var(--bg-card-elevated); border:1px solid var(--border-subtle); border-left:4px solid var(--luciana-border); border-radius:12px; padding:14px 18px;">
                  <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:4px;">
                    <span style="font-weight:800; color:var(--gold-light); font-size:0.85rem;">
                      #${l.lucianaOrder} • ${sc ? sc.titleEs : ""} ${l.isLucianaEnsemble ? "(Todos juntos)" : "(Assistant Director)"}
                    </span>
                    <span style="font-size:0.8rem; color:#f0abfc;">🎭 (${l.emotion})</span>
                  </div>
                  <div style="font-size:0.82rem; color:var(--text-dim); margin-bottom:6px;">
                    👂 <strong>Pie de entrada (${cueC.shortName}):</strong> "${l.cueEn}"
                  </div>
                  <div style="font-size:1.15rem; font-weight:800; color:#fff; margin-bottom:3px;">
                    👉 "${l.en}"
                  </div>
                  <div style="font-size:0.9rem; color:var(--gold-light); margin-bottom:3px;">
                    🗣️ ${l.phonetic}
                  </div>
                  <div style="font-size:0.9rem; color:#5eead4;">
                    🇪🇸 «${l.es}»
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>

      <!-- ELENCO COMPLETO DE 4° GRADO -->
      <h3 style="font-size:1.3rem; color:var(--gold-light); margin-bottom:8px;">🌟 Elenco Completo y Compañeros de 4° Grado</h3>
      <div class="story-grid">
        ${charactersList
          .map(
            (c) => `
          <div class="cast-card ${c.id === "ASSISTANT_DIRECTOR" ? "is-luciana-card" : ""}">
            <div class="char-avatar" style="border-color:${c.color}">${c.avatar}</div>
            <div>
              <div style="font-weight:800; font-size:1.02rem; color:#fff;">${c.name}</div>
              <div style="font-size:0.8rem; color:var(--gold-light); font-weight:700; margin-bottom:6px;">
                👤 ${c.actors}
              </div>
              <div style="font-size:0.86rem; color:var(--text-muted);">${c.roleEs}</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  // ================= BOOTSTRAP =================
  function initApp() {
    loadProgress();
    initVoices();
    updateHeaderStats();

    // Navigation Tabs
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Speed Selector
    document.querySelectorAll(".speed-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.speechRate = parseFloat(btn.dataset.speed);
        document.querySelectorAll(".speed-btn").forEach((b) => {
          b.classList.toggle("active", b === btn);
        });
      });
    });

    // Clapperboard Easter Egg
    document.getElementById("header-clapper")?.addEventListener("click", () => {
      playClapperSound();
    });

    // Initial render
    renderMyLinesStudio();
  }

  document.addEventListener("DOMContentLoaded", initApp);
})();
