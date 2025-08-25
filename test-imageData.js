(() => {
    try {
        const LSK = "imgDataOverlay_v4";

        if (window._imgData?.cleanup) window._imgData.cleanup();

        const d = document;
        const badges = [];
        const items = [];
        let n = 1, badgeSize = 26, vGap = 6, margin = 6;

        // Create shadow host container
        const shadowHost = d.createElement('div');
        shadowHost.id = 'img-data-shadow-host';
        Object.assign(shadowHost.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '2147483646'
        });
        d.body.appendChild(shadowHost);

        // Create shadow root
        const shadow = shadowHost.attachShadow({ mode: 'open' });

        // Inject badge styles into document head for badges that appear outside shadow DOM
        const badgeStyle = d.createElement('style');
        badgeStyle.id = 'img-data-badge-styles';
        badgeStyle.textContent = `
            .img-data-badge {
                position: absolute !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: #FFA500 !important;
                color: #000 !important;
                font-weight: 700 !important;
                font-size: 14px !important;
                border: 2px solid #000 !important;
                width: 26px !important;
                height: 26px !important;
                line-height: 26px !important;
                text-align: center !important;
                user-select: none !important;
                cursor: pointer !important;
                border-radius: 4px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
                z-index: 2147483648 !important;
                text-decoration: none !important;
                font-family: Arial, sans-serif !important;
                pointer-events: auto !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        d.head.appendChild(badgeStyle);
        const style = d.createElement('style');
        style.textContent = `
            :host {
                font-family: Arial, sans-serif;
                font-size: 12px;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2147483646;
            }
            
            .badge {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #FFA500;
                color: #000;
                font-weight: 700;
                font-size: 14px;
                border: 2px solid #000;
                width: 26px;
                height: 26px;
                line-height: 26px;
                text-align: center;
                user-select: none;
                cursor: pointer;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                z-index: 2147483648;
                pointer-events: auto;
                text-decoration: none;
            }
            
            .overlay {
                position: fixed;
                top: 10px;
                right: 0;
                width: 520px;
                height: 240px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                background: #f8f9fa;
                font: 12px Arial, sans-serif;
                z-index: 2147483647;
                border: 1px solid #ccc;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                overflow: hidden;
                pointer-events: auto;
            }
            
            .header-bar, .footer-bar {
                display: flex;
                align-items: center;
                padding: 6px 10px;
                background: #34495e;
                color: #fff;
                font-weight: 700;
                cursor: grab;
                user-select: none;
            }
            
            .header-bar {
                height: 56px;
                justify-content: space-between;
            }
            
            .footer-bar {
                height: 28px;
                justify-content: flex-end;
            }
            
            .title {
                margin: 0;
                color: #fff;
                font-size: 16px;
                text-align: left;
            }
            
            .buttons {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .toggle-group {
                display: flex;
                align-items: center;
                background: #95a5a6;
                border-radius: 6px;
                padding: 2px 6px;
                cursor: pointer;
                user-select: none;
                height: 32px;
            }
            
            .toggle-label {
                font-size: 12px;
                margin-right: 6px;
            }
            
            .toggle-btn {
                border: none;
                background: transparent;
                font-size: 14px;
                cursor: pointer;
            }
            
            .close-btn {
                cursor: pointer;
                font-size: 16px;
                padding: 0;
                margin: 0 0 0 12px;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                background: #e74c3c;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .content {
                padding: 10px;
                overflow: auto;
                flex: 1;
                background: #fff;
            }
            
            .entry {
                display: flex;
                align-items: flex-start;
                padding: 4px 0;
            }
            
            .badge-container {
                flex: 0 0 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 10px;
            }
            
            .entry-badge {
                display: flex;
                align-items: center;
                justify-content: center;
                background: #FFA500;
                color: #000;
                font-weight: 700;
                font-size: 14px;
                border: 2px solid #000;
                width: 26px;
                height: 26px;
                line-height: 26px;
                text-align: center;
                user-select: none;
                text-decoration: none;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                cursor: pointer;
            }
            
            .info {
                flex: 1;
            }
            
            .info div {
                margin-bottom: 2px;
            }
            
            .info strong {
                font-weight: bold;
            }
            
            .info a {
                color: #0066cc;
                text-decoration: underline;
            }
            
            .separator {
                margin: 4px 0;
                border: none;
                border-top: 1px solid #ccc;
            }
            
            .resizer {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #09f;
                opacity: 0.85;
                z-index: 2147483648;
                border-radius: 2px;
                transition: box-shadow 0.15s, transform 0.15s;
            }
            
            .resizer:hover {
                box-shadow: 0 0 8px 2px rgba(0,150,255,0.9);
                transform: scale(1.2);
            }
            
            .resizer-n { top: 0; left: 50%; margin-left: -4px; cursor: n-resize; }
            .resizer-s { bottom: 0; left: 50%; margin-left: -4px; cursor: s-resize; }
            .resizer-e { right: 0; top: 50%; margin-top: -4px; cursor: e-resize; }
            .resizer-w { left: 0; top: 50%; margin-top: -4px; cursor: w-resize; }
            .resizer-ne { top: 0; right: 0; cursor: ne-resize; }
            .resizer-nw { top: 0; left: 0; cursor: nw-resize; }
            .resizer-se { bottom: 0; right: 0; cursor: se-resize; }
            .resizer-sw { bottom: 0; left: 0; cursor: sw-resize; }
        `;
        shadow.appendChild(style);

        window._imgData = {
            badges,
            badgesVisible: true,
            shadow,
            shadowHost,
            cleanup() {
                try {
                    badges.forEach(b => b.box?.remove());
                    badges.length = 0;
                    const badgeStyles = d.getElementById('img-data-badge-styles');
                    if (badgeStyles) badgeStyles.remove();
                    if (this.scrollHandler) removeEventListener("scroll", this.scrollHandler);
                    if (this.resizeHandler) removeEventListener("resize", this.resizeHandler);
                    if (this.interval) clearInterval(this.interval);
                    if (this.shadowHost) this.shadowHost.remove();
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
            a.className = "img-data-badge";
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
        o.className = "overlay";
        shadow.appendChild(o);

        const headerH = 56, footerH = 28;

        // Header bar
        const headerBar = d.createElement("div");
        headerBar.className = "header-bar";
        headerBar.setAttribute("data-drag-handle", "1");

        // Title
        const title = d.createElement("h1");
        title.textContent = "Image Data";
        title.className = "title";
        headerBar.appendChild(title);

        // Buttons container
        const btns = d.createElement("div");
        btns.className = "buttons";

        // Toggle badges
        const toggleGroup = d.createElement("div");
        toggleGroup.className = "toggle-group";
        const label = d.createElement("span");
        label.textContent = "Toggle Badges";
        label.className = "toggle-label";
        toggleGroup.appendChild(label);

        const toggleBtn = d.createElement("button");
        toggleBtn.textContent = "🔢";
        toggleBtn.title = "Toggle Number Badges";
        toggleBtn.className = "toggle-btn";
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
        x.className = "close-btn";
        x.title = "Close";
        x.setAttribute("data-drag-ignore", "1");
        x.onclick = e => { e.stopPropagation(); window._imgData.cleanup(); };
        btns.appendChild(x);

        headerBar.appendChild(btns);

        // Footer bar
        const footerBar = d.createElement("div");
        footerBar.className = "footer-bar";
        footerBar.setAttribute("data-drag-handle", "1");

        const txt = d.createElement("div");
        txt.className = "content";

        const autosize = () => {
            const h = Math.max(140, Math.min(headerH + txt.scrollHeight + footerH, Math.floor(0.9 * innerHeight)));
            o.style.height = h + "px";
        };

        const update = () => {
            txt.innerHTML = "";
            if (!items.length) { txt.textContent = "No images found."; return; }
            items.forEach((it, i) => {
                const entry = d.createElement("div");
                entry.className = "entry";

                const badgeDiv = d.createElement("div");
                badgeDiv.className = "badge-container";

                const link = d.createElement("a");
                link.href = `#${it.anchorId}`;
                link.textContent = i + 1;
                link.className = "entry-badge";
                link.addEventListener("click", e => {
                    e.preventDefault();
                    const el = d.getElementById(it.anchorId);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                });

                badgeDiv.appendChild(link);
                entry.appendChild(badgeDiv);

                const infoDiv = d.createElement("div");
                infoDiv.className = "info";
                infoDiv.innerHTML = `
                    <div><strong>Name:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer">${it.name}</a></div>
                    <div><strong>Dimensions:</strong> ${it.dim}</div>
                    <div><strong>Size:</strong> ${it.size}</div>
                    <div><strong>Alt:</strong> ${it.alt}</div>
                    <div><strong>Caption:</strong> ${it.caption}</div>
                `;
                entry.appendChild(infoDiv);
                txt.appendChild(entry);

                const hr = d.createElement("hr");
                hr.className = "separator";
                txt.appendChild(hr);
            });
            autosize();
        };

        update();
        o.appendChild(headerBar);
        o.appendChild(txt);
        o.appendChild(footerBar);

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
        shadow.querySelectorAll("[data-drag-handle]").forEach(b => b.onpointerdown = startDrag);

        // Resizers
        ["n","s","e","w","ne","nw","se","sw"].forEach(dir => {
            const h = d.createElement("div");
            h.className = `resizer resizer-${dir}`;

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
