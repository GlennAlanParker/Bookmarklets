(() => {
    try {
        const d = document;
        const badges = [];
        const items = [];
        let n = 1, badgeSize = 26, vGap = 6, margin = 6;

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

        const formatSize = b => {
            if (!b) return "Unknown";
            if (b < 1024) return b + " B";
            let kb = b / 1024;
            if (kb < 1024) return kb.toFixed(1) + " KB";
            return (kb / 1024).toFixed(1) + " MB";
        };

        const imgs = [...d.images].filter(e => {
            const s = (e.src || "").toLowerCase();
            const alt = (e.alt || "").toLowerCase();
            return s && !s.includes("qrcode") && !alt.includes("qr") && !s.startsWith("data:");
        });

        const createBadge = (img, index) => {
            const badge = d.createElement("div");
            badge.textContent = index;
            Object.assign(badge.style, {
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
                cursor: "default",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                zIndex: 2147483648
            });
            d.body.appendChild(badge);
            badges.push({ img, box: badge });
        };

        for (const img of imgs) {
            const name = (img.src.split("/").pop().split("?")[0]) || "";
            if (!name) continue;
            img.id = `imgData_${n}`;
            const caption = (img.closest("figure")?.querySelector(".caption")?.innerText || "").trim();
            const fullURL = img.closest("a")?.href || img.src;

            items.push({
                name,
                anchorId: img.id,
                url: img.src,
                caption,
                alt: img.alt || "None",
                rendered: `${img.width}×${img.height}`,
                thumbDim: `${img.naturalWidth}×${img.naturalHeight}`,
                fullURL,
                fullDim: "Fetching...",
                size: "Fetching..."
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

        const o = d.createElement("div");
        o.id = "img-data-overlay";
        window._imgData.overlay = o;
        Object.assign(o.style, {
            position: "fixed",
            top: "10px",
            right: "0",
            width: "520px",
            height: "240px",
            maxHeight: "95vh",
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

        const headerH = 56, footerH = 14;

        const mkbar = pos => {
            const b = d.createElement("div");
            Object.assign(b.style, {
                height: pos === "top" ? headerH + "px" : footerH + "px",
                display: "flex",
                alignItems: "center",
                justifyContent: pos === "top" ? "space-between" : "flex-end",
                padding: pos === "top" ? "6px 10px" : "2px 8px",
                background: "#34495e",
                color: "#fff",
                fontWeight: 700,
                cursor: "grab",
                userSelect: "none"
            });

            if (pos === "top") {
                const title = d.createElement("h1");
                title.textContent = "Image Data";
                Object.assign(title.style, { margin: 0, color: "#fff", fontSize: "16px", textAlign: "left" });
                b.appendChild(title);

                const btns = d.createElement("div");
                btns.style.display = "flex"; btns.style.alignItems = "center"; btns.style.gap = "8px";

                const toggleGroup = d.createElement("div");
                Object.assign(toggleGroup.style, {
                    display: "flex", alignItems: "center", background: "#5D6D7E",
                    color: "#fff", borderRadius: "6px", padding: "2px 6px", cursor: "pointer",
                    userSelect: "none", height: (badgeSize + 6) + "px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    transition: "background 0.2s ease, transform 0.2s ease"
                });
                const label = d.createElement("span");
                label.textContent = "Toggle Badges"; Object.assign(label.style, { fontSize: "12px", marginRight: "6px" });
                toggleGroup.appendChild(label);
                const toggleBtn = d.createElement("button");
                toggleBtn.textContent = "🔢"; Object.assign(toggleBtn.style, { border: "none", background: "transparent", fontSize: "14px", cursor: "pointer", color: "#fff" });
                toggleGroup.appendChild(toggleBtn);
                toggleGroup.onclick = e => {
                    e.stopPropagation(); window._imgData.badgesVisible = !window._imgData.badgesVisible;
                    badges.forEach(bb => bb.box.style.display = window._imgData.badgesVisible ? "flex" : "none");
                };
                toggleGroup.addEventListener("mouseenter", () => { toggleGroup.style.background = "#4A5A6A"; toggleGroup.style.transform = "scale(1.05)"; });
                toggleGroup.addEventListener("mouseleave", () => { toggleGroup.style.background = "#5D6D7E"; toggleGroup.style.transform = "scale(1)"; });
                btns.appendChild(toggleGroup);

                const x = d.createElement("div"); x.textContent = "×"; x.title = "Close";
                Object.assign(x.style, {
                    cursor: "pointer", fontSize: "14px", padding: 0, margin: "0 0 0 12px",
                    borderRadius: "50%", width: "20px", height: "20px", background: "#e74c3c",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                });
                x.setAttribute("data-drag-ignore","1"); x.onclick = e => { e.stopPropagation(); o.remove(); window._imgData.cleanup(); };
                btns.appendChild(x);

                b.appendChild(btns);
            }
            b.setAttribute("data-drag-handle","1");
            return b;
        };

        const txt = d.createElement("div");
        Object.assign(txt.style, { padding: "10px", overflow: "auto", flex: "1", background: "#fff", position: "relative", textAlign: "left", color: "#333333" });

        const autosize = () => { o.style.height = Math.max(140, Math.min(headerH + txt.scrollHeight + footerH, Math.floor(0.9 * innerHeight))) + "px"; };

        const update = () => {
            [...txt.querySelectorAll(".img-entry,.img-separator")].forEach(el => el.remove());
            if (!items.length) { txt.appendChild(Object.assign(d.createElement("div"), { textContent: "No images found." })); return; }

            items.forEach((it,i)=>{
                const entry = d.createElement("div"); entry.className="img-entry"; Object.assign(entry.style,{display:"flex",alignItems:"flex-start",padding:"4px 0"});
                const badgeDiv = d.createElement("div"); badgeDiv.style.flex=`0 0 ${badgeSize}px`; Object.assign(badgeDiv.style,{display:"flex",alignItems:"center",justifyContent:"center",paddingRight:"10px"});
                const link = d.createElement("a"); link.href=`#${it.anchorId}`; link.textContent=i+1;
                Object.assign(link.style,{display:"flex",alignItems:"center",justifyContent:"center",background:"#FFA500",color:"#000",fontWeight:"700",fontSize:"14px",border:"2px solid #000",width:badgeSize+"px",height:badgeSize+"px",lineHeight:badgeSize+"px",textAlign:"center",userSelect:"none",textDecoration:"underline",borderRadius:"4px",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",cursor:"pointer"});
                link.addEventListener("click",e=>{ e.preventDefault(); const el=d.getElementById(it.anchorId); if(el) el.scrollIntoView({behavior:"smooth",block:"center"}); });
                badgeDiv.appendChild(link); entry.appendChild(badgeDiv);

                const infoDiv=d.createElement("div"); infoDiv.style.flex="1"; infoDiv.style.textAlign="left";
                infoDiv.innerHTML=`<div><strong>Name:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer" style="color:#0066cc;text-decoration:underline;">${it.name}</a></div>
<div><strong>Rendered:</strong> ${it.rendered}</div>
<div><strong>Thumbnail Intrinsic:</strong> ${it.thumbDim}</div>
<div><strong>Full Intrinsic:</strong> ${it.fullDim}</div>
<div><strong>Size:</strong> ${it.size}</div>
<div><strong>Alt:</strong> ${it.alt}</div>
${it.caption?`<div><strong>Caption:</strong> ${it.caption}</div>`:""}`;
                entry.appendChild(infoDiv); txt.appendChild(entry);
                if(i<items.length-1){ const hr=d.createElement("hr"); Object.assign(hr.style,{margin:"4px 0",border:"none",borderTop:"1px solid #ccc"}); txt.appendChild(hr); }
            });
            autosize();
        };

        o.append(mkbar("top"),txt,mkbar("bottom"));
        d.body.appendChild(o);
        update();

        items.forEach(it=>{
            const fullImg=new Image();
            fullImg.onload=()=>{ it.fullDim=`${fullImg.naturalWidth}×${fullImg.naturalHeight}`; update(); };
            fullImg.src=it.fullURL;
            fetch(it.fullURL,{method:"HEAD"}).then(r=>{ const cl=r.headers.get("content-length"); it.size=formatSize(cl?parseInt(cl,10):0); update(); }).catch(()=>{ it.size="Error"; update(); });
        });

        setTimeout(()=>{ updateBadgePositions(); },150);

        // Drag
        let drag=null;
        const startDrag=e=>{ if(e.target.closest("[data-drag-ignore]")) return; const r=o.getBoundingClientRect(); drag={dx:e.clientX-r.left,dy:e.clientY-r.top}; e.preventDefault(); };
        const onDrag=e=>{ if(!drag) return; o.style.left=(e.clientX-drag.dx)+"px"; o.style.top=(e.clientY-drag.dy)+"px"; o.style.right="auto"; };
        const endDrag=()=>{ drag=null; };
        d.addEventListener("pointermove",onDrag);
        d.addEventListener("pointerup",endDrag);
        d.querySelectorAll("[data-drag-handle]").forEach(b=>b.onpointerdown=startDrag);

    } catch(e){ console.error(e); }
})();
