document.querySelectorAll('.vh-content, .vh-content-off').forEach(el => {
    if (el.classList.contains('vh-content')) {
        el.classList.remove('vh-content');
        el.classList.add('vh-content-off');
        el.style.setProperty('background-color', 'yellow', 'important'); // Yellow highlight
        el.style.setProperty('color', 'black', 'important');             // Black text
    } else if (el.classList.contains('vh-content-off')) {
        el.classList.remove('vh-content-off');
        el.classList.add('vh-content');
        el.style.removeProperty('background-color'); // Reset
        el.style.removeProperty('color');            // Reset
    }
});
