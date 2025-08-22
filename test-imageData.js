(() => {
  try {
    const LSK = "imgDataOverlay_v1";

    if (window._imgData?.cleanup) window._imgData.cleanup();

    const d = document;

    window._imgData = {
      badges: [],
      badgesVisible: true,
      scrollHandler: null,
      resizeHandler: null,
      keyHandler: null,
      panel: null,
      cleanup() {
        try {
          this.badges?.forEach(b => b.box?.remove());
          this.badges = [];
          this.scrollHandler && removeEventListener("scroll", this.scrollHandler);
          this.resizeHandler && removeEventListener("resize", this.resizeHandler);
          this.keyHandler && removeEventListener("keydown", this.keyHandler);
          this.panel?.remove();
        } catch (e) { console.warn(e); }
      }
    };

    // Add keyframe animations
    const style = d.createElement("style");
    style.textContent = `
      @keyframes pulseBadge {
        0% { transform: scale(1); box-shadow: 0 1px 4px rgba(0,0,0,0.3) }
        50% { transform: scale(1.08); box-shadow: 0 3px 10px rgba(0,0,0,0.4) }
        100% { transform: scale(1); box-shadow: 0 1px 4px rgba(0,0,0,0.3) }
      }
      @keyframes pulseOverlay {
        0% { transform: scale(1); box-shadow: 0 1px 2px rgba(0,0,0,0.2) }
        50% { transform: scale(1.04); box-shadow: 0 2px 6px rgba(0,0,0,0.25) }
        100% { transform: scale(1); box-shadow: 0 1px 2px rgba(0,0,0,0.2) }
      }
    `;
    d.head.appendChild(style);

    // Create overlay panel
    const overlay = d.createElement("div");
    overlay.id = LSK;
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      right: "0",
      width: "420px",
      height: "100%",
      background: "#fff",
      borderLeft: "3px solid #000",
      boxShadow: "-2px 0 5px rgba(0,0,0,.3)",
      zIndex: 2147483647,
      font: "14px/1.4 sans-serif",
      color: "#000",
      display: "flex",
      flexDirection: "column"
    });
    d.body.appendChild(overlay);

    // Header
    const header = d.createElement("h1");
    header.textContent = "Image Data";
    Object.assign(header.style, {
      margin: "0",
      padding: "10px",
      background: "#000",
      color: "#fff",
      textAlign: "center",
      fontSize: "18px",
      fontWeight: "700"
    });
    overlay.appendChild(header);

    // Scrollable content
    const scrollBox = d.createElement("div");
    Object.assign(scrollBox.style, {
      flex: "1",
      overflow: "auto",
      padding: "10px"
    });
    overlay.appendChild(scrollBox);

    const txt = d.createElement("div");
    scrollBox.appendChild(txt);

    // Footer
    const footer = d.createElement("div");
    footer.textContent = "Press Esc to close";
    Object.assign(footer.style, {
      padding: "6px",
      background: "#f0f0f0",
      borderTop: "1px solid #ccc",
      textAlign: "right",
      fontSize: "12px",
      color: "#555"
    });
    overlay.appendChild(footer);

    const badgeSize = 28;
    const items = [];

    // Function to create floating badges
    const makeBadge = (num, anchorId, offset = 0) => {
      const b = d.createElement("div");
      Object.assign(b.style, {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: `${badgeSize}px`,
        height: `${badgeSize}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFA500",
        color: "#000",
        fontWeight: "700",
        fontSize: "14px",
        border: "2px solid #000",
        textAlign: "center",
        userSelect: "none",
        textDecoration: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        cursor: "pointer",
        zIndex: 2147483646,
        transition: "all .2s ease"
      });
      b.textContent = num;
      b.onmouseover = () => {
        b.style.background = "#ff8c00";
        b.style.animation = `pulseBadge 1s ease-in-out ${offset}s infinite`;
      };
      b.onmouseout = () => {
        b.style.background = "#FFA500";
        b.style.animation = "";
        b.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";
        b.style.transform = "scale(1)";
      };
      b.onclick = e => {
        e.preventDefault();
        document.getElementById(anchorId).scrollIntoView({ behavior: "smooth", block: "center" });
      };
      return b;
    };

    // Collect images
    d.querySelectorAll("img").forEach((img, i) => {
      if (!img.src) return;
      const anchorId = `imgData_${Date.now()}_${i}`;
      img.id = img.id || anchorId;

      // Stagger offset for pulse effect
      const offset = (i % 5) * 0.1;
      const box = makeBadge(i + 1, anchorId, offset);
      d.body.appendChild(box);
      window._imgData.badges.push({ img, box });

      items.push({
        anchorId: img.id,
        name: img.src.split("/").pop() || "(no name)",
        dim: `${img.naturalWidth}×${img.naturalHeight}`,
        size: "?",
        alt: img.alt || "(none)",
        caption: img.title || img.closest("figure")?.querySelector("figcaption")?.innerText || "(none)",
        url: img.src
      });
    });

    // Update overlay content
    const update = () => {
      txt.innerHTML = items.length ? items.map((it, i) => `
        <div style="display:flex;padding:8px 0;border-bottom:1px solid #eee;align-items:flex-start">
          <div style="flex:0 0 ${badgeSize}px;display:flex;align-items:center;justify-content:center;margin-right:8px;">
            <a href="#${it.anchorId}"
              onclick="document.getElementById('${it.anchorId}').scrollIntoView({behavior:'smooth',block:'center'});return false;"
              style="display:flex;align-items:center;justify-content:center;
                     background:#FFA500;color:#000;font-weight:700;font-size:14px;
                     border:2px solid #000;width:${badgeSize}px;height:${badgeSize}px;
                     text-align:center;user-select:none;text-decoration:none;
                     box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;
                     transition:all .2s ease"
              onmouseover="this.style.background='#ff8c00';this.style.animation='pulseOverlay 1.2s ease-in-out infinite'"
              onmouseout="this.style.background='#FFA500';this.style.animation='';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)';this.style.transform='scale(1)'">
              ${i + 1}
            </a>
          </div>
          <div style="flex:1;line-height:1.4">
            <div style="display:flex;align-items:center;gap:6px;">
              <a href="#${it.anchorId}"
                onclick="document.getElementById('${it.anchorId}').scrollIntoView({behavior:'smooth',block:'center'});return false;"
                style="display:flex;align-items:center;justify-content:center;
                       background:#FFA500;color:#000;font-weight:700;font-size:14px;
                       border:2px solid #000;width:${badgeSize}px;height:${badgeSize}px;
                       text-align:center;user-select:none;text-decoration:none;
                       box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;
                       transition:all .2s ease"
                onmouseover="this.style.background='#ff8c00';this.style.animation='pulseOverlay 1.2s ease-in-out infinite'"
                onmouseout="this.style.background='#FFA500';this.style.animation='';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)';this.style.transform='scale(1)'">
                ${i + 1}
              </a>
              <span><strong>Name:</strong> ${it.name}</span>
            </div>
            <span><strong>Dimensions:</strong> ${it.dim}</span><br>
            <span><strong>Size:</strong> ${it.size}</span><br>
            <span><strong>Alt:</strong> ${it.alt}</span><br>
            <span><strong>Caption:</strong> ${it.caption}</span><br>
            <span><strong>URL:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer">${it.url}</a></span>
          </div>
        </div>
      `).join("") : "No images found.";
      autosize();
    };

    // Autosize overlay
    const autosize = () => {
      overlay.style.height = window.innerHeight + "px";
      overlay.style.width = "420px";
    };

    update();

    // Scroll badges with page
    window._imgData.scrollHandler = () => {
      window._imgData.badges.forEach(({ img, box }) => {
        const r = img.getBoundingClientRect();
        box.style.top = window.scrollY + r.top + "px";
        box.style.left = window.scrollX + r.left + "px";
      });
    };

    window._imgData.resizeHandler = autosize;

    // ESC to close
    window._imgData.keyHandler = e => {
      if (e.key === "Escape") {
        window._imgData.cleanup();
        delete window._imgData;
      }
    };

    addEventListener("scroll", window._imgData.scrollHandler);
    addEventListener("resize", window._imgData.resizeHandler);
    addEventListener("keydown", window._imgData.keyHandler);

  } catch (e) {
    alert("Bookmarklet error: " + e);
  }
})();
