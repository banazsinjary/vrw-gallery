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

      if (!window.__paintingTags) {
        window.__paintingTags = {};
      }
      this.paintingTags = window.__paintingTags;

      // create UI elements
      this.createGalleryMenuButton();
      this.createMyGalleryPanel();
      this.createTagMenu();

      // load click sound
      this.loadClickSound();

      console.log("[UITasks] Initialized");
    },

    getTagCategories() {
      return [
        "Calm",
        "Energetic",
        "Natural",
        "Mysterious",
        "Joyful",
        "Dark/Moody",
        "Colorful",
        "Warm",
        "Cool",
        "Abstract",
        "Simple/Minimal",
        "Elegant",
      ];
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

    createTagMenu() {
      const menu = document.createElement("a-entity");
      menu.setAttribute("id", "tagMenu");
      menu.setAttribute("position", "0 -0.1 -1.5");
      menu.setAttribute("visible", false);

      // background
      const bg = document.createElement("a-plane");
      bg.setAttribute("width", 1.6);
      bg.setAttribute("height", 1.8);
      bg.setAttribute(
        "material",
        "color:#FFFFFF; opacity:0.95; transparent:true;",
      );
      menu.appendChild(bg);

      // border
      const border = document.createElement("a-plane");
      border.setAttribute("width", 1.64);
      border.setAttribute("height", 1.84);
      border.setAttribute("position", "0 0 -0.005");
      border.setAttribute(
        "material",
        "color:#111111; opacity:0.2; transparent:true;",
      );
      menu.appendChild(border);

      // title
      const title = document.createElement("a-text");
      title.setAttribute("id", "tagMenuTitle");
      title.setAttribute("value", "Tag This Painting");
      title.setAttribute("position", "-0.75 0.82 0.01");
      title.setAttribute("width", 1.2);
      title.setAttribute("color", "#111111");
      title.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Roboto-msdf.json",
      );
      menu.appendChild(title);

      // subtitle
      const subtitle = document.createElement("a-text");
      subtitle.setAttribute("value", "Select up to 2 tags");
      subtitle.setAttribute("position", "-0.75 0.72 0.01");
      subtitle.setAttribute("width", 0.9);
      subtitle.setAttribute("color", "#6B7280");
      subtitle.setAttribute(
        "font",
        "https://cdn.aframe.io/fonts/Roboto-msdf.json",
      );
      menu.appendChild(subtitle);

      // content area (will be populated dynamically)
      const content = document.createElement("a-entity");
      content.setAttribute("id", "tagMenuContent");
      content.setAttribute("position", "0 0.5 0.01");
      menu.appendChild(content);

      // close button
      const closeBtn = document.createElement("a-entity");
      closeBtn.setAttribute("position", "0.72 0.82 0.01");
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
        this.closeTagMenu();
        this.playClickSound();
      });

      menu.appendChild(closeBtn);

      // attach to camera
      const camera = document.querySelector("a-camera");
      if (camera) {
        camera.appendChild(menu);
      }

      this.tagMenu = menu;
      this.tagMenuContent = content;
      console.log("[UITasks] Tag menu created");
    },

    openTagMenu(paintingId, paintingTitle) {
      this.currentTaggingPaintingId = paintingId;
      this.currentTaggingPaintingTitle = paintingTitle;

      // update title
      const titleEl = document.getElementById("tagMenuTitle");
      if (titleEl) {
        titleEl.setAttribute("value", paintingTitle);
      }

      // populate content
      this.updateTagMenuContent();

      // show menu
      this.tagMenu.setAttribute("visible", true);

      console.log(`[UITasks] Tag menu opened for: ${paintingTitle}`);
    },

    closeTagMenu() {
      this.tagMenu.setAttribute("visible", false);
      this.currentTaggingPaintingId = null;
      this.currentTaggingPaintingTitle = null;
      console.log("[UITasks] Tag menu closed");
    },

    getCurrentTags(paintingId) {
      return this.paintingTags[paintingId] || [];
    },

    toggleTag(paintingId, tag) {
      if (!this.paintingTags[paintingId]) {
        this.paintingTags[paintingId] = [];
      }

      const tags = this.paintingTags[paintingId];
      const index = tags.indexOf(tag);

      if (index > -1) {
        // remove tag
        tags.splice(index, 1);
        console.log(`[UITasks] Removed tag "${tag}" from ${paintingId}`);
      } else {
        // add tag (max 2)
        if (tags.length < 2) {
          tags.push(tag);
          console.log(`[UITasks] Added tag "${tag}" to ${paintingId}`);
        } else {
          console.log(
            `[UITasks] Cannot add "${tag}" - max 2 tags already selected`,
          );
          return false; // couldn't add
        }
      }

      this.playClickSound();
      return true;
    },

    updateTagMenuContent() {
  // clear existing content
  while (this.tagMenuContent.firstChild) {
    this.tagMenuContent.removeChild(this.tagMenuContent.firstChild);
  }
  
  const paintingId = this.currentTaggingPaintingId;
  const currentTags = this.getCurrentTags(paintingId);
  const categories = this.getTagCategories();
  
  // show like status at top
  const isLiked = this.isLiked(paintingId);
  const likeBtn = document.createElement("a-entity");
  likeBtn.setAttribute("position", "0 0.1 0");
  likeBtn.classList.add("clickable");
  
  const likeBg = document.createElement("a-plane");
  likeBg.setAttribute("width", 1.3);
  likeBg.setAttribute("height", 0.15);
  likeBg.setAttribute("material", `color:${isLiked ? '#EF4444' : '#6B7280'}; opacity:0.8; transparent:true;`);
  likeBg.classList.add("clickable");
  likeBtn.appendChild(likeBg);
  
  const likeText = document.createElement("a-text");
  likeText.setAttribute("value", isLiked ? "❤ Added to My Gallery" : "♡ Add to My Gallery");
  likeText.setAttribute("align", "center");
  likeText.setAttribute("anchor", "center");
  likeText.setAttribute("baseline", "center");
  likeText.setAttribute("width", 1.8);
  likeText.setAttribute("color", "#FFFFFF");
  likeText.setAttribute("position", "0 0 0.01");
  likeBtn.appendChild(likeText);
  
  likeBtn.addEventListener("click", () => {
    window.UITasks.toggleLike(paintingId, this.currentTaggingPaintingTitle);
    this.updateTagMenuContent(); // refresh to update button
  });
  
  this.tagMenuContent.appendChild(likeBtn);
  
  // show tag buttons in a grid
  const startY = -0.1;
  const buttonWidth = 0.6;
  const buttonHeight = 0.14;
  const spacingX = 0.08;
  const spacingY = 0.06;
  const cols = 2;
  
  categories.forEach((tag, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const xPos = -0.34 + (col * (buttonWidth + spacingX));
    const yPos = startY - (row * (buttonHeight + spacingY));
    
    const isSelected = currentTags.includes(tag);
    
    const tagBtn = document.createElement("a-entity");
    tagBtn.setAttribute("position", `${xPos} ${yPos} 0`);
    tagBtn.classList.add("clickable");
    
    const tagBg = document.createElement("a-plane");
    tagBg.setAttribute("width", buttonWidth);
    tagBg.setAttribute("height", buttonHeight);
    tagBg.setAttribute("material", `color:${isSelected ? '#374151' : '#E5E7EB'}; opacity:0.9; transparent:true;`);
    tagBg.classList.add("clickable");
    tagBtn.appendChild(tagBg);
    
    const tagText = document.createElement("a-text");
    tagText.setAttribute("value", isSelected ? `✓ ${tag}` : tag);
    tagText.setAttribute("align", "center");
    tagText.setAttribute("anchor", "center");
    tagText.setAttribute("baseline", "center");
    tagText.setAttribute("width", 1.1);
    tagText.setAttribute("color", isSelected ? "#FFFFFF" : "#111111");
    tagText.setAttribute("position", "0 0 0.01");
    tagBtn.appendChild(tagText);
    
    tagBtn.addEventListener("click", () => {
      const success = this.toggleTag(paintingId, tag);
      if (success || isSelected) { // refresh if toggled or was already selected
        this.updateTagMenuContent();
      }
    });
    
    this.tagMenuContent.appendChild(tagBtn);
  });
  
  // show tag count at bottom
  const tagCountText = document.createElement("a-text");
  tagCountText.setAttribute("value", `Tags: ${currentTags.length}/2`);
  tagCountText.setAttribute("position", "0 -1.35 0");
  tagCountText.setAttribute("align", "center");
  tagCountText.setAttribute("anchor", "center");
  tagCountText.setAttribute("baseline", "center");
  tagCountText.setAttribute("width", 1.0);
  tagCountText.setAttribute("color", "#6B7280");
  this.tagMenuContent.appendChild(tagCountText);
},

    toggleMyGalleryPanel() {
      const isVisible = this.myGalleryPanel.getAttribute("visible");
      this.myGalleryPanel.setAttribute("visible", !isVisible);

      if (!isVisible) {
        // Reset to first page when opening
        this.galleryPage = 0;

        // Update title with current count
        const titleEl = this.myGalleryPanel.querySelector("a-text");
        if (titleEl) {
          titleEl.setAttribute(
            "value",
            `My Gallery (${this.likedPaintings.size}/38)`,
          );
        }
        // Update content when opening
        this.updateMyGalleryPanel();
      }
    },

    updateMyGalleryPanel() {
      // Clear existing content
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

      // Pagination setup
      if (!this.galleryPage) this.galleryPage = 0;
      const itemsPerPage = 8;
      const paintingsArray = Array.from(this.likedPaintings);
      const totalPages = Math.ceil(paintingsArray.length / itemsPerPage);
      const startIdx = this.galleryPage * itemsPerPage;
      const endIdx = Math.min(startIdx + itemsPerPage, paintingsArray.length);
      const pageItems = paintingsArray.slice(startIdx, endIdx);

      // Show items for current page
      const startY = 0.1;
      const lineHeight = 0.15;

      pageItems.forEach((paintingData, index) => {
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

      // Add navigation buttons if needed
      if (totalPages > 1) {
        const navY = startY - itemsPerPage * lineHeight - 0.1;

        // Previous button
        if (this.galleryPage > 0) {
          const prevBtn = document.createElement("a-entity");
          prevBtn.setAttribute("position", `-0.4 ${navY} 0`);
          prevBtn.classList.add("clickable");

          const prevBg = document.createElement("a-plane");
          prevBg.setAttribute("width", 0.3);
          prevBg.setAttribute("height", 0.12);
          prevBg.setAttribute(
            "material",
            "color:#374151; opacity:0.8; transparent:true;",
          );
          prevBg.classList.add("clickable");
          prevBtn.appendChild(prevBg);

          const prevText = document.createElement("a-text");
          prevText.setAttribute("value", "◀ Prev");
          prevText.setAttribute("align", "center");
          prevText.setAttribute("anchor", "center");
          prevText.setAttribute("baseline", "center");
          prevText.setAttribute("width", 1);
          prevText.setAttribute("color", "#FFFFFF");
          prevText.setAttribute("position", "0 0 0.01");
          prevBtn.appendChild(prevText);

          prevBtn.addEventListener("click", () => {
            this.galleryPage--;
            this.updateMyGalleryPanel();
            this.playClickSound();
          });

          this.galleryPanelContent.appendChild(prevBtn);
        }

        // Page indicator
        const pageIndicator = document.createElement("a-text");
        pageIndicator.setAttribute(
          "value",
          `${this.galleryPage + 1}/${totalPages}`,
        );
        pageIndicator.setAttribute("position", `0 ${navY} 0`);
        pageIndicator.setAttribute("align", "center");
        pageIndicator.setAttribute("anchor", "center");
        pageIndicator.setAttribute("baseline", "center");
        pageIndicator.setAttribute("width", 1);
        pageIndicator.setAttribute("color", "#6B7280");
        this.galleryPanelContent.appendChild(pageIndicator);

        // Next button
        if (this.galleryPage < totalPages - 1) {
          const nextBtn = document.createElement("a-entity");
          nextBtn.setAttribute("position", `0.4 ${navY} 0`);
          nextBtn.classList.add("clickable");

          const nextBg = document.createElement("a-plane");
          nextBg.setAttribute("width", 0.3);
          nextBg.setAttribute("height", 0.12);
          nextBg.setAttribute(
            "material",
            "color:#374151; opacity:0.8; transparent:true;",
          );
          nextBg.classList.add("clickable");
          nextBtn.appendChild(nextBg);

          const nextText = document.createElement("a-text");
          nextText.setAttribute("value", "Next ▶");
          nextText.setAttribute("align", "center");
          nextText.setAttribute("anchor", "center");
          nextText.setAttribute("baseline", "center");
          nextText.setAttribute("width", 1);
          nextText.setAttribute("color", "#FFFFFF");
          nextText.setAttribute("position", "0 0 0.01");
          nextBtn.appendChild(nextText);

          nextBtn.addEventListener("click", () => {
            this.galleryPage++;
            this.updateMyGalleryPanel();
            this.playClickSound();
          });

          this.galleryPanelContent.appendChild(nextBtn);
        }
      }
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
