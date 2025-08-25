(() => {
    try {
        const LSK = "imgDataOverlay_v11";

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

        // Create badges with draggable handle
        const createBadge = (img, index) => {
            const wrapper = d.createElement("div");
            Object.assign(wrapper.style, {
                position: "absolute",
                left: "0px",
                top: "0px",
                width: badgeSize + "px",
                height: badgeSize + "px",
                zIndex: 2147483648,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            });

            const a = d.createElement("a");
            a.href = img.src;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = index;
            Object.assign(a.style, {
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
                position: "relative",
                overflow: "hidden",
                cursor: "pointer"
            });

            const handle = d.createElement("div");
            Object.assign(handle.style, {
                position: "absolute",
                bottom: "1px",
                right: "1px",
                width: "6px",
                height: "6px",
                background: "#09f",
                borderRadius: "50%",
                cursor: "grab",
                zIndex: 2147483649,
                boxShadow: "0 0 2px rgba(0,0,0,0.6)"
            });

            let drag = null, moved = false;
            handle.addEventListener("pointerdown", e => {
                e.stopPropagation(); e.preventDefault();
                drag = { dx: e.clientX - wrapper.getBoundingClientRect().left, dy: e.clientY - wrapper.getBoundingClientRect().top };
                moved = false;
                handle.setPointerCapture(e.pointerId);
            });
            handle.addEventListener("pointermove", e => {
                if (!drag) return;
                wrapper.style.left = (e.clientX - drag.dx + scrollX) + "px";
                wrapper.style.top = (e.clientY - drag.dy + scrollY) + "px";
                moved = true;
            });
            handle.addEventListener("pointerup", e => { drag = null; handle.releasePointerCapture(e.pointerId); });
            handle.addEventListener("pointercancel", e => { drag = null; handle.releasePointerCapture(e.pointerId); });

            a.addEventListener("click", e => {
                if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
                const el = d.getElementById(img.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            });

            wrapper.appendChild(a);
            wrapper.appendChild(handle);
            d.body.appendChild(wrapper);
            badges.push({ img, box: wrapper });
        };

        // Collect image data
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
                    Object.assign(b.box.style, { left: x + "px", top: y + "px", display: window._imgData.badgesVisible ? "flex" : "none" });
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
                const title = d.createElement("h1");
                title.textContent = "Image Data";
                Object.assign(title.style, { margin: 0, flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", color: "#fff", fontSize: "16px", paddingLeft: "20px" });
                b.appendChild(title);

                const btns = d.createElement("div");
                btns.style.display = "flex";
                btns.style.alignItems = "center";
                btns.style.gap = "8px";

                const toggleGroup = d.createElement("div");
                Object.assign(toggleGroup.style, { display: "flex", alignItems: "center", background: "#95a5a6", borderRadius: "6px", padding: "2px 6px", cursor: "pointer", userSelect: "none" });
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

                const x = d.createElement("div");
                x.textContent = "×";
                Object.assign(x.style, {
                    cursor: "pointer",
                    fontSize: "16px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#e74c3c",
                    color: "#fff"
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

        const updateOverlay = () => {
            txt.innerHTML = "";
            if (!items.length) { txt.textContent = "No images found."; return; }
            items.forEach((it, i) => {
                const entry = d.createElement("div");
                entry.style.display = "flex"; entry.style.alignItems = "flex-start"; entry.style.padding = "4px 0";

                const badgeDiv = d.createElement("div");
                badgeDiv.style.flex = `0 0 ${badgeSize}px`;
                badgeDiv.style.display = "flex";
                badgeDiv.style.alignItems = "center";
                badgeDiv.style.justifyContent = "center";
                badgeDiv.style.marginRight = "4px";

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
                link.addEventListener("click", e => { e.preventDefault(); const el = d.getElementById(it.anchorId); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); });
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
        };

        updateOverlay();
        o.append(mkbar("top"), txt, mkbar("bottom"));
        d.body.appendChild(o);

        // Fetch image sizes
        items.forEach(it => {
            fetch(it.url, { method: "HEAD" })
                .then(r => {
                    const cl = r.headers.get("content-length");
                    it.size = cl ? (+cl / 1024).toFixed(1) + " KB" : "Unknown";
                    updateOverlay();
                })
                .catch(() => { it.size = "Error"; updateOverlay(); });
        });

        console.log("Image Data Overlay v11 loaded successfully with full features.");

    } catch (e) { console.error(e); }
})();
