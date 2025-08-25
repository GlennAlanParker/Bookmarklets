javascript:(() => {
    try {
        const LSK = "imgDataOverlay_v1";

        // Cleanup if already running
        if (window._imgData?.cleanup) window._imgData.cleanup();

        const d = document;

        window._imgData = {
            badges: [],
            badgesVisible: true,
            cleanup() {
                try {
                    this.badges?.forEach(b => b.box?.remove());
                    this.badges = [];
                    this.overlay?.remove();
                    window.removeEventListener("scroll", this.updatePositions);
                    window.removeEventListener("resize", this.updatePositions);
                } catch (e) {}
                delete window._imgData;
            },
            updatePositions() {
                window._imgData.badges.forEach(({ box, img }) => {
                    const rect = img.getBoundingClientRect();
                    box.style.left = `${rect.left + window.scrollX}px`;
                    box.style.top = `${rect.top + window.scrollY}px`;
                });
            },
            toggleBadges() {
                this.badgesVisible = !this.badgesVisible;
                this.badges.forEach(({ box }) => {
                    box.style.display = this.badgesVisible ? "block" : "none";
                });
                toggleBtn.textContent = this.badgesVisible ? "Hide Badges" : "Show Badges";
            }
        };

        const cleanup = window._imgData.cleanup.bind(window._imgData);

        // Overlay container
        const overlay = d.createElement("div");
        overlay.id = LSK;
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            right: "0",
            width: "350px",
            height: "100%",
            background: "rgba(30,30,30,0.95)",
            color: "white",
            font: "14px/1.4 Arial, sans-serif",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 0 10px rgba(0,0,0,0.7)"
        });
        window._imgData.overlay = overlay;

        // Top bar
        const topBar = d.createElement("div");
        Object.assign(topBar.style, {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            borderBottom: "1px solid #555"
        });

        // Title
        const title = d.createElement("h1");
        title.textContent = "Image Data";
        Object.assign(title.style, {
            fontSize: "22px",       // Larger text
            margin: "0 0 0 20px",   // Margin-left 20px
            flex: "1",
            textAlign: "left"
        });

        // Button container
        const buttonBar = d.createElement("div");
        Object.assign(buttonBar.style, {
            display: "flex",
            alignItems: "center",
            gap: "8px"
        });

        // Toggle badges button
        const toggleBtn = d.createElement("button");
        toggleBtn.textContent = "Hide Badges";
        Object.assign(toggleBtn.style, {
            background: "#444",
            border: "1px solid #666",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
        });
        toggleBtn.onclick = () => window._imgData.toggleBadges();

        // Close button
        const closeBtn = d.createElement("button");
        closeBtn.textContent = "×";
        Object.assign(closeBtn.style, {
            background: "none",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer"
        });
        closeBtn.onclick = cleanup;

        buttonBar.appendChild(toggleBtn);
        buttonBar.appendChild(closeBtn);

        topBar.appendChild(title);
        topBar.appendChild(buttonBar);
        overlay.appendChild(topBar);

        // Content area
        const content = d.createElement("div");
        Object.assign(content.style, {
            flex: "1",
            overflowY: "auto",
            padding: "10px"
        });
        overlay.appendChild(content);

        // Gather images
        const images = [...d.images].filter(img => img.width && img.height);

        images.forEach((img, i) => {
            const box = d.createElement("div");
            Object.assign(box.style, {
                borderBottom: "1px solid #444",
                padding: "10px",
                display: "flex",
                alignItems: "flex-start"
            });

            // Number badge inside overlay
            const badge = d.createElement("div");
            badge.textContent = i + 1;
            Object.assign(badge.style, {
                background: "red",
                color: "white",
                fontWeight: "bold",
                padding: "4px 8px",
                borderRadius: "4px",
                minWidth: "24px",
                textAlign: "center"
            });

            // Info block
            const info = d.createElement("div");
            Object.assign(info.style, {
                marginLeft: "10px" // ✅ Add 10px spacing between number and info
            });
            info.textContent = `${img.src} (${img.naturalWidth}×${img.naturalHeight})`;

            box.appendChild(badge);
            box.appendChild(info);
            content.appendChild(box);

            // Badge overlay on page
            const badgeBox = d.createElement("div");
            badgeBox.textContent = i + 1;
            Object.assign(badgeBox.style, {
                position: "absolute",
                left: `${img.getBoundingClientRect().left + window.scrollX}px`,
                top: `${img.getBoundingClientRect().top + window.scrollY}px`,
                background: "red",
                color: "white",
                fontWeight: "bold",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "12px",
                pointerEvents: "none",
                zIndex: 999998
            });
            d.body.appendChild(badgeBox);

            window._imgData.badges.push({ box: badgeBox, img });
        });

        d.body.appendChild(overlay);

        // Update badge positions on scroll/resize
        window.addEventListener("scroll", window._imgData.updatePositions);
        window.addEventListener("resize", window._imgData.updatePositions);

    } catch (e) {
        alert("Error: " + e.message);
    }
})();
