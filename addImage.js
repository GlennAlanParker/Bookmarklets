javascript:(function() {
    function createOverlay(url) {
        const overlay = document.createElement("div");
        overlay.className = "custom-image-overlay";
        overlay.dataset.docked = "false";

        const sX = window.pageXOffset, sY = window.pageYOffset;

        Object.assign(overlay.style, {
            position: "absolute",
            top: sY + 100 + "px",
            left: sX + 100 + "px",
            width: "300px",
            height: "200px",
            zIndex: "999999",
            overflow: "hidden",
            backgroundColor: "#fff",
            cursor: "move"
        });

        const img = document.createElement("img");
        img.src = url;

        img.onload = () => {
            overlay.style.width = img.naturalWidth + "px";
            overlay.style.height = img.naturalHeight + "px";
        };

        Object.assign(img.style, {
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none"
        });

        const btn = document.createElement("button");
        btn.textContent = "Remove";
        Object.assign(btn.style, {
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: "1000000",
            padding: "4px 8px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
        });
        btn.onclick = () => overlay.remove();

        overlay.appendChild(img);
        overlay.appendChild(btn);

        /* ---------- Resizing Handles ---------- */
        function addResizeHandles(el) {
            const dirs = ["n","ne","e","se","s","sw","w","nw"];
            dirs.forEach(dir => {
                const h = document.createElement("div");
                h.dataset.dir = dir;

                Object.assign(h.style, {
                    position: "absolute",
                    width: "14px",
                    height: "14px",
                    background: "#000",
                    border: "1px solid #000",
                    zIndex: "1000000",
                    cursor: dir + "-resize",
                    transform: "translate(-50%, -50%)"
                });

                const pos = {
                    n:["50%","0"], ne:["100%","0"], e:["100%","50%"],
                    se:["100%","100%"], s:["50%","100%"],
                    sw:["0","100%"], w:["0","50%"], nw:["0","0"]
                };

                h.style.left = pos[dir][0];
                h.style.top = pos[dir][1];

                h.addEventListener("mousedown", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    startResize(e, dir, el);
                });

                el.appendChild(h);
            });
        }

function startResize(e, dir, el) {
    const startX = e.pageX, startY = e.pageY;
    const rect = el.getBoundingClientRect();
    const sX = window.pageXOffset, sY = window.pageYOffset;

    const img = el.querySelector("img");
    const ratio = img ? img.naturalWidth / img.naturalHeight : 1;

    function onMove(ev) {
        const dx = ev.pageX - startX;
        const dy = ev.pageY - startY;

        let w = rect.width;
        let h = rect.height;
        let l = rect.left + sX;
        let t = rect.top + sY;

        // Determine resize direction multipliers
        const xMul = dir.includes("w") ? -1 : (dir.includes("e") ? 1 : 0);
        const yMul = dir.includes("n") ? -1 : (dir.includes("s") ? 1 : 0);

        // Use whichever delta is larger in magnitude to keep proportion
        const dist = Math.abs(dx) > Math.abs(dy) ? dx * xMul : dy * yMul;

        // Compute new width & height
        w = Math.max(50, rect.width + dist * (xMul !== 0 ? 1 : ratio));
        h = w / ratio;

        // Reposition if grabbing from left/top sides
        if (dir.includes("w")) l = rect.left + sX - (w - rect.width);
        if (dir.includes("n")) t = rect.top + sY - (h - rect.height);

        el.style.width = w + "px";
        el.style.height = h + "px";
        el.style.left = l + "px";
        el.style.top = t + "px";
    }

    function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
}

        /* ---------- Dock/Undock ---------- */
        function undock(el) {
            el.dataset.docked = "false";
            el.style.cursor = "move";
            el.style.backgroundColor = "#fff";

            btn.style.display = "block";

            addResizeHandles(el);
            enableDragging(el);
        }

        function dock(el) {
            el.dataset.docked = "true";
            el.style.cursor = "default";
            el.style.backgroundColor = "transparent";

            btn.style.display = "none";

            [...el.querySelectorAll("div[data-dir]")].forEach(x => x.remove());

            if (el._dragHandles) {
                el.removeEventListener("mousedown", el._dragHandles.onMouseDown);
                document.removeEventListener("mousemove", el._dragHandles.onMove);
                document.removeEventListener("mouseup", el._dragHandles.onUp);
                delete el._dragHandles;
            }
        }

        overlay.addEventListener("dblclick", () => {
            if (overlay.dataset.docked === "true") undock(overlay);
            else dock(overlay);
        });

        undock(overlay);

        document.body.appendChild(overlay);
    }

    const url = prompt("Enter image URL:");
    if (url) createOverlay(url);
})();
