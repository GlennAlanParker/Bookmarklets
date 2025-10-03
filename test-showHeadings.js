javascript:(() => {
    const colors = { h1: "red", h2: "blue", h3: "green", h4: "purple", h5: "teal", h6: "maroon" };
    const bgColors = { red: "rgba(255,0,0,0.4)", blue: "rgba(0,0,255,0.4)", green: "rgba(0,128,0,0.4)", purple: "rgba(128,0,128,0.4)", teal: "rgba(0,128,128,0.4)", maroon: "rgba(128,0,0,0.4)" };

    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach(heading => {
        const tag = heading.tagName.toLowerCase();
        const color = colors[tag] || "black";

        // Force outline with !important without affecting layout
        heading.style.setProperty("outline", `2px dashed ${color}`, "important");

        // Background color only, no padding/margin changes
        heading.style.backgroundColor = bgColors[color] || "rgba(0,0,0,0.2)";
        heading.style.boxSizing = "border-box"; // ensures background doesn't add height

        // Add a pseudo-element for [tag] instead of appending a span
        heading.style.position = "relative";
        if (!heading.dataset.tagAdded) { // prevent duplicates
            const style = document.createElement("style");
            style.innerHTML = `
                h1[data-tag-added="true"]::after,
                h2[data-tag-added="true"]::after,
                h3[data-tag-added="true"]::after,
                h4[data-tag-added="true"]::after,
                h5[data-tag-added="true"]::after,
                h6[data-tag-added="true"]::after {
                    content: " [${tag}]";
                    font-size: 0.8em;
                    color: ${color};
                    display: inline;
                }
            `;
            document.head.appendChild(style);
            heading.dataset.tagAdded = "true";
        }
    });
})();
