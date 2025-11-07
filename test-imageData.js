javascript:(() => {
try {
(function removeImageQueryStrings() {
    // === CLEAN QUERY STRINGS FROM ALL IMAGES ===
    try {
        const imgs = document.querySelectorAll("img");
        imgs.forEach(img => {
            if (img.src) {
                try {
                    const u = new URL(img.src, location.href);
                    u.search = "";
                    const clean = u.href;
                    if (img.src !== clean) img.src = clean;
                } catch(e){}
            }
        });
    } catch(e){}
})();

const d = document, badges = [], items = [];
let n = 1, badgeSize = 26, vGap = 6, margin = 6;

// === CLEANUP FROM PREVIOUS RUN ===
if (window._imgData?.cleanup) window._imgData.cleanup();
window._imgData = { cleanup: () => badges.forEach(b => b.remove()) };

// === CREATE FLOATING OVERLAY PANEL ===
const o = d.createElement("div");
o.style.cssText = `
position:fixed;
top:${margin}px;
right:${margin}px;
z-index:999999;
font:12px sans-serif;
color:#fff;
background:#000c;
padding:8px;
border-radius:8px;
box-shadow:0 2px 8px #0008;
max-height:calc(100vh - ${margin*2}px);
overflow:auto;
cursor:move;
`;
o.dataset.dragHandle = true;
d.body.appendChild(o);

// === HEADER WITH VERSION INFO ===
const h = d.createElement("div");
h.textContent = "Image Info v" + n;
h.style.cssText = "font-weight:bold;margin-bottom:4px;";
o.appendChild(h);

// === CONTAINER FOR IMAGE DATA LINES ===
const c = d.createElement("div");
o.appendChild(c);

// === FUNCTION: UPDATE OVERLAY LIST ===
function update() {
    c.innerHTML = "";
    items.forEach(it => {
        const line = d.createElement("div");
        line.style.cssText = "border-top:1px solid #333;padding:4px 0;";
        line.innerHTML = `
            <div><b>#${it.i}</b> ${it.fullURL ? `<a href="${it.fullURL}" target="_blank" style="color:#6cf;">${it.fileName}</a>` : it.fileName}</div>
            <div>Full: ${it.fullDim || "Loading..."}</div>
            <div>Rendered: ${it.rendWidth} × ${it.rendHeight}</div>
            <div>Size: ${it.size || "Loading..."}</div>
        `;
        c.appendChild(line);
    });
}

// === FUNCTION: FORMAT FILE SIZE ===
function formatSize(bytes) {
    if(!bytes || isNaN(bytes)) return "Unavailable";
    if(bytes < 1024) return bytes + " B";
    if(bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1048576).toFixed(2) + " MB";
}

// === FUNCTION: UPDATE BADGE POSITIONS ===
function updateBadgePositions() {
    badges.forEach(b => {
        const rect = b._img.getBoundingClientRect();
        b.style.top = (window.scrollY + rect.top + vGap) + "px";
        b.style.left = (window.scrollX + rect.left + vGap) + "px";
    });
}
window.addEventListener("scroll", updateBadgePositions);
window.addEventListener("resize", updateBadgePositions);

// === PROCESS EACH IMAGE ON THE PAGE ===
const imgs = Array.from(d.images);
imgs.forEach((img, i) => {
    const it = {
        i: i+1,
        img,
        fullURL: (() => {
            try {
                const u = new URL(img.src, location.href);
                u.search = "";
                return u.href;
            } catch { return null; }
        })(),
        fileName: img.src.split("/").pop().split("?")[0],
        rendWidth: img.clientWidth,
        rendHeight: img.clientHeight
    };
    items.push(it);

    // === CREATE BADGE WITH IMAGE NUMBER ===
    const b = d.createElement("div");
    b.textContent = it.i;
    b.style.cssText = `
        position:absolute;
        background:#000c;
        color:#fff;
        width:${badgeSize}px;
        height:${badgeSize}px;
        border-radius:50%;
        text-align:center;
        line-height:${badgeSize}px;
        font-weight:bold;
        font-size:13px;
        pointer-events:none;
        user-select:none;
    `;
    b._img = img;
    d.body.appendChild(b);
    badges.push(b);

    // === GET FULL IMAGE DIMENSIONS ===
    const pre = new Image();
    pre.onload = () => {
        it.fullDim = pre.naturalWidth + " × " + pre.naturalHeight;
        update();
    };
    pre.onerror = () => {
        if(!it.fullWidth && !it.fullHeight) it.fullDim = it.fullDim || "Unavailable";
        update();
    };
    pre.src = it.fullURL;

    // === GET FILE SIZE USING HEAD REQUEST ===
    fetch(it.fullURL, { method: "HEAD" }).then(r => {
        const cl = r.headers.get("content-length");
        it.size = cl ? formatSize(parseInt(cl,10)) : "Unknown";
        update();
    }).catch(()=>{
        // === FALLBACK: FETCH ENTIRE IMAGE IF HEAD FAILS ===
        fetch(it.fullURL).then(r => {
            if(!r.ok) throw new Error("Fetch failed");
            return r.blob();
        }).then(b => {
            it.size = formatSize(b.size);
            update();
        }).catch(()=>{ it.size = it.size || "Unavailable"; update(); });
    });
});

setTimeout(()=>{ updateBadgePositions(); },150);

// === DRAG FUNCTIONALITY FOR OVERLAY ===
let drag=null;
const startDrag=e=>{
    if(e.target.closest("[data-drag-ignore]")) return;
    const r=o.getBoundingClientRect();
    drag={dx:e.clientX-r.left,dy:e.clientY-r.top};
    e.preventDefault();
};
const onDrag=e=>{
    if(!drag) return;
    o.style.left=(e.clientX-drag.dx)+"px";
    o.style.top=(e.clientY-drag.dy)+"px";
    o.style.right="auto";
};
const endDrag=()=>{ drag=null; };

// === ATTACH DRAG EVENTS ===
d.addEventListener("pointermove",onDrag);
d.addEventListener("pointerup",endDrag);
d.querySelectorAll("[data-drag-handle]").forEach(b=>b.onpointerdown=startDrag);

} catch(e){ console.error(e); }
})();
