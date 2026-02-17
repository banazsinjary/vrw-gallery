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

  // painting informational database
  const PAINTING_DATABASE = {
    imp_monet_parasol: {
      title: "Woman with a Parasol",
      artist: "Claude Monet",
      year: "1875",
      medium: "Oil on canvas",
      details:
        "Monet captured his wife Camille and son on a breezy summer day. The loose brushstrokes and vibrant colors exemplify Impressionism's focus on capturing fleeting moments of light and atmosphere.",
      technique:
        "Quick, visible brushstrokes with emphasis on natural light effects",
      funFacts: [
        "Monet painted this in just four hours to capture the fleeting light and wind effects.",
        "The model is Monet's first wife, Camille, who died just four years after this was painted.",
        "The painting was completed en plein air (outdoors) in a single session to preserve spontaneity.",
      ],
    },
    imp_monet_lilies: {
      title: "Water Lilies",
      artist: "Claude Monet",
      year: "c. 1916",
      medium: "Oil on canvas",
      details:
        "Part of Monet's iconic series painted in his Giverny garden. He was fascinated by how light danced across water at different times of day, creating over 250 paintings of this subject.",
      technique: "Thick impasto with layered colors creating depth and texture",
      funFacts: [
        "Monet painted over 250 water lily canvases in the last 30 years of his life.",
        "He had cataracts during this period, which affected his color perception and made his palette more intense.",
        "The pond in his garden was custom-built - he diverted a river and imported water lilies from Egypt and South America.",
      ],
    },
    imp_renoir_promenade: {
      title: "The Promenade",
      artist: "Pierre-Auguste Renoir",
      year: "1870",
      medium: "Oil on canvas",
      details:
        "Renoir celebrates the leisure of Parisian middle class during the Belle Époque. His soft, feathered brushwork creates a dreamy quality that focuses on beauty and everyday joy.",
      technique: "Soft brushwork with dappled light filtering through foliage",
      funFacts: [
        "This was painted the same year Renoir served in the Franco-Prussian War.",
        "Renoir often painted outdoors alongside Monet, sharing techniques and subjects.",
      ],
    },
    imp_renoir_by_water: {
      title: "By the Water",
      artist: "Pierre-Auguste Renoir",
      year: "1880",
      medium: "Oil on canvas",
      details:
        "Renoir loved painting outdoors to capture natural light. This work demonstrates his mastery of rendering how sunlight filters through trees and reflects off water.",
      technique: "Impressionist plein air painting with luminous color palette",
    },
    imp_renoir_rose_garden: {
      title: "The Rose Garden",
      artist: "Pierre-Auguste Renoir",
      year: "1876",
      medium: "Oil on canvas",
      details:
        "Renoir's celebration of natural beauty and gardens. The soft brushwork and luminous colors create an almost dreamlike atmosphere of peace and tranquility.",
      technique: "Soft, blended brushwork with warm, glowing color harmony",
    },
    imp_renoir_woman_garden: {
      title: "Woman in a Garden",
      artist: "Pierre-Auguste Renoir",
      year: "1873",
      medium: "Oil on canvas",
      details:
        "Painted entirely outdoors to capture authentic natural light. Renoir explores the interplay between sunlight, shadow, and organic forms in nature.",
      technique:
        "Impressionist outdoor painting with visible, textured brushstrokes",
    },
    imp_renoir_layole: {
      title: "La Yole",
      artist: "Pierre-Auguste Renoir",
      year: "1875",
      medium: "Oil on canvas",
      details:
        "Depicts leisure boating on the Seine, a favorite Impressionist subject. Renoir captures the joy of modern Parisian life and outdoor recreation with vibrant, loose brushwork.",
      technique: "Vibrant colors with energetic, loose brushstrokes",
    },
    cont_basquiat_buddha: {
      title: "Buddha",
      artist: "Jean-Michel Basquiat",
      year: "1982-83",
      medium: "Acrylic & mixed media",
      details:
        "Basquiat merged Eastern spirituality with Western pop culture and street art aesthetics. His work challenges boundaries between high art and graffiti, creating a unique visual language.",
      technique: "Mixed media with graffiti-inspired elements and collage",
      funFacts: [
        "Basquiat started as a graffiti artist under the tag 'SAMO' in New York City.",
        "He became the youngest artist to exhibit at Documenta at age 22.",
        "His paintings now sell for over $100 million at auction.",
      ],
    },
    cont_basquiat_pez: {
      title: "Pez Dispenser",
      artist: "Jean-Michel Basquiat",
      year: "1984",
      medium: "Acrylic and oilstick",
      details:
        "This work references a popular children's candy dispenser, transforming it into a sharp critique of consumerism, power, and cultural symbols. Basquiat often juxtaposed childlike imagery with complex social commentary, blending street culture, history, and art-world critique.",
      technique:
        "Expressive line work, symbolic imagery, and layered text with raw, graffiti-inspired marks",
      funFacts: [
        "Basquiat frequently used text and symbols to create layers of meaning in his work.",
        "He was friends with Andy Warhol and they collaborated on numerous paintings together.",
      ],
    },
    cont_basquiat_untitled: {
      title: "Untitled",
      artist: "Jean-Michel Basquiat",
      year: "1982",
      medium: "Acrylic, oilstick, spray paint",
      details:
        "This monumental work exemplifies Basquiat's mature visual language, combining mask-like faces, anatomical symbols, and aggressive mark-making. The figure recalls African and Caribbean visual traditions while confronting themes of power, identity, and historical erasure.",
      technique:
        "Layered brushwork, raw line drawing, symbolic figuration, and expressive color fields",
      funFacts: [
        "Basquiat completed some paintings in a single night-long session.",
        "He incorporated anatomical imagery from Gray's Anatomy, which he received as a gift while hospitalized as a child.",
      ],
    },
    cont_abs_01: {
      title: "Abstract Composition I",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Oil on canvas",
      details:
        "Modern abstract art emphasizes color, form, and emotion over representational imagery. This piece invites personal interpretation and emotional response.",
      technique: "Bold color fields with gestural marks",
    },
    cont_abs_02: {
      title: "Abstract Composition II",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Oil on canvas",
      details:
        "Abstract art frees color and form from the need to represent reality, allowing pure visual expression. Each viewer brings their own meaning to the work.",
      technique: "Layered colors with dynamic composition",
    },
    cont_rain_red_dress: {
      title: "Raining Red Dress",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Mixed media",
      details:
        "Contemporary figurative work blending realistic and abstract elements. The vivid red creates strong emotional impact and focal point.",
      technique: "Mixed media with bold color contrast",
    },
    cont_stargazer_collage: {
      title: "Stargazer Collage",
      artist: "Contemporary",
      year: "20th Century",
      medium: "Mixed media collage",
      details:
        "Collage allows artists to combine disparate elements into unified compositions. This technique gained popularity in modern art for its innovative approach to creating imagery.",
      technique: "Collage with layered imagery and textures",
    },
    rena_da_vinci_monalisa: {
      title: "Mona Lisa",
      artist: "Leonardo da Vinci",
      year: "c. 1503-1519",
      medium: "Oil on poplar panel",
      details:
        "The world's most famous painting. Da Vinci used sfumato (subtle blending) to create the enigmatic smile. The atmospheric background and psychological depth make this a masterpiece of Renaissance art.",
      technique: "Sfumato technique with subtle transitions between colors",
      funFacts: [
        "The Mona Lisa has no eyebrows - it was fashionable in Renaissance Florence to shave them.",
        "Da Vinci worked on this painting for over 16 years and carried it with him everywhere.",
        "It was stolen from the Louvre in 1911 and missing for two years, making it even more famous.",
      ],
    },
    rena_da_vinci_ladyermine: {
      title: "Lady with an Ermine",
      artist: "Leonardo da Vinci",
      year: "c. 1489-1490",
      medium: "Oil on walnut panel",
      details:
        "Portrait of Cecilia Gallerani, mistress of the Duke of Milan. The ermine symbolizes purity and was a clever play on her name. Da Vinci's mastery of light and shadow brings life to her expression.",
      technique: "Careful attention to light, shadow, and realistic detail",
      funFacts: [
        "The ermine is a pun - in Greek, 'galè' means ermine, referencing the sitter's surname Gallerani.",
        "This is one of only four portraits of women painted by Leonardo da Vinci.",
      ],
    },
    pre_waterhouse_shalott: {
      title: "The Lady of Shalott",
      artist: "John William Waterhouse",
      year: "1888",
      medium: "Oil on canvas",
      details:
        "Based on Tennyson's poem about a cursed lady who could only view the world through a mirror. The painting captures her tragic moment of leaving the tower, knowing death awaits her.",
      technique:
        "Rich colors and romantic detail characteristic of Pre-Raphaelite art",
      funFacts: [
        "Waterhouse painted this subject three times - he was obsessed with the tragic story.",
        "The three candles represent her fading life force - two are already extinguished.",
      ],
    },
    pre_waterhouse_miranda: {
      title: "Miranda—The Tempest",
      artist: "John William Waterhouse",
      year: "1916",
      medium: "Oil on canvas",
      details:
        "Shakespeare's character Miranda watches the storm from shore. Waterhouse was fascinated by literary and mythological subjects, bringing them to life with atmospheric effects.",
      technique: "Dramatic atmospheric effects with detailed naturalism",
    },
    pre_waterhouse_souloftherose: {
      title: "The Soul of the Rose",
      artist: "John William Waterhouse",
      year: "1908",
      medium: "Oil on canvas",
      details:
        "A woman lost in the scent and beauty of roses. Waterhouse explores themes of beauty, contemplation, and sensory experience with characteristic Pre-Raphaelite botanical detail.",
      technique: "Meticulous botanical detail with soft, romantic lighting",
    },
    bar_vandyke_cherubs: {
      title: "Cherubs",
      artist: "Anthony van Dyck",
      year: "1630s",
      medium: "Oil on canvas",
      details:
        "Van Dyck was court painter to Charles I of England. His cherubs celebrate divine innocence with dramatic Baroque lighting and soft modeling of forms.",
      technique: "Dramatic lighting with soft, rounded forms",
    },
    bar_vandyke_family: {
      title: "Family Portrait",
      artist: "Anthony van Dyck",
      year: "1630s",
      medium: "Oil on canvas",
      details:
        "Van Dyck revolutionized portrait painting with elegant poses and rich fabrics. His Baroque style emphasizes drama, movement, and psychological depth.",
      technique: "Rich color and detailed fabric rendering",
      funFacts: [
        "Van Dyck was knighted by King Charles I and became the leading court painter in England.",
        "He established the visual style for British portraiture that lasted for over 150 years.",
      ],
    },
    bar_vandyke_head_woman: {
      title: "Head of a Woman",
      artist: "Anthony van Dyck",
      year: "1630s",
      medium: "Oil on canvas",
      details:
        "Van Dyck's portraits capture both physical likeness and inner character. His fluid brushwork and attention to expression influenced generations of portrait painters.",
      technique: "Fluid brushwork with psychological depth",
    },
    postimp_redon_cyclops: {
      title: "The Cyclops",
      artist: "Odilon Redon",
      year: "1914",
      medium: "Oil on cardboard",
      details:
        "Redon reimagines Greek mythology through dreamlike symbolism. After years working in dark charcoals, he embraced brilliant, vibrant colors late in his career.",
      technique: "Symbolic use of vibrant, expressive color",
      funFacts: [
        "Redon worked exclusively in black and white for his first 30 years as an artist.",
        "He called his dark charcoal works his 'noirs' - they explored dreams, nightmares, and the subconscious.",
      ],
    },
    postimp_redon_reflection: {
      title: "Reflection",
      artist: "Odilon Redon",
      year: "Late 19th C.",
      medium: "Oil on canvas",
      details:
        "Redon bridges Impressionism and Symbolism, creating mysterious, dreamlike works. His art explores the subconscious and spiritual realms through color and form.",
      technique: "Soft, atmospheric color creating mysterious mood",
    },
    roco_fragonard_swing: {
      title: "The Swing",
      artist: "Jean-Honoré Fragonard",
      year: "1767",
      medium: "Oil on canvas",
      details:
        "Epitomizes Rococo focus on pleasure and romance. Painted before the French Revolution, it captures aristocratic leisure and flirtation with light, playful brushwork.",
      technique: "Light, delicate brushwork with pastel color palette",
      funFacts: [
        "The man in the bushes commissioned this painting to show himself looking up his lover's skirt - quite scandalous!",
        "The older man pushing the swing is the woman's husband, unaware of the hidden lover.",
      ],
    },
    acad_leighton_accolade: {
      title: "The Accolade",
      artist: "Edmund Blair Leighton",
      year: "1901",
      medium: "Oil on canvas",
      details:
        "Romanticized vision of medieval chivalry. The precise, academic realism shows the moment a knight receives recognition for his honor and bravery.",
      technique: "Precise academic realism with historical detail",
    },
    fig_van_gogh_pearlearing: {
      title: "Girl with a Pearl Earring",
      artist: "Johannes Vermeer",
      year: "c. 1665",
      medium: "Oil on canvas",
      details:
        'Often called the "Mona Lisa of the North." Vermeer\'s masterful use of light creates an intimate, enigmatic portrait. The pearl earring catches light beautifully against the dark background.',
      technique: "Masterful use of light with smooth tonal transitions",
      funFacts: [
        "This isn't actually a portrait - it's a 'tronie', a Dutch art form showing imaginary characters in exotic dress.",
        "The pearl earring is so large it's probably not real - likely polished tin or glass.",
        "Vermeer used expensive ultramarine blue (made from lapis lazuli) for the turban, showing the subject's high status.",
      ],
    },
    med_st_jerome: {
      title: "Saint Jerome",
      artist: "Medieval/Renaissance",
      year: "Medieval Period",
      medium: "Tempera on panel",
      details:
        "Religious imagery was central to medieval art. Saint Jerome, translator of the Bible, is typically depicted as a scholar in contemplation or with a lion.",
      technique: "Tempera painting with gold leaf and symbolic imagery",
    },
    fig_baptiste_head: {
      title: "Head Study",
      artist: "Jean-Baptiste",
      year: "19th Century",
      medium: "Oil on canvas",
      details:
        "Academic portrait studies focus on capturing human expression and character. These works demonstrate technical mastery of rendering form and light.",
      technique: "Classical portrait technique with careful modeling",
    },
    fig_llanes_poet: {
      title: "The Poet",
      artist: "Llanes",
      year: "19th Century",
      medium: "Oil on canvas",
      details:
        "Romantic-era portraits of artists and intellectuals celebrated creativity and inner life. The contemplative pose suggests deep thought and artistic inspiration.",
      technique: "Romantic realism with emphasis on character",
    },
    fig_rossi_boudoir: {
      title: "Boudoir",
      artist: "Rossi",
      year: "19th Century",
      medium: "Oil on canvas",
      details:
        "Intimate interior scenes were popular in 19th century art. These works explore private moments and the psychology of domestic spaces.",
      technique: "Soft lighting with attention to fabric and texture",
    },
    bobross_cedar_park: {
      title: "Cedar Park",
      artist: "Bob Ross",
      year: "20th Century",
      medium: "Oil on canvas",
      details:
        "A calm landscape study with warm light and soft trees. Take a moment to breathe and notice the depth in the background.",
      technique: "Wet-on-wet landscape painting with soft blending",
      funFacts: [
        "Bob Ross completed each painting in under 30 minutes for his TV show 'The Joy of Painting'.",
        "He painted over 30,000 paintings in his lifetime but gave most away for free.",
      ],
    },
    bobross_country: {
      title: "Country Scene",
      artist: "Bob Ross",
      year: "20th Century",
      medium: "Oil on canvas",
      details:
        "A peaceful country view with gentle contrast and open space. Notice how the horizon guides your gaze.",
      technique: "Wet-on-wet with simple value layering",
    },
    bobross_mountain_sunset: {
      title: "Mountain at Sunset",
      artist: "Bob Ross",
      year: "20th Century",
      medium: "Oil on canvas",
      details:
        "A warm sunset palette with silhouetted forms and atmospheric distance. Let your eyes rest on the gradient sky.",
      technique: "Soft sky gradients with mountain silhouettes",
    },
    bobross_silver_linings: {
      title: "Silver Linings",
      artist: "Bob Ross",
      year: "20th Century",
      medium: "Oil on canvas",
      details:
        "A bright, hopeful sky study with glowing highlights and layered clouds. Notice the contrast between light and shadow.",
      technique: "Layered clouds with highlight passes",
    },
    dicksee_la_belle_dame: {
      title: "La Belle Dame",
      artist: "Unknown (file: Dicksee)",
      year: "19th Century",
      medium: "Oil on canvas",
      details:
        "A romantic-era figurative work. Observe the focus on expression, fabric detail, and soft lighting.",
      technique: "Academic portrait technique with controlled edges",
    },
    selva_death_of_maiden: {
      title: "Death of the Maiden",
      artist: "Unknown (file: Selva)",
      year: "19th Century",
      medium: "Oil on canvas",
      details:
        "A dramatic narrative scene. Notice how the composition uses contrast and gesture to create emotion and tension.",
      technique: "Narrative realism with strong tonal contrast",
    },
    toulmouche_fiancee: {
      title: "The Fiancée",
      artist: "Unknown (file: Toulmouche)",
      year: "19th Century",
      medium: "Oil on canvas",
      details:
        "A refined interior portrait. Notice posture, gaze, and material textures that communicate social tone and character.",
      technique: "Smooth academic rendering with attention to fabric",
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

      const { enableUILogging = true } = options;

      const PAINT_INSET = paintInset;
      const PAINT_MAT_BASE =
        "shader: standard; transparent:true; side:double; depthTest:true; depthWrite:true;";

      // create painting with interactive elements
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

        const baseMat = `${PAINT_MAT_BASE} src:${src};`;
        p.setAttribute("material", baseMat);

        if (id) p.setAttribute("data-art-id", id);
        if (title) p.setAttribute("data-title", title);

        // like indicator (heart) - top right of painting
        const likeIndicator = document.createElement("a-image");
        likeIndicator.setAttribute("src", "#heartOutline");
        likeIndicator.setAttribute("width", 0.3);
        likeIndicator.setAttribute("height", 0.3);
        likeIndicator.setAttribute(
          "position",
          `${w / 2 - 0.2} ${h / 2 - 0.2} 0.05`,
        );
        likeIndicator.setAttribute("opacity", 0.9);
        likeIndicator.setAttribute("transparent", true);
        likeIndicator.setAttribute("material", "alphaTest: 0.5; side: double");
        likeIndicator.classList.add("clickable");
        likeIndicator.classList.add("like-indicator");
        p.appendChild(likeIndicator);

        // heart tooltip
        const heartTooltip = document.createElement("a-entity");
        heartTooltip.setAttribute(
          "position",
          `${w / 2 - 0.2} ${h / 2 - 0.65} 0.06`,
        );

        const tooltipBg = document.createElement("a-plane");
        tooltipBg.setAttribute("width", 0.7);
        tooltipBg.setAttribute("height", 0.25);
        tooltipBg.setAttribute(
          "material",
          "color:#FFFFFF; opacity:0.95; transparent:true;",
        );
        tooltipBg.classList.add("no-ray");
        heartTooltip.appendChild(tooltipBg);

        const tooltipText = document.createElement("a-text");
        tooltipText.setAttribute("value", "Like to add\nto My Gallery");
        tooltipText.setAttribute("align", "center");
        tooltipText.setAttribute("anchor", "center");
        tooltipText.setAttribute("baseline", "center");
        tooltipText.setAttribute("width", 1.4);
        tooltipText.setAttribute("color", "#111111");
        tooltipText.setAttribute("position", "0 0 0.01");
        tooltipText.classList.add("no-ray");
        heartTooltip.appendChild(tooltipText);

        heartTooltip.setAttribute("visible", false);
        p.appendChild(heartTooltip);

        // show/hide tooltip on heart hover
        likeIndicator.addEventListener("mouseenter", () => {
          heartTooltip.setAttribute("visible", true);
        });

        likeIndicator.addEventListener("mouseleave", () => {
          heartTooltip.setAttribute("visible", false);
        });

        // heart click handler - toggle like
        likeIndicator.addEventListener("click", (e) => {
          e.stopPropagation();
          if (window.UITasks) {
            window.UITasks.toggleLike(id, title);
            updateLikeIndicator();
          }
        });

        // details button (bottom right corner, outside painting, top position)
        const detailsButton = document.createElement("a-entity");
        detailsButton.setAttribute("position", `${w / 2 + 0.55} ${-h / 2 + 0.35} 0.05`);
        detailsButton.classList.add("clickable");

        const detailsBg = document.createElement("a-plane");
        detailsBg.setAttribute("width", 0.9);
        detailsBg.setAttribute("height", 0.22);
        detailsBg.setAttribute(
          "material",
          "color:#374151; opacity:0.85; transparent:true;",
        );
        detailsBg.classList.add("clickable");
        detailsButton.appendChild(detailsBg);

        const detailsText = document.createElement("a-text");
        detailsText.setAttribute("value", "Details");
        detailsText.setAttribute("align", "center");
        detailsText.setAttribute("anchor", "center");
        detailsText.setAttribute("baseline", "center");
        detailsText.setAttribute("width", 2);
        detailsText.setAttribute("color", "#FFFFFF");
        detailsText.setAttribute("position", "0 0 0.01");
        detailsButton.appendChild(detailsText);

        // track details panel state
        let detailsPanel = null;

        // details button click handler - toggle panel
        detailsButton.addEventListener("click", (e) => {
          e.stopPropagation();

          if (detailsPanel) {
            // close panel
            if (detailsPanel.parentNode) {
              detailsPanel.parentNode.removeChild(detailsPanel);
            }
            detailsPanel = null;
          } else if (artInfo) {
            // open panel
            detailsPanel = createDetailsPanel(artInfo, id);
            p.appendChild(detailsPanel);
          }
        });

        p.appendChild(detailsButton);

        // tag button (bottom right corner, outside painting, below details)
        const tagButton = document.createElement("a-entity");
        tagButton.setAttribute("position", `${w / 2 + 0.55} ${-h / 2} 0.05`);
        tagButton.classList.add("clickable");

        const tagBg = document.createElement("a-plane");
        tagBg.setAttribute("width", 0.9);
        tagBg.setAttribute("height", 0.22);
        tagBg.setAttribute(
          "material",
          "color:#374151; opacity:0.85; transparent:true;",
        );
        tagBg.classList.add("clickable");
        tagButton.appendChild(tagBg);

        const tagText = document.createElement("a-text");
        tagText.setAttribute("value", "Tag");
        tagText.setAttribute("align", "center");
        tagText.setAttribute("anchor", "center");
        tagText.setAttribute("baseline", "center");
        tagText.setAttribute("width", 2);
        tagText.setAttribute("color", "#FFFFFF");
        tagText.setAttribute("position", "0 0 0.01");
        tagButton.appendChild(tagText);

        tagButton.addEventListener("click", (e) => {
          e.stopPropagation();
          if (window.UITasks) {
            window.UITasks.openTagMenu(id, title);
          }
        });

        p.appendChild(tagButton);

        // update like indicator function
        function updateLikeIndicator() {
          if (window.UITasks && window.UITasks.isLiked(id)) {
            likeIndicator.setAttribute("src", "#heartFilled");
          } else {
            likeIndicator.setAttribute("src", "#heartOutline");
          }
        }

        world.appendChild(p);
        return p;
      }

      // create details information panel
      function createDetailsPanel(artInfo, artId) {
        const panel = document.createElement("a-entity");
        panel.setAttribute("position", "0 0.55 0.75");
        panel.setAttribute("rotation", "0 0 0");
        panel.classList.add("no-ray");

        const bg = document.createElement("a-plane");
        bg.setAttribute("width", 1.6);
        bg.setAttribute("height", 1.25);
        bg.setAttribute(
          "material",
          "color:#FFFFFF; opacity:0.96; transparent:true; shader:flat; side:double;",
        );
        bg.classList.add("no-ray");
        panel.appendChild(bg);

        const border = document.createElement("a-plane");
        border.setAttribute("width", 1.64);
        border.setAttribute("height", 1.29);
        border.setAttribute("position", "0 0 -0.005");
        border.setAttribute(
          "material",
          "color:#111111; opacity:0.22; transparent:true; shader:flat; side:double;",
        );
        border.classList.add("no-ray");
        panel.appendChild(border);

        // handle rotating fun facts
        let factIndex = 0;
        const hasFunFacts = artInfo.funFacts && artInfo.funFacts.length > 0;

        // track which fact to show next for this painting
        if (!window.__paintingFactIndex) {
          window.__paintingFactIndex = {};
        }
        if (!window.__paintingFactIndex[artId]) {
          window.__paintingFactIndex[artId] = 0;
        }

        factIndex = window.__paintingFactIndex[artId];

        // build text content
        let textContent = "";

        // technique section
        if (artInfo.technique) {
          textContent += `Technique:\n${artInfo.technique}\n\n`;
        }

        // fun fact section
        if (hasFunFacts) {
          const currentFact = artInfo.funFacts[factIndex];
          textContent += `Fun Fact:\n${currentFact}\n\n`;

          // increment for next view
          window.__paintingFactIndex[artId] =
            (factIndex + 1) % artInfo.funFacts.length;
        }

        // painting details section
        if (artInfo.details) {
          textContent += `Painting Details:\n${artInfo.details}`;
        }

        textContent = clampText(textContent, 720);

        const textEl = document.createElement("a-text");
        textEl.setAttribute("value", textContent);
        textEl.setAttribute("position", "-0.74 0.56 0.01");
        textEl.setAttribute("width", 1.5);
        textEl.setAttribute("color", "#111111");
        textEl.setAttribute(
          "font",
          "https://cdn.aframe.io/fonts/Roboto-msdf.json",
        );
        textEl.setAttribute("wrap-count", 34);
        textEl.setAttribute("line-height", 38);
        textEl.setAttribute("baseline", "top");
        textEl.classList.add("no-ray");
        panel.appendChild(textEl);

        return panel;
      }

      // create plaque below painting
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
          "color:#1F2937; opacity:0.92; transparent:true; roughness:0.35; metalness:0.05; side:double; depthTest:true;",
        );
        wrap.appendChild(plaque);

        const frame = document.createElement("a-plane");
        frame.setAttribute("width", plaqueW + 0.03);
        frame.setAttribute("height", plaqueH + 0.03);
        frame.setAttribute("position", `0 0 0`);
        frame.setAttribute(
          "material",
          "color:#D1D5DB; opacity:0.35; transparent:true; side:double;",
        );
        wrap.appendChild(frame);

        const textEl = document.createElement("a-entity");
        textEl.setAttribute(
          "position",
          `${-plaqueW / 2 + 0.06} ${plaqueH / 2 - 0.07} ${PAINT_INSET * 2}`,
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

      // place painting + plaque on wall
      function paintOnWall(
        boundsObj,
        side,
        along,
        src,
        w = 2.2,
        h = 1.6,
        y = 2.0,
        id = "",
        title = "",
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

        if (side === "north")
          place({ x: along, z: zMin + PAINT_INSET, rotY: 0 });
        else if (side === "south")
          place({ x: along, z: zMax - PAINT_INSET, rotY: 180 });
        else if (side === "west")
          place({ x: xMin + PAINT_INSET, z: along, rotY: 90 });
        else if (side === "east")
          place({ x: xMax - PAINT_INSET, z: along, rotY: -90 });
      }

      const { HUB, NORTH, SOUTH, EAST, WEST, NE } = bounds;

      // painting placements

      // north wing
      paintOnWall(NORTH, "north", -4.5, "#imp_monet_parasol", 3.2, 2.2, 2.0);
      paintOnWall(NORTH, "north", 4.5, "#imp_monet_lilies", 4.0, 2.6, 2.0);
      paintOnWall(NORTH, "west", -28.0, "#imp_renoir_promenade", 2.6, 1.8, 2.0);
      paintOnWall(
        NORTH,
        "west",
        -21.0,
        "#imp_renoir_rose_garden",
        2.2,
        1.6,
        2.0,
      );
      paintOnWall(NORTH, "west", -15.0, "#imp_renoir_layole", 2.2, 1.6, 2.0);
      paintOnWall(NORTH, "east", -26.0, "#imp_renoir_by_water", 2.6, 1.8, 2.0);
      paintOnWall(
        NORTH,
        "east",
        -18.0,
        "#imp_renoir_woman_garden",
        2.2,
        2.0,
        2.0,
      );

      // north east wing
      paintOnWall(NE, "north", 16.0, "#postimp_redon_cyclops", 3.0, 2.8, 2.0);
      paintOnWall(
        NE,
        "north",
        25.0,
        "#postimp_redon_reflection",
        2.6,
        2.6,
        2.0,
      );
      paintOnWall(NE, "east", -16.0, "#pre_waterhouse_shalott", 2.8, 2.4, 2.0);
      paintOnWall(NE, "west", -16.0, "#fig_llanes_poet", 2.2, 1.6, 2.0);
      paintOnWall(NE, "west", -28.0, "#bobross_cedar_park", 2.6, 1.8, 2.0);
      paintOnWall(NE, "west", -22.0, "#bobross_country", 2.6, 1.8, 2.0);
      paintOnWall(NE, "east", -28.0, "#bobross_mountain_sunset", 2.6, 1.8, 2.0);
      paintOnWall(NE, "east", -22.0, "#bobross_silver_linings", 2.6, 1.8, 2.0);

      // west wing
      paintOnWall(WEST, "west", -6.0, "#rena_da_vinci_monalisa", 1.8, 2.5, 2.0);
      paintOnWall(
        WEST,
        "west",
        0.5,
        "#rena_da_vinci_ladyermine",
        2.2,
        2.7,
        2.0,
      );
      paintOnWall(WEST, "west", 7.0, "#roco_fragonard_swing", 2.2, 1.6, 2.0);
      paintOnWall(
        WEST,
        "north",
        -22.0,
        "#pre_waterhouse_miranda",
        2.8,
        2.3,
        2.0,
      );
      paintOnWall(
        WEST,
        "north",
        -16.0,
        "#pre_waterhouse_souloftherose",
        2.0,
        2.6,
        2.0,
      );
      paintOnWall(WEST, "north", -28.0, "#toulmouche_fiancee", 2.4, 1.8, 2.0);
      paintOnWall(
        WEST,
        "south",
        -28.0,
        "#acad_leighton_accolade",
        3.2,
        2.2,
        2.0,
      );
      paintOnWall(
        WEST,
        "south",
        -21.5,
        "#dicksee_la_belle_dame",
        2.4,
        2.6,
        2.0,
      );
      paintOnWall(
        WEST,
        "south",
        -15.0,
        "#selva_death_of_maiden",
        2.2,
        2.8,
        2.0,
      );

      // south wing
      paintOnWall(
        SOUTH,
        "south",
        0.0,
        "#fig_van_gogh_pearlearing",
        2.0,
        2.6,
        2.0,
      );
      paintOnWall(SOUTH, "south", -6.0, "#med_st_jerome", 2.2, 2.6, 2.0);
      paintOnWall(SOUTH, "south", 6.0, "#bar_vandyke_cherubs", 2.2, 1.6, 2.0);
      paintOnWall(SOUTH, "west", 18.0, "#bar_vandyke_family", 3.6, 2.4, 2.0);
      paintOnWall(SOUTH, "west", 26.0, "#fig_baptiste_head", 1.8, 2.2, 2.0);
      paintOnWall(
        SOUTH,
        "east",
        18.0,
        "#bar_vandyke_head_woman",
        1.8,
        2.2,
        2.0,
      );
      paintOnWall(SOUTH, "east", 26.0, "#fig_rossi_boudoir", 2.2, 1.6, 2.0);

      // east wing
      paintOnWall(EAST, "east", -7.0, "#cont_basquiat_buddha", 3.2, 2.2, 2.0);
      paintOnWall(EAST, "east", 6.0, "#cont_basquiat_untitled", 3.4, 2.6, 2.0);
      paintOnWall(EAST, "east", 0.0, "#cont_basquiat_pez", 2.2, 2.0, 2.2);
      paintOnWall(EAST, "north", 14.0, "#cont_abs_01", 2.2, 1.6, 2.0);
      paintOnWall(EAST, "south", 14.0, "#cont_abs_02", 2.6, 2.6, 2.2);
      paintOnWall(
        EAST,
        "south",
        26.0,
        "#cont_stargazer_collage",
        2.6,
        2.6,
        2.2,
      );
      paintOnWall(EAST, "south", 20.0, "#cont_rain_red_dress", 2.2, 2.8, 2.0);

      // ui logging setup
      if (enableUILogging) {
        for (let i = 1; i <= 5; i++) {
          const el = document.getElementById(`comfortBtn${i}`);
          if (!el) continue;
          el.addEventListener("click", () =>
            vrwLog("comfort_rating", { rating: i }),
          );
        }

        const yes = document.getElementById("breakYesBtn");
        const no = document.getElementById("breakNoBtn");
        const ok = document.getElementById("breakOkBtn");

        if (yes)
          yes.addEventListener("click", () =>
            vrwLog("break_choice", { choice: "take_break" }),
          );
        if (no)
          no.addEventListener("click", () =>
            vrwLog("break_choice", { choice: "keep_going" }),
          );
        if (ok)
          ok.addEventListener("click", () => vrwLog("break_ack", { ok: true }));

        window.addEventListener("keydown", (e) => {
          if (e.key && e.key.toLowerCase() === "l") {
            const blob = new Blob([JSON.stringify(window.__vrwLog, null, 2)], {
              type: "application/json",
            });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `vrw_log_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
        });
      }

      vrwLog("paintings_init", {
        enableUILogging,
        paintingCount: Object.keys(PAINTING_DATABASE).length,
      });
      console.log(
        `[VRWPaintings] Initialized with ${Object.keys(PAINTING_DATABASE).length} paintings in database`,
      );
    },
  };

  window.VRWPaintings = VRWPaintings;
})();
