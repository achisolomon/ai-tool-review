// Pure helpers for the suggest modal. No DOM. Exposed as window.SuggestLogic.
(function () {
  function slugify(name) {
    return String(name).toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function registrableDomain(url) {
    try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
  }

  function allTools(data) {
    const out = [];
    for (const track of ['users', 'developers']) for (const cat of data[track] || [])
      for (const sub of cat.subcategories || []) for (const t of sub.tools || []) out.push(t);
    return out;
  }

  function findDuplicates(input, data) {
    const name = (input.name || '').trim().toLowerCase();
    const dom = registrableDomain(input.website || '');
    return allTools(data).filter((t) =>
      (name && t.name && t.name.toLowerCase() === name) ||
      (dom && registrableDomain(t.url || '') === dom));
  }

  function buildPayload(kind, f) {
    if (kind === 'new_tool') {
      return {
        name: f.name, slug: f.slug || slugify(f.name), website: f.website, description: f.description,
        placement: f.placementProvided
          ? { track: f.track, category: f.category, subcategory: f.subcategory } : null,
        tags: f.tags || [], type: f.type || null, pricing_model: f.pricing_model || null, notes: f.notes || null,
      };
    }
    if (kind === 'tool_placement') {
      return { current: f.current, proposed: f.proposed };
    }
    if (kind === 'tool_edit') {
      const changes = {};
      for (const k of Object.keys(f.edited)) if ((f.edited[k] ?? '') !== (f.original[k] ?? '')) {
        changes[k] = { from: f.original[k] ?? '', to: f.edited[k] ?? '' };
      }
      return { changes };
    }
    if (kind === 'taxonomy_change') return f.payload;  // assembled by the form per op
    throw new Error('unknown kind ' + kind);
  }

  window.SuggestLogic = { slugify, registrableDomain, findDuplicates, buildPayload, allTools };
})();
