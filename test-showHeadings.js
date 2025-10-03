javascript:(() => {
    // Map each heading level to a distinct web-safe color
    const colors = {
        h1: "red",
        h2: "blue",
        h3: "green",
        h4: "purple",
        h5: "teal",
        h6: "maroon"
    };

    // Semi-transparent background colors (slightly stronger for visibility)
    const bgColors = {
        red: "rgba(255, 0, 0, 0.25)",
        blue: "rgba(0, 0, 255, 0.25)",
        green: "rgba(0, 128, 0, 0.25)",
        purple: "rgba(128, 0, 128, 0.25)",
        teal: "rgba(0, 128, 128, 0.25)",
        maroon: "rgba(128, 0, 0, 0.25)"
    };

    // Select all headings (h1–h6)
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach(heading => {
        const tag = heading.tagName.toLowerCase();
        const color = colors[tag] || "black";

        // Add dashed outline (does not affect text color)
        heading.style.outline = `2px dashed ${color}`;

        // Add semi-transparent background highlight
        heading.style.backgroundColor = bgColors[color] || "rgba(0,0,0,0.1)";

        // Create a small label to show the tag name
        const label = document.createElement("span");
        label.style.color = color; // only the label uses the outline color
        label.style.fontSize = "small";
        label.style.marginLeft = "5px";
        label.textContent = `[${tag}]`;

        heading.appendChild(label);
    });
})();
