(function () {
  var KEY = '__gap_heading_labels_v2';
  if (window[KEY]) { try { window[KEY].cleanup(); } catch (e) {} ; return; }

  var state = { badges: [], headings: [], listeners: [] };

  state.cleanup = function () {
    try {
      for (var i = 0; i < state.badges.length; i++) {
        var b = state.badges[i];
        if (b && b.parentNode) b.parentNode.removeChild(b);
      }
      for (var j = 0; j < state.headings.length; j++) {
        var h = state.headings[j];
        if (!h) continue;
        h.style.outline = h.__gapOrigOutline || '';
        h.style.boxShadow = h.__gapOrigBoxShadow || '';
        h.style.borderRadius = h.__gapOrigBorderRadius || '';
        if (typeof h.__gapOrigPosition !== 'undefined') h.style.position = h.__gapOrigPosition;
        delete h.__gapOrigPosition;
        delete h.__gapOrigOutline;
        delete h.__gapOrigBoxShadow;
        delete h.__gapOrigBorderRadius;
        delete h.__gapLabeled;
      }
      for (var k = 0; k < state.listeners.length; k++) {
        var l = state.listeners[k];
        l.target.removeEventListener(l.event, l.handler);
      }
      delete window[KEY];
      console.info('Heading labels removed.');
    } catch (err) { console.error('cleanup error', err); }
  };

  try {
    var nodes = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    if (!nodes || nodes.length === 0) {
      console.warn('No <h1>-<h6> elements found on this page.');
    }

    Array.prototype.forEach.call(nodes, function (h) {
      if (h.__gapLabeled) return;
      state.headings.push(h);

      // Save original values
      h.__gapOrigPosition = h.style.position || '';
      h.__gapOrigOutline = h.style.outline || '';
      h.__gapOrigBoxShadow = h.style.boxShadow || '';
      h.__gapOrigBorderRadius = h.style.borderRadius || '';

      var comp = (window.getComputedStyle) ? window.getComputedStyle(h) : null;
      if (comp && comp.position === 'static') h.style.position = 'relative';

      // subtle inline styling (less likely to be blocked)
      h.style.boxShadow = '0 0 0 1px rgba(0,123,255,0.14)';
      h.style.borderRadius = '6px';

      // create badge
      var span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = h.tagName.toLowerCase();

      // badge inline styles
      span.style.position = 'absolute';
      span.style.top = '0';
      span.style.right = '0';
      span.style.transform = 'translate(25%,-50%)';
      span.style.background = 'rgba(0,123,255,0.95)';
      span.style.color = '#fff';
      span.style.fontSize = '0.65rem';
      span.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace';
      span.style.padding = '3px 6px';
      span.style.borderRadius = '4px';
      span.style.boxShadow = '0 1px 2px rgba(0,0,0,0.18)';
      span.style.pointerEvents = 'none';
      span.style.zIndex = 2147483647;

      // small-screen adjustment
      if (window.innerWidth && window.innerWidth < 520) {
        span.style.fontSize = '0.6rem';
        span.style.padding = '2px 5px';
      }

      h.appendChild(span);
      state.badges.push(span);
      h.__gapLabeled = true;
    });

    // keyboard: Esc or Ctrl+Shift+H to remove
    var keyHandler = function (e) {
      if (e.key === 'Escape') state.cleanup();
      if (e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === 'h') state.cleanup();
    };
    window.addEventListener('keydown', keyHandler);
    state.listeners.push({ target: window, event: 'keydown', handler: keyHandler });

    window[KEY] = state;
    console.info('Heading labels applied. Press Esc or Ctrl+Shift+H to remove.');
  } catch (err) {
    console.error('heading-labels error', err);
  }
})();
