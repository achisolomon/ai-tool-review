// Cursor-following glow on result cards. Pure CSS custom-prop tracking;
// the visual lives in a ::after radial gradient, so this never touches layout.
(function () {
    'use strict';

    function init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.matchMedia('(hover: none)').matches) return;

        const grid = document.getElementById('results-grid');
        if (!grid) return;

        // Remove any previously-bound listener (avoid duplicates on re-init)
        if (grid.__cardGlowHandler) {
            grid.removeEventListener('pointermove', grid.__cardGlowHandler);
        }

        grid.__cardGlowHandler = (e) => {
            const card = e.target.closest('.result-card');
            if (!card) return;
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
        };

        grid.addEventListener('pointermove', grid.__cardGlowHandler);
    }

    init();
    window.CardGlow = { init };
})();
