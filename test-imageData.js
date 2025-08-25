javascript:(() => {
  try {
    const LSK = "imgDataOverlay_v1";

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
          this.styleEl?.remove();
          delete window._imgData;
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
    };

    // --- Styles ---
    const styleEl = d.createElement("style");
    styleEl.textContent = `
      .imgData-overlay {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 320px;
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        font-family: Arial, sans-serif;
        font-size: 12px;
        overflow-y: auto;
        z-index: 999999;
        display: flex;
        flex-direction: column;
      }
      .imgData-header {
        display: flex;
        align-items: center;         /* vertical centering */
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid #666;
        background: #222;
      }
      .imgData-header h1 {
        font-size: 22px;             /* Change #1 */
        margin: 0;
        margin-left: 20px;           /* Change #1 */
        flex: 1;
        text-align: left;
      }
      .imgData-controls {
        display: flex;
        gap: 8px;
      }
      .imgData-btn {
        cursor: pointer;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #e91e63;
        color: #fff;
        user-select: none;
      }
      .imgData-close {
        cursor: pointer;
        font-size: 16px;
        padding: 0 6px;
        color: #fff;
      }
      .imgData-body {
        flex: 1;
        padding: 8px;
      }
      .imgData-entry {
        border-bottom: 1px solid #444;
        padding: 4px 0;
        display: flex;
        align-items: flex-start;
      }
      .imgData-num {
        background: #e91e63;
        border-radius: 4px;
        padding: 2px 6px;
        margin-right: 10px;          /* Change #2 */
        font-weight: bold;
        font-size: 12px;
      }
      .imgData-badge {
        position: absolute;
        background: rgba(233, 30, 99, 0.9);
        color: #fff;
        font-size: 12px;
        font-weight: bold;
        border-radius: 4px;
        padding: 2px 5px;
        z-index: 999999;
        pointer-events: none;
      }
      .imgData-footer {
        padding: 6px 8px;
        font-size: 11px;
        border-top: 1px solid #666;
        text-align: center;
        background: #111;
      }
    `;
    d.head.appendChild(styleEl);
    window._imgData.styleEl = styleEl;

    // --- Overlay ---
    const overlay = d.createElement("div");
    overlay.className = "imgData-overlay";
    overlay.innerHTML = `
      <div class="imgData-header">
        <h1>Image Data</h1>
        <div class="imgData-controls">
          <div class="imgData-btn" id="toggleBadges">Toggle Badges</div>
          <div class="imgData-close">&times;</div>
        </div>
      </div>
      <div class="imgData-body"></div>
      <div class="imgData-footer">
        Use "Toggle Badges" to show/hide pink markers on images.
      </div>
    `;
    d.body.appendChild(overlay);
    window._imgData.overlay = overlay;

    const body = overlay.querySelector(".imgData-body");

    // Close button
    overlay.querySelector(".imgData-close").onclick = () => window._imgData.cleanup();

    // Toggle badges button
    overlay.querySelector("#toggleBadges").onclick = () => {
      window._imgData.badgesVisible = !window._imgData.badgesVisible;
      window._imgData.badges.forEach(
        b => (b.box.style.display = window._imgData.badgesVisible ? "block" : "none")
      );
    };

    // --- Process images ---
    let idx = 1;
    d.querySelectorAll("img").forEach(img => {
      const rect = img.getBoundingClientRect();
      const badge = d.createElement("div");
      badge.className = "imgData-badge";
      badge.textContent = idx;
      badge.style.top = (window.scrollY + rect.top + 4) + "px";
      badge.style.left = (window.scrollX + rect.left + 4) + "px";
      d.body.appendChild(badge);

      window._imgData.badges.push({ box: badge, img });

      // Entry with attributes in original order
      const entry = d.createElement("div");
      entry.className = "imgData-entry";
      entry.innerHTML = `
        <div class="imgData-num">${idx}</div>
        <div>
          <div><strong>Src:</strong> ${img.src}</div>
          <div><strong>Alt:</strong> ${img.alt || "(none)"}</div>
          <div><strong>Size:</strong> ${img.naturalWidth}×${img.naturalHeight}</div>
        </div>
      `;
      body.appendChild(entry);

      idx++;
    });
  } catch (e) {
    alert("Error: " + e.message);
  }
})();
