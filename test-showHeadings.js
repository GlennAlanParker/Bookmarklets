(() => {
  // 1. GitHub raw URL + cache-busting
  const url = "https://raw.githubusercontent.com/GlennAlanParker/Bookmarklets/main/test-showHeadings.js?_=" + Date.now();

  // 2. Inject script dynamically
  const script = document.createElement("script");
  script.src = url;
  script.onload = () => {
    console.log("Script loaded successfully.");

    // 3. Selector for heading level boxes (update if different)
    const selector = ".heading-level-box";

    // 4. Use MutationObserver to detect boxes created dynamically
    const observer = new MutationObserver(() => {
      const boxes = document.querySelectorAll(selector);
      if (boxes.length > 0) {
        boxes.forEach(el => {
          el.style.display = "block";
          el.style.visibility = "visible";
          el.style.opacity = "1";

          // Scroll box into view
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        observer.disconnect(); // Stop observing once boxes are found
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  script.onerror = () => console.error("Failed to load script from GitHub.");

  // 5. Add the script to the page
  document.body.appendChild(script);
})();
