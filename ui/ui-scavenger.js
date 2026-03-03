/***
 * scavenger hunt system
 * - 20 randomized clues
 * - golden orbs appear on correct paintings
 * - persistent across blocks
 ***/

(function () {
  // global scavenger hunt state (persists across blocks)
  if (!window.__scavengerHunt) {
    window.__scavengerHunt = {
      clues: [],
      currentIndex: 0,
      foundPaintings: new Set(),
      initialized: false,
    };
  }

  const UIScavenger = {
    init({ world }) {
      if (!world) {
        console.warn("[UIScavenger] Missing world element");
        return;
      }

      this.world = world;
      this.hunt = window.__scavengerHunt;

      // initialize clues on first run
      if (!this.hunt.initialized) {
        const allClues = this.getScavengerClues();
        this.hunt.clues = this.shuffleArray(allClues);
        this.hunt.currentIndex = 0;
        this.hunt.foundPaintings = new Set();
        this.hunt.initialized = true;
        console.log("[UIScavenger] Clues shuffled and initialized");
      }

      // create ui elements
      this.createScavengerButton();
      this.createScavengerCluePanel();

      // spawn first orb
      this.updateCurrentOrb();

      // start proximity checking
      this.startProximityCheck();

      console.log(
        "[UIScavenger] Initialized - Hunt progress:",
        this.hunt.foundPaintings.size + "/20",
      );
    },

    startProximityCheck() {
      const scene = document.querySelector("a-scene");
      if (!scene) {
        console.warn("[UIScavenger] Scene not found for proximity check");
        return;
      }

      // wait for scene to be ready
      if (scene.hasLoaded) {
        this.setupProximityTick();
      } else {
        scene.addEventListener("loaded", () => {
          this.setupProximityTick();
        });
      }
    },

    setupProximityTick() {
      this.camera = document.querySelector("#rig");
      if (!this.camera) {
        console.warn("[UIScavenger] Camera not found for proximity check");
        return;
      }

      console.log("[UIScavenger] Proximity check enabled");

      // check distance on every tick
      const checkProximity = () => {
        this.checkOrbProximity();
        requestAnimationFrame(checkProximity);
      };

      checkProximity();
    },

    checkOrbProximity() {
      if (!this.currentOrb || !this.currentOrbPainting || !this.camera) return;

      // get positions
      const cameraPos = new THREE.Vector3();
      this.camera.object3D.getWorldPosition(cameraPos);

      const paintingPos = new THREE.Vector3();
      this.currentOrbPainting.object3D.getWorldPosition(paintingPos);

      // calculate distance
      const distance = cameraPos.distanceTo(paintingPos);

      // show orb if within 20 meters, hide if further
      const showDistance = 20.0;
      const isVisible = distance <= showDistance;

      this.currentOrb.setAttribute("visible", isVisible);
    },

    getScavengerClues() {
      return [
        {
          id: "rena_da_vinci_monalisa",
          clue: "Find the portrait with the world's most scrutinized smile.",
        },
        {
          id: "rena_da_vinci_ladyermine",
          clue: "Seek the Renaissance woman cradling a white ermine.",
        },
        {
          id: "bar_vandyke_cherubs",
          clue: "Locate the celestial beings bathed in Baroque chiaroscuro.",
        },
        {
          id: "bar_vandyke_family",
          clue: "Find the aristocratic family portrait displaying wealth and status through fabric and pose.",
        },
        {
          id: "bar_vandyke_head_woman",
          clue: "Seek the intimate portrait study that captures psychological depth in a single face.",
        },
        {
          id: "pre_waterhouse_shalott",
          clue: "Find the cursed woman adrift in a boat, three candles marking her fate.",
        },
        {
          id: "pre_waterhouse_miranda",
          clue: "Locate the figure witnessing a tempest from the safety of shore.",
        },
        {
          id: "pre_waterhouse_souloftherose",
          clue: "Find the woman inhaling deeply from a garden bloom.",
        },
        {
          id: "acad_leighton_accolade",
          clue: "Seek the ceremonial moment when blade touches shoulder in medieval ritual.",
        },
        {
          id: "roco_fragonard_swing",
          clue: "Find the flirtatious scene where physics and desire intersect on a garden swing.",
        },
        {
          id: "imp_monet_parasol",
          clue: "Locate the wind-swept figure shielding herself from sun on a hilltop.",
        },
        {
          id: "imp_monet_lilies",
          clue: "Find the aquatic garden where water and sky blur into abstraction.",
        },
        {
          id: "imp_renoir_layole",
          clue: "Seek the small boat gliding across sun-dappled water.",
        },
        {
          id: "imp_renoir_promenade",
          clue: "Find the couple strolling beneath a canopy of light-filtered foliage.",
        },
        {
          id: "cont_rain_red_dress",
          clue: "Locate the figure whose crimson garment commands the entire canvas.",
        },
        {
          id: "cont_basquiat_pez",
          clue: "Find the childhood candy container reimagined as cultural critique.",
        },
        {
          id: "cont_basquiat_untitled",
          clue: "Seek the skull-like visage surrounded by symbols, text, and gestural marks.",
        },
        {
          id: "postimp_redon_cyclops",
          clue: "Find the mythological giant whose single eye watches over a vulnerable sleeper.",
        },
        {
          id: "postimp_redon_reflection",
          clue: "Locate the ethereal composition built from color rather than form.",
        },
        {
          id: "bobross_cedar_park",
          clue: "Find the landscape completed in a single session using the wet-on-wet technique.",
        },
      ];
    },

    shuffleArray(array) {
      // fisher-yates shuffle
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },

    getCurrentClue() {
      if (this.hunt.currentIndex >= this.hunt.clues.length) {
        return null; // hunt complete
      }
      return this.hunt.clues[this.hunt.currentIndex];
    },

    createScavengerButton() {
      const button = document.createElement("a-entity");
      button.setAttribute("id", "scavengerButton");
      button.setAttribute("position", "0.38 0.12 -2.0"); // directly under gallery button
      button.classList.add("clickable");

      // background - same color as gallery button
      const bg = document.createElement("a-plane");
      bg.setAttribute("width", 0.35);
      bg.setAttribute("height", 0.1);
      bg.setAttribute(
        "material",
        "color:#374151; opacity:0.75; transparent:true;",
      ); // matching gallery button
      bg.classList.add("clickable");
      button.appendChild(bg);

      // text
      const text = document.createElement("a-text");
      text.setAttribute("id", "scavengerButtonText");
      text.setAttribute("value", "🔍 Hunt: 0/20");
      text.setAttribute("align", "center");
      text.setAttribute("anchor", "center");
      text.setAttribute("baseline", "center");
      text.setAttribute("width", 0.7); // matching gallery button text size
      text.setAttribute("color", "#FFFFFF");
      text.setAttribute("position", "0 0 0.01");
      button.appendChild(text);

      // click handler
      button.addEventListener("click", () => {
        this.toggleCluePanel();
        if (window.UITasks) {
          window.UITasks.playClickSound();
        }
      });

      // attach to camera
      const camera = document.querySelector("a-camera");
      if (camera) {
        camera.appendChild(button);
      }

      this.scavengerButton = button;
      this.updateButtonText();
      console.log("[UIScavenger] Button created");
    },

    updateButtonText() {
      const text = document.getElementById("scavengerButtonText");
      if (text) {
        const progress = this.hunt.foundPaintings.size;
        text.setAttribute("value", `🔍 Hunt: ${progress}/20`);
      }
    },

    createScavengerCluePanel() {
      const panel = document.createElement("a-entity");
      panel.setAttribute("id", "scavengerCluePanel");
      panel.setAttribute("position", "0 -0.1 -1.5");
      panel.setAttribute("visible", false);

      // background
      const bg = document.createElement("a-plane");
      bg.setAttribute("width", 1.4);
      bg.setAttribute("height", 1.2);
      bg.setAttribute(
        "material",
        "color:#FFFFFF; opacity:0.95; transparent:true;",
      );
      panel.appendChild(bg);

      // border
      const border = document.createElement("a-plane");
      border.setAttribute("width", 1.44);
      border.setAttribute("height", 1.24);
      border.setAttribute("position", "0 0 -0.005");
      border.setAttribute(
        "material",
        "color:#111111; opacity:0.2; transparent:true;",
      );
      panel.appendChild(border);

      // title
      const title = document.createElement("a-text");
      title.setAttribute("value", "Scavenger Hunt");
      title.setAttribute("position", "-0.65 0.52 0.01");
      title.setAttribute("width", 1.2);
      title.setAttribute("color", "#111111");
      title.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Roboto-msdf.json",
      );
      panel.appendChild(title);

      // progress text
      const progress = document.createElement("a-text");
      progress.setAttribute("id", "scavengerProgress");
      progress.setAttribute("value", "Progress: 0/20");
      progress.setAttribute("position", "-0.65 0.42 0.01");
      progress.setAttribute("width", 0.9);
      progress.setAttribute("color", "#6B7280");
      progress.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Roboto-msdf.json",
      );
      panel.appendChild(progress);

      // current clue text
      const clueText = document.createElement("a-text");
      clueText.setAttribute("id", "scavengerClueText");
      clueText.setAttribute("value", "Loading clue...");
      clueText.setAttribute("position", "-0.65 0.25 0.01");
      clueText.setAttribute("width", 1.3);
      clueText.setAttribute("color", "#111111");
      clueText.setAttribute("wrap-count", 45);
      clueText.setAttribute("line-height", 50);
      clueText.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Roboto-msdf.json",
      );
      panel.appendChild(clueText);

      // hint text
      const hint = document.createElement("a-text");
      hint.setAttribute(
        "value",
        "Look for a golden orb on the correct painting!",
      );
      hint.setAttribute("position", "-0.65 -0.25 0.01");
      hint.setAttribute("width", 1.0);
      hint.setAttribute("color", "#F59E0B");
      hint.setAttribute("wrap-count", 50);
      hint.setAttribute("font", "https://cdn.aframe.io/fonts/Roboto-msdf.json");
      panel.appendChild(hint);

      // close button
      const closeBtn = document.createElement("a-entity");
      closeBtn.setAttribute("position", "0.62 0.52 0.01");
      closeBtn.classList.add("clickable");

      const closeBg = document.createElement("a-circle");
      closeBg.setAttribute("radius", 0.05);
      closeBg.setAttribute(
        "material",
        "color:#EF4444; opacity:0.8; transparent:true;",
      );
      closeBg.classList.add("clickable");
      closeBtn.appendChild(closeBg);

      const closeX = document.createElement("a-text");
      closeX.setAttribute("value", "✕");
      closeX.setAttribute("align", "center");
      closeX.setAttribute("anchor", "center");
      closeX.setAttribute("baseline", "center");
      closeX.setAttribute("width", 0.3);
      closeX.setAttribute("color", "#FFFFFF");
      closeX.setAttribute("position", "0 0 0.01");
      closeBtn.appendChild(closeX);

      closeBtn.addEventListener("click", () => {
        this.toggleCluePanel();
        if (window.UITasks) {
          window.UITasks.playClickSound();
        }
      });

      panel.appendChild(closeBtn);

      // attach to camera
      const camera = document.querySelector("a-camera");
      if (camera) {
        camera.appendChild(panel);
      }

      this.cluePanel = panel;
      console.log("[UIScavenger] Clue panel created");
    },

    toggleCluePanel() {
      const isVisible = this.cluePanel.getAttribute("visible");
      this.cluePanel.setAttribute("visible", !isVisible);

      if (!isVisible) {
        this.updateCluePanel();
      }
    },

    updateCluePanel() {
      const currentClue = this.getCurrentClue();
      const progressText = document.getElementById("scavengerProgress");
      const clueText = document.getElementById("scavengerClueText");

      if (progressText) {
        progressText.setAttribute(
          "value",
          `Progress: ${this.hunt.foundPaintings.size}/20`,
        );
      }

      if (clueText) {
        if (currentClue) {
          clueText.setAttribute(
            "value",
            `Current Clue:\n\n${currentClue.clue}`,
          );
        } else {
          clueText.setAttribute(
            "value",
            "🎉 Congratulations!\n\nYou found all 20 paintings!",
          );
        }
      }
    },

    updateCurrentOrb() {
      // remove any existing orb
      if (this.currentOrb && this.currentOrb.parentNode) {
        this.currentOrb.parentNode.removeChild(this.currentOrb);
        this.currentOrb = null;
      }

      const currentClue = this.getCurrentClue();
      if (!currentClue) {
        console.log("[UIScavenger] Hunt complete! No more orbs to spawn.");
        return;
      }

      // find the painting
      const painting = document.querySelector(
        `[data-art-id="${currentClue.id}"]`,
      );
      if (!painting) {
        console.warn(
          `[UIScavenger] Could not find painting: ${currentClue.id}`,
        );
        return;
      }

      // create golden orb
      const orb = document.createElement("a-sphere");
      orb.setAttribute("radius", 0.15);
      orb.setAttribute("position", "0 0 0.3");
      orb.setAttribute(
        "material",
        "color:#FFD700; metalness:0.8; roughness:0.2; emissive:#FFD700; emissiveIntensity:0.5;",
      );
      orb.setAttribute("visible", false); // start hidden
      orb.classList.add("clickable");
      orb.classList.add("scavenger-orb");

      // pulsing animation
      orb.setAttribute(
        "animation",
        "property: scale; to: 1.2 1.2 1.2; dur: 1000; loop: true; dir: alternate; easing: easeInOutQuad",
      );

      // click handler
      orb.addEventListener("click", (e) => {
        e.stopPropagation();
        this.collectOrb(currentClue.id);
      });

      painting.appendChild(orb);
      this.currentOrb = orb;
      this.currentOrbPainting = painting;

      console.log(`[UIScavenger] Golden orb spawned on: ${currentClue.id}`);
    },

    collectOrb(paintingId) {
      // mark as found
      this.hunt.foundPaintings.add(paintingId);
      this.hunt.currentIndex++;

      console.log(
        `[UIScavenger] Collected orb! Progress: ${this.hunt.foundPaintings.size}/20`,
      );

      // log event
      if (window.vrwLog) {
        window.vrwLog("scavenger_found", {
          painting_id: paintingId,
          progress: this.hunt.foundPaintings.size,
          total: 20,
        });
      }

      // play sound
      if (window.UITasks) {
        window.UITasks.playClickSound();
      }

      // update ui
      this.updateButtonText();
      this.updateCluePanel();

      // spawn next orb
      this.updateCurrentOrb();

      // show completion message if done
      if (this.hunt.foundPaintings.size >= 20) {
        console.log("[UIScavenger] 🎉 Hunt complete!");
      }
    },
  };

  window.UIScavenger = UIScavenger;
})();
