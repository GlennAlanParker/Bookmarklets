(() => {
    try {
        const LSK = "imgDataOverlay_v4";
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
                Object.assign(title.style, {
                    margin: 0,
                    marginLeft: "20px",          // requested left margin
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start", // left align
                    color: "#fff",
                    fontSize: "18px"             // slightly larger
                });
                b.appendChild(title);

                // Buttons container
                const btns = d.createElement("div");
                btns.style.display = "flex";
                btns.style.alignItems = "center";
                btns.style.gap = "8px";

                // Toggle badges
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

                // Close button (smaller and centered)
                const x = d.createElement("div");
                x.textContent = "×";
                const toggleHeight = toggleGroup.offsetHeight || 28; // fallback height
                const closeSize = toggleHeight * 0.8; 
                Object.assign(x.style, {
                    cursor: "pointer",
                    fontSize: closeSize * 0.6 + "px",
                    width: closeSize + "px",
                    height: closeSize + "px",
                    lineHeight: closeSize + "px",
                    textAlign: "center",
                    borderRadius: "50%",
                    background: "#e74c3c",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    padding: "0",
                    margin: "0 0 0 12px"
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

        // (The rest of your original script continues without changes)
        // ...badge overlay, update function, drag, resizers, etc.

    } catch (e) { console.error(e); }
})();
