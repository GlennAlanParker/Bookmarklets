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

    // Stronger semi-transparent background colors for clarity
    const bgColors = {
        red: "rgba(255, 0, 0, 0.4)",
        blue: "rgba(0, 0, 255, 0.4)",
        green: "rgba(0, 128, 0, 0.4)",
        purple: "rgba(128, 0, 128, 0.4)",
        teal: "rgba(0, 128, 128, 0.4)",
        maroon: "rgba(128, 0, 0, 0.4)"
    };

    // Select all headings (h1–h6)
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach(heading => {
        const tag = heading.tagName.toLowerCase();
        const color = colors[tag] || "black";

        // Add dashed outline
        heading.style.outline = `2px dashed ${color}`;

        // Add a solid enough background for visibility
        heading.style.backgroundColor = bgColors[color] || "rgba(0,0,0,0.2)";
        heading.style.padding = "2px 4px"; // add padding so background doesn't cut text

        // Create a small label for the heading level
        const label = document.createElement("span");
        label.style.color = color; // only the label uses the color
        label.style.fontSize = "small";
        label.style.marginLeft = "5px";
        label.textContent = `[${tag}]`;

        heading.appendChild(label);
    });
})();
