// Tool page init. Re-callable by the SPA router after a content swap.
// Reads tool data from the #tool-data JSON island (not Liquid), so it works
// on both direct load and SPA navigation. Idempotent.
(function () {
  'use strict';

  function readToolData() {
    var el = document.getElementById('tool-data');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (_) { return null; }
  }

  function wireSuggestEdit(tool) {
    var btn = document.getElementById('tool-suggest-open');
    if (!btn || btn.dataset.wired === '1') return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', function (e) {
      if (!window.Suggest) return;
      window.Suggest.open({ mode: 'tool', trigger: e.currentTarget, tool: {
        name: tool.name,
        slug: tool.slug,
        category: tool.category,
        subcategory: tool.subcategory,
        url: tool.website,
        type: tool.type,
        desc: tool.description
      } });
    });
  }

  function toolPageInit() {
    var tool = readToolData();
    if (!tool) return;
    wireSuggestEdit(tool);
    // Review init is added in a later task.
  }

  window.toolPageInit = toolPageInit;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', toolPageInit);
  } else {
    toolPageInit();
  }
})();
