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
    blockSeconds: { type: "number", default: 30 },       // 15 min real (900)
    checkInAtSec: { type: "number", default: 3 },        // 5 min real (300)
    defaultBreakAtSec: { type: "number", default: 12 },  // 9 min real (540)
    promptTimeoutSec: { type: "number", default: 20 },
  },

  init: function () {
    // session setup
    this.participantId = "P" + Math.floor(Math.random() * 900 + 100);
    this.order = Math.random() < 0.5 ? ["NUDGE", "NO_NUDGE"] : ["NO_NUDGE", "NUDGE"];
    this.blockIndex = 0;
    this.condition = this.order[this.blockIndex];
    this.inTransition = false;

    // wait for scene to be ready before setting up panels
    const scene = this.el.sceneEl;
    if (scene.hasLoaded) {
      this.setupPanels();
    } else {
      scene.addEventListener('loaded', () => {
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
    console.log("[StudyUI] Block 1 will run for:", this.data.blockSeconds, "seconds");
    console.log("[StudyUI] ========================================");
  },

  setupPanels: function () {
    // ui refs
    this.checkInPanel = document.querySelector("#checkInPanel");
    this.breakPromptPanel = document.querySelector("#breakPromptPanel");
    this.breakMessagePanel = document.querySelector("#breakMessagePanel");
    this.blockTransitionPanel = document.querySelector("#blockTransitionPanel");

    // get camera reference for position updates
    this.camera = document.querySelector("a-camera");
    if (!this.camera) {
      console.warn("[StudyUI] Camera not found - panels will be world-fixed");
    } else {
      console.log("[StudyUI] Camera found - panels will follow view");
    }

    // initialize block state
    this.resetBlockState();
    this.hideAllPanels();
    this.bindUiListeners();

    this.logEvent("block_start", {
      block: this.blockIndex + 1,
      condition: this.condition,
    });

    console.log("[StudyUI] Block 1 condition:", this.condition);
  },

  updatePanelPositions: function () {
    if (!this.camera) return;

    const cameraWorldPos = new THREE.Vector3();
    this.camera.object3D.getWorldPosition(cameraWorldPos);
    
    const cameraWorldQuaternion = new THREE.Quaternion();
    this.camera.object3D.getWorldQuaternion(cameraWorldQuaternion);

    // calculate position in front of camera
    const offset = new THREE.Vector3(0, -0.25, -1.45);
    offset.applyQuaternion(cameraWorldQuaternion);
    
    const panelPos = cameraWorldPos.clone().add(offset);

    // update all panels
    const panels = [
      this.checkInPanel,
      this.breakPromptPanel,
      this.breakMessagePanel,
      this.blockTransitionPanel
    ];

    panels.forEach(panel => {
      if (panel && panel.object3D) {
        // only update position if panel is visible
        if (panel.getAttribute('visible')) {
          panel.object3D.position.copy(panelPos);
          panel.object3D.quaternion.copy(cameraWorldQuaternion);
        } else {
          // move hidden panels far out of view so they can't be clicked
          panel.object3D.position.set(0, -1000, 0);
        }
      }
    });
  },

  resetBlockState: function () {
    this.blockStartMs = performance.now();
    this.checkInDone = false;
    this.checkInShown = false;
    this.breakPromptShown = false;
    this.breakPromptClosed = false;
    this.adjustedBreakAtSec = this.data.defaultBreakAtSec;
    this._ended = false;
    this.breakPromptTimer = null;
  },

  tick: function () {
    // update panel positions to follow camera every frame
    this.updatePanelPositions();

    if (this._ended || this.inTransition) return;

    const tSec = this.elapsedSec();

    if (tSec >= this.data.blockSeconds) {
      this.endBlock();
      return;
    }

    if (this.condition === "NO_NUDGE") {
      this.hideAllPanels();
      return;
    }

    //  NUDGE CONDITION ONLY BELOW THIS POINT 

    // show check-in once
    if (!this.checkInDone && !this.checkInShown && tSec >= this.data.checkInAtSec) {
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
    if (this.breakPromptPanel) this.breakPromptPanel.setAttribute("visible", false);
    if (this.breakMessagePanel) this.breakMessagePanel.setAttribute("visible", false);
    if (this.blockTransitionPanel) this.blockTransitionPanel.setAttribute("visible", false);
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
    }
  },

  showCheckIn: function () {
    this.checkInShown = true;
    this.setActivePanel("checkIn");
    this.logEvent("checkin_shown");
    console.log("[StudyUI] Check-in panel shown");
  },

  onComfort: function (rating) {
    this.checkInDone = true;
    this.setActivePanel(null);
    this.logEvent("comfort_rating", { value: rating });

    this.adjustedBreakAtSec = this.computeBreakTime(rating);
    this.logEvent("break_prompt_scheduled", { at_sec: this.adjustedBreakAtSec });
    
    console.log(`[StudyUI] Comfort rating: ${rating}`);
    console.log(`[StudyUI] Break prompt scheduled for: ${this.adjustedBreakAtSec}s`);
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

      if (this.breakPromptPanel && this.breakPromptPanel.getAttribute("visible")) {
        this.setActivePanel(null);
        this.breakPromptClosed = true;
        this.logEvent("break_prompt_ignored");
        console.log("[StudyUI] Break prompt ignored (timeout)");
      }
    }, this.data.promptTimeoutSec * 1000);
  },

  takeBreak: function () {
    this.clearBreakPromptTimer();
    this.breakPromptClosed = true;
    this.setActivePanel("breakMessage");
    this.logEvent("break_taken");
    console.log("[StudyUI] Break accepted");
  },

  declineBreak: function () {
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

    this.logEvent("block_end", {
      block: this.blockIndex + 1,
      condition: this.condition,
    });

    console.log("[StudyUI] ========================================");
    console.log(`[StudyUI] BLOCK ${this.blockIndex + 1} ENDED`);
    console.log(`[StudyUI] Condition was: ${this.condition}`);
    console.log("[StudyUI] ========================================");

    // check if there's another block
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
    console.log("[StudyUI] Next block will be:", this.order[this.blockIndex + 1]);
    console.log("[StudyUI] ========================================");
  },

  continueToNextBlock: function () {
    this.logEvent("block_transition_continue");
    
    console.log("[StudyUI] ========================================");
    console.log("[StudyUI] CONTINUING TO BLOCK 2");
    console.log("[StudyUI] ========================================");
    
    // move to next block
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

    console.log(`[StudyUI] Block 2 started`);
    console.log(`[StudyUI] Condition: ${this.condition}`);
    console.log(`[StudyUI] Block 2 will run for: ${this.data.blockSeconds} seconds`);
  },

  endSession: function () {
    this.logEvent("session_end");
    console.log("[StudyUI] ========================================");
    console.log("[StudyUI] SESSION COMPLETE!");
    console.log("[StudyUI] Both blocks finished");
    console.log("[StudyUI] ========================================");
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

    // break prompt buttons
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
    setTimeout(() => el.setAttribute("material", { ...mat, color: original }), ms);
  },

  logEvent: function (event, extra = {}) {
    console.log("[LOG]", {
      participant: this.participantId,
      block: this.blockIndex + 1,
      condition: this.condition,
      t_sec: Math.round(this.elapsedSec()),
      event,
      ...extra,
    });
  },
});