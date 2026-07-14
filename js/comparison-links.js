// Auto-links competitor names in "How It Compares" tables to their internal
// tool pages. Runs on every tool-page render via toolPageInit(). Idempotent.
// Links are built ONLY from landscapeData slugs, so they can never 404.
(function () {
  'use strict';

  // Single source of truth for the internal tool URL (matches _config.yml
  // permalink /tools/:slug/). Never built from scraped competitor text.
  function toolUrl(slug) { return '/tools/' + slug + '/'; }

  // Normalize a name to a match key: lowercase, drop parenthetical qualifiers
  // like "(Python)", then strip everything that is not a-z0-9.
  function norm(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .replace(/\([^)]*\)/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  // Build Map<normKey, slug> from landscapeData. On collision between two
  // DIFFERENT slugs, drop the key entirely (ambiguous → never link).
  function buildIndex(data) {
    var index = new Map();
    var ambiguous = new Set();
    if (!data) return index;
    ['users', 'developers'].forEach(function (track) {
      (data[track] || []).forEach(function (category) {
        (category.subcategories || []).forEach(function (sub) {
          (sub.tools || []).forEach(function (tool) {
            if (!tool || !tool.name || !tool.slug) return;
            var key = norm(tool.name);
            if (!key || ambiguous.has(key)) return;
            if (index.has(key) && index.get(key) !== tool.slug) {
              index.delete(key);
              ambiguous.add(key);
              return;
            }
            index.set(key, tool.slug);
          });
        });
      });
    });
    return index;
  }

  function currentSlug() {
    var el = document.getElementById('tool-data');
    if (!el) return null;
    try { return (JSON.parse(el.textContent) || {}).slug || null; }
    catch (_) { return null; }
  }

  // Header cells hold the tool names (kramdown renders them as <thead><th>).
  // Fall back to the first row's cells if there is no <thead>.
  function headerCells(table) {
    var cells = table.querySelectorAll('thead th');
    if (cells.length) return cells;
    var firstRow = table.querySelector('tr');
    return firstRow ? firstRow.children : [];
  }

  function linkComparisonCompetitors() {
    // Reuse a cached index; build it from landscapeData if absent. If neither
    // is available, no-op gracefully (never throw).
    var index = window.__comparisonIndex ||
      (window.landscapeData
        ? (window.__comparisonIndex = buildIndex(window.landscapeData))
        : null);
    if (!index) return;

    var self = currentSlug();
    var tables = document.querySelectorAll('div.comparison table');
    for (var t = 0; t < tables.length; t++) {
      var cells = headerCells(tables[t]);
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        // Idempotent: skip cells already linked.
        if (cell.querySelector && cell.querySelector('a')) continue;
        // Only transform pure-text cells — never corrupt nested markup.
        if (cell.children && cell.children.length) continue;
        var text = cell.textContent;
        var slug = index.get(norm(text));
        if (!slug || slug === self) continue; // no match, or the page's own tool
        var a = document.createElement('a');
        a.href = toolUrl(slug);
        a.className = 'comparison-competitor-link';
        a.textContent = text;
        cell.textContent = '';
        cell.appendChild(a);
      }
    }
  }

  window.ComparisonLinks = {
    norm: norm,
    buildIndex: buildIndex,
    linkComparisonCompetitors: linkComparisonCompetitors
  };
})();
