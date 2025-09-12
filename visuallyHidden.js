javascript:(() => {
    function toggleVHContent(doc) {
        doc.querySelectorAll('.vh-content, .vh-content-off').forEach(el => {
            if (el.classList.contains('vh-content')) {
                el.classList.remove('vh-content');
                el.classList.add('vh-content-off');
                el.style.setProperty('background-color', 'yellow', 'important');
                el.style.setProperty('color', 'black', 'important');
            } else if (el.classList.contains('vh-content-off')) {
                el.classList.remove('vh-content-off');
                el.classList.add('vh-content');
                el.style.removeProperty('background-color');
                el.style.removeProperty('color');
            }
        });
    }

    // Main page
    toggleVHContent(document);

    // Wait for iframe load
    const iframe = document.getElementById('ifPreview');
    if (iframe) {
        iframe.addEventListener('load', () => {
            try {
                toggleVHContent(iframe.contentDocument);
            } catch(e) {
                alert("Can't access iframe (cross-origin).");
            }
        });
    }
})();
