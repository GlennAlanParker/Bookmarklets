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

    // Semi-transparent background versions of the same colors
    const bgColors = {
        red: "rgba(255, 0, 0, 0.15)",
        blue: "rgba(0, 0, 255, 0.15)",
        green: "rgba(0, 128, 0, 0.15)",
        purple: "rgba(128, 0, 128, 0.15)",
        teal: "rgba(0, 128, 128, 0.15)",
        maroon: "rgba(128, 0, 0, 0.15)"
    };

    // Select all headings (h1–h6)
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach(heading => {
        const tag = heading.tagName.toLowerCase();
        const color = colors[tag] || "black";

        // Add dashed outline with the chosen color
        heading.style.outline = `2px dashed ${color}`;

        // Add faint background highlight without affecting text color
        heading.style.backgroundColor = bgColors[color] || "rgba(0,0,0,0.05)";

        // Create a span to show the tag name
        const label = document.createElement("span");
        label.style.color = color; // label uses the heading’s outline color
        label.style.fontSize = "small";
        label.style.marginLeft = "5px";
        label.textContent = `[${tag}]`;

        heading.appendChild(label);
    });
})();
