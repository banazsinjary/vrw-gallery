/***
 * Goals
 * randomize block order
 * 15 min per block
 * nudge: check in prompt at 5 min break set at 9 min - subject to change based on prompt response
 * no nudge: no set break or prompts, participants may take off heaset as a break when they wish
 ***/

/** !!!! THIS IS IN TEST MODE TIME REMEMBER TO CHANGE BACK FOR EXPERIMENT !!!! */
AFRAME.registerComponent("ui-block", {
  schema: {
    blockSeconds: { type: "number", default: 30 },       // 15 min real
    checkInAtSec: { type: "number", default: 3 },        // 5 min real
    defaultBreakAtSec: { type: "number", default: 12 },  // 9 min real
    promptTimeoutSec: { type: "number", default: 20 },
  },

  init: function () {
    // session setup
    this.participantId = "P" + Math.floor(Math.random() * 900 + 100);
    this.order = Math.random() < 0.5 ? ["NUDGE", "NO_NUDGE"] : ["NO_NUDGE", "NUDGE"];
    this.blockIndex = 0;
    this.condition = this.order[this.blockIndex];

    // state
    this.blockStartMs = performance.now();
    this.checkInDone = false;
    this.checkInShown = false;          
    this.breakPromptShown = false;
    this.breakPromptClosed = false;
    this.adjustedBreakAtSec = this.data.defaultBreakAtSec;
    this._ended = false;

    // timers
    this.breakPromptTimer = null;       

    // ui refs
    this.checkInPanel = document.querySelector("#checkInPanel");
    this.breakPromptPanel = document.querySelector("#breakPromptPanel");
    this.breakMessagePanel = document.querySelector("#breakMessagePanel");

    this.hideAllPanels();
    this.bindUiListeners();

    this.logEvent("block_start", {
      order: this.order.join("_THEN_"),
      condition: this.condition,
    });

    console.log("[StudyUI] Participant:", this.participantId);
    console.log("[StudyUI] Order:", this.order);
  },

  tick: function () {
    if (this._ended) return;

    const tSec = this.elapsedSec();

    if (tSec >= this.data.blockSeconds) {
      this.endBlock();
      return;
    }

    // If we're in NO_NUDGE, ensure nothing is visible (prevents "stuck" panels)
    if (this.condition === "NO_NUDGE") {
      this.hideAllPanels();
      return;
    }

    // Show check-in once
    if (!this.checkInDone && !this.checkInShown && tSec >= this.data.checkInAtSec) {
      this.showCheckIn();
      return;
    }

    // Only schedule/show break prompt after check-in is completed
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
    if (this.breakPromptPanel) this.breakPromptPanel.setAttribute("visible", false);
    if (this.breakMessagePanel) this.breakMessagePanel.setAttribute("visible", false);
  },

  // handles null case to hide all panels
  setActivePanel: function (panelName) {
    this.hideAllPanels();
    
    // Only show a panel if a valid name was provided
    if (panelName === "checkIn" && this.checkInPanel) {
      this.checkInPanel.setAttribute("visible", true);
    } else if (panelName === "breakPrompt" && this.breakPromptPanel) {
      this.breakPromptPanel.setAttribute("visible", true);
    } else if (panelName === "breakMessage" && this.breakMessagePanel) {
      this.breakMessagePanel.setAttribute("visible", true);
    }
    
  },

  showCheckIn: function () {
    this.checkInShown = true;                
    this.setActivePanel("checkIn");          
    this.logEvent("checkin_shown");
  },

  onComfort: function (rating) {
    this.checkInDone = true;
    this.setActivePanel(null);               // NOW WORKS: hides everything cleanly
    this.logEvent("comfort_rating", { value: rating });

    // schedule break prompt time
    this.adjustedBreakAtSec = this.computeBreakTime(rating);
    this.logEvent("break_prompt_scheduled", { at_sec: this.adjustedBreakAtSec });
  },

  computeBreakTime: function (rating) {
    const base = this.data.defaultBreakAtSec;

    // NOTE: values are seconds; fine for real study if your base is minutes converted.
    const delta = { 5: 90, 4: 45, 3: 0, 2: -45, 1: -90 };
    const t = base + (delta[rating] || 0);

    const minT = this.data.checkInAtSec + 2;              // was +20; too big for test mode
    const maxT = Math.max(minT, this.data.blockSeconds - 1);
    return Math.max(minT, Math.min(t, maxT));
  },

  showBreakPrompt: function () {
    this.breakPromptShown = true;
    this.breakPromptClosed = false;

    this.setActivePanel("breakPrompt");
    this.logEvent("break_prompt_shown");

    // FIXED: clear any prior timers, then set correct timer (ms = sec * 1000)
    this.clearBreakPromptTimer();
    this.breakPromptTimer = setTimeout(() => {
      // Check if block ended or component destroyed
      if (this._ended || !this.el) return;

      // if still visible, auto-close and mark as ignored
      if (this.breakPromptPanel && this.breakPromptPanel.getAttribute("visible")) {
        this.setActivePanel(null);
        this.breakPromptClosed = true;
        this.logEvent("break_prompt_ignored");
      }
    }, this.data.promptTimeoutSec * 1000);
  },

  takeBreak: function () {
    this.clearBreakPromptTimer();           
    this.breakPromptClosed = true;
    this.setActivePanel("breakMessage");
    this.logEvent("break_taken");
  },

  declineBreak: function () {
    this.clearBreakPromptTimer();           
    this.breakPromptClosed = true;
    this.setActivePanel(null);
    this.logEvent("break_declined");
  },

  closeBreakMessage: function () {
    this.setActivePanel(null);
    this.logEvent("break_message_closed");
  },

  bindUiListeners: function () {
    // comfort buttons 1–5
    for (let i = 1; i <= 5; i++) {
      const btn = document.querySelector(`#comfortBtn${i}`);
      if (!btn) continue;
      btn.addEventListener("click", () => {
        this.flashButton(btn, "#6B7280");
        this.onComfort(i);
      });
    }

    const yesBtn = document.querySelector("#breakYesBtn");
    if (yesBtn) yesBtn.addEventListener("click", () => {
      this.flashButton(yesBtn, "#6B7280");
      this.takeBreak();
    });

    const noBtn = document.querySelector("#breakNoBtn");
    if (noBtn) noBtn.addEventListener("click", () => {
      this.flashButton(noBtn, "#6B7280");
      this.declineBreak();
    });

    const okBtn = document.querySelector("#breakOkBtn");
    if (okBtn) okBtn.addEventListener("click", () => {
      this.flashButton(okBtn, "#374151");
      this.closeBreakMessage();
    });
  },

  flashButton: function (el, pressedColor = "#374151", ms = 300) {
    if (!el) return;
    const mat = el.getAttribute("material") || {};
    const original = mat.color || "#1F2937";
    el.setAttribute("material", { ...mat, color: pressedColor });
    setTimeout(() => el.setAttribute("material", { ...mat, color: original }), ms);
  },

  endBlock: function () {
    if (this._ended) return;
    this._ended = true;

    // clear timer before ending to prevent ghost callbacks
    this.clearBreakPromptTimer();
    this.hideAllPanels();

    this.logEvent("block_end");
    console.log("[StudyUI] Block ended");
  },

  logEvent: function (event, extra = {}) {
    console.log("[LOG]", {
      participant: this.participantId,
      condition: this.condition,
      t_sec: Math.round(this.elapsedSec()),
      event,
      ...extra,
    });
  },
});