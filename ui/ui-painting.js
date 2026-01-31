/***
 * Goals
 * painting placement 
 * plaque mounted on bottom of paintings
 * interactive hover - information about painting 
 ***/

(function () {
  window.__vrwLog = window.__vrwLog || [];
  window.vrwLog =
    window.vrwLog ||
    function (type, payload = {}) {
      const t = performance.now();
      const entry = { t_ms: Math.round(t), type, ...payload };
      window.__vrwLog.push(entry);
      console.log("[LOG]", entry);
    };

  //  painting informational db 
  const PAINTING_DATABASE = {
    imp_monet_parasol: {
      title: "Woman with a Parasol",
      artist: "Claude Monet",
      year: "1875",
      medium: "Oil on canvas",
      hoverInfo:
        "Monet captured his wife Camille and son on a breezy summer day. The loose brushstrokes and vibrant colors exemplify Impressionism's focus on capturing fleeting moments of light and atmosphere.",
      technique:
        "Quick, visible brushstrokes with emphasis on natural light effects",
    },
    imp_monet_lilies: {
      title: "Water Lilies",
      artist: "Claude Monet",
      year: "c. 1916",
      medium: "Oil on canvas",
      hoverInfo:
        "Part of Monet's iconic series painted in his Giverny garden. He was fascinated by how light danced across water at different times of day, creating over 250 paintings of this subject.",
      technique: "Thick impasto with layered colors creating depth and texture",
    },
    imp_renoir_promenade: {
      title: "The Promenade",
      artist: "Pierre-Auguste Renoir",
      year: "1870",
      medium: "Oil on canvas",
      hoverInfo:
        "Renoir celebrates the leisure of Parisian middle class during the Belle Époque. His soft, feathered brushwork creates a dreamy quality that focuses on beauty and everyday joy.",
      technique: "Soft brushwork with dappled light filtering through foliage",
    },
    imp_renoir_by_water: {
      title: "By the Water",
      artist: "Pierre-Auguste Renoir",
      year: "1880",
      medium: "Oil on canvas",
      hoverInfo:
        "Renoir loved painting outdoors to capture natural light. This work demonstrates his mastery of rendering how sunlight filters through trees and reflects off water.",
      technique: "Impressionist plein air painting with luminous color palette",
    },
    imp_renoir_rose_garden: {
      title: "The Rose Garden",
      artist: "Pierre-Auguste Renoir",
      year: "1876",
      medium: "Oil on canvas",
      hoverInfo:
        "Renoir's celebration of natural beauty and gardens. The soft brushwork and luminous colors create an almost dreamlike atmosphere of peace and tranquility.",
      technique: "Soft, blended brushwork with warm, glowing color harmony",
    },
    imp_renoir_woman_garden: {
      title: "Woman in a Garden",
      artist: "Pierre-Auguste Renoir",
      year: "1873",
      medium: "Oil on canvas",
      hoverInfo:
        "Painted entirely outdoors to capture authentic natural light. Renoir explores the interplay between sunlight, shadow, and organic forms in nature.",
      technique:
        "Impressionist outdoor painting with visible, textured brushstrokes",
    },
    imp_renoir_layole: {
      title: "La Yole",
      artist: "Pierre-Auguste Renoir",
      year: "1875",
      medium: "Oil on canvas",
      hoverInfo:
        "Depicts leisure boating on the Seine, a favorite Impressionist subject. Renoir captures the joy of modern Parisian life and outdoor recreation with vibrant, loose brushwork.",
      technique: "Vibrant colors with energetic, loose brushstrokes",
    },
    cont_basquiat_buddha: {
      title: "Buddha",
      artist: "Jean-Michel Basquiat",
      year: "1982-83",
      medium: "Acrylic & mixed media",
      hoverInfo:
        "Basquiat merged Eastern spirituality with Western pop culture and street art aesthetics. His work challenges boundaries between high art and graffiti, creating a unique visual language.",
      technique: "Mixed media with graffiti-inspired elements and collage",
    },
    cont_mondrian_01: {
      title: "Composition with Red, Blue and Yellow",
      artist: "Piet Mondrian",
      year: "1930",
      medium: "Oil on canvas",
      hoverInfo:
        "Mondrian sought universal harmony through pure abstraction. Using only primary colors, black, and white, he reduced art to its essential elements as part of the De Stijl movement.",
      technique:
        "Precise lines and flat color blocks in primary colors only",
    },
    cont_mondrian_02: {
      title: "Broadway Boogie Woogie",
      artist: "Piet Mondrian",
      year: "1942-43",
      medium: "Oil on canvas",
      hoverInfo:
        "Mondrian's final completed painting captures the rhythm and energy of Manhattan. Inspired by NYC streets and jazz music, the grid pattern pulses with vibrant color.",
      technique:
        "Grid pattern with small, vibrant color blocks creating rhythm",
    },
    cont_abs_01: {
      title: "Abstract Composition I",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Oil on canvas",
      hoverInfo:
        "Modern abstract art emphasizes color, form, and emotion over representational imagery. This piece invites personal interpretation and emotional response.",
      technique: "Bold color fields with gestural marks",
    },
    cont_abs_02: {
      title: "Abstract Composition II",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Oil on canvas",
      hoverInfo:
        "Abstract art frees color and form from the need to represent reality, allowing pure visual expression. Each viewer brings their own meaning to the work.",
      technique: "Layered colors with dynamic composition",
    },
    cont_rain_red_dress: {
      title: "Raining Red Dress",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Mixed media",
      hoverInfo:
        "Contemporary figurative work blending realistic and abstract elements. The vivid red creates strong emotional impact and focal point.",
      technique: "Mixed media with bold color contrast",
    },
    cont_stargazer_collage: {
      title: "Stargazer Collage",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Mixed media collage",
      hoverInfo:
        "Collage allows artists to combine disparate elements into unified compositions. This technique gained popularity in modern art for its innovative approach to creating imagery.",
      technique: "Collage with layered imagery and textures",
    },
    rena_da_vinci_monalisa: {
      title: "Mona Lisa",
      artist: "Leonardo da Vinci",
      year: "c. 1503-1519",
      medium: "Oil on poplar panel",
      hoverInfo:
        "The world's most famous painting. Da Vinci used sfumato (subtle blending) to create the enigmatic smile. The atmospheric background and psychological depth make this a masterpiece of Renaissance art.",
      technique: "Sfumato technique with subtle transitions between colors",
    },
    rena_da_vinci_ladyermine: {
      title: "Lady with an Ermine",
      artist: "Leonardo da Vinci",
      year: "c. 1489-1490",
      medium: "Oil on walnut panel",
      hoverInfo:
        "Portrait of Cecilia Gallerani, mistress of the Duke of Milan. The ermine symbolizes purity and was a clever play on her name. Da Vinci's mastery of light and shadow brings life to her expression.",
      technique: "Careful attention to light, shadow, and realistic detail",
    },
    pre_waterhouse_shalott: {
      title: "The Lady of Shalott",
      artist: "John William Waterhouse",
      year: "1888",
      medium: "Oil on canvas",
      hoverInfo:
        "Based on Tennyson's poem about a cursed lady who could only view the world through a mirror. The painting captures her tragic moment of leaving the tower, knowing death awaits her.",
      technique:
        "Rich colors and romantic detail characteristic of Pre-Raphaelite art",
    },
    pre_waterhouse_miranda: {
      title: "Miranda—The Tempest",
      artist: "John William Waterhouse",
      year: "1916",
      medium: "Oil on canvas",
      hoverInfo:
        "Shakespeare's character Miranda watches the storm from shore. Waterhouse was fascinated by literary and mythological subjects, bringing them to life with atmospheric effects.",
      technique: "Dramatic atmospheric effects with detailed naturalism",
    },
    pre_waterhouse_souloftherose: {
      title: "The Soul of the Rose",
      artist: "John William Waterhouse",
      year: "1908",
      medium: "Oil on canvas",
      hoverInfo:
        "A woman lost in the scent and beauty of roses. Waterhouse explores themes of beauty, contemplation, and sensory experience with characteristic Pre-Raphaelite botanical detail.",
      technique: "Meticulous botanical detail with soft, romantic lighting",
    },
    bar_vandyke_cherubs: {
      title: "Cherubs",
      artist: "Anthony van Dyck",
      year: "1630s",
      medium: "Oil on canvas",
      hoverInfo:
        "Van Dyck was court painter to Charles I of England. His cherubs celebrate divine innocence with dramatic Baroque lighting and soft modeling of forms.",
      technique: "Dramatic lighting with soft, rounded forms",
    },
    bar_vandyke_family: {
      title: "Family Portrait",
      artist: "Anthony van Dyck",
      year: "1630s",
      medium: "Oil on canvas",
      hoverInfo:
        "Van Dyck revolutionized portrait painting with elegant poses and rich fabrics. His Baroque style emphasizes drama, movement, and psychological depth.",
      technique: "Rich color and detailed fabric rendering",
    },
    bar_vandyke_head_woman: {
      title: "Head of a Woman",
      artist: "Anthony van Dyck",
      year: "1630s",
      medium: "Oil on canvas",
      hoverInfo:
        "Van Dyck's portraits capture both physical likeness and inner character. His fluid brushwork and attention to expression influenced generations of portrait painters.",
      technique: "Fluid brushwork with psychological depth",
    },
    postimp_redon_cyclops: {
      title: "The Cyclops",
      artist: "Odilon Redon",
      year: "1914",
      medium: "Oil on cardboard",
      hoverInfo:
        "Redon reimagines Greek mythology through dreamlike symbolism. After years working in dark charcoals, he embraced brilliant, vibrant colors late in his career.",
      technique: "Symbolic use of vibrant, expressive color",
    },
    postimp_redon_reflection: {
      title: "Reflection",
      artist: "Odilon Redon",
      year: "Late 19th C.",
      medium: "Oil on canvas",
      hoverInfo:
        "Redon bridges Impressionism and Symbolism, creating mysterious, dreamlike works. His art explores the subconscious and spiritual realms through color and form.",
      technique: "Soft, atmospheric color creating mysterious mood",
    },
    roco_fragonard_swing: {
      title: "The Swing",
      artist: "Jean-Honoré Fragonard",
      year: "1767",
      medium: "Oil on canvas",
      hoverInfo:
        "Epitomizes Rococo focus on pleasure and romance. Painted before the French Revolution, it captures aristocratic leisure and flirtation with light, playful brushwork.",
      technique: "Light, delicate brushwork with pastel color palette",
    },
    acad_leighton_accolade: {
      title: "The Accolade",
      artist: "Edmund Blair Leighton",
      year: "1901",
      medium: "Oil on canvas",
      hoverInfo:
        "Romanticized vision of medieval chivalry. The precise, academic realism shows the moment a knight receives recognition for his honor and bravery.",
      technique: "Precise academic realism with historical detail",
    },
    fig_van_gogh_pearlearing: {
      title: "Girl with a Pearl Earring",
      artist: "Johannes Vermeer",
      year: "c. 1665",
      medium: "Oil on canvas",
      hoverInfo:
        'Often called the "Mona Lisa of the North." Vermeer\'s masterful use of light creates an intimate, enigmatic portrait. The pearl earring catches light beautifully against the dark background.',
      technique: "Masterful use of light with smooth tonal transitions",
    },
    med_st_jerome: {
      title: "Saint Jerome",
      artist: "Medieval/Renaissance",
      year: "Medieval Period",
      medium: "Tempera on panel",
      hoverInfo:
        "Religious imagery was central to medieval art. Saint Jerome, translator of the Bible, is typically depicted as a scholar in contemplation or with a lion.",
      technique: "Tempera painting with gold leaf and symbolic imagery",
    },
    fig_baptiste_head: {
      title: "Head Study",
      artist: "Jean-Baptiste",
      year: "19th Century",
      medium: "Oil on canvas",
      hoverInfo:
        "Academic portrait studies focus on capturing human expression and character. These works demonstrate technical mastery of rendering form and light.",
      technique: "Classical portrait technique with careful modeling",
    },
    fig_llanes_poet: {
      title: "The Poet",
      artist: "Llanes",
      year: "19th Century",
      medium: "Oil on canvas",
      hoverInfo:
        "Romantic-era portraits of artists and intellectuals celebrated creativity and inner life. The contemplative pose suggests deep thought and artistic inspiration.",
      technique: "Romantic realism with emphasis on character",
    },
    fig_rossi_boudoir: {
      title: "Boudoir",
      artist: "Rossi",
      year: "19th Century",
      medium: "Oil on canvas",
      hoverInfo:
        "Intimate interior scenes were popular in 19th century art. These works explore private moments and the psychology of domestic spaces.",
      technique: "Soft lighting with attention to fabric and texture",
    },
  };

  function clampText(str, maxChars = 520) {
    if (!str) return "";
    return str.length > maxChars ? str.slice(0, maxChars - 1) + "…" : str;
  }

  const VRWPaintings = {
    init({ world, bounds, paintInset = 0.01, options = {} }) {
      if (!world) {
        console.warn("[VRWPaintings] Missing world element");
        return;
      }
      if (!bounds) {
        console.warn("[VRWPaintings] Missing bounds");
        return;
      }

      const { enableHoverHighlight = true, enableUILogging = true } = options;

      const PAINT_INSET = paintInset;
      const PAINT_MAT_BASE =
        "shader: standard; transparent:true; side:double; depthTest:true; depthWrite:true;";

      // add paintings with info 
      function addPainting({
        x,
        y,
        z,
        w,
        h,
        rotY,
        src,
        id = "",
        title = "",
        artInfo = null,
      }) {
        const p = document.createElement("a-plane");
        p.setAttribute("position", `${x} ${y} ${z}`);
        p.setAttribute("rotation", `0 ${rotY} 0`);
        p.setAttribute("width", w);
        p.setAttribute("height", h);

        // base material
        const baseMat = `${PAINT_MAT_BASE} src:${src};`;
        p.setAttribute("material", baseMat);


        p.setAttribute("material", "emissive", "#000000");
        p.setAttribute("material", "emissiveIntensity", 0);

        if (id) p.setAttribute("data-art-id", id);
        if (title) p.setAttribute("data-title", title);
        p.classList.add("clickable");

        let hoverOn = false;
        let hoverPanel = null;

        const hasInfo = !!(artInfo && artInfo.hoverInfo);

        function cleanupHover() {
          if (!hoverOn) return;
          hoverOn = false;

          p.setAttribute("material", "emissive", "#000000");
          p.setAttribute("material", "emissiveIntensity", 0);

          if (hoverPanel && hoverPanel.parentNode) {
            hoverPanel.parentNode.removeChild(hoverPanel);
          }
          hoverPanel = null;

          vrwLog("painting_hover_end", { id, title });
        }

        p.addEventListener("mouseenter", () => {
          if (hoverOn) return;
          hoverOn = true;


          if (hasInfo) {
            hoverPanel = createHoverPanel(artInfo);

            hoverPanel.addEventListener(
              "raycaster-intersection-cleared",
              cleanupHover
            );

            p.appendChild(hoverPanel);
          }

          vrwLog("painting_hover_start", { id, title });
        });

        p.addEventListener("mouseleave", cleanupHover);
        p.addEventListener("raycaster-intersection-cleared", cleanupHover);

        world.appendChild(p);
        return p;
      }

      //  hover information panel
      function createHoverPanel(artInfo) {
        const panel = document.createElement("a-entity");

        panel.setAttribute("position", "0 0.55 0.75");
        panel.setAttribute("rotation", "0 0 0");

        panel.classList.add("no-ray");

        const bg = document.createElement("a-plane");
        bg.setAttribute("width", 1.6);
        bg.setAttribute("height", 1.25);
        bg.setAttribute(
          "material",
          "color:#FFFFFF; opacity:0.96; transparent:true; shader:flat; side:double;"
        );
        bg.classList.add("no-ray");
        panel.appendChild(bg);

        const border = document.createElement("a-plane");
        border.setAttribute("width", 1.64);
        border.setAttribute("height", 1.29);
        border.setAttribute("position", "0 0 -0.005");
        border.setAttribute(
          "material",
          "color:#111111; opacity:0.22; transparent:true; shader:flat; side:double;"
        );
        border.classList.add("no-ray");
        panel.appendChild(border);

        const techniqueLine = artInfo.technique
          ? `Technique:\n${artInfo.technique}\n\n`
          : "";
        const textContent = clampText(
          techniqueLine + (artInfo.hoverInfo || ""),
          520
        );

        const textEl = document.createElement("a-text");
        textEl.setAttribute("value", textContent);

        textEl.setAttribute("position", "-0.74 0.56 0.01");
        textEl.setAttribute("width", 1.5);
        textEl.setAttribute("color", "#111111");
        textEl.setAttribute("font", "https://cdn.aframe.io/fonts/Roboto-msdf.json");
        textEl.setAttribute("wrap-count", 34);
        textEl.setAttribute("line-height", 38);
        textEl.setAttribute("baseline", "top");

        textEl.classList.add("no-ray");
        panel.appendChild(textEl);

        return panel;
      }

      // plaques
      function addPlaque({
        x,
        y,
        z,
        rotY,
        title,
        subtitle = "",
        meta = "",
        plaqueW = 1.1,
        plaqueH = 0.32,
        id = "",
        paintingH = 1.6,
      }) {
        const wrap = document.createElement("a-entity");

        const gapBelow = 0.18;
        const plaqueY = y - paintingH / 2 - gapBelow - plaqueH / 2;

        wrap.setAttribute("position", `${x} ${plaqueY} ${z}`);
        wrap.setAttribute("rotation", `0 ${rotY} 0`);
        if (id) wrap.setAttribute("data-art-id", id);
        world.appendChild(wrap);

        const plaque = document.createElement("a-plane");
        plaque.setAttribute("width", plaqueW);
        plaque.setAttribute("height", plaqueH);
        plaque.setAttribute("position", `0 0 ${PAINT_INSET}`);
        plaque.setAttribute(
          "material",
          "color:#1F2937; opacity:0.92; transparent:true; roughness:0.35; metalness:0.05; side:double; depthTest:true;"
        );
        wrap.appendChild(plaque);

        const frame = document.createElement("a-plane");
        frame.setAttribute("width", plaqueW + 0.03);
        frame.setAttribute("height", plaqueH + 0.03);
        frame.setAttribute("position", `0 0 0`);
        frame.setAttribute(
          "material",
          "color:#D1D5DB; opacity:0.35; transparent:true; side:double;"
        );
        wrap.appendChild(frame);

        const textEl = document.createElement("a-entity");
        textEl.setAttribute(
          "position",
          `${-plaqueW / 2 + 0.06} ${plaqueH / 2 - 0.07} ${PAINT_INSET * 2}`
        );

        const lines = [title];
        if (subtitle) lines.push(subtitle);
        if (meta) lines.push(meta);

        textEl.setAttribute("text", {
          value: lines.join("\n"),
          align: "left",
          anchor: "left",
          color: "#F9FAFB",
          width: plaqueW * 0.95,
          wrapCount: 28,
          lineHeight: 40,
          baseline: "top",
        });
        wrap.appendChild(textEl);

        return wrap;
      }

      // painting + plaque + hover information
      function paintOnWall(
        boundsObj,
        side,
        along,
        src,
        w = 2.2,
        h = 1.6,
        y = 2.0,
        id = "",
        title = ""
      ) {
        const { xMin, xMax, zMin, zMax } = boundsObj;

        const artId = src.replace("#", "");
        const artInfo = PAINTING_DATABASE[artId];

        if (!artInfo) {
          console.warn(`[VRWPaintings] Missing database entry for: ${artId}`);
        }

        const resolvedTitle = title || (artInfo && artInfo.title) || artId;
        const resolvedSubtitle = (artInfo && artInfo.artist) || "";
        const resolvedMeta = artInfo
          ? `${artInfo.year || ""}${artInfo.medium ? ` • ${artInfo.medium}` : ""}`.trim()
          : "";

        const place = ({ x, z, rotY }) => {
          addPainting({
            x,
            y,
            z,
            w,
            h,
            rotY,
            src,
            id: artId,
            title: resolvedTitle,
            artInfo,
          });

          addPlaque({
            x,
            y,
            z,
            rotY,
            title: resolvedTitle,
            subtitle: resolvedSubtitle,
            meta: resolvedMeta,
            id: artId,
            paintingH: h,
            plaqueW: Math.min(1.6, Math.max(1.05, w * 0.58)),
            plaqueH: 0.34,
          });
        };

        if (side === "north") place({ x: along, z: zMin + PAINT_INSET, rotY: 0 });
        else if (side === "south") place({ x: along, z: zMax - PAINT_INSET, rotY: 180 });
        else if (side === "west") place({ x: xMin + PAINT_INSET, z: along, rotY: 90 });
        else if (side === "east") place({ x: xMax - PAINT_INSET, z: along, rotY: -90 });
      }

      const { HUB, NORTH, SOUTH, EAST, WEST, NE } = bounds;

      // painting placements
      paintOnWall(HUB, "west", -7.0, "#cont_mondrian_01", 3.0, 3.0, 2.0);
      paintOnWall(HUB, "east", 7.0, "#rena_da_vinci_monalisa", 2.2, 3.0, 2.0);

      paintOnWall(NORTH, "north", -6.0, "#imp_monet_parasol", 3.2, 2.2, 2.0);
      paintOnWall(NORTH, "north", 6.0, "#imp_monet_lilies", 4.0, 2.6, 2.0);
      paintOnWall(NORTH, "west", -26.0, "#imp_renoir_promenade", 2.6, 1.8, 2.0);
      paintOnWall(NORTH, "east", -26.0, "#imp_renoir_by_water", 2.6, 1.8, 2.0);
      paintOnWall(NORTH, "west", -18.0, "#imp_renoir_rose_garden", 2.2, 1.6, 2.0);
      paintOnWall(NORTH, "east", -18.0, "#imp_renoir_woman_garden", 2.2, 1.6, 2.0);
      paintOnWall(NORTH, "west", -12.0, "#imp_renoir_layole", 2.2, 1.6, 2.0);

      paintOnWall(EAST, "east", -7.0, "#cont_basquiat_buddha", 3.2, 2.2, 2.0);
      paintOnWall(EAST, "north", 14.0, "#cont_abs_01", 2.2, 1.6, 2.0);
      paintOnWall(EAST, "south", 14.0, "#cont_abs_02", 2.2, 1.6, 2.0);
      paintOnWall(EAST, "east", 6.0, "#cont_mondrian_02", 3.0, 3.0, 2.0);
      paintOnWall(EAST, "south", 26.0, "#cont_stargazer_collage", 2.2, 1.6, 2.0);
      paintOnWall(EAST, "east", 0.0, "#cont_rain_red_dress", 2.2, 3.0, 2.0);

      paintOnWall(WEST, "west", -7.0, "#rena_da_vinci_monalisa", 2.4, 3.2, 2.0);
      paintOnWall(WEST, "west", 0.5, "#rena_da_vinci_ladyermine", 2.2, 3.0, 2.0);
      paintOnWall(WEST, "west", 7.0, "#roco_fragonard_swing", 2.2, 1.6, 2.0);
      paintOnWall(WEST, "north", -26.0, "#pre_waterhouse_miranda", 2.8, 2.4, 2.0);
      paintOnWall(WEST, "north", -20.0, "#pre_waterhouse_souloftherose", 2.0, 2.6, 2.0);
      paintOnWall(WEST, "north", -14.0, "#pre_waterhouse_shalott", 2.8, 2.4, 2.0);
      paintOnWall(WEST, "south", -14.0, "#acad_leighton_accolade", 3.2, 2.2, 2.0);

      paintOnWall(SOUTH, "south", 0.0, "#fig_van_gogh_pearlearing", 2.0, 2.6, 2.0);
      paintOnWall(SOUTH, "south", -6.0, "#med_st_jerome", 2.2, 3.2, 2.0);
      paintOnWall(SOUTH, "south", 6.0, "#bar_vandyke_cherubs", 2.2, 1.6, 2.0);
      paintOnWall(SOUTH, "west", 18.0, "#bar_vandyke_family", 3.6, 2.4, 2.0);
      paintOnWall(SOUTH, "east", 18.0, "#bar_vandyke_head_woman", 1.8, 2.2, 2.0);
      paintOnWall(SOUTH, "west", 26.0, "#fig_baptiste_head", 1.8, 2.2, 2.0);
      paintOnWall(SOUTH, "east", 26.0, "#fig_rossi_boudoir", 2.2, 1.6, 2.0);
      paintOnWall(SOUTH, "east", 12.0, "#fig_llanes_poet", 2.2, 1.6, 2.0);

      paintOnWall(NE, "north", 14.0, "#postimp_redon_cyclops", 3.0, 3.0, 2.0);
      paintOnWall(NE, "north", 26.0, "#postimp_redon_reflection", 2.6, 1.8, 2.0);
      paintOnWall(NE, "east", -16.0, "#imp_renoir_by_water", 2.2, 1.6, 2.0);

      // ui 
      if (enableUILogging) {
        for (let i = 1; i <= 5; i++) {
          const el = document.getElementById(`comfortBtn${i}`);
          if (!el) continue;
          el.addEventListener("click", () =>
            vrwLog("comfort_rating", { rating: i })
          );
        }

        const yes = document.getElementById("breakYesBtn");
        const no = document.getElementById("breakNoBtn");
        const ok = document.getElementById("breakOkBtn");

        if (yes)
          yes.addEventListener("click", () =>
            vrwLog("break_choice", { choice: "take_break" })
          );
        if (no)
          no.addEventListener("click", () =>
            vrwLog("break_choice", { choice: "keep_going" })
          );
        if (ok)
          ok.addEventListener("click", () =>
            vrwLog("break_ack", { ok: true })
          );

        window.addEventListener("keydown", (e) => {
          if (e.key && e.key.toLowerCase() === "l") {
            const blob = new Blob(
              [JSON.stringify(window.__vrwLog, null, 2)],
              { type: "application/json" }
            );
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `vrw_log_${new Date()
              .toISOString()
              .replace(/[:.]/g, "-")}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
        });
      }

      vrwLog("paintings_init", {
        enableHoverHighlight,
        enableUILogging,
        paintingCount: Object.keys(PAINTING_DATABASE).length,
      });
      console.log(
        `[VRWPaintings] Initialized with ${Object.keys(PAINTING_DATABASE).length} paintings in database`
      );
    },
  };

  window.VRWPaintings = VRWPaintings;
})();
