javascript:(() => {
try {
    // === MAIN EXECUTION WRAPPER ===
    // Wraps everything in a try/catch to prevent page-breaking errors.

    const d = document, badges = [], items = [];
    let n = 1, badgeSize = 26, vGap = 6, margin = 6;

    // === CLEANUP PREVIOUS RUN ===
    // If the script ran before, remove any old overlays.
    if (window._imgData?.cleanup) window._imgData.cleanup();
    window._imgData = { cleanup: () => badges.forEach(b => b.remove()) };

    // === CREATE OVERLAY CONTAINER ===
    // Holds badges for each image found on the page.
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
        max-height:calc(100vh - ${margin * 2}px);
        overflow:auto;
        cursor:move;
    `;
    o.dataset.dragHandle = true;
    d.body.appendChild(o);

    // === CREATE STATUS DISPLAY ===
    // Displays script version and live count of images processed.
    const h = d.createElement("div");
    h.textContent = `Image Info v${n}`;
    h.style.cssText = "font-weight:bold;margin-bottom:4px;";
    o.appendChild(h);
    const c = d.createElement("div");
    o.appendChild(c);

    // === UPDATE FUNCTION ===
    // Refreshes image list overlay content.
    function update() {
        c.innerHTML = "";
        items.forEach(it => {
            const line = d.createElement("div");
            line.style.cssText = "border-top:1px solid #333;padding:4px 0;";

            // Display image number and key details.
            line.innerHTML = `
                <div><b>#${it.i}</b> ${it.fullURL ? `<a href="${it.fullURL}" target="_blank" style="color:#6cf;">${it.fileName}</a>` : it.fileName}</div>
                <div>Full: ${it.fullDim || "Loading..."}</div>
                <div>Rendered: ${it.rendWidth} × ${it.rendHeight}</div>
                <div>Size: ${it.size || "Loading..."}</div>
            `;
            c.appendChild(line);
        });
    }

    // === FORMAT SIZE FUNCTION ===
    // Converts bytes into KB/MB with two decimal precision.
    function formatSize(bytes) {
        if (!bytes || isNaN(bytes)) return "Unavailable";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / 1048576).toFixed(2)} MB`;
    }

    // === UPDATE BADGE POSITIONS ===
    // Keeps info badges aligned with their images on scroll/resize.
    function updateBadgePositions() {
        badges.forEach(b => {
            const rect = b._img.getBoundingClientRect();
            b.style.top = (window.scrollY + rect.top + vGap) + "px";
            b.style.left = (window.scrollX + rect.left + vGap) + "px";
        });
    }
    window.addEventListener("scroll", updateBadgePositions);
    window.addEventListener("resize", updateBadgePositions);

    // === PROCESS IMAGES ===
    // Loops through all <img> elements on the page and collects data.
    const imgs = Array.from(d.images);
    imgs.forEach((img, i) => {
        const it = {
            i: i + 1,
            img,
            fullURL: (() => {
                try {
                    const u = new URL(img.src, location.href);
                    u.search = ""; // Remove query strings from URL
                    return u.href;
                } catch {
                    return null;
                }
            })(),
            fileName: img.src.split("/").pop().split("?")[0],
            rendWidth: img.clientWidth,
            rendHeight: img.clientHeight
        };
        items.push(it);

        // === CREATE FLOATING BADGE ===
        // Displays index label beside the corresponding image.
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

        // === GET FULL IMAGE DIMENSIONS AND SIZE ===
        // Loads the image separately to measure natural size and fetch file size.
        const pre = new Image();
        pre.onload = () => {
            it.fullDim = `${pre.naturalWidth} × ${pre.naturalHeight}`;
            update();
        };
        pre.onerror = () => {
            if (!it.fullWidth && !it.fullHeight) it.fullDim = it.fullDim || "Unavailable";
            update();
        };
        pre.src = it.fullURL;

        // === FETCH FILE SIZE VIA HEAD REQUEST ===
        fetch(it.fullURL, { method: "HEAD" }).then(r => {
            const cl = r.headers.get("content-length");
            it.size = cl ? formatSize(parseInt(cl, 10)) : "Unknown";
            update();
        }).catch(() => {
            // Fallback: full GET fetch if HEAD fails.
            fetch(it.fullURL).then(r => {
                if (!r.ok) throw new Error("Fetch failed");
                return r.blob();
            }).then(b => {
                it.size = formatSize(b.size);
                update();
            }).catch(() => {
                it.size = it.size || "Unavailable";
                update();
            });
        });
    });

    // Initial badge positioning after slight delay.
    setTimeout(() => { updateBadgePositions(); }, 150);

    // === DRAG FUNCTIONALITY ===
    // Allows moving the overlay panel around the viewport.
    let drag = null;
    const startDrag = e => {
        if (e.target.closest("[data-drag-ignore]")) return;
        const r = o.getBoundingClientRect();
        drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
        e.preventDefault();
    };
    const onDrag = e => {
        if (!drag) return;
        o.style.left = (e.clientX - drag.dx) + "px";
        o.style.top = (e.clientY - drag.dy) + "px";
        o.style.right = "auto";
    };
    const endDrag = () => { drag = null; };

    // Attach drag handlers
    d.addEventListener("pointermove", onDrag);
    d.addEventListener("pointerup", endDrag);
    d.querySelectorAll("[data-drag-handle]").forEach(b => b.onpointerdown = startDrag);

} catch (e) {
    console.error(e);
}
})();
