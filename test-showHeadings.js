(() => {
  const url = "https://raw.githubusercontent.com/GlennAlanParker/Bookmarklets/main/test-showHeadings.js";

  fetch(url + "?_=" + Date.now(), { cache: "no-store" })
    .then(response => response.text())
    .then(js => {
      try {
        eval(js);

        // Wait until heading boxes exist, then force them visible
        const selector = ".heading-level-box"; // change if needed
        const interval = setInterval(() => {
          const boxes = document.querySelectorAll(selector);
          if (boxes.length > 0) {
            boxes.forEach(el => {
              el.style.display = "block";
              el.style.visibility = "visible";
              el.style.opacity = "1";
            });
            clearInterval(interval);
          }
        }, 100); // check every 100ms

      } catch (e) {
        console.error("Eval error:", e);
      }
    })
    .catch(e => console.error("Failed to load script:", e));
})();
