/* ==========================================================================
   STAGE CHOREOGRAPHY & ACTING ENGINE
   Defines how every character moves, acts, holds props, and changes
   expressions across all 127 lines of "Rear Window: Behind the Scenes".
   Stage coordinates: 1920 x 820 (floor Y = 685..735)
   ========================================================================== */
(function () {
  "use strict";

  const ALL_ACTORS = [
    "CEREMONY_MASTER",
    "DIRECTOR",
    "ASSISTANT_DIRECTOR",
    "MAKEUP_MASTER",
    "JEFF",
    "LISA",
    "THORWALD",
    "DETECTIVE",
    "MISS_LONELYHEARTS",
    "ARTIST",
    "CAMERA_MAN",
    "PROP_MASTER"
  ];

  // Default backstage layout per scene
  const SCENE_BASE = {
    "scene-1": {
      backdrop: "stage18",
      lighting: "warm",
      actors: {
        CEREMONY_MASTER:    { x: 180,  y: 710, scale: 0.86, vis: false, pose: "mcIdle", expr: "happy" },
        DIRECTOR:           { x: 960,  y: 695, scale: 0.94, vis: true,  pose: "holdR", expr: "happy", propR: "megaphone" },
        ASSISTANT_DIRECTOR: { x: 740,  y: 705, scale: 0.94, vis: true,  pose: "clipboard", expr: "neutral", propL: "clipboard" },
        MAKEUP_MASTER:      { x: 470,  y: 705, scale: 0.88, vis: true,  pose: "holdR", expr: "happy", propR: "brush" },
        JEFF:               { x: 340,  y: 710, scale: 0.90, vis: true,  pose: "rest", expr: "neutral", stance: "sit", wheelchair: true },
        LISA:               { x: 585,  y: 700, scale: 0.88, vis: true,  pose: "clasp", expr: "happy" },
        CAMERA_MAN:         { x: 1170, y: 700, scale: 0.90, vis: true,  pose: "holdR", expr: "neutral", propR: "clapper" },
        PROP_MASTER:        { x: 1330, y: 705, scale: 0.88, vis: true,  pose: "rest", expr: "neutral" },
        DETECTIVE:          { x: 1500, y: 700, scale: 0.90, vis: true,  pose: "holdR", expr: "smug", propR: "magnifier" },
        THORWALD:           { x: 1685, y: 705, scale: 0.94, vis: true,  pose: "rest", expr: "smug", propL: "suitcase" },
        MISS_LONELYHEARTS:  { x: 150,  y: 675, scale: 0.78, vis: false, pose: "clasp", expr: "neutral" },
        ARTIST:             { x: 250,  y: 675, scale: 0.78, vis: false, pose: "rest", expr: "neutral" }
      }
    },

    "scene-2": {
      backdrop: "lonelyhearts",
      lighting: "romantic",
      actors: {
        CEREMONY_MASTER:    { x: 180,  y: 710, scale: 0.86, vis: false, pose: "mcIdle", expr: "happy" },
        MISS_LONELYHEARTS:  { x: 760,  y: 705, scale: 0.95, vis: true,  pose: "clasp", expr: "sad", propR: "hanky" },
        ARTIST:             { x: 1120, y: 705, scale: 0.95, vis: true,  pose: "ukulele", expr: "calm", propR: "ukulele" },
        DIRECTOR:           { x: 1540, y: 700, scale: 0.88, vis: true,  pose: "holdR", expr: "calm", propR: "megaphone" },
        CAMERA_MAN:         { x: 1690, y: 705, scale: 0.88, vis: true,  pose: "holdR", expr: "neutral", propR: "camera" },
        ASSISTANT_DIRECTOR: { x: 1390, y: 705, scale: 0.90, vis: true,  pose: "clipboard", expr: "tender", propL: "clipboard" },
        MAKEUP_MASTER:      { x: 520,  y: 700, scale: 0.85, vis: true,  pose: "holdR", expr: "neutral", propR: "brush" },
        PROP_MASTER:        { x: 380,  y: 700, scale: 0.85, vis: true,  pose: "rest", expr: "neutral", propR: "clay" },
        DETECTIVE:          { x: 240,  y: 700, scale: 0.85, vis: true,  pose: "rest", expr: "neutral" },
        LISA:               { x: 600,  y: 685, scale: 0.84, vis: false, pose: "clasp", expr: "calm" },
        JEFF:               { x: 430,  y: 705, scale: 0.86, vis: false, pose: "rest", expr: "calm", stance: "sit", wheelchair: true },
        THORWALD:           { x: 1790, y: 690, scale: 0.82, vis: false, pose: "crossed", expr: "neutral" }
      }
    },

    "scene-2-5": {
      backdrop: "party",
      lighting: "party",
      actors: {
        CEREMONY_MASTER:    { x: 170,  y: 710, scale: 0.86, vis: false, pose: "mcIdle", expr: "happy" },
        PROP_MASTER:        { x: 770,  y: 705, scale: 0.92, vis: true,  pose: "speaker", expr: "happy", propR: "speaker" },
        ASSISTANT_DIRECTOR: { x: 960,  y: 710, scale: 0.98, vis: true,  pose: "speaker", expr: "happy", propL: "clipboard" },
        DIRECTOR:           { x: 560,  y: 700, scale: 0.90, vis: true,  pose: "hips", expr: "grumpy", propR: "megaphone" },
        THORWALD:           { x: 1470, y: 705, scale: 0.92, vis: true,  pose: "crossed", expr: "grumpy" },
        DETECTIVE:          { x: 1300, y: 705, scale: 0.90, vis: true,  pose: "hips", expr: "happy" },
        MAKEUP_MASTER:      { x: 390,  y: 700, scale: 0.86, vis: true,  pose: "holdR", expr: "worried", propR: "brush" },
        CAMERA_MAN:         { x: 1140, y: 700, scale: 0.88, vis: true,  pose: "holdR", expr: "happy", propR: "clapper" },
        LISA:               { x: 1640, y: 700, scale: 0.88, vis: true,  pose: "wide", expr: "happy" },
        JEFF:               { x: 230,  y: 708, scale: 0.86, vis: true,  pose: "rest", expr: "happy", stance: "sit", wheelchair: true },
        ARTIST:             { x: 1775, y: 695, scale: 0.84, vis: true,  pose: "rest", expr: "happy" },
        MISS_LONELYHEARTS:  { x: 105,  y: 695, scale: 0.84, vis: true,  pose: "clasp", expr: "happy" }
      }
    },

    "scene-3": {
      backdrop: "thriller",
      lighting: "tension",
      actors: {
        CEREMONY_MASTER:    { x: 170,  y: 710, scale: 0.86, vis: false, pose: "mcIdle", expr: "worried" },
        THORWALD:           { x: 1080, y: 708, scale: 0.98, vis: true,  pose: "selfHug", expr: "scared", propL: "suitcase" },
        JEFF:               { x: 520,  y: 710, scale: 0.94, vis: true,  pose: "rest", expr: "calm", stance: "sit", wheelchair: true },
        ASSISTANT_DIRECTOR: { x: 880,  y: 708, scale: 0.96, vis: true,  pose: "clipboard", expr: "tender", propL: "clipboard" },
        DIRECTOR:           { x: 1320, y: 705, scale: 0.90, vis: true,  pose: "holdR", expr: "calm", propR: "megaphone" },
        CAMERA_MAN:         { x: 1490, y: 705, scale: 0.88, vis: true,  pose: "holdR", expr: "happy", propR: "clapper" },
        LISA:               { x: 700,  y: 700, scale: 0.88, vis: true,  pose: "clasp", expr: "tender" },
        MAKEUP_MASTER:      { x: 340,  y: 700, scale: 0.85, vis: true,  pose: "clasp", expr: "tender", propR: "brush" },
        PROP_MASTER:        { x: 1640, y: 700, scale: 0.86, vis: true,  pose: "holdR", expr: "happy", propR: "rock" },
        DETECTIVE:          { x: 1775, y: 698, scale: 0.85, vis: true,  pose: "hips", expr: "happy" },
        ARTIST:             { x: 200,  y: 698, scale: 0.84, vis: true,  pose: "holdR", expr: "happy", propR: "horse" },
        MISS_LONELYHEARTS:  { x: 100,  y: 696, scale: 0.82, vis: true,  pose: "handChest", expr: "tender" }
      }
    },

    "scene-4": {
      backdrop: "relief",
      lighting: "celebration",
      actors: {
        CEREMONY_MASTER:    { x: 175,  y: 710, scale: 0.86, vis: false, pose: "mcIdle", expr: "happy" },
        THORWALD:           { x: 960,  y: 708, scale: 0.98, vis: true,  pose: "armsUp", expr: "laugh", propR: "rock" },
        LISA:               { x: 770,  y: 705, scale: 0.92, vis: true,  pose: "nudge", expr: "laugh" },
        DETECTIVE:          { x: 1160, y: 705, scale: 0.92, vis: true,  pose: "pointL", expr: "laugh" },
        PROP_MASTER:        { x: 1340, y: 705, scale: 0.90, vis: true,  pose: "armsUp", expr: "happy" },
        JEFF:               { x: 560,  y: 710, scale: 0.92, vis: true,  pose: "rest", expr: "happy", stance: "sit", wheelchair: true },
        ASSISTANT_DIRECTOR: { x: 390,  y: 705, scale: 0.94, vis: true,  pose: "wide", expr: "happy", propL: "clipboard" },
        DIRECTOR:           { x: 1520, y: 700, scale: 0.88, vis: true,  pose: "armsUp", expr: "happy", propR: "megaphone" },
        CAMERA_MAN:         { x: 1690, y: 700, scale: 0.86, vis: true,  pose: "raiseR", expr: "happy", propR: "clapper" },
        MAKEUP_MASTER:      { x: 230,  y: 698, scale: 0.84, vis: true,  pose: "clasp", expr: "happy" },
        ARTIST:             { x: 1810, y: 696, scale: 0.82, vis: true,  pose: "wide", expr: "happy" },
        MISS_LONELYHEARTS:  { x: 95,   y: 696, scale: 0.82, vis: true,  pose: "clasp", expr: "happy" }
      }
    },

    "scene-5": {
      backdrop: "curtain",
      lighting: "finale",
      actors: {
        MISS_LONELYHEARTS:  { x: 130,  y: 705, scale: 0.86, vis: true, pose: "handChest", expr: "tender" },
        ARTIST:             { x: 280,  y: 705, scale: 0.86, vis: true, pose: "openR", expr: "happy" },
        THORWALD:           { x: 435,  y: 705, scale: 0.88, vis: true, pose: "handChest", expr: "happy", propR: "rock" },
        CAMERA_MAN:         { x: 590,  y: 705, scale: 0.86, vis: true, pose: "holdR", expr: "happy", propR: "clapper" },
        MAKEUP_MASTER:      { x: 745,  y: 705, scale: 0.86, vis: true, pose: "clasp", expr: "happy", propR: "brush" },
        ASSISTANT_DIRECTOR: { x: 935,  y: 712, scale: 0.98, vis: true, pose: "wide", expr: "happy", propL: "clipboard" },
        LISA:               { x: 1115, y: 705, scale: 0.86, vis: true, pose: "handChest", expr: "tender" },
        PROP_MASTER:        { x: 1265, y: 705, scale: 0.86, vis: true, pose: "wide", expr: "happy" },
        DETECTIVE:          { x: 1415, y: 705, scale: 0.86, vis: true, pose: "hips", expr: "laugh" },
        JEFF:               { x: 1575, y: 710, scale: 0.86, vis: true, pose: "rest", expr: "happy", stance: "sit", wheelchair: true },
        DIRECTOR:           { x: 1735, y: 705, scale: 0.88, vis: true, pose: "wide", expr: "happy", propR: "megaphone" },
        CEREMONY_MASTER:    { x: 1845, y: 705, scale: 0.84, vis: true, pose: "mcIdle", expr: "happy", propR: "mic" }
      }
    }
  };

  // Clone helper
  function cloneActors(map) {
    const out = {};
    for (const k of ALL_ACTORS) {
      out[k] = Object.assign(
        { x: 960, y: 700, scale: 0.88, vis: false, pose: "rest", expr: "neutral", stance: "stand", wheelchair: false, propL: null, propR: null, dance: false, nod: false, shake: false, bow: false },
        map[k] || {}
      );
    }
    return out;
  }

  // Automatic pose + expression from emotion text if not explicitly overridden
  function inferPoseAndExpr(line, currentActorState) {
    const emo = (line.emotion || "").toLowerCase();
    const en = (line.en || "").toLowerCase();
    let pose = currentActorState.pose || "rest";
    let expr = currentActorState.expr || "neutral";

    if (emo.includes("worried")) expr = "worried";
    else if (emo.includes("scared") || emo.includes("fear") || emo.includes("shaking")) expr = "scared";
    else if (emo.includes("crying") || emo.includes("sad")) expr = "sad";
    else if (emo.includes("grumpy") || emo.includes("impatient") || emo.includes("exasperated")) expr = "grumpy";
    else if (emo.includes("laugh") || emo.includes("delighted") || emo.includes("thrilled") || emo.includes("excited")) expr = "laugh";
    else if (emo.includes("grin") || emo.includes("teasing") || emo.includes("playful") || emo.includes("proud") || emo.includes("smiling") || emo.includes("welcoming")) expr = "happy";
    else if (emo.includes("gentle") || emo.includes("warm") || emo.includes("kind") || emo.includes("soft") || emo.includes("sincere") || emo.includes("touched")) expr = "tender";
    else if (emo.includes("threatening") || emo.includes("menacing") || emo.includes("firm")) expr = "smug";

    if (emo.includes("pointing up")) pose = "pointUp";
    else if (emo.includes("pointing")) pose = "point";
    else if (emo.includes("arms wide") || emo.includes("waving")) pose = "wide";
    else if (emo.includes("snapping")) pose = "snap";
    else if (emo.includes("stretching")) pose = "stretch";
    else if (emo.includes("flexing") || emo.includes("chest out")) pose = "flex";
    else if (emo.includes("arms crossed")) pose = "crossed";
    else if (emo.includes("covering ears")) pose = "ears";
    else if (emo.includes("shrugging")) pose = "shrug";
    else if (emo.includes("hand to chest") || emo.includes("touched")) pose = "handChest";
    else if (emo.includes("wiping eyes") || emo.includes("crying")) pose = "eyes";
    else if (emo.includes("thoughtful") || emo.includes("to self")) pose = "chin";
    else if (emo.includes("raising hand") || emo.includes("raising board") || emo.includes("jumping")) pose = "raiseR";
    else if (emo.includes("looming") || emo.includes("reaching out")) pose = "loom";
    else if (emo.includes("nudging")) pose = "nudge";
    else if (en.includes("cut!") || en.includes("action!")) pose = "raiseR";

    return { pose, expr };
  }

  // Build state for any line ID (1..127)
  function getStageStateForLine(line) {
    const baseScene = SCENE_BASE[line.sceneId] || SCENE_BASE["scene-1"];
    const actors = cloneActors(baseScene.actors);
    let lighting = baseScene.lighting;
    let backdrop = baseScene.backdrop;
    let fx = { flicker: false, clapper: false, filmMode: false, musicNotes: false, rockMode: false, partyMode: false, bubbles: false };

    const id = line.id;

    // Ceremony Master intros on stage left spotlight
    if (line.character === "CEREMONY_MASTER") {
      actors.CEREMONY_MASTER.vis = true;
      actors.CEREMONY_MASTER.x = 240;
      actors.CEREMONY_MASTER.scale = 0.96;
      actors.CEREMONY_MASTER.pose = "mic";
      actors.CEREMONY_MASTER.propR = "mic";
    }

    // ---- SCENE 1 SPECIFIC BLOCKING ----
    if (id === 4 || id === 5) {
      // Luciana: "Director! The lights are flickering!"
      fx.flicker = true;
      actors.ASSISTANT_DIRECTOR.x = 790;
      actors.ASSISTANT_DIRECTOR.scale = 1.02;
      actors.ASSISTANT_DIRECTOR.pose = "pointUp";
      actors.ASSISTANT_DIRECTOR.expr = "worried";
      actors.LISA.pose = "pointUp";
    }
    if (id === 7) {
      actors.PROP_MASTER.propL = "suitcase";
      actors.PROP_MASTER.pose = "holdUpR";
      actors.PROP_MASTER.propR = "rock";
    }
    if (id === 8) {
      actors.DETECTIVE.pose = "stretch";
    }
    if (id === 9) {
      actors.THORWALD.pose = "flex";
      actors.THORWALD.expr = "laugh";
    }
    if (id >= 11 && id <= 15) {
      // Private warm moment between Luciana (Assistant Director) and Thorwald
      actors.ASSISTANT_DIRECTOR.x = 1380;
      actors.ASSISTANT_DIRECTOR.scale = 1.02;
      actors.THORWALD.x = 1560;
      actors.THORWALD.scale = 0.98;
      if (id === 11 || id === 12 || id === 13) {
        actors.THORWALD.expr = "sad";
        actors.THORWALD.pose = "selfHug";
        actors.ASSISTANT_DIRECTOR.expr = "worried";
        actors.ASSISTANT_DIRECTOR.pose = "openR";
      }
      if (id === 14) {
        // Luciana hand on Thorwald's shoulder
        actors.ASSISTANT_DIRECTOR.x = 1420;
        actors.ASSISTANT_DIRECTOR.pose = "reachR";
        actors.ASSISTANT_DIRECTOR.expr = "tender";
        actors.THORWALD.expr = "surprised";
      }
      if (id === 15) {
        actors.THORWALD.pose = "flex";
        actors.THORWALD.expr = "happy";
      }
    }
    if (id === 18 || id === 19) {
      actors.MAKEUP_MASTER.x = 450;
      actors.MAKEUP_MASTER.pose = "reachL";
    }
    if (id === 21 || id === 22) {
      fx.clapper = true;
      actors.CAMERA_MAN.pose = "raiseR";
    }
    if (id >= 24 && id <= 29) {
      // Film Scene 1 inside Rear Window
      fx.filmMode = true;
      lighting = "film";
      actors.JEFF.x = 580;
      actors.JEFF.scale = 0.98;
      actors.JEFF.pose = "binocs";
      actors.LISA.x = 430;
      actors.LISA.scale = 0.92;
      actors.THORWALD.x = 1480;
      actors.THORWALD.pose = "hairTouch";
      if (id === 25) actors.JEFF.pose = "point";
      if (id === 26) actors.LISA.pose = "wag";
      if (id === 27) actors.JEFF.pose = "palmsOut";
    }

    // ---- SCENE 2 SPECIFIC BLOCKING ----
    if (id === 33) fx.clapper = true;
    if (id >= 35 && id <= 42) {
      fx.filmMode = true;
      fx.musicNotes = id <= 36;
      actors.MISS_LONELYHEARTS.x = 780;
      actors.ARTIST.x = 1090;
      if (id === 36) actors.MISS_LONELYHEARTS.pose = "eyes";
      if (id === 41) {
        actors.ARTIST.propR = "clay";
        actors.ARTIST.pose = "holdUpR";
      }
      if (id === 42) actors.MISS_LONELYHEARTS.pose = "handChest";
    }
    if (id >= 50 && id <= 52) {
      actors.LISA.vis = true;
      actors.JEFF.vis = true;
    }

    // ---- SCENE 2.5 SPECIFIC BLOCKING (THE PLAYLIST PROBLEM) ----
    if (id === 54 || id === 55) {
      // Prop Master & Luciana run in holding portable speaker
      actors.PROP_MASTER.x = 830;
      actors.ASSISTANT_DIRECTOR.x = 1010;
      actors.ASSISTANT_DIRECTOR.scale = 1.02;
      actors.ASSISTANT_DIRECTOR.propR = "speaker";
      actors.ASSISTANT_DIRECTOR.pose = "speaker";
    }
    if (id === 57 || id === 58) {
      fx.musicNotes = true;
      ALL_ACTORS.forEach((c) => {
        if (c !== "DIRECTOR" && c !== "THORWALD" && actors[c].vis) actors[c].dance = true;
      });
      if (id === 58) {
        actors.DIRECTOR.pose = "ears";
        actors.DIRECTOR.expr = "grumpy";
      }
    }
    if (id === 62) {
      // Luciana: "Okay — try this one!"
      actors.ASSISTANT_DIRECTOR.x = 960;
      actors.ASSISTANT_DIRECTOR.scale = 1.04;
      actors.ASSISTANT_DIRECTOR.pose = "raiseR";
      actors.ASSISTANT_DIRECTOR.expr = "laugh";
    }
    if (id === 63 || id === 64 || id === 65) {
      // Rock trend #2 + Luciana nodding along: "Hm... this has some style. Rough, but I like the energy."
      fx.musicNotes = true;
      fx.rockMode = true;
      actors.ASSISTANT_DIRECTOR.x = 960;
      actors.ASSISTANT_DIRECTOR.scale = 1.04;
      actors.ASSISTANT_DIRECTOR.nod = true;
      actors.ASSISTANT_DIRECTOR.pose = "hips";
      actors.ASSISTANT_DIRECTOR.expr = "happy";
      ["PROP_MASTER", "DETECTIVE", "CAMERA_MAN", "LISA", "ARTIST"].forEach((c) => {
        actors[c].dance = true;
      });
    }
    if (id >= 68 && id <= 72) {
      // Crowd-favorite song #3 — everyone dances!
      fx.musicNotes = true;
      fx.partyMode = true;
      ALL_ACTORS.forEach((c) => {
        if (actors[c].vis && c !== "THORWALD") {
          actors[c].dance = true;
          actors[c].pose = "armsUp";
          actors[c].expr = "laugh";
        }
      });
      actors.ASSISTANT_DIRECTOR.scale = 1.04;
    }

    // ---- SCENE 3 SPECIFIC BLOCKING (THE VILLAIN'S FEAR) ----
    if (id >= 75 && id <= 77) {
      actors.THORWALD.x = 1040;
      actors.THORWALD.pose = "selfHug";
      actors.THORWALD.expr = "scared";
      actors.JEFF.x = 720;
    }
    if (id === 78 || id === 80) fx.clapper = true;
    if (id >= 81 && id <= 85) {
      fx.filmMode = true;
      lighting = "thriller";
      actors.JEFF.x = 640;
      actors.THORWALD.x = 1180;
      actors.THORWALD.pose = "loom";
      actors.THORWALD.expr = id >= 85 ? "scared" : "angry";
      if (id === 85) actors.THORWALD.shake = true;
    }
    if (id >= 86 && id <= 98) {
      // Everyone gathers around Thorwald on the floor; Luciana sits right beside him!
      lighting = "warm";
      actors.THORWALD.x = 980;
      actors.THORWALD.stance = "kneel";
      actors.THORWALD.expr = id < 97 ? "sad" : "happy";
      actors.DIRECTOR.x = 1140;
      actors.DIRECTOR.stance = id <= 90 ? "kneel" : "stand";
      actors.ASSISTANT_DIRECTOR.x = 830;
      actors.ASSISTANT_DIRECTOR.scale = 1.04;
      actors.ASSISTANT_DIRECTOR.stance = "floor";
      actors.ASSISTANT_DIRECTOR.pose = "reachR";
      actors.ASSISTANT_DIRECTOR.expr = "tender";
      actors.LISA.x = 690;
      actors.LISA.stance = id === 91 ? "kneel" : "stand";
      actors.CAMERA_MAN.x = 1280;
      actors.CAMERA_MAN.stance = id === 95 ? "floor" : "stand";
    }
    if (id >= 101 && id <= 103) {
      fx.filmMode = true;
      lighting = "thriller";
      actors.THORWALD.x = 1150;
      actors.THORWALD.stance = "stand";
      actors.THORWALD.pose = "loom";
      actors.THORWALD.expr = "angry";
      actors.JEFF.x = 640;
      actors.JEFF.pose = "armsUp";
      actors.JEFF.expr = "scared";
    }

    // ---- SCENE 4 SPECIFIC BLOCKING (THE RELIEF) ----
    if (id === 105) {
      fx.cheers = true;
      fx.bubbles = true;
      ALL_ACTORS.forEach((c) => {
        if (actors[c].vis && c !== "THORWALD") {
          actors[c].pose = "armsUp";
          actors[c].expr = "laugh";
          actors[c].dance = true;
        }
      });
      actors.THORWALD.pose = "wide";
      actors.THORWALD.expr = "laugh";
      actors.THORWALD.scale = 1.04;
    }
    if (id >= 105 && id <= 111) {
      fx.musicNotes = id >= 108;
      if (id >= 108) {
        actors.THORWALD.dance = true;
        actors.LISA.dance = true;
        actors.DETECTIVE.dance = true;
        actors.ASSISTANT_DIRECTOR.dance = true;
      }
    }

    // ---- SCENE 5 SPECIFIC BLOCKING (FINALE CURTAIN CALL) ----
    if (id === 119) {
      // Luciana's Finale line: "Every job matters here, big or small."
      actors.ASSISTANT_DIRECTOR.scale = 1.06;
      actors.ASSISTANT_DIRECTOR.nod = true;
      actors.ASSISTANT_DIRECTOR.pose = "wide";
      actors.ASSISTANT_DIRECTOR.expr = "happy";
    }
    if (id === 125 || id === 126 || id === 127) {
      // "Thank you all!" + Bow + Confetti/Bubbles dance
      fx.bubbles = true;
      fx.musicNotes = true;
      ALL_ACTORS.forEach((c) => {
        actors[c].vis = true;
        actors[c].pose = "wide";
        actors[c].expr = "laugh";
        if (id === 126) actors[c].bow = true;
        if (id >= 126) actors[c].dance = true;
      });
    }

    // Apply speaker's automatic expression & pose unless customized above
    const spk = line.character;
    if (actors[spk]) {
      actors[spk].vis = true;
      const inferred = inferPoseAndExpr(line, actors[spk]);
      if (id !== 14 && id !== 89 && id !== 119 && id !== 125) {
        actors[spk].pose = inferred.pose;
      }
      actors[spk].expr = inferred.expr;
    }

    return { actors, lighting, backdrop, fx };
  }

  window.STAGE_DIRECTOR = { ALL_ACTORS, getStageStateForLine };
})();
