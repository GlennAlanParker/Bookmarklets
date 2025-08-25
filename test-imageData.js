(() => {
    try {
        const d = document;
        const badges = [];
        const items = [];
        let badgeSize = 26, n = 1, vGap = 6, margin = 6;

        // Cleanup previous overlay
        if (window._imgData?.cleanup) window._imgData.cleanup();

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

        // Collect images
        const imgs = [...d.images].filter(img => img.src && !img.src.startsWith("data:") && !img.src.toLowerCase().includes("qrcode") && img.naturalWidth > 0);
        if (!imgs.length) return alert("No suitable images found.");

        // Create badges
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
                cursor: "grab",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                zIndex: 2147483648,
            });
            d.body.appendChild(a);

            // Drag logic for badges
            let drag = null;
            a.onpointerdown = e => { e.preventDefault(); drag = { dx: e.clientX - a.offsetLeft, dy: e.clientY - a.offsetTop }; };
            d.addEventListener("pointermove", e => { if (drag) { a.style.left = e.clientX - drag.dx + "px"; a.style.top = e.clientY - drag.dy + "px"; } });
            d.addEventListener("pointerup", () => drag = null);

            badges.push({ img, box: a });
        };

        // Collect image data
        for (const img of imgs) {
            const name = img.src.split("/").pop().split("?")[0] || "";
            if (!name) continue;
            img.id = `imgData_${n}`;
            const caption = img.closest("figure")?.querySelector("figcaption")?.textContent.trim() || "None";

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

        // Badge position updater
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

        // Overlay panel
        const overlay = d.createElement("div");
        overlay.id = "img-data-overlay";
        Object.assign(overlay.style, {
            position: "fixed",
            top: "10px",
            right: "0",
            width: "520px",
            height: "350px",
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
        window._imgData.overlay = overlay;

        const headerH = 56, footerH = 28;

        // Top and bottom bars
        const mkbar = pos => {
            const b = d.createElement("div");
            Object.assign(b.style, {
                height: pos === "top" ? headerH + "px" : footerH + "px",
                display: "flex",
                alignItems: "center",
                justifyContent: pos === "top" ? "flex-start" : "flex-end",
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
                Object.assign(title.style, {
                    margin: 0,
                    marginLeft: "20px",
                    color: "#fff",
                    fontSize: "18px",
                    lineHeight: headerH + "px"
                });
                b.appendChild(title);

                // Toggle badges
                const toggleBtn = d.createElement("button");
                toggleBtn.textContent = "🔢";
                toggleBtn.title = "Toggle Number Badges";
                Object.assign(toggleBtn.style, { fontSize: "14px", cursor: "pointer", marginLeft: "20px" });
                toggleBtn.onclick = e => {
                    e.stopPropagation();
                    window._imgData.badgesVisible = !window._imgData.badgesVisible;
                    badges.forEach(bb => bb.box.style.display = window._imgData.badgesVisible ? "flex" : "none");
                };
                b.appendChild(toggleBtn);

                // Close button
                const closeBtn = d.createElement("div");
                closeBtn.textContent = "×";
                Object.assign(closeBtn.style, {
                    cursor: "pointer",
                    fontSize: "16px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#e74c3c",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "10px"
                });
                closeBtn.onclick = e => { e.stopPropagation(); overlay.remove(); window._imgData.cleanup(); };
                b.appendChild(closeBtn);
            }
            b.setAttribute("data-drag-handle", "1");
            return b;
        };

        const content = d.createElement("div");
        Object.assign(content.style, { flex: "1", overflow: "auto", padding: "10px", background: "#fff" });

        const footer = mkbar("bottom"); // Footer placeholder

        const updateOverlay = () => {
            content.innerHTML = "";
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
                badgeDiv.style.marginRight = "10px";

                const link = d.createElement("a");
                link.href = `#${it.anchorId}`;
                link.textContent = i + 1;
                Object.assign(link.style, {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: badgeSize + "px",
                    height: badgeSize + "px",
                    background: "#FFA500",
                    borderRadius: "4px",
                    color: "#000",
                    fontWeight: "700",
                    textDecoration: "none",
                    textAlign: "center",
                    lineHeight: badgeSize + "px",
                    cursor: "pointer"
                });
                link.onclick = e => { e.preventDefault(); const el = d.getElementById(it.anchorId); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); };
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
                content.appendChild(entry);

                const hr = d.createElement("hr");
                Object.assign(hr.style, { margin: "4px 0", border: "none", borderTop: "1px solid #ccc" });
                content.appendChild(hr);
            });
        };

        updateOverlay();
        overlay.append(mkbar("top"), content, footer);
        d.body.appendChild(overlay);

        // Fetch actual image sizes
        items.forEach(it => {
            fetch(it.url, { method: "HEAD" })
                .then(r => {
                    const cl = r.headers.get("content-length");
                    it.size = cl ? (+cl / 1024).toFixed(1) + " KB" : "Unknown";
                    updateOverlay();
                })
                .catch(() => { it.size = "Error"; updateOverlay(); });
        });

        setTimeout(updateBadgePositions, 100);
    } catch (e) { console.error(e); }
})();
