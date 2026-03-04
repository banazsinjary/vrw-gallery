/***
 * Goals
 * randomize block order
 * 15 min per block
 * nudge: check in prompt at 5 min break set at 9 min - subject to change based on prompt response
 * no nudge: no set break or prompts, participants may take off heaset as a break when they wish
 ***/

// false = actual session, true = test
const DEBUG_MODE = true;
// false = actual session, true = test
const DEV_MODE = true;

AFRAME.registerComponent("ui-block", {
  schema: {
    blockSeconds: { type: "number", default: DEBUG_MODE ? 60 : 900 },
    checkInAtSec: { type: "number", default: DEBUG_MODE ? 10 : 300 },
    defaultBreakAtSec: { type: "number", default: DEBUG_MODE ? 15 : 540 },
    promptTimeoutSec: { type: "number", default: 20 },
  },

  init: function () {
    // session setup
    this.participantId = "P" + Math.floor(Math.random() * 900 + 100);
    this.order =
      Math.random() < 0.5 ? ["NUDGE", "NO_NUDGE"] : ["NO_NUDGE", "NUDGE"];
    this.blockIndex = 0;
    this.condition = this.order[this.blockIndex];
    this.inTransition = false;
    this._setupDone = false;

    // wait for scene to be ready before setting up panels
    const scene = this.el.sceneEl;
    if (scene.hasLoaded) {
      this.setupPanels();
    } else {
      scene.addEventListener("loaded", () => {
        this.setupPanels();
      });
    }

    this.logEvent("session_start", {
      order: this.order.join("_THEN_"),
    });

    console.log("[StudyUI] ========================================");
    console.log("[StudyUI] SESSION STARTED");
    console.log("[StudyUI] Participant:", this.participantId);
    console.log("[StudyUI] Order:", this.order.join(" → "));
    console.log("[StudyUI] Block 1 condition:", this.condition);
    console.log(
      "[StudyUI] Block 1 will run for:",
      this.data.blockSeconds,
      "seconds",
    );
    console.log("[StudyUI] ========================================");
  },

  setupPanels: function () {
    if (this._setupDone) return;
    this._setupDone = true;
    // ui refs
    this.checkInPanel = document.querySelector("#checkInPanel");
    this.breakPromptPanel = document.querySelector("#breakPromptPanel");
    this.breakMessagePanel = document.querySelector("#breakMessagePanel");
    this.blockTransitionPanel = document.querySelector("#blockTransitionPanel");
    this.thankYouPanel = document.querySelector("#thankYouPanel");

    // get camera reference for position updates
    this.camera = document.querySelector("a-camera");
    if (!this.camera) {
      console.warn("[StudyUI] Camera not found - panels will be world-fixed");
    } else {
      console.log("[StudyUI] Camera found - panels will follow view");
    }

    // Create and show start panel
    this.createStartPanel();

    // Don't initialize block state yet - wait for start button
    this.hideAllPanels();
    this.bindUiListeners();

    console.log("[StudyUI] Waiting for participant to start Block 1");
  },

  createStartPanel: function () {
    const panel = document.createElement("a-entity");
    panel.setAttribute("id", "startPanel");
    panel.setAttribute("position", "0 -0.1 -2.8");

    const shadow = document.createElement("a-plane");
    shadow.setAttribute("width", 2.2);
    shadow.setAttribute("height", 0.75);
    shadow.setAttribute("position", "0 -0.025 -0.01");
    shadow.setAttribute(
      "material",
      "color:#000; opacity:0.15; transparent:true;",
    );
    panel.appendChild(shadow);

    const bg1 = document.createElement("a-plane");
    bg1.setAttribute("width", 2.14);
    bg1.setAttribute("height", 0.69);
    bg1.setAttribute("position", "0 0 -0.005");
    bg1.setAttribute(
      "material",
      "color:#FFFFFF; opacity:0.4; transparent:true;",
    );
    panel.appendChild(bg1);

    const bg2 = document.createElement("a-plane");
    bg2.setAttribute("width", 2.08);
    bg2.setAttribute("height", 0.63);
    bg2.setAttribute("position", "0 0 0");
    bg2.setAttribute(
      "material",
      "color:#F5F1E8; opacity:0.35; transparent:true;",
    );
    panel.appendChild(bg2);

    const title = document.createElement("a-text");
    title.setAttribute("value", "VR Art Gallery Study");
    title.setAttribute("position", "-0.95 0.19 0.01");
    title.setAttribute("width", 2.0);
    title.setAttribute("color", "#111111");
    title.setAttribute("font", "https://cdn.aframe.io/fonts/Roboto-msdf.json");
    panel.appendChild(title);

    const instructions = document.createElement("a-text");
    instructions.setAttribute(
      "value",
      "When ready, press the button to begin.",
    );
    instructions.setAttribute("position", "-0.95 0.05 0.01");
    instructions.setAttribute("width", 2.0);
    instructions.setAttribute("color", "#6B7280");
    instructions.setAttribute(
      "font",
      "https://cdn.aframe.io/fonts/Roboto-msdf.json",
    );
    panel.appendChild(instructions);

    const startBtn = document.createElement("a-entity");
    startBtn.setAttribute("position", "0 -0.18 0.02");
    startBtn.classList.add("clickable");

    const btnBg = document.createElement("a-plane");
    btnBg.setAttribute("width", 1.1);
    btnBg.setAttribute("height", 0.25);
    btnBg.setAttribute(
      "material",
      "color:#FFFFFF; opacity:0.75; transparent:true;",
    );
    btnBg.classList.add("clickable");
    startBtn.appendChild(btnBg);

    const btnText = document.createElement("a-text");
    btnText.setAttribute("value", "Start Block 1");
    btnText.setAttribute("align", "center");
    btnText.setAttribute("anchor", "center");
    btnText.setAttribute("baseline", "center");
    btnText.setAttribute("width", 1.6);
    btnText.setAttribute("color", "#111");
    btnText.setAttribute(
      "font",
      "https://cdn.aframe.io/fonts/Roboto-msdf.json",
    );
    btnText.setAttribute("position", "0 0 0.01");
    startBtn.appendChild(btnText);

    startBtn.addEventListener("click", () => {
      this.flashButton(btnBg, "#6B7280");
      setTimeout(() => {
        panel.setAttribute("visible", false);
        this.startBlock1();
      }, 300);
    });

    panel.appendChild(startBtn);

    if (this.camera) {
      this.camera.appendChild(panel);
    }

    this.startPanel = panel;
    console.log("[StudyUI] Start panel created");
  },

  startBlock1: function () {
    // Initialize block state
    this.resetBlockState();
    this.hideAllPanels();

    this.logEvent("block_start", {
      block: this.blockIndex + 1,
      condition: this.condition,
    });

    console.log(
      `[StudyUI] Block ${this.blockIndex + 1} started by participant`,
    );
    console.log(
      `[StudyUI] Block ${this.blockIndex + 1} condition:`,
      this.condition,
    );
  },

  resetBlockState: function () {
    this.blockStartMs = performance.now();
    this.blockWallStart = Date.now();
    this.checkInDone = false;
    this.checkInShown = false;
    this.breakPromptShown = false;
    this.breakPromptClosed = false;
    this.adjustedBreakAtSec = this.data.defaultBreakAtSec;
    this._ended = false;
    this.breakPromptTimer = null;
    this.firstInteractionMs = null;
  },

  recordFirstInteraction: function () {
    if (this.firstInteractionMs !== null) return;
    this.firstInteractionMs = performance.now();
    const t = Math.round((this.firstInteractionMs - this.blockStartMs) / 1000);
    this.logEvent("first_interaction", { t_sec_into_block: t });
  },

  tick: function () {
    if (this._ended || this.inTransition) return;

    const tSec = this.elapsedSec();

    if (tSec >= this.data.blockSeconds) {
      this.endBlock();
      return;
    }

    if (this.condition === "NO_NUDGE") {
      return;
    }

    // === NUDGE CONDITION ONLY BELOW THIS POINT ===

    // show check-in once
    if (
      !this.checkInDone &&
      !this.checkInShown &&
      tSec >= this.data.checkInAtSec
    ) {
      this.showCheckIn();
      return;
    }

    // only schedule/show break prompt after check-in is completed
    if (
      this.checkInDone &&
      !this.breakPromptShown &&
      !this.breakPromptClosed &&
      tSec >= this.adjustedBreakAtSec
    ) {
      this.showBreakPrompt();
      return;
    }
  },

  elapsedSec: function () {
    return (performance.now() - this.blockStartMs) / 1000;
  },

  clearBreakPromptTimer: function () {
    if (this.breakPromptTimer) {
      clearTimeout(this.breakPromptTimer);
      this.breakPromptTimer = null;
      console.log("[StudyUI] Break prompt timer cleared");
    }
  },

  hideAllPanels: function () {
    if (this.checkInPanel) this.checkInPanel.setAttribute("visible", false);
    if (this.breakPromptPanel)
      this.breakPromptPanel.setAttribute("visible", false);
    if (this.breakMessagePanel)
      this.breakMessagePanel.setAttribute("visible", false);
    if (this.blockTransitionPanel)
      this.blockTransitionPanel.setAttribute("visible", false);
    if (this.thankYouPanel) this.thankYouPanel.setAttribute("visible", false);
  },

  setActivePanel: function (panelName) {
    this.hideAllPanels();
    if (panelName === "checkIn" && this.checkInPanel) {
      this.checkInPanel.setAttribute("visible", true);
    } else if (panelName === "breakPrompt" && this.breakPromptPanel) {
      this.breakPromptPanel.setAttribute("visible", true);
    } else if (panelName === "breakMessage" && this.breakMessagePanel) {
      this.breakMessagePanel.setAttribute("visible", true);
    } else if (panelName === "blockTransition" && this.blockTransitionPanel) {
      this.blockTransitionPanel.setAttribute("visible", true);
    } else if (panelName === "thankYou" && this.thankYouPanel) {
      this.thankYouPanel.setAttribute("visible", true);
    }
  },

  showCheckIn: function () {
    this.checkInShown = true;
    this.setActivePanel("checkIn");
    this.logEvent("checkin_shown");
    console.log("[StudyUI] Check-in panel shown");
  },

  onComfort: function (rating) {
    this.recordFirstInteraction();
    this.checkInDone = true;
    this.setActivePanel(null);

    this.adjustedBreakAtSec = this.computeBreakTime(rating);
    const adjustment = this.adjustedBreakAtSec - this.data.defaultBreakAtSec;

    this.logEvent("comfort_rating", {
      value: rating,
      break_adjustment_sec: adjustment,
      direction:
        adjustment > 0 ? "later" : adjustment < 0 ? "earlier" : "unchanged",
      break_scheduled_at_sec: this.adjustedBreakAtSec,
    });

    console.log(`[StudyUI] Comfort rating: ${rating}`);
    console.log(
      `[StudyUI] Break adjustment: ${adjustment > 0 ? "+" : ""}${adjustment}s`,
    );
    console.log(
      `[StudyUI] Break prompt scheduled for: ${this.adjustedBreakAtSec}s`,
    );
  },

  computeBreakTime: function (rating) {
    const base = this.data.defaultBreakAtSec;
    const delta = { 5: 90, 4: 45, 3: 0, 2: -45, 1: -90 };
    const t = base + (delta[rating] || 0);
    const minT = this.data.checkInAtSec + 2;
    const maxT = Math.max(minT, this.data.blockSeconds - 1);
    return Math.max(minT, Math.min(t, maxT));
  },

  showBreakPrompt: function () {
    this.breakPromptShown = true;
    this.breakPromptClosed = false;
    this.setActivePanel("breakPrompt");
    this.logEvent("break_prompt_shown");
    console.log("[StudyUI] Break prompt shown");

    this.clearBreakPromptTimer();
    this.breakPromptTimer = setTimeout(() => {
      if (this._ended || !this.el) return;
      if (
        this.breakPromptPanel &&
        this.breakPromptPanel.getAttribute("visible")
      ) {
        this.setActivePanel(null);
        this.breakPromptClosed = true;
        this.logEvent("break_prompt_ignored");
        console.log("[StudyUI] Break prompt ignored (timeout)");
      }
    }, this.data.promptTimeoutSec * 1000);
  },

  takeBreak: function () {
    this.recordFirstInteraction();
    this.clearBreakPromptTimer();
    this.breakPromptClosed = true;
    this.setActivePanel("breakMessage");
    this.logEvent("break_taken");
    console.log("[StudyUI] Break accepted");
  },

  declineBreak: function () {
    this.recordFirstInteraction();
    this.clearBreakPromptTimer();
    this.breakPromptClosed = true;
    this.setActivePanel(null);
    this.logEvent("break_declined");
    console.log("[StudyUI] Break declined");
  },

  closeBreakMessage: function () {
    this.setActivePanel(null);
    this.logEvent("break_message_closed");
    console.log("[StudyUI] Break message closed");
  },

  endBlock: function () {
    if (this._ended) return;
    this._ended = true;

    this.clearBreakPromptTimer();
    this.hideAllPanels();

    const orbsFound = window.__scavengerHunt
      ? window.__scavengerHunt.foundPaintings.size
      : 0;
    const actualDurationSec = Math.round(this.elapsedSec());
    const wallDurationSec = Math.round(
      (Date.now() - this.blockWallStart) / 1000,
    );

    this.logEvent("block_end", {
      block: this.blockIndex + 1,
      condition: this.condition,
      actual_duration_sec: actualDurationSec,
      wall_duration_sec: wallDurationSec,
      orbs_found_total: orbsFound,
    });

    console.log("[StudyUI] ========================================");
    console.log(`[StudyUI] BLOCK ${this.blockIndex + 1} ENDED`);
    console.log(`[StudyUI] Condition was: ${this.condition}`);
    console.log(`[StudyUI] Orbs found so far: ${orbsFound}`);
    console.log("[StudyUI] ========================================");

    if (this.blockIndex < this.order.length - 1) {
      this.showBlockTransition();
    } else {
      this.endSession();
    }
  },

  showBlockTransition: function () {
    this.inTransition = true;
    this.setActivePanel("blockTransition");
    this.logEvent("block_transition_shown");

    console.log("[StudyUI] ========================================");
    console.log("[StudyUI] BLOCK TRANSITION");
    console.log("[StudyUI] Waiting for participant to complete survey");
    console.log(
      "[StudyUI] Next block will be:",
      this.order[this.blockIndex + 1],
    );
    console.log("[StudyUI] ========================================");
  },

  continueToNextBlock: function () {
    this.logEvent("block_transition_continue");

    // move to next block FIRST
    this.blockIndex++;
    this.condition = this.order[this.blockIndex];
    this.inTransition = false;

    // reset all block state for new block
    this.resetBlockState();
    this.hideAllPanels();

    this.logEvent("block_start", {
      block: this.blockIndex + 1,
      condition: this.condition,
    });

    // THEN log with correct values
    console.log("[StudyUI] ========================================");
    console.log(`[StudyUI] CONTINUING TO BLOCK ${this.blockIndex + 1}`);
    console.log(`[StudyUI] Block ${this.blockIndex + 1} started`);
    console.log(`[StudyUI] Condition: ${this.condition}`);
    console.log(`[StudyUI] Will run for: ${this.data.blockSeconds} seconds`);
    console.log("[StudyUI] ========================================");
  },

  endSession: function () {
    const orbsFound = window.__scavengerHunt
      ? window.__scavengerHunt.foundPaintings.size
      : 0;
    this.setActivePanel("thankYou");
    this.logEvent("session_end", {
      total_orbs_found: orbsFound,
    });

    console.log("[StudyUI] ========================================");
    console.log("[StudyUI] SESSION COMPLETE!");
    console.log("[StudyUI] Both blocks finished");
    console.log(`[StudyUI] Total orbs found: ${orbsFound}`);
    console.log("[StudyUI] Thank you panel displayed");
    console.log("[StudyUI] ========================================");
  },

  bindUiListeners: function () {
    for (let i = 1; i <= 5; i++) {
      const btn = document.querySelector(`#comfortBtn${i}`);
      if (!btn) continue;
      btn.addEventListener("click", () => {
        this.flashButton(btn, "#6B7280");
        this.onComfort(i);
      });
    }

    const yesBtn = document.querySelector("#breakYesBtn");
    if (yesBtn)
      yesBtn.addEventListener("click", () => {
        this.flashButton(yesBtn, "#6B7280");
        this.takeBreak();
      });

    const noBtn = document.querySelector("#breakNoBtn");
    if (noBtn)
      noBtn.addEventListener("click", () => {
        this.flashButton(noBtn, "#6B7280");
        this.declineBreak();
      });

    const okBtn = document.querySelector("#breakOkBtn");
    if (okBtn)
      okBtn.addEventListener("click", () => {
        this.flashButton(okBtn, "#374151");
        this.closeBreakMessage();
      });

    // block transition button
    const continueBtn = document.querySelector("#continueBlockBtn");
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        this.flashButton(continueBtn, "#6B7280");
        this.continueToNextBlock();
      });
      console.log("[StudyUI] Continue button listener bound successfully");
    } else {
      console.warn("[StudyUI] Continue button not found!");
    }
  },

  flashButton: function (el, pressedColor = "#374151", ms = 300) {
    if (!el) return;
    const mat = el.getAttribute("material") || {};
    const original = mat.color || "#FFFFFF";
    el.setAttribute("material", { ...mat, color: pressedColor });
    setTimeout(
      () => el.setAttribute("material", { ...mat, color: original }),
      ms,
    );
  },

  logEvent: function (event, extra = {}) {
    const payload = {
      participant: this.participantId,
      block: this.blockIndex + 1,
      condition: this.condition,
      t_sec: Math.round(this.elapsedSec()),
      event,
      extra,
    };

    console.log("[LOG]", payload);

    if (DEV_MODE) return;

    fetch(
      "https://script.google.com/macros/s/AKfycbx3XEIMHlsel1Xf-Om09ToUGWdLpKgSbN1qtkKpHAPU_cqSoSocu9i3lwcyosvlXLeV/exec",
      {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    ).catch((err) => console.warn("[LOG] Failed to send:", err));
  },
});
