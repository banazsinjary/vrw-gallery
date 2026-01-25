/***
 * GOALS:
 * randomize block order
 * 15 min per block
 * nudge: check in prompt at 5 min break set at 9 min - subject to change based on prompt response
 * no nudge: no set break or prompts, participants may take off heaset as a break when they wish 
 * manual break always available 
 ***/

/** !!!! THIS IS IN TEST MODE TIME REMEMBER TO CHANGE BACK FOR EXPERIMENT !!!! */
AFRAME.registerComponent("ui-block", {
  schema: {
    blockSeconds: { type: "number", default: 30 },      // 15 min
    checkInAtSec: { type: "number", default: 5 },      // 5 min
    defaultBreakAtSec: { type: "number", default: 12 }, // 9 min
    promptTimeoutSec: { type: "number", default: 6 }
  },

  init: function () {
    // session details
    this.participantId = "P" + Math.floor(Math.random() * 900 + 100);
    this.order = this.randomizeOrder();
    this.blockIndex = 0;
    this.condition = this.order[this.blockIndex];

    this.blockStartMs = performance.now();
    this.checkInDone = false;
    this.comfortRating = null;

    this.adjustedBreakAtSec = this.data.defaultBreakAtSec;
    this.breakPromptShown = false;
    this.breakPromptClosed = false;

    // ui details
    this.manualBreakBtn = document.querySelector("#manualBreakBtn");
    this.checkInPanel = document.querySelector("#checkInPanel");
    this.breakPromptPanel = document.querySelector("#breakPromptPanel");
    this.breakMessagePanel = document.querySelector("#breakMessagePanel");

    this.hideAllPanels();

    this.setupManualBreak();
    this.setupCheckInButtons();
    this.setupBreakPromptButtons();

    this.logEvent("block_start", {
      condition: this.condition,
      order: this.order.join("_THEN_")
    });

    console.log("[StudyUI] Participant:", this.participantId);
    console.log("[StudyUI] Order:", this.order);
  },

  tick: function () {
    const tSec = this.elapsedSec();

    if (tSec >= this.data.blockSeconds) {
      this.endBlock();
      return;
    }

    if (this.condition === "NO_NUDGE") return;

    if (!this.checkInDone && tSec >= this.data.checkInAtSec) {
      this.showCheckIn();
      return;
    }

    if (
      this.checkInDone &&
      !this.breakPromptShown &&
      !this.breakPromptClosed &&
      tSec >= this.adjustedBreakAtSec
    ) {
      this.showBreakPrompt();
    }
  },

  randomizeOrder: function () {
    return Math.random() < 0.5
      ? ["NUDGE", "NO_NUDGE"]
      : ["NO_NUDGE", "NUDGE"];
  },

  elapsedSec: function () {
    return (performance.now() - this.blockStartMs) / 1000;
  },

  hideAllPanels: function () {
    this.checkInPanel.setAttribute("visible", false);
    this.breakPromptPanel.setAttribute("visible", false);
    this.breakMessagePanel.setAttribute("visible", false);
  },

  showCheckIn: function () {
    this.checkInPanel.setAttribute("visible", true);
    this.logEvent("checkin_shown");
  },

  setupCheckInButtons: function () {
    for (let i = 1; i <= 5; i++) {
      const btn = document.querySelector(`#comfortBtn${i}`);
      btn.addEventListener("click", () => this.onComfort(i));
    }
  },

  onComfort: function (rating) {
    this.checkInDone = true;
    this.comfortRating = rating;
    this.checkInPanel.setAttribute("visible", false);

    this.logEvent("comfort_rating", { value: rating });

    this.adjustedBreakAtSec = this.computeBreakTime(rating);

    this.logEvent("break_prompt_scheduled", {
      adjusted_at_sec: this.adjustedBreakAtSec
    });
  },

  // adjust break times
  computeBreakTime: function (rating) {
    const base = this.data.defaultBreakAtSec;
    const delta = { 5: 90, 4: 45, 3: 0, 2: -45, 1: -90 };
    const t = base + (delta[rating] || 0);
    return Math.max(this.data.checkInAtSec + 20, Math.min(t, 870));
  },

  showBreakPrompt: function () {
    this.breakPromptShown = true;
    this.breakPromptPanel.setAttribute("visible", true);
    this.logEvent("break_prompt_shown");

    setTimeout(() => {
      if (this.breakPromptPanel.getAttribute("visible")) {
        this.breakPromptPanel.setAttribute("visible", false);
        this.breakPromptClosed = true;
        this.logEvent("break_prompt_ignored");
      }
    }, this.data.promptTimeoutSec * 1000);
  },

  setupBreakPromptButtons: function () {
    document
      .querySelector("#breakYesBtn")
      .addEventListener("click", () => this.takeBreak("prompt"));

    document
      .querySelector("#breakNoBtn")
      .addEventListener("click", () => {
        this.breakPromptPanel.setAttribute("visible", false);
        this.breakPromptClosed = true;
        this.logEvent("break_declined");
      });

    document
      .querySelector("#breakOkBtn")
      .addEventListener("click", () => {
        this.breakMessagePanel.setAttribute("visible", false);
      });
  },

  // manual break set up 
  setupManualBreak: function () {
    this.manualBreakBtn.addEventListener("click", () => {
      this.takeBreak("manual");
    });
  },

  takeBreak: function (source) {
    this.breakPromptPanel.setAttribute("visible", false);
    this.breakMessagePanel.setAttribute("visible", true);
    this.logEvent("break_taken", { source });
  },

  // ending
  endBlock: function () {
    if (this._ended) return;
    this._ended = true;
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
      ...extra
    });
  }


});