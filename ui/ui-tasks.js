/***
 * Goals
 * - Like/Unlike paintings
 * - My Gallery panel
 * - Tagging system (coming soon)
 ***/

(function () {
  // paintings stay liked through blocks
  if (!window.__likedPaintings) {
    window.__likedPaintings = new Set();
  }

  const UITasks = {
    init({ world }) {
      if (!world) {
        console.warn("[UITasks] Missing world element");
        return;
      }

      this.world = world;
      this.likedPaintings = window.__likedPaintings;

      // Create UI elements
      this.createGalleryMenuButton(); // Small button in corner
      this.createMyGalleryPanel(); // Full panel (hidden by default)

      // Load click sound
      this.loadClickSound();

      console.log("[UITasks] Initialized");
    },

    loadClickSound() {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    },

    playClickSound() {
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.1,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    },

    createGalleryMenuButton() {
      const button = document.createElement("a-entity");
      button.setAttribute("id", "galleryMenuButton");
      button.setAttribute("position", "0.95 0.68 -1.5"); 
      button.classList.add("clickable");

      const bg = document.createElement("a-plane");
      bg.setAttribute("width", 0.35);
      bg.setAttribute("height", 0.1);
      bg.setAttribute(
        "material",
        "color:#374151; opacity:0.75; transparent:true;",
      );
      bg.classList.add("clickable");
      button.appendChild(bg);

      const label = document.createElement("a-text");
      label.setAttribute("value", "My Gallery");
      label.setAttribute("align", "center");
      label.setAttribute("anchor", "center");
      label.setAttribute("baseline", "center");
      label.setAttribute("width", 0.7);
      label.setAttribute("color", "#FFFFFF");
      label.setAttribute("position", "0 0 0.01");
      button.appendChild(label);

      button.addEventListener("click", () => {
        this.toggleMyGalleryPanel();
        this.playClickSound();
      });

      const camera = document.querySelector("a-camera");
      if (camera) {
        camera.appendChild(button);
      } else {
        console.warn("[UITasks] Camera not found for gallery button");
      }

      console.log("[UITasks] Gallery menu button created");
    },

    createLikeCounter() {
      const counter = document.createElement("a-entity");
      counter.setAttribute("id", "likeCounter");
      counter.setAttribute("position", "-0.65 0.48 -1.5");

      const bg = document.createElement("a-plane");
      bg.setAttribute("width", 0.35);
      bg.setAttribute("height", 0.12);
      bg.setAttribute(
        "material",
        "color:#1F2937; opacity:0.85; transparent:true;",
      );
      counter.appendChild(bg);

      const text = document.createElement("a-text");
      text.setAttribute("id", "likeCounterText");
      text.setAttribute("value", "❤ 0/38");
      text.setAttribute("align", "center");
      text.setAttribute("anchor", "center");
      text.setAttribute("baseline", "center");
      text.setAttribute("width", 0.6);
      text.setAttribute("color", "#FFFFFF");
      text.setAttribute("position", "0 0 0.01");
      counter.appendChild(text);

      const camera = document.querySelector("a-camera");
      if (camera) {
        camera.appendChild(counter);
      }

      this.likeCounterText = text;
      console.log("[UITasks] Like counter created");
    },

    updateLikeCounter() {
      if (this.likeCounterText) {
        this.likeCounterText.setAttribute(
          "value",
          `❤ ${this.likedPaintings.size}/38`,
        );
      }
    },

    createMyGalleryButton() {
      const button = document.createElement("a-entity");
      button.setAttribute("id", "myGalleryButton");
      button.setAttribute("position", "0.50 0.48 -1.5");
      button.classList.add("clickable");

      const bg = document.createElement("a-plane");
      bg.setAttribute("width", 0.45);
      bg.setAttribute("height", 0.12);
      bg.setAttribute(
        "material",
        "color:#374151; opacity:0.85; transparent:true;",
      );
      bg.classList.add("clickable");
      button.appendChild(bg);

      const text = document.createElement("a-text");
      text.setAttribute("value", "My Gallery");
      text.setAttribute("align", "center");
      text.setAttribute("anchor", "center");
      text.setAttribute("baseline", "center");
      text.setAttribute("width", 0.7);
      text.setAttribute("color", "#FFFFFF");
      text.setAttribute("position", "0 0 0.01");
      button.appendChild(text);

      
      button.addEventListener("click", () => {
        this.toggleMyGalleryPanel();
        this.playClickSound();
      });

      const camera = document.querySelector("a-camera");
      if (camera) {
        camera.appendChild(button);
      }

      console.log("[UITasks] My Gallery button created");
    },

    createMyGalleryPanel() {
      const panel = document.createElement("a-entity");
      panel.setAttribute("id", "myGalleryPanel");
      panel.setAttribute("position", "0 -0.1 -1.5");
      panel.setAttribute("visible", false);

      // background
      const bg = document.createElement("a-plane");
      bg.setAttribute("width", 1.4);
      bg.setAttribute("height", 1.6);
      bg.setAttribute(
        "material",
        "color:#FFFFFF; opacity:0.95; transparent:true;",
      );
      panel.appendChild(bg);

      // border
      const border = document.createElement("a-plane");
      border.setAttribute("width", 1.44);
      border.setAttribute("height", 1.64);
      border.setAttribute("position", "0 0 -0.005");
      border.setAttribute(
        "material",
        "color:#111111; opacity:0.2; transparent:true;",
      );
      panel.appendChild(border);

      // title
      const title = document.createElement("a-text");
      title.setAttribute("value", "My Gallery");
      title.setAttribute("position", "-0.65 0.72 0.01");
      title.setAttribute("width", 1.2);
      title.setAttribute("color", "#111111");
      title.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Roboto-msdf.json",
      );
      panel.appendChild(title);

      // close button
      const closeBtn = document.createElement("a-entity");
      closeBtn.setAttribute("position", "0.62 0.72 0.01");
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
        this.toggleMyGalleryPanel();
        this.playClickSound();
      });

      panel.appendChild(closeBtn);

      // content area (will be populated dynamically)
      const content = document.createElement("a-entity");
      content.setAttribute("id", "galleryPanelContent");
      content.setAttribute("position", "0 0.5 0.01");
      panel.appendChild(content);

      // attach to camera
      const camera = document.querySelector("a-camera");
      if (camera) {
        camera.appendChild(panel);
      }

      this.myGalleryPanel = panel;
      this.galleryPanelContent = content;
      console.log("[UITasks] My Gallery panel created");
    },

    toggleMyGalleryPanel() {
      const isVisible = this.myGalleryPanel.getAttribute("visible");
      this.myGalleryPanel.setAttribute("visible", !isVisible);

      if (!isVisible) {
        // update title with current count
        const titleEl = this.myGalleryPanel.querySelector("a-text");
        if (titleEl) {
          titleEl.setAttribute(
            "value",
            `My Gallery (${this.likedPaintings.size}/38)`,
          );
        }
        // update content when opening
        this.updateMyGalleryPanel();
      }
    },

    updateMyGalleryPanel() {
      // clear existing content
      while (this.galleryPanelContent.firstChild) {
        this.galleryPanelContent.removeChild(
          this.galleryPanelContent.firstChild,
        );
      }

      if (this.likedPaintings.size === 0) {
        const emptyText = document.createElement("a-text");
        emptyText.setAttribute(
          "value",
          "No paintings liked yet.\nClick on paintings to add them!",
        );
        emptyText.setAttribute("align", "center");
        emptyText.setAttribute("anchor", "center");
        emptyText.setAttribute("baseline", "center");
        emptyText.setAttribute("width", 1.0);
        emptyText.setAttribute("color", "#6B7280");
        emptyText.setAttribute("position", "0 0 0");
        this.galleryPanelContent.appendChild(emptyText);
        return;
      }

      // show liked paintings as a list
      const paintingsArray = Array.from(this.likedPaintings);
      const startY = 0.1;
      const lineHeight = 0.15;

      paintingsArray.forEach((paintingData, index) => {
        const yPos = startY - index * lineHeight;

        const item = document.createElement("a-text");
        item.setAttribute("value", `❤ ${paintingData.title}`);
        item.setAttribute("position", `-0.6 ${yPos} 0`);
        item.setAttribute("width", 1.1);
        item.setAttribute("color", "#111111");
        item.setAttribute("wrap-count", 30);
        item.setAttribute(
          "font",
          "https://cdn.aframe.io/fonts/Roboto-msdf.json",
        );

        this.galleryPanelContent.appendChild(item);
      });
    },

    toggleLike(paintingId, paintingTitle) {
      let isCurrentlyLiked = false;
      let existingItem = null;

      for (const item of this.likedPaintings) {
        if (item.id === paintingId) {
          isCurrentlyLiked = true;
          existingItem = item;
          break;
        }
      }

      if (isCurrentlyLiked && existingItem) {
        // unlike
        this.likedPaintings.delete(existingItem);
        console.log(`[UITasks] Unliked: ${paintingTitle}`);
        window.vrwLog("painting_unliked", {
          id: paintingId,
          title: paintingTitle,
        });
      } else {
        // like
        const paintingData = { id: paintingId, title: paintingTitle };
        this.likedPaintings.add(paintingData);
        console.log(`[UITasks] Liked: ${paintingTitle}`);
        window.vrwLog("painting_liked", {
          id: paintingId,
          title: paintingTitle,
        });

        this.showHeartAnimation(paintingId);
      }

      this.updateLikeCounter();
      this.playClickSound();

      return !isCurrentlyLiked;
    },

    showHeartAnimation(paintingId) {
      const painting = document.querySelector(`[data-art-id="${paintingId}"]`);
      if (!painting) return;

      const heart = document.createElement("a-text");
      heart.setAttribute("value", "❤");
      heart.setAttribute("align", "center");
      heart.setAttribute("anchor", "center");
      heart.setAttribute("baseline", "center");
      heart.setAttribute("width", 2);
      heart.setAttribute("color", "#EF4444");
      heart.setAttribute("position", "0 0 0.2");
      heart.setAttribute("opacity", 1);

      painting.appendChild(heart);

      setTimeout(() => {
        heart.setAttribute(
          "animation",
          "property: position; to: 0 0.5 0.2; dur: 800; easing: easeOutQuad",
        );
        heart.setAttribute(
          "animation__fade",
          "property: opacity; to: 0; dur: 800; easing: easeOutQuad",
        );
      }, 50);

      setTimeout(() => {
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
        }
      }, 900);
    },

    isLiked(paintingId) {
      return Array.from(this.likedPaintings).some((p) => p.id === paintingId);
    },
  };

  window.UITasks = UITasks;
})();
