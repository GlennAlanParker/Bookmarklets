javascript:(function(){
    const colors = {
        H1: "#D32F2F", // Dark Red
        H2: "#F57C00", // Dark Orange
        H3: "#0288D1", // Dark Blue
        H4: "#388E3C", // Dark Green
        H5: "#7B1FA2", // Purple
        H6: "#FBC02D"  // Amber
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
    
    alert(\`Outlined and labeled ${headings.length} headings!\`);
})();
