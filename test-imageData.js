javascript:(() => {
try {
const d = document, badges = [], items = [];
let n = 1, badgeSize = 26, vGap = 6, margin = 6;
if (window._imgData?.cleanup) window._imgData.cleanup();
window._imgData = { badges, badgesVisible: true, cleanup() {
    try { badges.forEach(b => b.box?.remove()); badges.length = 0;
          if(this.scrollHandler) removeEventListener("scroll", this.scrollHandler);
          if(this.resizeHandler) removeEventListener("resize", this.resizeHandler);
          if(this.interval) clearInterval(this.interval);
          if(this.overlay) this.overlay.remove(); } catch(e){console.warn("Cleanup error",e);} } };

// small helpers
const formatSize = b => { if(!b) return "Unknown"; if(b<1024) return b+" B"; let kb=b/1024; if(kb<1024) return kb.toFixed(1)+" KB"; return (kb/1024).toFixed(1)+" MB"; };
const looksLikeImageURL = u => {
    if(!u) return false;
    u = String(u).trim();
    if(u.startsWith('data:') || u.startsWith('blob:')) return true;
    // absolute/relative http(s) or path
    try { const parsed = new URL(u, location.href); u = parsed.href; } catch(e){}
    return (/\.(jpe?g|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i).test(u);
};
const pickFromSrcset = srcset => {
    if(!srcset) return null;
    const parts = srcset.split(',').map(p => p.trim()).filter(Boolean);
    if(!parts.length) return null;
    // try to pick the candidate with the largest 'w' descriptor
    let best = null, bestW = -1;
    for(const p of parts){
        const m = p.match(/^\s*(\S+)(?:\s+(\d+)w)?\s*$/);
        if(m){
            const url = m[1];
            const w = m[2]?parseInt(m[2],10):-1;
            if(w > bestW){ bestW = w; best = url; }
            if(bestW === -1) best = url; // fallback to last if no widths provided
        }
    }
    return best || null;
};
const getDataAttr = (img, keys) => {
    for(const k of keys){
        if(img.dataset && img.dataset[k]) return img.dataset[k];
        const attr = img.getAttribute && img.getAttribute(k);
        if(attr) return attr;
    }
    return null;
};
const getBestFullURL = img => {
    // 1) anchor href if it looks like an image
    const a = img.closest && img.closest("a");
    const aHref = a?.href;
    if(aHref && looksLikeImageURL(aHref)) return aHref;

    // 2) obvious data attributes used by many libraries
    const cand = getDataAttr(img, ['full','fullsrc','original','src','large_image','fullsrcset','data-src','data-original','data-full','data-large','data-full-url']);
    if(cand && looksLikeImageURL(cand)) return cand;

    // 3) currentSrc (chosen by browser from srcset)
    if(img.currentSrc && looksLikeImageURL(img.currentSrc)) return img.currentSrc;

    // 4) parse srcset for the largest candidate
    const srcset = img.getAttribute && img.getAttribute('srcset');
    const fromSrcset = pickFromSrcset(srcset);
    if(fromSrcset && looksLikeImageURL(fromSrcset)) {
        try { return new URL(fromSrcset, location.href).href; } catch(e) { return fromSrcset; }
    }

    // 5) fallback to the image src
    if(img.src) return img.src;

    // last resort: anchor even if not clearly an image (keeps original behavior)
    return aHref || img.src || "";
};

// collect images (filter out QR/data)
const imgs = [...d.images].filter(e => {
    const s=(e.src||"").toLowerCase(), alt=(e.alt||"").toLowerCase();
    return s && !s.includes("qrcode") && !alt.includes("qr") && !s.startsWith("data:");
});

const createBadge=(img,index)=>{ const badge=d.createElement("div"); badge.textContent=index; Object.assign(badge.style,{position:"absolute",display:"flex",alignItems:"center",justifyContent:"center",background:"#FFA500",color:"#000",fontWeight:"700",fontSize:"14px",border:"2px solid #000",width:badgeSize+"px",height:badgeSize+"px",lineHeight:badgeSize+"px",textAlign:"center",userSelect:"none",cursor:"default",borderRadius:"4px",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",zIndex:2147483648}); d.body.appendChild(badge); badges.push({img,box:badge}); };

for(const img of imgs){
    const name=(img.src.split("/").pop().split("?")[0])||"";
    if(!name) continue;
    img.id=`imgData_${n}`;
    const caption=(img.closest("figure")?.querySelector(".caption")?.innerText||"").trim();
    const guessedFull = getBestFullURL(img);
    items.push({ name, anchorId: img.id, url: img.src, caption, alt: img.alt||"None",
        rendered:`${img.width}×${img.height}`, thumbDim:`${img.naturalWidth}×${img.naturalHeight}`,
        thumbWidth:img.naturalWidth, thumbHeight:img.naturalHeight, fullURL: guessedFull,
        fullDim:"Fetching...", fullWidth:null, fullHeight:null, size:"Fetching..." });
    createBadge(img,n); n++;
}

const updateBadgePositions=()=>{
    const placed=[];
    for(const b of badges){
        try{
            const r=b.img.getBoundingClientRect();
            let x=Math.max(margin,Math.min(d.documentElement.scrollWidth-badgeSize-margin,Math.round(r.left+window.scrollX-8)));
            let y=Math.max(margin,Math.min(d.documentElement.scrollHeight-badgeSize-margin,Math.round(r.top+window.scrollY-8)));
            for(const p of placed){
                if(Math.abs(p.x-x)<badgeSize+8 && !((y+badgeSize+vGap<p.y)||y>p.y+p.bh+vGap)){
                    y=p.y+p.bh+vGap;
                    y=Math.min(y,d.documentElement.scrollHeight-badgeSize-margin);
                }
            }
            Object.assign(b.box.style,{left:x+"px",top:y+"px",display:window._imgData.badgesVisible?"flex":"none"});
            placed.push({x,y,bw:badgeSize,bh:badgeSize});
        } catch(e){}
    }
};
updateBadgePositions(); setTimeout(updateBadgePositions,80);
window._imgData.scrollHandler=updateBadgePositions; window._imgData.resizeHandler=updateBadgePositions;
addEventListener("scroll",window._imgData.scrollHandler); addEventListener("resize",window._imgData.resizeHandler);
window._imgData.interval=setInterval(updateBadgePositions,300);

const o=d.createElement("div"); o.id="img-data-overlay"; window._imgData.overlay=o;
Object.assign(o.style,{position:"fixed",top:"10px",right:"0",width:"520px",height:"240px",maxHeight:"95vh",display:"flex",flexDirection:"column",background:"#f8f9fa",font:"12px Arial, sans-serif",zIndex:2147483647,border:"1px solid #ccc",borderRadius:"10px",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",overflow:"hidden"});
const headerH=56,footerH=14;
const mkbar=pos=>{ const b=d.createElement("div"); Object.assign(b.style,{height:pos==="top"?headerH+"px":footerH+"px",display:"flex",alignItems:"center",justifyContent:pos==="top"?"space-between":"flex-end",padding:pos==="top"?"6px 10px":"2px 8px",background:"#34495e",color:"#fff",fontWeight:700,cursor:"grab",userSelect:"none"});
if(pos==="top"){ const title=d.createElement("h1"); title.textContent="Image Data"; Object.assign(title.style,{margin:0,color:"#fff",fontSize:"16px",textAlign:"left"}); b.appendChild(title);
const btns=d.createElement("div"); btns.style.display="flex"; btns.style.alignItems="center"; btns.style.gap="8px";
const toggleGroup=d.createElement("div"); Object.assign(toggleGroup.style,{display:"flex",alignItems:"center",background:"#5D6D7E",color:"#fff",borderRadius:"6px",padding:"2px 6px",cursor:"pointer",userSelect:"none",height:(badgeSize+6)+"px",boxShadow:"0 2px 6px rgba(0,0,0,0.2)",transition:"background 0.2s ease, transform 0.2s ease"});
const label=d.createElement("span"); label.textContent="Toggle Badges"; Object.assign(label.style,{fontSize:"12px",marginRight:"6px"}); toggleGroup.appendChild(label);
const toggleBtn=d.createElement("button"); toggleBtn.textContent="🔢"; Object.assign(toggleBtn.style,{border:"none",background:"transparent",fontSize:"14px",cursor:"pointer",color:"#fff"}); toggleGroup.appendChild(toggleBtn);
toggleGroup.onclick=e=>{ e.stopPropagation(); window._imgData.badgesVisible=!window._imgData.badgesVisible; badges.forEach(bb=>bb.box.style.display=window._imgData.badgesVisible?"flex":"none"); };
toggleGroup.addEventListener("mouseenter",()=>{toggleGroup.style.background="#4A5A6A";toggleGroup.style.transform="scale(1.05)";});
toggleGroup.addEventListener("mouseleave",()=>{toggleGroup.style.background="#5D6D7E";toggleGroup.style.transform="scale(1)";});
btns.appendChild(toggleGroup);
const x=d.createElement("div"); x.textContent="×"; x.title="Close"; Object.assign(x.style,{cursor:"pointer",fontSize:"14px",padding:0,margin:"0 0 0 12px",borderRadius:"50%",width:"20px",height:"20px",background:"#e74c3c",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}); x.setAttribute("data-drag-ignore","1"); x.onclick=e=>{ e.stopPropagation(); o.remove(); window._imgData.cleanup(); }; btns.appendChild(x);
b.appendChild(btns); }
b.setAttribute("data-drag-handle","1"); return b; };

const txt=d.createElement("div"); Object.assign(txt.style,{padding:"10px",overflow:"auto",flex:"1",background:"#fff",position:"relative",textAlign:"left",color:"#333"});
const autosize=()=>{ o.style.height=Math.max(140,Math.min(headerH+txt.scrollHeight+footerH,Math.floor(0.9*innerHeight)))+"px"; };

const update=()=>{
[...txt.querySelectorAll(".img-entry,.img-separator")].forEach(el=>el.remove());
if(!items.length){ const noImagesText=d.createElement("div"); noImagesText.textContent="No images found."; txt.appendChild(noImagesText); return; }
items.forEach((it,i)=>{
if(!it.name) return;
const entry=d.createElement("div"); entry.className="img-entry"; Object.assign(entry.style,{display:"flex",alignItems:"flex-start",padding:"4px 0"});
const badgeDiv=d.createElement("div"); badgeDiv.style.flex=`0 0 ${badgeSize}px`; Object.assign(badgeDiv.style,{display:"flex",alignItems:"center",justifyContent:"center",paddingRight:"10px"});
const link=d.createElement("a"); link.href=`#${it.anchorId}`; link.textContent=i+1; Object.assign(link.style,{display:"flex",alignItems:"center",justifyContent:"center",background:"#FFA500",color:"#000",fontWeight:"700",fontSize:"14px",border:"2px solid #000",width:badgeSize+"px",height:badgeSize+"px",lineHeight:badgeSize+"px",textAlign:"center",userSelect:"none",textDecoration:"underline",borderRadius:"4px",boxShadow:"0 1px 3px rgba(0,0,0,0.3)",cursor:"pointer"});
link.addEventListener("click",e=>{ e.preventDefault(); const el=d.getElementById(it.anchorId); if(el) el.scrollIntoView({behavior:"smooth",block:"center"}); });
badgeDiv.appendChild(link); entry.appendChild(badgeDiv);
const infoDiv=d.createElement("div"); infoDiv.style.flex="1"; infoDiv.style.textAlign="left";

infoDiv.innerHTML=`<div><strong>Name:</strong> <a href="${it.url}" target="_blank" rel="noopener noreferrer" style="color:#0066cc;text-decoration:underline;">${it.name}</a></div>
<div><strong>Full Size:</strong> ${it.fullDim}</div>
${(it.fullWidth && it.fullHeight && (it.thumbWidth!==it.fullWidth||it.thumbHeight!==it.fullHeight))?`<div><strong>Thumbnail:</strong> ${it.thumbDim}</div>`:""}
<div><strong>Rendered:</strong> ${it.rendered}</div>
<div><strong>Size:</strong> ${it.size}</div>
<div><strong>Alt:</strong> ${it.alt}</div>
${it.caption?`<div><strong>Caption:</strong> ${it.caption}</div>`:""}`;

infoDiv.querySelector("a").addEventListener("click", e => {
    e.preventDefault();
    const overlay = d.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2147483660,
        cursor: "zoom-out"
    });

    const fullImg = d.createElement("img");
    fullImg.src = it.fullURL || it.url;
    Object.assign(fullImg.style, {
        maxWidth: "95%",
        maxHeight: "95%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
        borderRadius: "6px",
        position: "relative",
        zIndex: 2147483661
    });

    fullImg.onload = () => {
        // if overlay load gives us dimensions, update item
        it.fullWidth = fullImg.naturalWidth || it.fullWidth;
        it.fullHeight = fullImg.naturalHeight || it.fullHeight;
        it.fullDim = (it.fullWidth && it.fullHeight) ? `${it.fullWidth}×${it.fullHeight}` : it.fullDim;
        update();
    };
    fullImg.onerror = () => { it.fullDim = it.fullDim || "Unavailable"; update(); };

    overlay.appendChild(fullImg);
    d.body.appendChild(overlay);
    overlay.addEventListener("click", () => overlay.remove());
});

entry.appendChild(infoDiv); txt.appendChild(entry);
if(i<items.length-1){ const hr=d.createElement("hr"); hr.className="img-separator"; Object.assign(hr.style,{margin:"4px 0",border:"none",borderTop:"1px solid #ccc"}); txt.appendChild(hr); }
});
autosize();
};
o.append(mkbar("top"),txt,mkbar("bottom")); d.body.appendChild(o); update();

// Preload full images to get natural size and content-length
items.forEach(it=>{
    if(!it.fullURL) { it.fullDim = "Unavailable"; it.size = "Unknown"; return; }
    try {
        const pre = new Image();
        pre.decoding = "async";
        pre.onload = () => {
            // Accept preload dimensions if they are meaningful and larger than 0
            if(pre.naturalWidth > 0 && pre.naturalHeight > 0){
                it.fullWidth = pre.naturalWidth;
                it.fullHeight = pre.naturalHeight;
                it.fullDim = `${it.fullWidth}×${it.fullHeight}`;
            } else {
                it.fullDim = it.fullDim || "Unavailable";
            }
            update();
        };
        pre.onerror = () => {
            // Could not preload; mark Unavailable for now (but size/head fallback continues below)
            if(!it.fullWidth && !it.fullHeight) it.fullDim = it.fullDim || "Unavailable";
            update();
        };
        pre.src = it.fullURL;

        // try HEAD for content-length; if CORS prevents HEAD, fallback to GET -> blob
        fetch(it.fullURL, { method: "HEAD" }).then(r => {
            const cl = r.headers.get("content-length");
            it.size = cl ? formatSize(parseInt(cl,10)) : "Unknown";
            update();
        }).catch(()=>{
            // HEAD failed (CORS or not supported): try GET and measure blob
            fetch(it.fullURL).then(r => {
                if(!r.ok) throw new Error("Fetch failed");
                return r.blob();
            }).then(b => {
                it.size = formatSize(b.size);
                update();
            }).catch(()=>{ it.size = it.size || "Unavailable"; update(); });
        });
    } catch(e){
        it.fullDim = it.fullDim || "Unavailable";
        it.size = it.size || "Unavailable";
        update();
    }
});

setTimeout(()=>{ updateBadgePositions(); },150);

// Drag
let drag=null;
const startDrag=e=>{ if(e.target.closest("[data-drag-ignore]")) return; const r=o.getBoundingClientRect(); drag={dx:e.clientX-r.left,dy:e.clientY-r.top}; e.preventDefault(); };
const onDrag=e=>{ if(!drag) return; o.style.left=(e.clientX-drag.dx)+"px"; o.style.top=(e.clientY-drag.dy)+"px"; o.style.right="auto"; };
const endDrag=()=>{ drag=null; };
d.addEventListener("pointermove",onDrag); d.addEventListener("pointerup",endDrag); d.querySelectorAll("[data-drag-handle]").forEach(b=>b.onpointerdown=startDrag);

} catch(e){ console.error(e); }
})();
