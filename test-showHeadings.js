(function () {
  var KEY = '__gap_heading_labels_v5';
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

  var colors = {
    h1: '#c82333',
    h2: '#e67e22',
    h3: '#218838',
    h4: '#0056b3',
    h5: '#6610f2',
    h6: '#343a40'
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

    // Force thicker outline
    h.style.setProperty('outline', '4px solid ' + color, 'important');

    var span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    span.textContent = tag.toUpperCase();

    // Use setProperty with !important for key styles
    span.style.setProperty('position', 'absolute');
    span.style.setProperty('top', '0');
    span.style.setProperty('right', '0');
    span.style.setProperty('transform', 'translate(30%,-50%)');
    span.style.setProperty('background', color);
    span.style.setProperty('color', '#fff');
    span.style.setProperty('fontSize', '1rem', 'important');  // Increased size
    span.style.setProperty('fontWeight', 'bold');
    span.style.setProperty('fontFamily', 'sans-serif');
    span.style.setProperty('padding', '5px 9px');
    span.style.setProperty('borderRadius', '5px');
    span.style.setProperty('boxShadow', '0 2px 4px rgba(0,0,0,0.3)');
    span.style.setProperty('pointerEvents', 'none');
    span.style.setProperty('zIndex', '2147483647');

    h.appendChild(span);
    state.badges.push(span);
    h.__gapLabeled = true;
  });

  var keyHandler = function (e) {
    if (e.key === 'Escape') state.cleanup();
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') state.cleanup();
  };
  window.addEventListener('keydown', keyHandler);
  state.listeners.push({ target:window, event:'keydown', handler:keyHandler });

  window[KEY] = state;
  console.info('Heading labels applied. Press Esc or Ctrl+Shift+H to remove.');
})();
