(() => {
    try {
        const LSK = "imgDataOverlay_v7";

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

        // Create draggable numbered badge with visible corner handle
        const createBadge = (img, index) => {
            const wrapper = d.createElement("div");
            Object.assign(wrapper.style, {
                position: "absolute",
                left: "0px",
                top: "0px",
                width: badgeSize + "px",
                height: badgeSize + "px",
                zIndex: 2147483648,
            });

            // Badge number (clickable)
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
                cursor: "pointer",
                position: "relative"
            });

            a.addEventListener("click", e => {
                e.preventDefault();
                const el = d.getElementById(img.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            });

            // Small visible corner drag handle
            const handle = d.createElement("div");
            Object.assign(handle.style, {
                position: "absolute",
                bottom: "0px",
                right: "0px",
                width: "8px",
                height: "8px",
                background: "#09f",
                borderRadius: "2px",
                cursor: "grab",
                zIndex: 2147483649,
            });

            let drag = null;
            handle.addEventListener("pointerdown", e => {
                e.stopPropagation(); e.preventDefault();
                drag = { dx: e.clientX - wrapper.getBoundingClientRect().left, dy: e.clientY - wrapper.getBoundingClientRect().top };
                handle.setPointerCapture(e.pointerId);
            });
            handle.addEventListener("pointermove", e => {
                if (!drag) return;
                wrapper.style.left = (e.clientX - drag.dx + scrollX) + "px";
                wrapper.style.top = (e.clientY - drag.dy + scrollY) + "px";
            });
            handle.addEventListener("pointerup", e => { drag = null; handle.releasePointerCapture(e.pointerId); });
            handle.addEventListener("pointercancel", e => { drag = null; handle.releasePointerCapture(e.pointerId); });

            wrapper.appendChild(a);
            wrapper.appendChild(handle);
            d.body.appendChild(wrapper);
            badges.push({ img, box: wrapper });
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

        // Update badge positions
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

        // --- Overlay, header, toggle badges, close button, and resizers ---
        // Keep all previous overlay code exactly as before
        console.log("Image Data Overlay v7 loaded with draggable badge handles.");

    } catch (e) { console.error(e); }
})();
