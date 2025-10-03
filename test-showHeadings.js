javascript:(function(){
    const colors = {
        H1: "#FF0000", // Red
        H2: "#FF7F00", // Orange
        H3: "#FFFF00", // Yellow
        H4: "#00FF00", // Green
        H5: "#0000FF", // Blue
        H6: "#8B00FF"  // Violet
    };
    
    const headings = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
    
    headings.forEach(h => {
        h.style.outline = `3px solid ${colors[h.tagName]}`;
        h.style.position = "relative";
        
        // Remove existing label if present
        let existingLabel = h.querySelector(".heading-label-bookmarklet");
        if(existingLabel) existingLabel.remove();
        
        const label = document.createElement("span");
        label.textContent = h.tagName;
        label.className = "heading-label-bookmarklet";
        label.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            background: ${colors[h.tagName]};
            color: #fff;
            font-size: 12px;
            font-family: sans-serif;
            font-weight: bold;
            padding: 1px 4px;
            z-index: 9999;
        `;
        h.prepend(label);
    });
    
    alert(`Outlined and labeled ${headings.length} headings!`);
})();
