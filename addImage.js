javascript:(function () {
    function createOverlay(url) {
        const overlay = document.createElement("div");
        overlay.dataset.docked = "false";

        Object.assign(overlay.style, {
            position: "absolute",
            top: window.pageYOffset + 100 + "px",
            left: window.pageXOffset + 100 + "px",
            width: "200px",
            height: "150px",
            zIndex: 999999,
            overflow: "hidden",
            backgroundColor: "#fff",
            cursor: "move",
            border: "1px solid #000"
        });

        const img = document.createElement("img");
        img.src = url;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.pointerEvents = "none";

        img.onload = () => {
            overlay.style.width = img.naturalWidth + "px";
            overlay.style.height = img.naturalHeight + "px";
        };

        const btn = document.createElement("button");
        btn.textContent = "Remove";
        Object.assign(btn.style, {
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000000,
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

        /* ----------------- RESIZE HANDLES ------------------ */
        function addResizeHandles(el) {
            const dirs = ["n","ne","e","se","s","sw","w","nw"];
            const positions = {
                n:["50%","0"], ne:["100%","0"], e:["100%","50%"],
                se:["100%","100%"], s:["50%","100%"],
                sw:["0","100%"], w:["0","50%"], nw:["0","0"]
            };

            dirs.forEach(dir => {
                const h = document.createElement("div");
                h.dataset.dir = dir;

                Object.assign(h.style, {
                    position: "absolute",
                    width: "14px",
                    height: "14px",
                    background: "#000",
                    border: "1px solid #000",
                    zIndex: 1000000,
                    cursor: dir + "-resize",
                    transform: "translate(-50%, -50%)",
                    left: positions[dir][0],
                    top: positions[dir][1]
                });

                h.addEventListener("mousedown", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    startResize(e, dir, el);
                });

                el.appendChild(h);
            });
        }

        /* ------------- PROPORTIONAL RESIZE LOGIC ---------------- */
        function startResize(e, dir, el) {
            const startX = e.pageX;
            const startY = e.pageY;

            const rect = el.getBoundingClientRect();
            const ratio = img.naturalWidth / img.naturalHeight;

            const sX = window.pageXOffset;
            const sY = window.pageYOffset;

            function onMove(ev) {
                const dx = ev.pageX - startX;
                const dy = ev.pageY - startY;

                let newW = rect.width;
                let newH = rect.height;
                let newL = rect.left + sX;
                let newT = rect.top + sY;

                const xSign = dir.includes("w") ? -1 : dir.includes("e") ? 1 : 0;
                const ySign = dir.includes("n") ? -1 : dir.includes("s") ? 1 : 0;

                // Choose the bigger movement to keep aspect ratio correct
                const delta = Math.abs(dx) > Math.abs(dy) ? dx * xSign : dy * ySign;

                newW = Math.max(50, rect.width + delta);
                newH = newW / ratio;

                // Position correction
                if (dir.includes("w")) newL = rect.left + sX - (newW - rect.width);
                if (dir.includes("n")) newT = rect.top + sY - (newH - rect.height);

                el.style.width = newW + "px";
                el.style.height = newH + "px";
                el.style.left = newL + "px";
                el.style.top = newT + "px";
            }

            function onUp() {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
            }

            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
        }

        /* ---------------------- DRAGGING ------------------------ */
        function enableDragging(el) {
            let dragging = false;
            let offX = 0, offY = 0;

            el.addEventListener("mousedown", ev => {
                if (ev.target !== el) return;
                dragging = true;

                const r = el.getBoundingClientRect();
                offX = ev.pageX - (r.left + window.pageXOffset);
                offY = ev.pageY - (r.top + window.pageYOffset);

                ev.preventDefault();
            });

            document.addEventListener("mousemove", ev => {
                if (!dragging) return;
                el.style.left = ev.pageX - offX + "px";
                el.style.top = ev.pageY - offY + "px";
            });

            document.addEventListener("mouseup", () => dragging = false);
        }

        /* ---------------- DOCK / UNDOCK ------------------- */
        function undock(el) {
            el.dataset.docked = "false";
            btn.style.display = "block";
            el.style.cursor = "move";

            addResizeHandles(el);
            enableDragging(el);
        }

        function dock(el) {
            el.dataset.docked = "true";
            btn.style.display = "none";

            [...el.querySelectorAll("div[data-dir]")].forEach(h => h.remove());
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
