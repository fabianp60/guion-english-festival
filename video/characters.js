/* ==========================================================================
   CHARACTERS — consistent cartoon cast for "Rear Window: Behind the Scenes"
   Each character is a jointed SVG puppet (head, eyes, brows, mouth, 2-segment
   arms, 2-segment legs, props, tears, sweat, powder puffs) so the player can
   make them act line by line at 60 FPS.
   Local coordinates: feet at (0,0), head centre at (0,-262).
   ========================================================================== */
(function () {
  "use strict";

  // ---------- LOOK BOOK (keep in sync with the cast sheet on the title card) ----------
  const LOOKS = {
    CEREMONY_MASTER: {
      label: "Valeria (MC)", skin: "#f1c27d", hair: "long", hairColor: "#3b2314",
      outfit: "gala", top: "#f5c542", bottom: "#f5c542", legs: "#f1c27d", shoes: "#b91c1c",
      hat: "tiara", props: { R: "mic" }, idle: "mcIdle"
    },
    DIRECTOR: {
      label: "Director", skin: "#e0ac69", hair: "short", hairColor: "#2b1b0e",
      outfit: "vest", top: "#ffffff", vest: "#f59e0b", bottom: "#6b4f2a", legs: "#6b4f2a", shoes: "#3b2314",
      hat: "cap", hatColor: "#7c2d12", scarf: "#dc2626", props: { R: "megaphone" }, idle: "holdR"
    },
    ASSISTANT_DIRECTOR: {
      label: "Luciana · Assistant Director", skin: "#e2b08a", hair: "ponytail", hairColor: "#5a3214",
      outfit: "jacket", top: "#ffffff", jacket: "#8b5cf6", bottom: "#1e3a8a", legs: "#1e3a8a", shoes: "#f8fafc",
      hat: "headset", props: { L: "clipboard" }, idle: "clipboard", isLuciana: true
    },
    MAKEUP_MASTER: {
      label: "Makeup Master", skin: "#f6d0b1", hair: "bun", hairColor: "#b9382a",
      outfit: "apron", top: "#fbcfe8", apron: "#ec4899", bottom: "#4c1d95", legs: "#4c1d95", shoes: "#831843",
      props: { R: "brush" }, idle: "holdR"
    },
    JEFF: {
      label: "Jeff / Jessy", skin: "#f3c9a0", hair: "swoop", hairColor: "#6b4423",
      outfit: "shirtCamera", top: "#3b82f6", bottom: "#c2a878", legs: "#c2a878", shoes: "#3f3f46",
      props: {}, idle: "rest"
    },
    LISA: {
      label: "Lisa", skin: "#fbd7b5", hair: "bob", hairColor: "#e9c46a",
      outfit: "swingDress", top: "#14b8a6", bottom: "#14b8a6", legs: "#fbd7b5", shoes: "#0f766e",
      hat: "headband", hatColor: "#f8fafc", pearls: true, props: {}, idle: "clasp"
    },
    THORWALD: {
      label: "Thorwald", skin: "#e8b98f", hair: "slick", hairColor: "#111827",
      outfit: "suit", top: "#374151", bottom: "#374151", legs: "#1f2937", shoes: "#111827",
      glasses: true, props: { L: "suitcase" }, idle: "rest"
    },
    DETECTIVE: {
      label: "Detective", skin: "#c68642", hair: "short", hairColor: "#2b1b0e",
      outfit: "trench", top: "#c8a165", bottom: "#4b5563", legs: "#4b5563", shoes: "#1f2937",
      hat: "fedora", hatColor: "#4b3621", props: { R: "magnifier" }, idle: "holdR"
    },
    MISS_LONELYHEARTS: {
      label: "Miss Lonelyhearts", skin: "#f5cba7", hair: "curly", hairColor: "#8e3b1f",
      outfit: "dress", top: "#e11d48", bottom: "#e11d48", legs: "#f5cba7", shoes: "#7f1d1d",
      props: { R: "hanky" }, idle: "clasp"
    },
    ARTIST: {
      label: "Artist", skin: "#8d5524", hair: "curly", hairColor: "#141414",
      outfit: "smock", top: "#fde68a", bottom: "#334155", legs: "#334155", shoes: "#1e293b",
      hat: "beret", hatColor: "#b91c1c", props: {}, idle: "rest"
    },
    CAMERA_MAN: {
      label: "Camera Man", skin: "#ffdbac", hair: "short", hairColor: "#c2410c",
      outfit: "striped", top: "#ffffff", stripe: "#1e3a8a", vest: "#111827", bottom: "#1f2937", legs: "#1f2937", shoes: "#111827",
      hat: "backcap", hatColor: "#1d4ed8", props: { R: "clapper" }, idle: "holdR"
    },
    PROP_MASTER: {
      label: "Prop Master", skin: "#a0522d", hair: "braids", hairColor: "#24130a",
      outfit: "overalls", top: "#fde047", overalls: "#ea580c", bottom: "#ea580c", legs: "#ea580c", shoes: "#422006",
      props: {}, idle: "rest"
    }
  };

  // ---------- POSE LIBRARY: [shoulder, elbow] in degrees, "outward" positive ----------
  const POSES = {
    rest:      { L: [8, 6], R: [8, 6] },
    holdR:     { L: [8, 6], R: [12, -40] },
    holdL:     { L: [12, -40], R: [8, 6] },
    clipboard: { L: [-12, -78], R: [8, 6] },
    mcIdle:    { L: [8, 6], R: [10, -70] },
    mic:       { L: [8, 6], R: [-12, -150] },
    clasp:     { L: [-18, -62], R: [-18, -62] },
    pointUp:   { L: [8, 6], R: [165, 4], head: -10 },
    point:     { L: [8, 6], R: [92, 0] },
    pointL:    { L: [92, 0], R: [8, 6] },
    wide:      { L: [118, 8], R: [118, 8], head: -4 },
    snap:      { L: [8, 6], R: [120, 70] },
    stretch:   { L: [170, 0], R: [170, 0], head: -6 },
    flex:      { L: [92, 100], R: [92, 100], head: -6 },
    hips:      { L: [40, -95], R: [40, -95] },
    crossed:   { L: [-20, -76], R: [-20, -70] },
    chin:      { L: [-18, -70], R: [-12, -152], head: 6 },
    handChest: { L: [8, 6], R: [-16, -118] },
    reachR:    { L: [8, 6], R: [78, 8] },
    reachL:    { L: [78, 8], R: [8, 6] },
    raiseR:    { L: [8, 6], R: [142, 22] },
    holdUpR:   { L: [8, 6], R: [150, 25] },
    holdUpL:   { L: [150, 25], R: [8, 6] },
    showR:     { L: [8, 6], R: [70, 85] },
    palmsOut:  { L: [48, 100], R: [48, 100] },
    hairTouch: { L: [8, 6], R: [118, 125] },
    eyes:      { L: [-6, -152], R: [-6, -152], head: 8 },
    cheeks:    { L: [-4, -156], R: [-4, -156], head: 4 },
    ears:      { L: [98, 150], R: [98, 150] },
    shrug:     { L: [36, 75], R: [36, 75], head: 8 },
    loom:      { L: [72, 30], R: [88, 18], head: 6 },
    armsUp:    { L: [150, 15], R: [150, 15], head: -6 },
    belly:     { L: [-14, -96], R: [-14, -96] },
    nudge:     { L: [8, 6], R: [52, -100] },
    holdBoth:  { L: [60, 75], R: [60, 75] },
    ukulele:   { L: [-28, -95], R: [-14, -68] },
    speaker:   { L: [-30, -70], R: [-14, -80] },
    binocs:    { L: [-10, -148], R: [-10, -148], head: -3 },
    wag:       { L: [8, 6], R: [70, 95] },
    openR:     { L: [8, 6], R: [42, 60] },
    selfHug:   { L: [-28, -90], R: [-28, -84], head: 10 },
    powderL:   { L: [88, 28], R: [-18, -68], head: -4 },
    powderR:   { L: [-18, -68], R: [88, 28], head: 4 },
    filmCam:   { L: [-14, -126], R: [14, -45], head: 2 }
  };

  // Expressions: brow rotation (inner end up = +), mouth shape
  const EXPR = {
    neutral:   { brow: 0, mouth: "smile" },
    happy:     { brow: 4, mouth: "grin" },
    laugh:     { brow: 8, mouth: "laugh" },
    sad:       { brow: 16, mouth: "sad" },
    worried:   { brow: 14, mouth: "worried" },
    scared:    { brow: 20, mouth: "o" },
    angry:     { brow: -16, mouth: "flat" },
    grumpy:    { brow: -12, mouth: "sad" },
    surprised: { brow: 10, mouth: "o" },
    smug:      { brow: -6, mouth: "smirk" },
    sly:       { brow: -8, mouth: "smirk" },
    calm:      { brow: 2, mouth: "smile" },
    tender:    { brow: 10, mouth: "smile" }
  };
  const MOUTHS = {
    smile: "M-15,-236 Q0,-225 15,-236",
    grin: "M-19,-238 Q0,-214 19,-238 Z",
    laugh: "M-21,-240 Q0,-208 21,-240 Z",
    sad: "M-14,-226 Q0,-237 14,-226",
    worried: "M-15,-231 Q-7,-236 0,-231 Q7,-226 15,-231",
    flat: "M-13,-231 L13,-231",
    smirk: "M-14,-233 Q4,-228 17,-239",
    o: "M-7,-232 a7,8 0 1,0 14,0 a7,8 0 1,0 -14,0 Z"
  };

  // ---------- helpers ----------
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, v + amt));
    const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // ---------- PROPS (drawn upright, origin = hand centre) ----------
  const PROP_SVG = {
    megaphone: `<g><path d="M-6,-6 L34,-28 L34,24 L-6,6 Z" fill="#d6a865" stroke="#8a5a2b" stroke-width="3"/><ellipse cx="34" cy="-2" rx="7" ry="26" fill="#b88446" stroke="#8a5a2b" stroke-width="3"/><path d="M44,-14 Q54,-2 44,10 M52,-22 Q65,-2 52,18" stroke="#fde047" stroke-width="2.5" fill="none" stroke-linecap="round" class="mega-waves" opacity="0.8"/></g>`,
    clipboard: `<g transform="translate(6,-26)"><rect x="-20" y="-26" width="40" height="52" rx="5" fill="#a16207" stroke="#713f12" stroke-width="2"/><rect x="-15" y="-19" width="30" height="40" fill="#fff"/><rect x="-9" y="-30" width="18" height="9" rx="3" fill="#94a3b8"/><path d="M-10,-10 h20 M-10,-2 h20 M-10,6 h14" stroke="#64748b" stroke-width="2.5"/><text x="0" y="17" font-size="9" text-anchor="middle" fill="#7c3aed" font-weight="800">★ AD</text></g>`,
    suitcase: `<g transform="translate(0,26)"><rect x="-30" y="-14" width="60" height="42" rx="6" fill="#7c4a1e" stroke="#4a2c10" stroke-width="3"/><path d="M-10,-14 v-10 h20 v10" fill="none" stroke="#4a2c10" stroke-width="4"/><path d="M-30,6 h60" stroke="#c19a6b" stroke-width="3"/><rect x="-22" y="-14" width="6" height="42" fill="#5c3412" opacity=".6"/><rect x="16" y="-14" width="6" height="42" fill="#5c3412" opacity=".6"/></g>`,
    mic: `<g><rect x="-4" y="-34" width="8" height="34" rx="3" fill="#1f2937"/><circle cx="0" cy="-40" r="10" fill="#9ca3af" stroke="#4b5563" stroke-width="2"/></g>`,
    clapper: `<g class="clapper-prop" transform="translate(4,-28)">
      <rect x="-30" y="-14" width="60" height="40" rx="4" fill="#111827" stroke="#f8fafc" stroke-width="2"/>
      <line x1="-24" y1="-2" x2="24" y2="-2" stroke="#475569" stroke-width="1.5"/>
      <text x="0" y="11" font-size="9.5" fill="#fde047" text-anchor="middle" font-weight="900">STAGE 18</text>
      <text x="0" y="21" font-size="7" fill="#e2e8f0" text-anchor="middle" font-weight="700">TAKE 1 · 1954</text>
      <rect x="-30" y="-20" width="60" height="7" fill="#fff" stroke="#111" stroke-width="1.5"/>
      <path d="M-22,-20 l6,7 M-6,-20 l6,7 M10,-20 l6,7" stroke="#111" stroke-width="4.5"/>
      <g class="clap-arm" style="transform-origin: -28px -20px;">
        <rect x="-30" y="-31" width="60" height="11" rx="2" fill="#fff" stroke="#111" stroke-width="2"/>
        <path d="M-22,-31 l8,11 M-6,-31 l8,11 M10,-31 l8,11" stroke="#111" stroke-width="5"/>
        <circle cx="-26" cy="-22" r="2.5" fill="#fbbf24"/>
      </g>
      <g class="clack-burst" opacity="0" transform="translate(0,-38)">
        <polygon points="0,-24 7,-9 24,-12 12,0 22,14 5,9 0,24 -5,9 -22,14 -12,0 -24,-12 -7,-9" fill="#fde047" stroke="#ea580c" stroke-width="2"/>
        <text x="0" y="4" font-size="11" font-weight="900" fill="#111827" text-anchor="middle">CLACK!</text>
      </g>
    </g>`,
    magnifier: `<g><rect x="-3" y="-30" width="6" height="30" rx="3" fill="#78350f"/><circle cx="0" cy="-44" r="15" fill="#bae6fd" fill-opacity=".55" stroke="#a16207" stroke-width="5"/></g>`,
    brush: `<g class="makeup-brush"><rect x="-4" y="-30" width="8" height="32" rx="3.5" fill="#1f2937"/><rect x="-4.5" y="-35" width="9" height="6" rx="1" fill="#fbbf24"/><ellipse cx="0" cy="-46" rx="14" ry="16" fill="#f472b6" stroke="#ec4899" stroke-width="2"/><circle cx="-6" cy="-54" r="3" fill="#fbcfe8" opacity=".85"/><circle cx="7" cy="-50" r="2.5" fill="#fdf2f8" opacity=".9"/></g>`,
    powderPuff: `<g><circle cx="0" cy="-16" r="16" fill="#f9a8d4" stroke="#ec4899" stroke-width="2.5"/><circle cx="0" cy="-16" r="11" fill="#fdf2f8"/><path d="M-6,-16 h12" stroke="#f472b6" stroke-width="3" stroke-linecap="round"/></g>`,
    binoculars: `<g transform="translate(0,-14)"><rect x="-24" y="-12" width="19" height="26" rx="5" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/><rect x="5" y="-12" width="19" height="26" rx="5" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/><rect x="-6" y="-5" width="12" height="8" rx="2" fill="#475569"/><circle cx="-14.5" cy="-12" r="8" fill="#38bdf8" stroke="#94a3b8" stroke-width="2"/><circle cx="14.5" cy="-12" r="8" fill="#38bdf8" stroke="#94a3b8" stroke-width="2"/><circle cx="-16" cy="-14" r="2.5" fill="#fff" opacity=".8"/><circle cx="13" cy="-14" r="2.5" fill="#fff" opacity=".8"/></g>`,
    hanky: `<g><path d="M-12,-8 L14,-18 L20,10 L-8,16 Z" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><path d="M-4,-2 Q4,4 10,-4" stroke="#e2e8f0" stroke-width="2" fill="none"/></g>`,
    clay: `<g><ellipse cx="0" cy="-16" rx="18" ry="13" fill="#a8806a" stroke="#6b4b3a" stroke-width="2.5"/><ellipse cx="-5" cy="-19" rx="6" ry="4" fill="#c29b84" opacity=".6"/></g>`,
    horse: `<g transform="translate(0,-24)"><ellipse cx="0" cy="0" rx="20" ry="10" fill="#a8806a" stroke="#6b4b3a" stroke-width="2.5"/><path d="M12,-4 l9,-16 l8,3 l-5,15 Z" fill="#a8806a" stroke="#6b4b3a" stroke-width="2.5"/><ellipse cx="26" cy="-16" rx="6" ry="4" fill="#a8806a" stroke="#6b4b3a" stroke-width="2"/><path d="M-12,6 v12 M-4,6 v12 M6,6 v12 M14,6 v12" stroke="#6b4b3a" stroke-width="3.5"/><path d="M-18,-2 l-8,8" stroke="#6b4b3a" stroke-width="3" stroke-linecap="round"/></g>`,
    rock: `<g><circle cx="0" cy="-12" r="18" fill="#fde047" opacity="0.28"/><path d="M-12,-8 Q-15,-23 0,-23 Q15,-23 13,-8 Q10,2 -2,2 Q-12,2 -12,-8 Z" fill="#9ca3af" stroke="#4b5563" stroke-width="2.5"/><path d="M-5,-16 L2,-18 L5,-12" stroke="#e5e7eb" stroke-width="2" fill="none" stroke-linecap="round"/></g>`,
    speaker: `<g transform="translate(0,-18)"><rect x="-32" y="-22" width="64" height="42" rx="9" fill="#1f2937" stroke="#7c3aed" stroke-width="3"/><circle cx="-14" cy="-1" r="11" fill="#4b5563" stroke="#a78bfa" stroke-width="2.5"/><circle cx="14" cy="-1" r="11" fill="#4b5563" stroke="#a78bfa" stroke-width="2.5"/><circle cx="-14" cy="-1" r="4" fill="#ddd6fe"/><circle cx="14" cy="-1" r="4" fill="#ddd6fe"/></g>`,
    camera: `<g transform="translate(0,-18)"><rect x="-24" y="-16" width="48" height="32" rx="5" fill="#374151" stroke="#111827" stroke-width="2.5"/><circle cx="-10" cy="-24" r="9" fill="#1f2937" stroke="#4b5563" stroke-width="2"/><circle cx="10" cy="-24" r="9" fill="#1f2937" stroke="#4b5563" stroke-width="2"/><polygon points="24,-6 38,-14 38,10 24,2" fill="#111827"/><circle cx="0" cy="0" r="10" fill="#111827" stroke="#38bdf8" stroke-width="2.5"/></g>`,
    ukulele: `<g transform="rotate(-35)"><ellipse cx="0" cy="18" rx="22" ry="26" fill="#c2763b" stroke="#7c3f14" stroke-width="3"/><circle cx="0" cy="14" r="6" fill="#3b1d0a"/><rect x="-4" y="-50" width="8" height="52" fill="#7c3f14"/><line x1="-1.5" y1="-46" x2="-1.5" y2="28" stroke="#fef08a" stroke-width="1"/><line x1="1.5" y1="-46" x2="1.5" y2="28" stroke="#fef08a" stroke-width="1"/></g>`
  };

  // ---------- HAIR ----------
  function hairBack(L) {
    const c = L.hairColor;
    switch (L.hair) {
      case "long": return `<rect x="-70" y="-312" width="140" height="138" rx="56" fill="${c}"/>`;
      case "bob": return `<rect x="-68" y="-312" width="136" height="96" rx="48" fill="${c}"/>`;
      case "ponytail": return `<g class="pony"><ellipse cx="66" cy="-262" rx="19" ry="46" transform="rotate(18 66 -262)" fill="${c}"/></g>`;
      case "curly": {
        let s = "";
        for (let a = 150; a <= 390; a += 24) {
          const r = (a * Math.PI) / 180;
          s += `<circle cx="${(Math.cos(r) * 60).toFixed(1)}" cy="${(-268 + Math.sin(r) * 58).toFixed(1)}" r="20" fill="${c}"/>`;
        }
        return s;
      }
      case "braids": return [-62, 62].map((x) => [0, 1, 2, 3].map((i) => `<ellipse cx="${x}" cy="${-252 + i * 22}" rx="11" ry="13" fill="${c}"/>`).join("")).join("");
      default: return "";
    }
  }
  function hairFront(L) {
    const c = L.hairColor;
    const cap = `<path d="M-60,-268 Q-56,-328 0,-330 Q56,-328 60,-268 Q46,-298 0,-302 Q-46,-298 -60,-268 Z" fill="${c}"/>`;
    switch (L.hair) {
      case "swoop": return cap + `<path d="M-30,-300 Q10,-334 48,-296 Q20,-306 -4,-290 Z" fill="${c}"/>`;
      case "slick": return cap + `<path d="M-18,-327 Q-22,-306 -40,-292" stroke="${shade(c, 50)}" stroke-width="3" fill="none"/><path d="M-60,-268 Q-58,-300 -40,-292 L-58,-262Z" fill="${c}"/>`;
      case "bob": return `<path d="M-62,-262 Q-62,-334 0,-334 Q62,-334 62,-262 L50,-262 Q50,-294 0,-298 Q-50,-294 -50,-262 Z" fill="${c}"/><path d="M-46,-298 h92 v12 h-92 Z" fill="${c}"/>`;
      case "ponytail": return cap + `<path d="M-56,-280 Q-30,-318 30,-300 Q-10,-296 -36,-276 Z" fill="${c}"/><circle cx="56" cy="-300" r="7" fill="#a855f7"/>`;
      case "bun": return `<circle cx="0" cy="-334" r="24" fill="${c}"/>` + cap;
      case "curly": return cap + [-36, -12, 12, 36].map((x) => `<circle cx="${x}" cy="-312" r="15" fill="${c}"/>`).join("");
      case "long": return cap + `<path d="M-60,-268 Q-40,-310 0,-306 Q-30,-296 -46,-262 Z" fill="${c}"/>`;
      default: return cap;
    }
  }
  function hat(L) {
    const c = L.hatColor || "#333";
    switch (L.hat) {
      case "tiara": return `<path d="M-30,-318 L-20,-336 L-10,-322 L0,-344 L10,-322 L20,-336 L30,-318 Z" fill="#fde047" stroke="#ca8a04" stroke-width="2"/><circle cx="0" cy="-344" r="5" fill="#f472b6"/>`;
      case "cap": return `<ellipse cx="0" cy="-314" rx="64" ry="24" fill="${c}"/><ellipse cx="14" cy="-300" rx="52" ry="10" fill="${shade(c, -25)}"/><circle cx="0" cy="-336" r="5" fill="${shade(c, -30)}"/>`;
      case "fedora": return `<ellipse cx="0" cy="-310" rx="84" ry="13" fill="${shade(c, -15)}"/><path d="M-46,-312 Q-48,-356 0,-358 Q48,-356 46,-312 Z" fill="${c}"/><rect x="-46" y="-326" width="92" height="10" fill="#1c1917"/><path d="M-14,-356 Q0,-346 14,-356" stroke="${shade(c, -30)}" stroke-width="3" fill="none"/>`;
      case "beret": return `<ellipse cx="-8" cy="-322" rx="62" ry="20" transform="rotate(-8 -8 -322)" fill="${c}"/><rect x="-4" y="-348" width="6" height="10" rx="2" fill="${c}"/>`;
      case "backcap": return `<path d="M-60,-292 Q-56,-338 0,-338 Q56,-338 60,-292 Z" fill="${c}"/><ellipse cx="-58" cy="-292" rx="24" ry="7" fill="${shade(c, -30)}"/><rect x="-12" y="-300" width="24" height="9" rx="4" fill="#f8fafc" opacity=".8"/>`;
      case "headset": return `<path d="M-63,-262 Q-64,-344 0,-344 Q64,-344 63,-262" stroke="#312e81" stroke-width="7" fill="none"/><circle cx="-63" cy="-258" r="14" fill="#7c3aed" stroke="#312e81" stroke-width="3"/><circle cx="63" cy="-258" r="14" fill="#7c3aed" stroke="#312e81" stroke-width="3"/><path d="M-60,-248 Q-52,-222 -24,-226" stroke="#312e81" stroke-width="4" fill="none"/><circle cx="-22" cy="-226" r="5" fill="#1e1b4b"/>`;
      case "headband": return `<path d="M-58,-284 Q0,-334 58,-284" stroke="${c}" stroke-width="8" fill="none"/>`;
      default: return "";
    }
  }

  // ---------- TORSO ----------
  function torso(L) {
    const base = (fill, bottom = -95) => `<path d="M-42,-202 Q-47,-150 -38,${bottom} L38,${bottom} Q47,-150 42,-202 Q0,-214 -42,-202 Z" fill="${fill}"/>`;
    const skirt = (fill, flare) => `<path d="M-34,-140 L-${flare},-62 Q0,-50 ${flare},-62 L34,-140 Z" fill="${fill}"/>`;
    switch (L.outfit) {
      case "gala":
        return base(L.top, -120) + skirt(L.bottom, 66) +
          [[-20, -180], [16, -160], [-8, -130], [24, -110], [-30, -90], [8, -80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".85"/>`).join("") +
          `<path d="M-30,-202 Q0,-186 30,-202" stroke="#fff7d6" stroke-width="4" fill="none"/>`;
      case "vest":
        return base(L.top) + `<path d="M-42,-202 Q-47,-150 -38,-95 L-10,-95 L-12,-196 Z" fill="${L.vest}"/><path d="M42,-202 Q47,-150 38,-95 L10,-95 L12,-196 Z" fill="${L.vest}"/>` +
          `<path d="M-18,-206 L18,-206 L4,-176 L-4,-176 Z" fill="${L.scarf}"/><path d="M2,-180 L12,-150 L-2,-156 Z" fill="${L.scarf}"/>`;
      case "jacket":
        return base(L.top) + `<path d="M-42,-202 Q-47,-150 -38,-95 L-12,-95 L-16,-198 Z" fill="${L.jacket}"/><path d="M42,-202 Q47,-150 38,-95 L12,-95 L16,-198 Z" fill="${L.jacket}"/>` +
          `<path d="M0,-176 l5,11 12,1 -9,8 3,12 -11,-6 -11,6 3,-12 -9,-8 12,-1 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>` +
          `<rect x="-38" y="-150" width="22" height="16" rx="3" fill="#fff" stroke="#6d28d9" stroke-width="2"/><text x="-27" y="-138" font-size="10" text-anchor="middle" fill="#6d28d9" font-weight="900">AD</text>`;
      case "apron":
        return base(L.top) + `<rect x="-30" y="-182" width="60" height="96" rx="10" fill="${L.apron}"/><rect x="-18" y="-130" width="36" height="22" rx="4" fill="${shade(L.apron, -30)}"/><path d="M-12,-130 v-14 M0,-130 v-18 M12,-130 v-12" stroke="#1f2937" stroke-width="4"/>`;
      case "shirtCamera":
        return base(L.top) + `<path d="M-16,-206 L0,-188 L16,-206" stroke="#fff" stroke-width="5" fill="none"/>` +
          `<path d="M-36,-196 L-2,-152 M36,-196 L2,-152" stroke="#111827" stroke-width="4"/><rect x="-20" y="-162" width="40" height="28" rx="5" fill="#27272a"/><circle cx="0" cy="-148" r="9" fill="#52525b" stroke="#d4d4d8" stroke-width="2"/><rect x="8" y="-168" width="9" height="6" fill="#27272a"/>`;
      case "swingDress":
        return base(L.top, -120) + skirt(L.bottom, 78) + `<rect x="-36" y="-142" width="72" height="9" fill="#f8fafc"/>` +
          (L.pearls ? [-24, -14, -4, 6, 16, 26].map((x, i) => `<circle cx="${x - 1}" cy="${-200 + Math.abs(i - 2.5) * -2 + 8}" r="4" fill="#fff" stroke="#e2e8f0"/>`).join("") : "");
      case "dress":
        return base(L.top, -120) + skirt(L.bottom, 62) + `<path d="M-20,-204 Q0,-186 20,-204" stroke="${shade(L.top, 40)}" stroke-width="5" fill="none"/>`;
      case "suit":
        return base(L.top) + `<path d="M-14,-206 L0,-168 L14,-206 Z" fill="#f8fafc"/><path d="M-4,-198 L4,-198 L7,-150 L0,-138 L-7,-150 Z" fill="#b91c1c"/>` +
          `<path d="M-14,-206 L-4,-160 M14,-206 L4,-160" stroke="${shade(L.top, -40)}" stroke-width="3"/><circle cx="0" cy="-120" r="3" fill="#111"/>`;
      case "trench":
        return base(L.top, -66) + `<rect x="-42" y="-136" width="84" height="11" fill="${shade(L.top, -40)}"/><rect x="-7" y="-138" width="14" height="15" fill="none" stroke="#fde68a" stroke-width="3"/>` +
          `<path d="M-14,-206 L0,-176 L14,-206" stroke="${shade(L.top, -40)}" stroke-width="4" fill="none"/><circle cx="-12" cy="-160" r="3.5" fill="#5b4632"/><circle cx="12" cy="-160" r="3.5" fill="#5b4632"/><circle cx="-12" cy="-104" r="3.5" fill="#5b4632"/><circle cx="12" cy="-104" r="3.5" fill="#5b4632"/>`;
      case "smock":
        return base(L.top, -78) + [["#ef4444", -18, -170], ["#3b82f6", 16, -150], ["#22c55e", -8, -120], ["#a855f7", 22, -100], ["#f97316", -24, -96]].map(([c, x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`).join("") +
          `<rect x="-20" y="-112" width="22" height="16" rx="3" fill="${shade(L.top, -25)}"/>`;
      case "striped":
        return base(L.top) + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="-44" y="${-196 + i * 17}" width="88" height="7" fill="${L.stripe}" opacity=".85"/>`).join("") +
          `<path d="M-42,-202 Q-47,-150 -38,-95 L-18,-95 L-20,-198 Z" fill="${L.vest}"/><path d="M42,-202 Q47,-150 38,-95 L18,-95 L20,-198 Z" fill="${L.vest}"/>`;
      case "overalls":
        return base(L.top) + `<rect x="-28" y="-172" width="56" height="78" rx="8" fill="${L.overalls}"/><path d="M-26,-170 L-34,-204 M26,-170 L34,-204" stroke="${L.overalls}" stroke-width="9"/>` +
          `<circle cx="-20" cy="-164" r="4" fill="#fde68a"/><circle cx="20" cy="-164" r="4" fill="#fde68a"/><rect x="-14" y="-150" width="28" height="18" rx="3" fill="${shade(L.overalls, -30)}"/>` +
          `<rect x="-44" y="-112" width="88" height="14" rx="4" fill="#78350f"/><path d="M30,-112 l6,-20 l6,2 l-4,18" fill="#9ca3af" stroke="#4b5563" stroke-width="2"/><rect x="-38" y="-118" width="10" height="20" fill="#facc15"/>`;
      default:
        return base(L.top);
    }
  }

  // ---------- LOWER BODY VARIANTS ----------
  function lowerBody(L, cast) {
    const leg = (x) => `<g class="leg leg-${x < 0 ? "l" : "r"}" style="transform-origin: ${x}px -96px;"><rect x="${x - 10}" y="-100" width="20" height="88" rx="9" fill="${L.legs}"/><ellipse class="shoe" cx="${x + (x < 0 ? -3 : 3)}" cy="-9" rx="18" ry="10" fill="${L.shoes}"/></g>`;
    const stand = `<g class="lower-stand">${leg(-16)}${leg(16)}</g>`;
    const castLeg = cast ? `<rect x="5" y="-62" width="24" height="56" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/><path d="M7,-48 h20 M7,-36 h20 M7,-24 h20" stroke="#cbd5e1" stroke-width="2"/>` : "";
    const sit = `<g class="lower-sit">
        <rect x="-26" y="-64" width="20" height="56" rx="9" fill="${L.legs}"/><ellipse cx="-19" cy="-8" rx="17" ry="9" fill="${L.shoes}"/>
        <rect x="6" y="-64" width="20" height="56" rx="9" fill="${L.legs}"/><ellipse cx="19" cy="-8" rx="17" ry="9" fill="${L.shoes}"/>
        ${castLeg}
        <rect x="-50" y="-72" width="100" height="14" rx="5" fill="#475569"/>
      </g>`;
    const kneel = `<g class="lower-kneel"><rect x="-28" y="-58" width="22" height="52" rx="11" fill="${L.legs}"/><rect x="6" y="-58" width="22" height="52" rx="11" fill="${L.legs}"/></g>`;
    const floor = `<g class="lower-floor"><ellipse cx="0" cy="-18" rx="56" ry="18" fill="${L.legs}"/><ellipse cx="-50" cy="-8" rx="14" ry="8" fill="${L.shoes}"/><ellipse cx="50" cy="-8" rx="14" ry="8" fill="${L.shoes}"/></g>`;
    return stand + sit + kneel + floor;
  }
  const WHEELCHAIR_BACK = `<g class="wheelchair"><rect x="-48" y="-196" width="96" height="120" rx="10" fill="#334155"/>
      <circle cx="-62" cy="-56" r="52" fill="none" stroke="#1e293b" stroke-width="9"/><circle cx="62" cy="-56" r="52" fill="none" stroke="#1e293b" stroke-width="9"/>
      <path d="M-62,-108 v104 M-114,-56 h104 M62,-108 v104 M10,-56 h104" stroke="#64748b" stroke-width="3"/></g>`;

  // ---------- ARM ----------
  function arm(L, side) {
    const sx = side === "L" ? -40 : 40;
    const sleeve = ["gala", "swingDress", "dress"].includes(L.outfit) ? L.skin
      : L.outfit === "jacket" ? L.jacket : L.outfit === "vest" ? L.top : L.outfit === "overalls" ? L.top : L.top;
    return `<g class="arm arm-${side}">
        <rect x="${sx - 10}" y="-200" width="20" height="60" rx="10" fill="${sleeve}"/>
        <g class="fore fore-${side}">
          <rect x="${sx - 8.5}" y="-148" width="17" height="54" rx="8.5" fill="${L.skin}"/>
          <g class="hand hand-${side}" transform="translate(${sx},-92)">
            <g class="prop prop-${side}"></g>
            <circle r="11" fill="${L.skin}" stroke="${shade(L.skin, -30)}" stroke-width="1.5"/>
          </g>
        </g>
      </g>`;
  }

  // ---------- BUILD ONE CHARACTER ----------
  function buildCharacterSVG(id) {
    const L = LOOKS[id];
    const isLu = !!L.isLuciana;
    return `<g class="char ${isLu ? "char-luciana" : ""}" data-id="${id}" style="opacity:0">
      <ellipse class="floor-spot" cx="0" cy="-4" rx="105" ry="22" fill="url(#gradSpot)" opacity="0"/>
      ${isLu ? `<ellipse class="lu-glow" cx="0" cy="-180" rx="125" ry="210" fill="url(#gradLuGlow)" opacity="0"/>` : ""}
      <ellipse cx="0" cy="-3" rx="60" ry="11" fill="#000" opacity=".28"/>
      <g class="bob">
        <g class="chair-layer">${WHEELCHAIR_BACK}</g>
        <g class="lower">${lowerBody(L, id === "JEFF")}</g>
        <g class="upper">
          <g class="torso">${torso(L)}</g>
          <g class="body-prop"></g>
          ${arm(L, "L")}
          <g class="head">
            <rect x="-11" y="-214" width="22" height="20" fill="${shade(L.skin, -18)}"/>
            ${hairBack(L)}
            <circle cx="-58" cy="-258" r="11" fill="${L.skin}"/><circle cx="58" cy="-258" r="11" fill="${L.skin}"/>
            <circle cx="0" cy="-262" r="60" fill="${L.skin}"/>
            <ellipse class="cheek-l" cx="-34" cy="-240" rx="10" ry="6" fill="#ff6b8b" opacity=".33"/><ellipse class="cheek-r" cx="34" cy="-240" rx="10" ry="6" fill="#ff6b8b" opacity=".33"/>
            <g class="eye eye-l"><ellipse cx="-22" cy="-266" rx="11" ry="13" fill="#fff"/><circle class="pupil" cx="-22" cy="-264" r="6.5" fill="#2b1d14"/><circle class="glint" cx="-20" cy="-267" r="2" fill="#fff"/></g>
            <g class="eye eye-r"><ellipse cx="22" cy="-266" rx="11" ry="13" fill="#fff"/><circle class="pupil" cx="22" cy="-264" r="6.5" fill="#2b1d14"/><circle class="glint" cx="24" cy="-267" r="2" fill="#fff"/></g>
            <path class="brow brow-l" d="M-33,-288 Q-22,-295 -11,-289" stroke="${shade(L.hairColor, -10)}" stroke-width="4.5" stroke-linecap="round" fill="none"/>
            <path class="brow brow-r" d="M11,-289 Q22,-295 33,-288" stroke="${shade(L.hairColor, -10)}" stroke-width="4.5" stroke-linecap="round" fill="none"/>
            <ellipse cx="0" cy="-249" rx="4.5" ry="3.5" fill="${shade(L.skin, -35)}"/>
            <path class="mouth" d="${MOUTHS.smile}" stroke="#7a1f2b" stroke-width="4" stroke-linecap="round" fill="#7a1f2b"/>
            <ellipse class="mouth-open" cx="0" cy="-233" rx="11" ry="0" fill="#7a1f2b"/>
            <!-- Animated Tears Layer -->
            <g class="tears-layer" opacity="0">
              <path class="tear-l" d="M-24,-250 Q-29,-238 -24,-234 Q-19,-238 -24,-250 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
              <path class="tear-r" d="M24,-250 Q19,-238 24,-234 Q29,-238 24,-250 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
            </g>
            <!-- Animated Nervous Sweat Drop -->
            <g class="sweat-layer" opacity="0">
              <path class="sweat-drop" d="M48,-295 Q41,-276 48,-270 Q55,-276 48,-295 Z" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.5"/>
            </g>
            <!-- Animated Makeup Powder Puffs on Face -->
            <g class="powder-layer" opacity="0">
              <circle class="puff-1" cx="-36" cy="-244" r="14" fill="#fbcfe8" fill-opacity="0.72"/>
              <circle class="puff-2" cx="32" cy="-246" r="13" fill="#f9a8d4" fill-opacity="0.68"/>
              <circle class="puff-3" cx="0" cy="-272" r="11" fill="#fdf2f8" fill-opacity="0.75"/>
              <text x="-46" y="-266" font-size="16">✨</text>
              <text x="34" y="-262" font-size="15">✨</text>
            </g>
            ${hairFront(L)}
            ${L.glasses ? `<g fill="none" stroke="#111" stroke-width="4"><circle cx="-22" cy="-266" r="16"/><circle cx="22" cy="-266" r="16"/><path d="M-6,-268 h12"/></g>` : ""}
            ${hat(L)}
            <g class="head-prop"></g>
          </g>
          ${arm(L, "R")}
        </g>
        <g class="tag" transform="translate(0,-382)" opacity="0">
          <rect class="tag-bg" x="-90" y="-22" width="180" height="40" rx="20" fill="${isLu ? "url(#gradLuTag)" : "#0f172a"}" stroke="${isLu ? "#fde047" : "#fbbf24"}" stroke-width="3"/>
          <text class="tag-text" x="0" y="6" font-size="20" font-weight="800" text-anchor="middle" fill="#fff">${isLu ? "★ LUCIANA" : L.label}</text>
        </g>
        ${isLu ? `<g class="lu-star" transform="translate(0,-440)" opacity="0"><path d="M0,-22 l6.5,13.5 15,2 -11,10.5 2.7,15 -13.2,-7 -13.2,7 2.7,-15 -11,-10.5 15,-2 Z" fill="#fde047" stroke="#f59e0b" stroke-width="2"/></g>` : ""}
      </g>
    </g>`;
  }

  window.CAST_KIT = { LOOKS, POSES, EXPR, MOUTHS, PROP_SVG, buildCharacterSVG, shade };
})();
