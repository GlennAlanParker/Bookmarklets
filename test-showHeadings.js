(() => {
  const url = "https://raw.githubusercontent.com/GlennAlanParker/Bookmarklets/main/test-showHeadings.js";

  fetch(url + "?_=" + Date.now(), { cache: "no-store" })
    .then(r => r.text())
    .then(js => {
      try {
        // Execute the script
        eval(js);

        // Wait for heading boxes to appear
        const selector = ".heading-level-box"; // Replace with actual class if different
        const observer = new MutationObserver(() => {
          const boxes = document.querySelectorAll(selector);
          if (boxes.length > 0) {
            boxes.forEach(el => {
              el.style.display = "block";
              el.style.visibility = "visible";
              el.style.opacity = "1";
            });
            observer.disconnect(); // Stop observing once done
          }
        });

        // Observe DOM changes for added nodes
        observer.observe(document.body, { childList: true, subtree: true });

      } catch (e) {
        console.error("Eval error:", e);
      }
    })
    .catch(e => console.error("Failed to load script:", e));
})();
