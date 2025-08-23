(() => {
  const url = "https://raw.githubusercontent.com/GlennAlanParker/Bookmarklets/main/test-showHeadings.js";

  // Add cache-busting query parameter to always get the latest version
  const fetchUrl = url + "?_=" + Date.now();

  fetch(fetchUrl, { cache: "no-store" })
    .then(response => response.text())
    .then(js => {
      try {
        // Evaluate the fetched JavaScript
        eval(js);

        // Ensure all heading level boxes are visible
        document.querySelectorAll(".heading-level-box").forEach(el => {
          el.style.display = "block";
          el.style.visibility = "visible";
          el.style.opacity = "1";
        });

      } catch (e) {
        console.error("Eval error:", e);
      }
    })
    .catch(e => console.error("Failed to load script:", e));
})();
