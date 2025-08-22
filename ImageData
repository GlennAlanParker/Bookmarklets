javascript:(() => {
  try {
    const LSK = "imgDataOverlay_v1";

    if (window._imgData?.cleanup) window._imgData.cleanup();

    const d = document;

    window._imgData = {
      badges: [],
      badgesVisible: true,
      cleanup() {
        try {
          this.badges?.forEach(b => b.box?.remove());
          this.badges = [];
          this.scrollHandler && removeEventListener("scroll", this.scrollHandler);
          this.resizeHandler && removeEventListener("resize", this.resizeHandler);
          this.interval && clearInterval(this.interval);
          this.overlay && this.overlay.remove();
        } catch (e) {
          console.warn("Cleanup error", e);
        }
      }
    };

    const imgs = [...d.images];
    const items = [];
    const badges = window._imgData.badges;
    let n = 1;
    const badgeSize = 26, vGap = 6, margin = 6;

    const updateBadgePositions = () => {
      const placed = [];
      for (const b of badges) {
        try {
          const r = b.img.getBoundingClientRect();
          const docX = r.left + scrollX;
          let y = r.top + scrollY;
          const bw = badgeSize, bh = badgeSize;
          let x = Math.max(margin, Math.min(d.documentElement.scrollWidth - bw - margin, Math.round(docX - 8)));
          y = Math.max(margin, Math.min(d.documentElement.scrollHeight - bh - margin, Math.round(y - 8)));

          for (const p of placed) {
            if (Math.abs(p.x - x) < bw + 8 && !((y + bh + vGap < p.y) || y > p.y + p.bh + vGap)) {
              y = p.y + p.bh + vGap;
              y = Math.min(y, d.documentElement.scrollHeight - bh - margin);
            }
          }

          Object.assign(b.box.style, {
            left: x + "px",
            top: y + "px",
            opacity: "1",
            alignItems: "center",
            justifyContent: "center",
            display: window._imgData.badgesVisible ? "flex" : "none"
          });

          placed.push({ x, y, bw, bh });
        } catch { }
      }
    };

    for (const e of imgs) {
      try {
        const s = (e.src || "").trim();
        const sl = s.toLowerCase();
        const alt = (e.alt || "").toLowerCase();

        if (!s || sl.includes("qrcode") || alt.includes("qr") || sl.startsWith("data:")) continue;

        const name = (s.split("/").pop().split("?")[0]) || "";
        if (!name) continue;

        e.id = `imgData_${n}`;
        items.push({
          name,
          dim: `${e.naturalWidth}×${e.naturalHeight} actual, ${e.width}×${e.height} rendered`,
          size: "Fetching...",
          alt: e.alt || "None",
          caption: (e.closest("figure")?.querySelector("figcaption")?.textContent || "").trim()
            .replace(/\(.*?\)/g, "")
            .replace(/Open image in slideshow/gi, "")
            .trim() || "None",
          url: e.src,
          anchorId: e.id
        });

        const a = d.createElement("a");
        a.textContent = n;
        a.href = e.src;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        Object.assign(a.style, {
          position: "absolute",
          top: "0",
          left: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFA500",
          color: "#000",
          fontWeight: "700",
          fontSize: "14px",
          border: "2px solid #000",
          width: badgeSize + "px",
          height: badgeSize + "px",
          lineHeight: badgeSize + "px",
          textAlign: "center",
          pointerEvents: "auto",
          userSelect: "none",
          zIndex: 2147483648,
          textDecoration: "none",
          opacity: "1",
          transition: "opacity .12s ease",
          cursor: "pointer",
          borderRadius: "50%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        });

        d.body.appendChild(a);
        badges.push({ img: e, box: a });
        n++;
      } catch { }
    }

    updateBadgePositions();
    setTimeout(updateBadgePositions, 80);

    window._imgData.scrollHandler = () => updateBadgePositions();
    addEventListener("scroll", window._imgData.scrollHandler);

    window._imgData.resizeHandler = () => updateBadgePositions();
    addEventListener("resize", window._imgData.resizeHandler);

    window._imgData.interval = setInterval(updateBadgePositions, 300);

    const o = d.createElement("div");
    o.id = "img-data-overlay";
    window._imgData.overlay = o;

    Object.assign(o.style, {
      position: "fixed",
      right: "0px",
      left: "auto",
      top: "10px",
      width: "520px",
      height: "240px",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
      background: "#f8f9fa",
      color: "#1a1a1a",
      font: "12px 'Courier New', monospace",
      zIndex: 2147483647,
      whiteSpace: "pre-wrap",
      border: "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      boxSizing: "border-box",
      overflow: "hidden"
    });

    const headerH = 56, footerH = 56;

    const makeGrip = () => {
      const g = d.createElement("div");
      Object.assign(g.style, {
        width: "42px",
        height: "18px",
        borderRadius: "4px",
        marginRight: "8px",
        background: "repeating-linear-gradient(90deg,#888 0 4px,transparent 4 8px)"
      });
      return g;
    };

    const mkbar = pos => {
      const b = d.createElement("div");
      Object.assign(b.style, {
        height: headerH + "px",
        display: "flex",
        alignItems: "center",
        justifyContent: pos === "top" ? "space-between" : "flex-end",
        padding: "6px 10px",
        background: "#34495e",
        color: "#fff",
        fontWeight: 700,
        cursor: "grab",
        userSelect: "none",
        borderBottom: pos === "top" ? "1px solid rgba(0,0,0,0.08)" : "none",
        borderTop: pos === "bottom" ? "1px solid rgba(0,0,0,0.08)" : "none",
        flexShrink: 0
      });

      if (pos === "top") {
        const left = d.createElement("div");
        left.style.display = "flex";
        left.style.alignItems = "center";
        left.appendChild(makeGrip());

        const title = d.createElement("div");
        title.textContent = "IMAGE DATA";
        left.appendChild(title);
        b.appendChild(left);

        const btns = d.createElement("div");
        btns.style.display = "flex";
        btns.style.alignItems = "center";
        btns.style.gap = "8px";

        const toggleGroup = d.createElement("div");
        Object.assign(toggleGroup.style, {
          display: "flex",
          alignItems: "center",
          background: "#95a5a6",
          borderRadius: "6px",
          padding: "2px 6px",
          cursor: "pointer",
          userSelect: "none"
        });

        const label = d.createElement("span");
        label.textContent = "Toggle Badges";
        label.style.fontSize = "12px";
        label.style.marginRight = "6px";
        label.setAttribute("data-drag-ignore", "1");
        label.onpointerdown = e => e.stopPropagation();

        const toggleBtn = d.createElement("button");
        toggleBtn.textContent = "🔢";
        toggleBtn.title = "Toggle Number Badges";
        Object.assign(toggleBtn.style, {
          border: "none",
          background: "transparent",
          fontSize: "14px",
          cursor: "pointer"
        });
        toggleBtn.setAttribute("data-drag-ignore", "1");
        toggleBtn.onpointerdown = e => e.stopPropagation();

        toggleGroup.onclick = e => {
          e.stopPropagation();
          toggleBadges();
          autosize();
        };
        toggleGroup.append(label, toggleBtn);
        btns.append(toggleGroup);

        const x = d.createElement("div");
        x.textContent = "×";
        Object.assign(x.style, {
          cursor: "pointer",
          fontSize: "20px",
          padding: "0",
          margin: "-6px 0 -6px 12px",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          background: "#e74c3c",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
        });
        x.title = "Close";
        x.setAttribute("data-drag-ignore", "1");
        x.onpointerdown = e => e.stopPropagation();
        x.onclick = e => {
          e.stopPropagation();
          o.remove();
          localStorage.removeItem(LSK);
          window._imgData.cleanup();
        };

        btns.append(x);
        b.appendChild(btns);
      }

      b.setAttribute("data-drag-handle", "1");
      return b;
    };

    const txt = d.createElement("div");
    Object.assign(txt.style, {
      padding: "10px",
      overflow: "auto",
      flex: "1",
      background: "#ffffff"
    });

    const autosize = () => {
      try {
        const contentH = txt.scrollHeight;
        const desired = headerH + contentH + footerH;
        const maxH = Math.floor(0.9 * innerHeight);
        const minH = 140;
        const h = Math.max(minH, Math.min(desired, maxH));
        o.style.height = h + "px";
      } catch { }
    };

    const update = () => {
      txt.innerHTML = items.length
        ? items.map((it, i) =>
          `<div style="display:flex;padding:8px 0;border-bottom:1px solid #eee;align-items:flex-start">
            <div style="flex:0 0 ${badgeSize}px;display:flex;align-items:center;justify-content:center;margin-right:8px;">
              <a href="#${it.anchorId}" onclick="document.getElementById('${it.anchorId}').scrollIntoView({behavior:'smooth',block:'center'});return false;" style="display:flex;align-items:center;justify-content:center;background:#FFA500;color:#000;font-weight:700;font-size:14px;border:2px solid #000;width:${badgeSize}px;height:${badgeSize}px;line-height:${badgeSize}px;text-align:center;user-select:none;text-decoration:none;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer">${i + 1}</a>
            </div>
            <div style="flex:1;">
              <div><strong>Name:</strong> ${it.name}</div>
              <div><strong>Dimensions:</strong> ${it.dim}</div>
              <div><strong>Size:</strong> ${it.size}</div>
              <div><strong>Alt:</strong> ${it.alt}</div>
              <div><strong>Caption:</strong> ${it.caption}</div>
              <div><strong>URL:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer">${it.url}</a></div>
            </div>
          </div>`
        ).join("")
        : "No images found.";
      autosize();
    };

    update();
    o.append(mkbar("top"), txt, mkbar("bottom"));
    d.body.appendChild(o);

    const savePos = () => {
      try {
        const r = o.getBoundingClientRect();
        localStorage.setItem(LSK, JSON.stringify({ l: r.left, t: r.top, w: r.width, h: r.height }));
      } catch { }
    };

    const loadPos = () => {
      try {
        const s = localStorage.getItem(LSK);
        if (!s) return;
        let p;
        try { p = JSON.parse(s); } catch { return void localStorage.removeItem(LSK); }
        o.style.left = p.l + "px";
        o.style.top = p.t + "px";
        o.style.width = p.w + "px";
        o.style.height = p.h + "px";
        o.style.right = "auto";
      } catch { }
    };

    const toggleBadges = () => {
      window._imgData.badgesVisible = !window._imgData.badgesVisible;
      for (const bb of window._imgData.badges) {
        bb.box.style.display = window._imgData.badgesVisible ? "flex" : "none";
      }
    };

    loadPos();

    items.forEach(it => {
      fetch(it.url, { method: "HEAD" })
        .then(r => {
          const cl = r.headers.get("content-length");
          it.size = cl ? (+cl / 1024).toFixed(1) + " KB" : "Unknown";
          update();
        })
        .catch(() => { it.size = "Error"; update(); });
    });

    setTimeout(() => { updateBadgePositions(); autosize(); }, 150);

    let drag = null;

    const startDrag = (e, t) => {
      if (e.target.closest("[data-drag-ignore]")) return;
      const r = o.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      t.style.cursor = "grabbing";
      e.preventDefault();
    };

    const onDrag = e => {
      if (!drag) return;
      const nx = e.clientX - drag.dx, ny = e.clientY - drag.dy;
      o.style.left = nx + "px";
      o.style.top = ny + "px";
      o.style.right = "auto";
    };

    const endDrag = e => {
      drag = null;
      d.querySelectorAll("[data-drag-handle]").forEach(b => b.style.cursor = "grab");
      savePos();
    };

    d.addEventListener("pointermove", onDrag);
    d.addEventListener("pointerup", endDrag);
    d.querySelectorAll("[data-drag-handle]").forEach(b => b.onpointerdown = e => startDrag(e, b));

    ["n", "s", "e", "w", "ne", "nw", "se", "sw"].forEach(dir => {
      const h = d.createElement("div");
      h.className = "resize-handle";
      Object.assign(h.style, {
        position: "absolute",
        background: "#09f",
        opacity: ".7",
        zIndex: "2147483647",
        borderRadius: "3px",
        cursor: dir + "-resize"
      });

      const sz = 10;
      dir.includes("n") && (h.style.top = "0");
      dir.includes("s") && (h.style.bottom = "0");
      dir.includes("e") && (h.style.right = "0");
      dir.includes("w") && (h.style.left = "0");

      if (["n", "s"].includes(dir)) {
        h.style.left = "50%";
        h.style.marginLeft = -sz / 2 + "px";
        h.style.width = sz + "px";
        h.style.height = sz + "px";
      } else if (["e", "w"].includes(dir)) {
        h.style.top = "50%";
        h.style.marginTop = -sz / 2 + "px";
        h.style.width = sz + "px";
        h.style.height = sz + "px";
      } else {
        h.style.width = sz + "px";
        h.style.height = sz + "px";
      }

      let startX, startY, startW, startH, startL, startT;

      h.addEventListener("pointerdown", e => {
        e.preventDefault();
        e.stopPropagation();
        startX = e.clientX;
        startY = e.clientY;

        const r = o.getBoundingClientRect();
        startW = r.width;
        startH = r.height;
        startL = r.left;
        startT = r.top;

        const onMove = me => {
          let dx = me.clientX - startX, dy = me.clientY - startY;
          let w = startW, h_ = startH, l = startL, t = startT;

          dir.includes("e") && (w = Math.max(200, startW + dx));
          dir.includes("s") && (h_ = Math.max(100, startH + dy));
          dir.includes("w") && (w = Math.max(200, startW - dx), l = startL + dx);
          dir.includes("n") && (h_ = Math.max(100, startH - dy), t = startT + dy);

          o.style.width = w + "px";
          o.style.height = h_ + "px";
          o.style.left = l + "px";
          o.style.top = t + "px";
          o.style.right = "auto";
        };

        const onUp = () => {
          d.removeEventListener("pointermove", onMove);
          d.removeEventListener("pointerup", onUp);
          savePos();
        };

        d.addEventListener("pointermove", onMove);
        d.addEventListener("pointerup", onUp);
      });

      o.appendChild(h);
    });

  } catch (e) {
    console.error(e);
  }
})();
