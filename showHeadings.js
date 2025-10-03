javascript:(function() {
    // Select all existing heading badges
    const existingBadges = document.querySelectorAll(".heading-badge");

    // If badges already exist, remove them and exit
    if (existingBadges.length > 0) {
        existingBadges.forEach(badge => badge.remove());
        return;
    }

    // Define colors for each heading level
    const colors = {
        H1: "#0050A0",
        H2: "#008000",
        H3: "#990000",
        H4: "#8A2BE2",
        H5: "#CC7700",
        H6: "#4A6C6C"
    };

    // Select all headings on the page
    const headings = document.querySelectorAll("h1,h2,h3,h4,h5,h6");

    // Loop through each heading and add a badge
    headings.forEach(heading => {
        // Create a span element for the badge
        const badge = document.createElement("span");

        // Set badge text as the tag name (e.g., <h1>)
        badge.textContent = "<" + heading.tagName.toLowerCase() + ">";

        // Assign class for potential CSS styling
        badge.className = "heading-badge";

        // Apply inline styles to badge
        Object.assign(badge.style, {
            display: "inline-block",
            verticalAlign: "middle",
            backgroundColor: colors[heading.tagName], // color based on heading level
            color: "#fff",
            fontSize: "12px",
            fontWeight: "bold",
            width: "30px",
            height: "30px",
            borderRadius: "4px",
            marginLeft: "6px",
            textAlign: "center",
            lineHeight: "30px",
            overflow: "hidden",
            whiteSpace: "pre" // preserve text formatting
        });

        // Append the badge to the heading
        heading.appendChild(badge);
    });
})();
