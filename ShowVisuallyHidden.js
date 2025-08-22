document.querySelectorAll('.vh-content, .vh-content-off').forEach(el => {
    if (el.classList.contains('vh-content')) {
        el.classList.remove('vh-content');
        el.classList.add('vh-content-off');
        el.style.backgroundColor = '#4B0082'; // Dark purple
        el.style.color = '#FFFFFF';           // White text
    } else if (el.classList.contains('vh-content-off')) {
        el.classList.remove('vh-content-off');
        el.classList.add('vh-content');
        el.style.backgroundColor = ''; // Reset to original
        el.style.color = '';           // Reset to original
    }
});
