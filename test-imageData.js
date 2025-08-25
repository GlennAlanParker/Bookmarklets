(() => {
    try {
        const LSK = "imgDataOverlay_v1";

        if (window._imgData?.cleanup) window._imgData.cleanup();

        const d = document;
        const badges = [];
        const items = [];
        let n = 1, badgeSize = 26, vGap = 6, margin = 6;

        window._imgData = {
            badges,
            badgesVisible: true,
            cleanup() {
                try {
                    badges.forEach(b => b.box?.remove());
                    badges.length = 0;
                    if (this.scrollHandler) removeEventListener("scroll", this.scrollHandler);
                    if (this.resizeHandler) removeEventListener("resize", this.resizeHandler);
                    if (this.interval) clearInterval(this.interval);
                    if (this.overlay) this.overlay.remove();
                } catch (e) { console.warn("Cleanup error", e); }
            }
        };

        // Gather images
        const imgs = [...d.images].filter(e => {
            const s = (e.src || "").toLowerCase();
            const alt = (e.alt || "").toLowerCase();
            return s && !s.includes("qrcode") && !alt.includes("qr") && !s.startsWith("data:");
        });

        const createBadge = (img, index) => {
            const a = d.createElement("a");
            a.href = img.src;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = index;
            Object.assign(a.style, {
                position: "absolute",
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
                userSelect: "none",
                cursor: "pointer",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                zIndex: 2147483648,
            });
            d.body.appendChild(a);
            badges.push({ img, box: a });
        };

        // Collect item data
        for (const img of imgs) {
            const name = (img.src.split("/").pop().split("?")[0]) || "";
            if (!name) continue;
            img.id = `imgData_${n}`;
            const caption = (img.closest("figure")?.querySelector("figcaption")?.textContent || "").trim() || "None";
            items.push({
                name,
                dim: `${img.naturalWidth}×${img.naturalHeight} actual, ${img.width}×${img.height} rendered`,
                size: "Fetching...",
                alt: img.alt || "None",
                caption,
                url: img.src,
                anchorId: img.id
            });
            createBadge(img, n);
            n++;
        }

        const updateBadgePositions = () => {
            const placed = [];
            for (const b of badges) {
                try {
                    const r = b.img.getBoundingClientRect();
                    let x = Math.max(margin, Math.min(d.documentElement.scrollWidth - badgeSize - margin, Math.round(r.left + scrollX - 8)));
                    let y = Math.max(margin, Math.min(d.documentElement.scrollHeight - badgeSize - margin, Math.round(r.top + scrollY - 8)));
                    for (const p of placed) {
                        if (Math.abs(p.x - x) < badgeSize + 8 && !((y + badgeSize + vGap < p.y) || y > p.y + p.bh + vGap)) {
                            y = p.y + p.bh + vGap;
                            y = Math.min(y, d.documentElement.scrollHeight - badgeSize - margin);
                        }
                    }
                    Object.assign(b.box.style, {
                        left: x + "px",
                        top: y + "px",
                        display: window._imgData.badgesVisible ? "flex" : "none"
                    });
                    placed.push({ x, y, bw: badgeSize, bh: badgeSize });
                } catch {}
            }
        };

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
            top: "10px",
            right: "0",
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

        // Top/Bottom bars
        const mkbar = pos => {
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
                // Title
                const title = d.createElement("h1");
                title.textContent = "Image Data";
                Object.assign(title.style, { margin: 0, color: "#fff", fontSize: "16px", textAlign: "left" });
                b.appendChild(title);

                // Buttons container
                const btns = d.createElement("div");
                btns.style.display = "flex";
                btns.style.alignItems = "center";
                btns.style.gap = "8px";

                // Toggle badges
                const toggleGroup = d.createElement("div");
                const toggleHeight = badgeSize + 6;
                Object.assign(toggleGroup.style, { display: "flex", alignItems: "center", background: "#95a5a6", borderRadius: "6px", padding: "2px 6px", cursor: "pointer", userSelect: "none", height: toggleHeight + "px" });
                const label = d.createElement("span");
                label.textContent = "Toggle Badges";
                Object.assign(label.style, { fontSize: "12px", marginRight: "6px" });
                toggleGroup.appendChild(label);

                const toggleBtn = d.createElement("button");
                toggleBtn.textContent = "🔢";
                toggleBtn.title = "Toggle Number Badges";
                Object.assign(toggleBtn.style, { border: "none", background: "transparent", fontSize: "14px", cursor: "pointer" });
                toggleGroup.appendChild(toggleBtn);

                toggleGroup.onclick = e => {
                    e.stopPropagation();
                    window._imgData.badgesVisible = !window._imgData.badgesVisible;
                    badges.forEach(bb => bb.box.style.display = window._imgData.badgesVisible ? "flex" : "none");
                };

                btns.appendChild(toggleGroup);

                // Close button
                const x = d.createElement("div");
                x.textContent = "×";
                Object.assign(x.style, {
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "0",
                    margin: "0 0 0 12px",
                    borderRadius: "50%",
                    width: (badgeSize + 6) + "px",
                    height: (badgeSize + 6) + "px",
                    background: "#e74c3c",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                });
                x.title = "Close";
                x.setAttribute("data-drag-ignore", "1");
                x.onclick = e => { e.stopPropagation(); o.remove(); window._imgData.cleanup(); };
                btns.appendChild(x);

                b.appendChild(btns);
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
            txt.innerHTML = "";
            if (!items.length) { txt.textContent = "No images found."; return; }
            items.forEach((it, i) => {
                const entry = d.createElement("div");
                entry.style.display = "flex";
                entry.style.alignItems = "flex-start";
                entry.style.padding = "4px 0";

                const badgeDiv = d.createElement("div");
                badgeDiv.style.flex = `0 0 ${badgeSize}px`;
                badgeDiv.style.display = "flex";
                badgeDiv.style.alignItems = "center";
                badgeDiv.style.justifyContent = "center";
                badgeDiv.style.paddingRight = "10px"; // Add 10px padding to the right

                const link = d.createElement("a");
                link.href = `#${it.anchorId}`;
                link.textContent = i + 1;
                Object.assign(link.style, {
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
                    userSelect: "none",
                    textDecoration: "none",
                    borderRadius: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    cursor: "pointer"
                });
                link.addEventListener("click", e => {
                    e.preventDefault();
                    const el = d.getElementById(it.anchorId);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                });

                badgeDiv.appendChild(link);
                entry.appendChild(badgeDiv);

                const infoDiv = d.createElement("div");
                infoDiv.style.flex = "1";
                infoDiv.innerHTML = `
                    <div><strong>Name:</strong> ${it.name}</div>
                    <div><strong>Dimensions:</strong> ${it.dim}</div>
                    <div><strong>Size:</strong> ${it.size}</div>
                    <div><strong>Alt:</strong> ${it.alt}</div>
                    <div><strong>Caption:</strong> ${it.caption}</div>
                    <div><strong>URL:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer">${it.url}</a></div>
                `;
                entry.appendChild(infoDiv);
                txt.appendChild(entry);

                const hr = d.createElement("hr");
                Object.assign(hr.style, { margin: "4px 0", border: "none", borderTop: "1px solid #ccc" });
                txt.appendChild(hr);
            });
            autosize();
        };

        update();
        o.append(mkbar("top"), txt, mkbar("bottom"));
        d.body.appendChild(o);

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

        // Drag logic
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

        // Resizers (same as before)
        ["n","s","e","w","ne","nw","se","sw"].forEach(dir => {
            const h = d.createElement("div");
            Object.assign(h.style, {
                position: "absolute",
                width: "8px",
                height: "8px",
                background: "#09f",
                opacity: "0.85",
                zIndex: "2147483648",
                borderRadius: "2px",
                cursor: dir + "-resize",
                transition: "box-shadow 0.15s, transform 0.15s"
            });
            if (dir.includes("n")) h.style.top = "0";
            if (dir.includes("s")) h.style.bottom = "0";
            if (dir.includes("e")) h.style.right = "0";
            if (dir.includes("w")) h.style.left = "0";
            if (["n","s"].includes(dir)) { h.style.left = "50%"; h.style.marginLeft = "-4px"; }
            if (["e","w"].includes(dir)) { h.style.top = "50%"; h.style.marginTop = "-4px"; }
            h.addEventListener("mouseenter", () => { h.style.boxShadow = "0 0 8px 2px rgba(0,150,255,0.9)"; h.style.transform = "scale(1.2)"; });
            h.addEventListener("mouseleave", () => { h.style.boxShadow = "none"; h.style.transform = "scale(1)"; });

            h.addEventListener("pointerdown", e => {
                e.preventDefault(); e.stopPropagation();
                let startX = e.clientX, startY = e.clientY;
                const r = o.getBoundingClientRect();
                let startW = r.width, startH = r.height, startL = r.left, startT = r.top;
                const onMove = me => {
                    let dx = me.clientX - startX, dy = me.clientY - startY;
                    let w = startW, hH = startH, l = startL, t = startT;
                    if (dir.includes("e")) w = Math.max(200, startW + dx);
                    if (dir.includes("s")) hH = Math.max(100, startH + dy);
                    if (dir.includes("w")) { w = Math.max(200, startW - dx); l = startL + dx; }
                    if (dir.includes("n")) { hH = Math.max(100, startH - dy); t = startT + dy; }
                    o.style.width = w + "px";
                    o.style.height = hH + "px";
                    o.style.left = l + "px";
                    o.style.top = t + "px";
                    o.style.right = "auto";
                };
                const onUp = () => { d.removeEventListener("pointermove", onMove); d.removeEventListener("pointerup", onUp); };
                d.addEventListener("pointermove", onMove);
                d.addEventListener("pointerup", onUp);
            });

            o.appendChild(h);
        });

    } catch (e) { console.error(e); }
})();
