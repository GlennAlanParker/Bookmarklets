(() => {
    try {
        const LSK = "imgDataOverlay_v2";

        if (window._imgData?.cleanup) window._imgData.cleanup();

        const d = document;

        window._imgData = {
            badges: [],
            badgesVisible: true,
            cleanup() {
                try {
                    this.badges?.forEach(b => b.box?.remove());
                    this.badges = [];
                    if (this.scrollHandler) removeEventListener("scroll", this.scrollHandler);
                    if (this.resizeHandler) removeEventListener("resize", this.resizeHandler);
                    if (this.interval) clearInterval(this.interval);
                    if (this.overlay) this.overlay.remove();
                } catch (e) { console.warn("Cleanup error", e); }
            }
        };

        const imgs = [...d.images].filter(e => {
            const s = (e.src || "").toLowerCase();
            const alt = (e.alt || "").toLowerCase();
            return s && !s.includes("qrcode") && !alt.includes("qr") && !s.startsWith("data:");
        });

        const items = [];
        const badges = window._imgData.badges;
        let n = 1, badgeSize = 26, vGap = 6, margin = 6;

        const updateBadgePositions = () => {
            const placed = [];
            for (const b of badges) {
                try {
                    const r = b.img.getBoundingClientRect(),
                        docX = r.left + scrollX,
                        docY = r.top + scrollY,
                        bw = badgeSize, bh = badgeSize;
                    let x = Math.max(margin, Math.min(d.documentElement.scrollWidth - bw - margin, Math.round(docX - 8)));
                    let y = Math.max(margin, Math.min(d.documentElement.scrollHeight - bh - margin, Math.round(docY - 8)));
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
                        display: window._imgData.badgesVisible ? "flex" : "none"
                    });
                    placed.push({ x, y, bw, bh });
                } catch {}
            }
        };

        for (const e of imgs) {
            try {
                const name = (e.src.split("/").pop().split("?")[0]) || "";
                if (!name) continue;
                e.id = `imgData_${n}`;
                items.push({
                    name,
                    dim: `${e.naturalWidth}×${e.naturalHeight} actual, ${e.width}×${e.height} rendered`,
                    size: "Fetching...",
                    alt: e.alt || "None",
                    caption: (e.closest("figure")?.querySelector("figcaption")?.textContent || "").trim() || "None",
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
                    cursor: "pointer",
                    borderRadius: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    zIndex: 2147483648
                });
                d.body.appendChild(a);
                badges.push({ img: e, box: a });
                n++;
            } catch {}
        }

        updateBadgePositions();
        setTimeout(updateBadgePositions, 80);

        window._imgData.scrollHandler = updateBadgePositions;
        window._imgData.resizeHandler = updateBadgePositions;
        addEventListener("scroll", window._imgData.scrollHandler);
        addEventListener("resize", window._imgData.resizeHandler);
        window._imgData.interval = setInterval(updateBadgePositions, 300);

        // Overlay
        const o = d.createElement("div");
        o.id = "img-data-overlay";
        window._imgData.overlay = o;
        Object.assign(o.style, {
            position: "fixed",
            right: "0px",
            top: "10px",
            width: "520px",
            height: "240px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            background: "#f8f9fa",
            font: "12px Arial, sans-serif",
            zIndex: 2147483647,
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            overflow: "hidden"
        });

        const headerH = 56, footerH = 28;

        const mkbar = (pos) => {
            const b = d.createElement("div");
            Object.assign(b.style, {
                height: pos === "top" ? headerH + "px" : footerH + "px",
                display: "flex",
                alignItems: "center",
                justifyContent: pos === "top" ? "space-between" : "flex-end",
                padding: "6px 10px",
                background: "#34495e",
                color: "#fff",
                fontWeight: 700,
                cursor: "grab",
                userSelect: "none"
            });
            if (pos === "top") {
                const title = d.createElement("h1");
                title.textContent = "Image Data";
                title.style.margin = "0";
                title.style.flex = "1";
                title.style.display = "flex";
                title.style.alignItems = "center";
                title.style.justifyContent = "center";
                title.style.color = "#fff"; // white
                b.appendChild(title);
            }
            b.setAttribute("data-drag-handle", "1");
            return b;
        };

        const txt = d.createElement("div");
        Object.assign(txt.style, { padding: "10px", overflow: "auto", flex: "1", background: "#fff" });

        const autosize = () => {
            const h = Math.max(140, Math.min(headerH + txt.scrollHeight + footerH, Math.floor(0.9 * innerHeight)));
            o.style.height = h + "px";
        };

        const update = () => {
            txt.innerHTML = items.length
                ? items.map((it, i) => `
                    <div style="display:flex;padding:4px 0;align-items:flex-start">
                        <div style="flex:0 0 ${badgeSize}px;display:flex;align-items:center;justify-content:center;margin-right:4px;">
                            <a href="#${it.anchorId}" onclick="document.getElementById('${it.anchorId}').scrollIntoView({behavior:'smooth',block:'center'});return false;" style="display:flex;align-items:center;justify-content:center;background:#FFA500;color:#000;font-weight:700;font-size:14px;border:2px solid #000;width:${badgeSize}px;height:${badgeSize}px;line-height:${badgeSize}px;text-align:center;user-select:none;text-decoration:none;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer">${i+1}</a>
                        </div>
                        <div style="flex:1;">
                            <div><strong>Name:</strong> ${it.name}</div>
                            <div><strong>Dimensions:</strong> ${it.dim}</div>
                            <div><strong>Size:</strong> ${it.size}</div>
                            <div><strong>Alt:</strong> ${it.alt}</div>
                            <div><strong>Caption:</strong> ${it.caption}</div>
                            <div><strong>URL:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer">${it.url}</a></div>
                        </div>
                    </div>
                    <hr style="margin:4px 0;border:none;border-top:1px solid #ccc;">
                `).join('')
                : "No images found.";
            autosize();
        };

        update();
        o.append(mkbar("top"), txt, mkbar("bottom"));
        d.body.appendChild(o);

        // fetch sizes
        items.forEach(it => {
            fetch(it.url, { method: "HEAD" })
                .then(r => {
                    const cl = r.headers.get("content-length");
                    it.size = cl ? (+cl / 1024).toFixed(1) + " KB" : "Unknown";
                    update();
                })
                .catch(() => { it.size = "Error"; update(); });
        });

        setTimeout(updateBadgePositions, 150);

        // drag
        let drag = null;
        const startDrag = (e) => {
            if (e.target.closest("[data-drag-ignore]")) return;
            const r = o.getBoundingClientRect();
            drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
            e.preventDefault();
        };
        const onDrag = (e) => { if (!drag) return; o.style.left = (e.clientX - drag.dx) + "px"; o.style.top = (e.clientY - drag.dy) + "px"; o.style.right = "auto"; };
        const endDrag = () => { drag = null; };
        d.addEventListener("pointermove", onDrag);
        d.addEventListener("pointerup", endDrag);
        d.querySelectorAll("[data-drag-handle]").forEach(b => b.onpointerdown = startDrag);

    } catch (e) { console.error(e); }
})();
