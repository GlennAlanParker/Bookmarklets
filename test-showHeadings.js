(function () {
  var KEY = '__gap_heading_labels_v4';
  if (window[KEY]) { window[KEY].cleanup(); return; }

  var state = { badges: [], headings: [], listeners: [] };

  state.cleanup = function () {
    state.badges.forEach(b => b.remove());
    state.headings.forEach(h => {
      h.style.outline = h.__gapOrigOutline || '';
      h.style.position = h.__gapOrigPosition || '';
      delete h.__gapOrigOutline;
      delete h.__gapOrigPosition;
      delete h.__gapLabeled;
    });
    state.listeners.forEach(l => l.target.removeEventListener(l.event, l.handler));
    delete window[KEY];
    console.info('Heading labels removed.');
  };

  // Stronger/darker colors for each heading level
  var colors = {
    h1: '#c82333',  // dark red
    h2: '#e67e22',  // dark orange
    h3: '#218838',  // dark green
    h4: '#0056b3',  // dark blue
    h5: '#6610f2',  // purple
    h6: '#343a40'   // dark gray
  };

  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
    if (h.__gapLabeled) return;
    state.headings.push(h);

    h.__gapOrigPosition = h.style.position || '';
    h.__gapOrigOutline = h.style.outline || '';

    var comp = window.getComputedStyle(h);
    if (comp.position === 'static') h.style.position = 'relative';

    var tag = h.tagName.toLowerCase();
    var color = colors[tag] || '#000';

    // Darker, thicker outline
    h.style.outline = '4px solid ' + color;

    // Badge
    var span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.textContent = tag.toUpperCase();

    // Badge styles
    span.style.position = 'absolute';
    span.style.top = '0';
    span.style.right = '0';
    span.style.transform = 'translate(30%,-50%)';
    span.style.background = color;
    span.style.color = '#fff';
    span.style.fontSize = '1rem';  // increased size
    span.style.fontWeight = 'bold';
    span.style.fontFamily = 'sans-serif';
    span.style.padding = '5px 9px';
    span.style.borderRadius = '5px';
    span.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    span.style.pointerEvents = 'none';
    span.style.zIndex = 2147483647;

    h.appendChild(span);
    state.badges.push(span);
    h.__gapLabeled = true;
  });

  // Keyboard toggle off (Esc or Ctrl+Shift+H)
  var keyHandler = function (e) {
    if (e.key === 'Escape') state.cleanup();
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') state.cleanup();
  };
  window.addEventListener('keydown', keyHandler);
  state.listeners.push({ target:window, event:'keydown', handler:keyHandler });

  window[KEY] = state;
  console.info('Heading labels applied. Press Esc or Ctrl+Shift+H to remove.');
})();
