// Renders the canonical GitHub star count from data/stars.json into the
// tool-page badge. Single source of truth: data/stars.json.
(function () {
  function formatK(n) {
    return Math.floor(n / 1000) + 'k';
  }

  async function render() {
    var badge = document.querySelector('.tool-stars .star-count');
    var slugEl = document.querySelector('[data-tool-slug]');
    if (!badge || !slugEl) return;
    var slug = slugEl.getAttribute('data-tool-slug');
    if (!slug) return;

    try {
      var res = await fetch('/data/stars.json', { cache: 'no-cache' });
      if (!res.ok) return; // keep build-time fallback
      var data = await res.json();
      var entry = data.stars && data.stars[slug];
      if (entry && typeof entry.count === 'number') {
        badge.textContent = formatK(entry.count);
      }
    } catch (e) {
      // network/parse failure: keep build-time fallback, never hide
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
