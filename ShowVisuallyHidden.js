document.querySelectorAll('.vh-content, .vh-content-off').forEach(el => {
    if (el.classList.contains('vh-content')) {
        el.classList.remove('vh-content');
        el.classList.add('vh-content-off');
        el.style.backgroundColor = '#E6E6FA'; // Light purple highlight
    } else if (el.classList.contains('vh-content-off')) {
        el.classList.remove('vh-content-off');
        el.classList.add('vh-content');
        el.style.backgroundColor = ''; // Reset to original
    }
});
