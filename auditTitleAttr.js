javascript:(function() {
    try {
        // Unique IDs and class names
        const STYLE_ID   = 'bm-title-link-outline-style-v2';
        const OBSERVER_KEY = '__bmTitleLinkObserver_v2';
        const EMPTY_CLASS  = 'bm-link-title-empty-v2';
        const NONEMPTY_CLASS = 'bm-link-title-nonempty-v2';

        // If style element already exists, remove everything and reset state (toggle off)
        const existingStyle = document.getElementById(STYLE_ID);
        if (existingStyle) {
            existingStyle.remove();

            // Disconnect mutation observer if running
            if (window[OBSERVER_KEY] && typeof window[OBSERVER_KEY].disconnect === 'function') {
                window[OBSERVER_KEY].disconnect();
                delete window[OBSERVER_KEY];
            }

            // Remove applied classes from all links
            document.querySelectorAll('a.' + EMPTY_CLASS + ', a.' + NONEMPTY_CLASS).forEach(a => {
                a.classList.remove(EMPTY_CLASS, NONEMPTY_CLASS);
            });
            return; // Exit (toggle off complete)
        }

        // Create and inject style element
        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = `
            a.${EMPTY_CLASS} {
                outline: 3px solid darkorange !important;
                outline-offset: 2px !important;
            }
            a.${NONEMPTY_CLASS} {
                outline: 3px solid red !important;
                outline-offset: 2px !important;
            }
        `;
        (document.head || document.documentElement).appendChild(styleEl);

        // Function to apply classes based on title attribute
        const applyClasses = (root) => {
            const links = (root || document).querySelectorAll
                ? (root || document).querySelectorAll('a[title]')
                : [];

            links.forEach(a => {
                // Remove old classes before reapplying
                a.classList.remove(EMPTY_CLASS, NONEMPTY_CLASS);

                // Add correct class based on whether title is empty or not
                if (a.getAttribute('title') === '') {
                    a.classList.add(EMPTY_CLASS);
                } else {
                    a.classList.add(NONEMPTY_CLASS);
                }
            });
        };

        // Apply to current document
        applyClasses(document);

        // Create mutation observer to catch dynamically added links
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (!mutation.addedNodes) continue;

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return; // Only element nodes

                    // If node itself is a link with title
                    if (node.matches && node.matches('a[title]')) {
                        if (node.getAttribute('title') === '') {
                            node.classList.add(EMPTY_CLASS);
                        } else {
                            node.classList.add(NONEMPTY_CLASS);
                        }
                    }

                    // If node contains links with title
                    if (node.querySelectorAll) {
                        node.querySelectorAll('a[title]').forEach(a => {
                            if (a.getAttribute('title') === '') {
                                a.classList.add(EMPTY_CLASS);
                            } else {
                                a.classList.add(NONEMPTY_CLASS);
                            }
                        });
                    }
                });
            }
        });

        // Observe DOM for changes
        observer.observe(document.documentElement || document, {
            childList: true,
            subtree: true
        });

        // Save observer globally for cleanup on toggle-off
        window[OBSERVER_KEY] = observer;

    } catch (err) {
        console.error('bookmarklet error', err);
    }
})();
