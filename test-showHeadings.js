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

        // Create a small label inline so it doesn't resize container
        const label = document.createElement("span");
        label.style.color = color;
        label.style.fontSize = "small";
        label.style.marginLeft = "0.3em"; // minimal spacing
        label.textContent = `[${tag}]`;
        label.style.display = "inline"; // ensures it doesn't create a block

        heading.appendChild(label);
    });
})();
