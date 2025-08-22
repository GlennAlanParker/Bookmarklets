(() => {
  try {
    const LSK = "imgDataOverlay_v1";

    if (window._imgData?.cleanup) window._imgData.cleanup();

    const d = document;
    const badgeSize = 28, vGap = 6, margin = 6;
    let n = 1;

    window._imgData = {
      badges: [],
      badgesVisible: true,
      scrollHandler: null,
      resizeHandler: null,
      keyHandler: null,
      interval: null,
      overlay: null,
      cleanup() {
        try {
          this.badges?.forEach(b => b.box?.remove());
          this.badges = [];
          this.scrollHandler && removeEventListener("scroll", this.scrollHandler);
          this.resizeHandler && removeEventListener("resize", this.resizeHandler);
          this.keyHandler && removeEventListener("keydown", this.keyHandler);
          this.interval && clearInterval(this.interval);
          this.overlay && this.overlay.remove();
        } catch (e) {
          console.warn("Cleanup error", e);
        }
      }
    };

    // Collect images
    const imgs = [...d.images];
    const items = [];
    const badges = window._imgData.badges;

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
          caption: (e.closest("figure")?.querySelector("figcaption")?.textContent || "").trim().replace(/\(.*?\)/g,"").replace(/Open image in slideshow/gi,"").trim() || "None",
          url: e.src,
          anchorId: e.id
        });

        const a = d.createElement("a");
        a.textContent = n;
        a.href = e.src;
        a.target = "_blank";
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
          cursor: "pointer",
          borderRadius: "0%", // square badges
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          transition: "all .2s ease"
        });
        a.onclick = e => { e.preventDefault(); document.getElementById(a.textContent).scrollIntoView({behavior:'smooth',block:'center'}); };
        d.body.appendChild(a);
        badges.push({ img: e, box: a });
        n++;
      } catch {}
    }

    // Create overlay panel
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

    // Create header/footer bars with drag
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

      if(pos === "top") {
        const left = d.createElement("div"); left.style.display="flex"; left.style.alignItems="center";
        left.appendChild(makeGrip());
        const title = d.createElement("div"); title.textContent="IMAGE DATA"; left.appendChild(title);
        b.appendChild(left);

        const btns = d.createElement("div"); btns.style.display="flex"; btns.style.alignItems="center"; btns.style.gap="8px";
        const toggleGroup = d.createElement("div");
        Object.assign(toggleGroup.style,{display:"flex",alignItems:"center",background:"#95a5a6",borderRadius:"6px",padding:"2px 6px",cursor:"pointer",userSelect:"none"});
        const label = d.createElement("span"); label.textContent="Toggle Badges"; label.style.fontSize="12px"; label.style.marginRight="6px";
        label.setAttribute("data-drag-ignore","1"); label.onpointerdown=e=>e.stopPropagation();
        const toggleBtn = d.createElement("button"); toggleBtn.textContent="🔢"; toggleBtn.title="Toggle Number Badges";
        Object.assign(toggleBtn.style,{border:"none",background:"transparent",fontSize:"14px",cursor:"pointer"});
        toggleBtn.setAttribute("data-drag-ignore","1"); toggleBtn.onpointerdown=e=>e.stopPropagation();
        toggleGroup.onclick = e=>{ e.stopPropagation(); window._imgData.badgesVisible=!window._imgData.badgesVisible; badges.forEach(bb=>bb.box.style.display=window._imgData.badgesVisible?"flex":"none"); };
        toggleGroup.append(label,toggleBtn); btns.append(toggleGroup);

        const x = d.createElement("div"); x.textContent="×";
        Object.assign(x.style,{cursor:"pointer",fontSize:"20px",padding:"0",margin:"-6px 0 -6px 12px",borderRadius:"50%",width:"32px",height:"32px",background:"#e74c3c",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"});
        x.title="Close"; x.setAttribute("data-drag-ignore","1"); x.onpointerdown=e=>e.stopPropagation(); x.onclick=e=>{e.stopPropagation(); o.remove(); window._imgData.cleanup();};
        btns.append(x); b.appendChild(btns);
      }

      b.setAttribute("data-drag-handle","1"); return b;
    };

    const txt = d.createElement("div"); Object.assign(txt.style,{padding:"10px",overflow:"auto",flex:"1",background:"#ffffff"});
    const autosize = ()=>{ try { o.style.height = Math.max(140,Math.min(headerH + txt.scrollHeight + footerH, Math.floor(0.9*innerHeight))) + "px"; } catch{} };
    
    const update = ()=>{
      txt.innerHTML = items.length ? items.map((it,i)=>`
        <div style="display:flex;padding:8px 0;border-bottom:1px solid #eee;align-items:flex-start">
          <div style="flex:0 0 ${badgeSize}px;display:flex;align-items:center;justify-content:center;margin-right:8px;">
            <a href="#${it.anchorId}" onclick="document.getElementById('${it.anchorId}').scrollIntoView({behavior:'smooth',block:'center'});return false;"
              style="display:flex;align-items:center;justify-content:center;background:#FFA500;color:#000;font-weight:700;font-size:14px;border:2px solid #000;width:${badgeSize}px;height:${badgeSize}px;text-align:center;user-select:none;text-decoration:none;box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;border-radius:0%">
              ${i+1}
            </a>
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
      `).join("") : "No images found.";
      autosize();
    };

    update();
    o.append(mkbar("top"), txt, mkbar("bottom"));
    d.body.appendChild(o);

    // Dragging
    let drag = null;
    const startDrag=(e,t)=>{if(e.target.closest("[data-drag-ignore]"))return; const r=o.getBoundingClientRect(); drag={dx:e.clientX-r.left,dy:e.clientY-r.top}; t.style.cursor="grabbing"; e.preventDefault();};
    const onDrag=e=>{if(!drag)return; o.style.left=e.clientX-drag.dx+"px"; o.style.top=e.clientY-drag.dy+"px"; o.style.right="auto";};
    const endDrag=e=>{drag=null; d.querySelectorAll("[data-drag-handle]").forEach(b=>b.style.cursor="grab");};
    d.addEventListener("pointermove",onDrag); d.addEventListener("pointerup",endDrag);
    d.querySelectorAll("[data-drag-handle]").forEach(b=>b.onpointerdown=e=>startDrag(e,b));

    // Resizers
    ["n","s","e","w","ne","nw","se","sw"].forEach(dir=>{
      const h=d.createElement("div"); h.className="resize-handle"; Object.assign(h.style,{position:"absolute",background:"#09f",opacity:".7",zIndex:"2147483647",borderRadius:"3px",cursor:dir+"-resize"});
      const sz=10;
      dir.includes("n")&&(h.style.top="0"); dir.includes("s")&&(h.style.bottom="0"); dir.includes("e")&&(h.style.right="0"); dir.includes("w")&&(h.style.left="0");
      if(["n","s"].includes(dir)){h.style.left="50%"; h.style.marginLeft=-sz/2+"px"; h.style.width=sz+"px"; h.style.height=sz+"px";}
      else if(["e","w"].includes(dir)){h.style.top="50%"; h.style.marginTop=-sz/2+"px"; h.style.width=sz+"px"; h.style.height=sz+"px";}
      else {h.style.width=sz+"px"; h.style.height=sz+"px";}
      let startX,startY,startW,startH,startL,startT;
      h.addEventListener("pointerdown",e=>{
        e.preventDefault(); e.stopPropagation();
        startX=e.clientX; startY=e.clientY;
        const r=o.getBoundingClientRect(); startW=r.width; startH=r.height; startL=r.left; startT=r.top;
        const onMove=me=>{
          let dx=me.clientX-startX, dy=me.clientY-startY; let w=startW, h_=startH, l=startL, t=startT;
          dir.includes("e")&&(w=Math.max(200,startW+dx)); dir.includes("s")&&(h_=Math.max(100,startH+dy));
          dir.includes("w")&&(w=Math.max(200,startW-dx), l=startL+dx); dir.includes("n")&&(h_=Math.max(100,startH-dy), t=startT+dy);
          o.style.width=w+"px"; o.style.height=h_+"px"; o.style.left=l+"px"; o.style.top=t+"px"; o.style.right="auto";
        };
        const onUp=()=>{ d.removeEventListener("pointermove",onMove); d.removeEventListener("pointerup",onUp); };
        d.addEventListener("pointermove",onMove); d.addEventListener("pointerup",onUp);
      });
      o.appendChild(h);
    });

    // Floating badges move with scroll
    window._imgData.scrollHandler=()=>{badges.forEach(b=>{const r=b.img.getBoundingClientRect(); b.box.style.top=window.scrollY+r.top+"px"; b.box.style.left=window.scrollX+r.left+"px";});};
    window._imgData.resizeHandler=autosize;
    addEventListener("scroll",window._imgData.scrollHandler);
    addEventListener("resize",window._imgData.resizeHandler);

    // ESC to close
    window._imgData.keyHandler=e=>{ if(e.key==="Escape"){window._imgData.cleanup(); delete window._imgData;} };
    addEventListener("keydown",window._imgData.keyHandler);

    // Fetch image sizes
    items.forEach(it=>{ fetch(it.url,{method:"HEAD"}).then(r=>{const cl=r.headers.get("content-length"); it.size=cl?(+cl/1024).toFixed(1)+" KB":"Unknown"; update();}).catch(()=>{it.size="Error"; update();}); });

    setTimeout(()=>{ window._imgData.scrollHandler(); autosize(); },150);

  } catch(e){ console.error(e); }
})();
