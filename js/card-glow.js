// Cursor-following glow on result cards. Pure CSS custom-prop tracking;
// the visual lives in a ::after radial gradient, so this never touches layout.
(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const grid = document.getElementById('results-grid');
    if (!grid) return;

    grid.addEventListener('pointermove', (e) => {
        const card = e.target.closest('.result-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
    });
})();
