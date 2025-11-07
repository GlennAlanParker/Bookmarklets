javascript: (() => {
    document.querySelectorAll('.vh-content, .vh-content-off').forEach(e => {
        if (e.classList.contains('vh-content')) {
            e.classList.replace('vh-content', 'vh-content-off');
            e.style.backgroundColor = 'yellow'
        } else {
            e.classList.replace('vh-content-off', 'vh-content');
            e.style.backgroundColor = ''
        }
    });
    let b = document.createElement('button');
    b.textContent = 'Restore vh-content';
    b.style.position = 'fixed';
    b.style.top = '10px';
    b.style.right = '10px';
    b.style.backgroundColor = 'green';
    b.style.color = 'white';
    b.style.border = 'none';
    b.style.padding = '8px 12px';
    b.style.cursor = 'pointer';
    b.style.zIndex = '9999';
    b.onclick = () => {
        document.querySelectorAll('.vh-content-off').forEach(e => {
            e.classList.replace('vh-content-off', 'vh-content');
            e.style.backgroundColor = ''
        });
        b.remove()
    };
    document.body.appendChild(b)
})();
