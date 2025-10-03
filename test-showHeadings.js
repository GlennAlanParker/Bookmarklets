javascript:(() => {
    const colors = { h1: "red", h2: "blue", h3: "green", h4: "purple", h5: "teal", h6: "maroon" };
    const bgColors = { red: "rgba(255,0,0,0.4)", blue: "rgba(0,0,255,0.4)", green: "rgba(0,128,0,0.4)", purple: "rgba(128,0,128,0.4)", teal: "rgba(0,128,128,0.4)", maroon: "rgba(128,0,0,0.4)" };

    // Select all headings, even inside links or accordion triggers
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach((heading) => {
        // Determine heading level
        let tag = heading.tagName.toLowerCase();

        // Check for parent container with data-title-level
        const parentContainer = heading.closest("[data-title-level]");
        if (parentContainer) {
            const level = parseInt(parentContainer.dataset.titleLevel, 10);
            if (level >= 1 && level <= 6) tag = `h${level}`;
        }

        const color = colors[tag] || "black";

        // Apply outline without changing layout
        heading.style.setProperty("outline", `2px dashed ${color}`, "important");

        // Apply visible background
        heading.style.backgroundColor = bgColors[color] || "rgba(0,0,0,0.2)";
        heading.style.boxSizing = "border-box";
        heading.style.position = "relative";

        // Assign correct label
        heading.dataset.headingTag = tag;

        // Add CSS for pseudo-element only once
        if (!document.getElementById("heading-label-style")) {
            const style = document.createElement("style");
            style.id = "heading-label-style";
            style.textContent = `
                h1[data-heading-tag]::after,
                h2[data-heading-tag]::after,
                h3[data-heading-tag]::after,
                h4[data-heading-tag]::after,
                h5[data-heading-tag]::after,
                h6[data-heading-tag]::after {
                    content: " [" attr(data-heading-tag) "]";
                    font-size: 0.8em;
                    color: inherit;
                    margin-left: 0.3em;
                    display: inline;
                }
            `;
            document.head.appendChild(style);
        }
    });
})();
