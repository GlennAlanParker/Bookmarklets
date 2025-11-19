javascript:(function () {

    function createOverlay(url) {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position:absolute;
            top:${window.pageYOffset + 100}px;
            left:${window.pageXOffset + 100}px;
            z-index:999999;
            background:#fff;
            cursor:move;
            border:1px solid #000;
            overflow:hidden;
        `;

        const img = document.createElement("img");
        img.src = url;
        img.style.cssText = `
            width:100%;
            height:100%;
            object-fit:contain;
            pointer-events:none;
        `;

        img.onload = () => {
            overlay.style.width = img.naturalWidth + "px";
            overlay.style.height = img.naturalHeight + "px";
        };

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.style.cssText = `
            position:absolute;
            top:10px;
            left:10px;
            z-index:1000000;
            background:red;
            color:white;
            border:none;
            padding:4px 8px;
            cursor:pointer;
        `;
        removeBtn.onclick = () => overlay.remove();

        overlay.appendChild(img);
        overlay.appendChild(removeBtn);
        document.body.appendChild(overlay);

        /* -------- DRAGGING -------- */
        (function enableDragging() {
            let dragging = false, offX = 0, offY = 0;

            overlay.addEventListener("mousedown", ev => {
                if (ev.target !== overlay) return;
                dragging = true;
                const r = overlay.getBoundingClientRect();
                offX = ev.pageX - (r.left + window.pageXOffset);
                offY = ev.pageY - (r.top + window.pageYOffset);
            });

            document.addEventListener("mousemove", ev => {
                if (!dragging) return;
                overlay.style.left = ev.pageX - offX + "px";
                overlay.style.top = ev.pageY - offY + "px";
            });

            document.addEventListener("mouseup", () => dragging = false);
        })();

        /* -------- RESIZE HANDLES -------- */
        const dirs = ["n","ne","e","se","s","sw","w","nw"];
        const pos = {
            n:["50%","0"], ne:["100%","0"], e:["100%","50%"],
            se:["100%","100%"], s:["50%","100%"],
            sw:["0","100%"], w:["0","50%"], nw:["0","0"]
        };

        dirs.forEach(dir => {
            const h = document.createElement("div");
            h.dataset.dir = dir;
            h.style.cssText = `
                position:absolute;
                width:12px;height:12px;
                background:black;
                border:1px solid black;
                cursor:${dir}-resize;
                transform:translate(-50%,-50%);
                left:${pos[dir][0]};
                top:${pos[dir][1]};
                z-index:1000000;
            `;

            h.addEventListener("mousedown", e => {
                e.preventDefault();
                startResize(e, dir);
            });

            overlay.appendChild(h);
        });

        /* -------- PROPORTIONAL RESIZE -------- */
        function startResize(e, dir) {
            const startX = e.pageX;
            const startY = e.pageY;
            const rect = overlay.getBoundingClientRect();
            const ratio = img.naturalWidth / img.naturalHeight;

            const xSign = dir.includes("w") ? -1 : dir.includes("e") ? 1 : 0;
            const ySign = dir.includes("n") ? -1 : dir.includes("s") ? 1 : 0;

            function move(ev) {
                const dx = ev.pageX - startX;
                const dy = ev.pageY - startY;

                const delta = Math.abs(dx) > Math.abs(dy) ? dx * xSign : dy * ySign;

                let w = Math.max(50, rect.width + delta);
                let h = w / ratio;

                let left = rect.left + window.pageXOffset;
                let top = rect.top + window.pageYOffset;

                if (dir.includes("w")) left = rect.left + window.pageXOffset - (w - rect.width);
                if (dir.includes("n")) top = rect.top + window.pageYOffset - (h - rect.height);

                overlay.style.width = w + "px";
                overlay.style.height = h + "px";
                overlay.style.left = left + "px";
                overlay.style.top = top + "px";
            }

            function stop() {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", stop);
            }

            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", stop);
        }

    }

    /* -------- SAFER URL PROMPT -------- */
    setTimeout(() => {
        const url = prompt("Enter image URL:");
        if (url) createOverlay(url);
    }, 10);

})();
