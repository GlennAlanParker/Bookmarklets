javascript:(() => {
    // Select all headings (h1–h6)
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headings.forEach(heading => {
        // Get the tag name in lowercase
        const tag = heading.tagName.toLowerCase();

        // Add a red dashed outline
        heading.style.outline = '2px dashed red';

        // Create a span to show the tag name
        const label = document.createElement('span');
        label.style.color = 'red';
        label.style.fontSize = 'small';
        label.style.marginLeft = '5px';
        label.textContent = `[${tag}]`;

        // Append the label to the heading
        heading.appendChild(label);
    });
})();
