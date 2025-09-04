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

    // Select all headings (h1–h6)
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    headings.forEach(heading => {
        const tag = heading.tagName.toLowerCase();
        const color = colors[tag] || "black";

        // Add dashed outline with the chosen color
        heading.style.outline = `2px dashed ${color}`;

        // Add faint background highlight
        heading.style.backgroundColor = color;
        heading.style.opacity = "0.15"; // makes it faint without overpowering text

        // Create a span to show the tag name
        const label = document.createElement("span");
        label.style.color = color;
        label.style.fontSize = "small";
        label.style.marginLeft = "5px";
        label.textContent = `[${tag}]`;

        heading.appendChild(label);
    });
})();
