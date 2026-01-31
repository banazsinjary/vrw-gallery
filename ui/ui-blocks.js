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
    blockSeconds: { type: "number", default: 30 }, // 15 min in real run
    checkInAtSec: { type: "number", default: 3 }, // 5 min in real run
    defaultBreakAtSec: { type: "number", default: 12 }, // 9 min in real run
    promptTimeoutSec: { type: "number", default: 20 },
  },

  init: function () {
    // session setup
    this.participantId = "P" + Math.floor(Math.random() * 900 + 100);
    this.order =
      Math.random() < 0.5 ? ["NUDGE", "NO_NUDGE"] : ["NO_NUDGE", "NUDGE"];
    this.blockIndex = 0;
    this.condition = this.order[this.blockIndex];

    // state
    this.blockStartMs = performance.now();
    this.checkInDone = false;
    this.breakPromptShown = false;
    this.breakPromptClosed = false;
    this.adjustedBreakAtSec = this.data.defaultBreakAtSec;
    this._ended = false;

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

  elapsedSec: function () {
    return (performance.now() - this.blockStartMs) / 1000;
  },

  hideAllPanels: function () {
    if (this.checkInPanel) this.checkInPanel.setAttribute("visible", false);
    if (this.breakPromptPanel)
      this.breakPromptPanel.setAttribute("visible", false);
    if (this.breakMessagePanel)
      this.breakMessagePanel.setAttribute("visible", false);
  },

  showCheckIn: function () {
    this.checkInPanel.setAttribute("visible", true);
    this.logEvent("checkin_shown");
  },

  onComfort: function (rating) {
    this.checkInDone = true;
    this.checkInPanel.setAttribute("visible", false);

    this.logEvent("comfort_rating", { value: rating });

    // schedule break prompt time
    this.adjustedBreakAtSec = this.computeBreakTime(rating);
    this.logEvent("break_prompt_scheduled", {
      at_sec: this.adjustedBreakAtSec,
    });
  },

  computeBreakTime: function (rating) {
    // base time + adjustment
    const base = this.data.defaultBreakAtSec;
    const delta = { 5: 90, 4: 45, 3: 0, 2: -45, 1: -90 };
    const t = base + (delta[rating] || 0);

    const minT = this.data.checkInAtSec + 20;
    const maxT = Math.max(minT, this.data.blockSeconds - 1);
    return Math.max(minT, Math.min(t, maxT));
  },

  showBreakPrompt: function () {
    this.breakPromptShown = true;
    this.breakPromptPanel.setAttribute("visible", true);
    this.logEvent("break_prompt_shown");

    setTimeout(() => {
      if (this._ended) return;
      if (this.breakPromptPanel.getAttribute("visible")) {
        this.breakPromptPanel.setAttribute("visible", false);
        this.breakPromptClosed = true;
        this.logEvent("break_prompt_ignored");
      }
    }, this.data.promptTimeoutSec * 1500);
  },

  takeBreak: function () {
    this.breakPromptPanel.setAttribute("visible", false);
    this.breakMessagePanel.setAttribute("visible", true);

    this.logEvent("break_taken");
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
      this.breakPromptPanel.setAttribute("visible", false);
      this.breakPromptClosed = true;
      this.logEvent("break_declined");
    });

    const okBtn = document.querySelector("#breakOkBtn");
    if (okBtn) okBtn.addEventListener("click", () => {
      this.flashButton(okBtn, "#374151");
      this.breakMessagePanel.setAttribute("visible", false);
    });

  },

  // button ui 

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
