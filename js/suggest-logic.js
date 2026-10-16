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

  // Hosts where one domain serves many unrelated tools, so the path (the
  // owner/repo or package) is what identifies a tool. Their paths are
  // case-insensitive and may carry a trailing ".git".
  const CODE_HOSTS = ['github.com', 'gitlab.com', 'codeberg.org', 'bitbucket.org',
    'huggingface.co', 'npmjs.com', 'pypi.org', 'sourceforge.net'];

  // Path segment that holds the project name on hosts that prefix it
  // (npmjs.com/package/<name>, pypi.org/project/<name>, ...).
  const PACKAGE_PREFIXES = { 'npmjs.com': 'package', 'pypi.org': 'project', 'sourceforge.net': 'projects' };

  function withScheme(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '');
  }

  function parseUrl(raw) {
    try { return new URL(withScheme(raw)); } catch { return null; }
  }

  function bareHost(u) { return u.hostname.toLowerCase().replace(/^www\./, ''); }

  function isCodeHost(host) { return CODE_HOSTS.includes(host); }

  // Normalizes user input to an absolute http(s) URL, or returns null when it
  // is not a plausible web address (no dot in the host, spaces, bad scheme).
  function normalizeToolUrl(raw) {
    const u = parseUrl(raw);
    if (!u || !/^https?:$/.test(u.protocol)) return null;
    if (!u.hostname.includes('.') || /\s/.test(String(raw).trim())) return null;
    return u.href;
  }

  // Comparison key for "is this the exact same URL": ignores scheme, a leading
  // www., host case, trailing slashes, query string and hash; on code hosts
  // also path case and a trailing .git.
  function urlKey(raw) {
    const u = parseUrl(raw);
    if (!u || !u.hostname) return '';
    const host = bareHost(u);
    let path = u.pathname.replace(/\/+$/, '');
    if (isCodeHost(host)) path = path.replace(/\.git$/i, '').toLowerCase();
    return host + path;
  }

  function findDuplicates(input, data) {
    const key = urlKey(input.website || '');
    if (!key) return [];
    return allTools(data).filter((t) => t.url && urlKey(t.url) === key);
  }

  function titleCase(text) {
    return text.split(/[-_.\s]+/).filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Best-effort tool name from its URL, used when the suggester leaves the name
  // blank: the repo/package name on code hosts, otherwise the site's name.
  function deriveNameFromUrl(raw) {
    const u = parseUrl(raw);
    if (!u || !u.hostname) return '';
    const host = bareHost(u);
    const segments = u.pathname.split('/').filter(Boolean);
    if (isCodeHost(host) && segments.length) {
      const prefix = PACKAGE_PREFIXES[host];
      const idx = prefix && segments[0] === prefix ? 1 : Math.min(1, segments.length - 1);
      const project = (segments[idx] || segments[0]).replace(/\.git$/i, '');
      if (project) return titleCase(project);
    }
    const labels = host.split('.');
    // example.co.uk -> "example"; app.example.com -> "example"
    const secondLevel = labels.length >= 3 && labels[labels.length - 1].length === 2 && labels[labels.length - 2].length <= 3;
    const label = labels[labels.length - (secondLevel ? 3 : 2)] || labels[0];
    return titleCase(label);
  }

  function buildPayload(kind, f) {
    if (kind === 'new_tool') {
      // Only the website is required; a blank name is derived from it so the
      // payload always has a name and slug (apply-suggestions slugifies name).
      const typedName = (f.name || '').trim();
      const name = typedName || deriveNameFromUrl(f.website);
      const nameDerived = !typedName;
      return {
        name, slug: f.slug || slugify(name), website: f.website, description: f.description || '',
        ...(nameDerived ? { name_derived: true } : {}),
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

  function taxonomyObjects(taxonomy, kind) {
    const out = [];
    if (!taxonomy) return out;
    if (kind === 'category') {
      for (const cats of Object.values(taxonomy.categories || {}))
        for (const [slug, c] of Object.entries(cats || {})) out.push({ slug, label: c.name });
    } else if (kind === 'subcategory') {
      for (const cats of Object.values(taxonomy.categories || {}))
        for (const c of Object.values(cats || {}))
          for (const [slug, s] of Object.entries(c.subcategories || {})) out.push({ slug, label: `${c.name} › ${s.name}` });
    } else if (kind === 'tag') {
      for (const [family, tags] of Object.entries(taxonomy.tags || {}))
        if (Array.isArray(tags)) for (const t of tags) out.push({ slug: t.slug, label: `${t.name} (${family})` });
    }
    return out;
  }

  window.SuggestLogic = {
    slugify, registrableDomain, findDuplicates, buildPayload, allTools, taxonomyObjects,
    normalizeToolUrl, urlKey, deriveNameFromUrl,
  };
})();
