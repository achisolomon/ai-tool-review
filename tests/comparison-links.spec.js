// Competitor-links tests. Layers:
//   1. Pure-function unit tests (browser-less, vm-loaded) — this file, below.
//   2. Never-broken invariant (browser-less) — added in Task 2.
//   3. Browser E2E (Playwright page) — added in Task 4.
import { test, expect } from '@playwright/test';
import fs, { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';

// Load js/comparison-links.js in a minimal sandbox and return window.ComparisonLinks.
// The module only touches window/document inside functions, so stubs suffice for
// the pure functions (norm, buildIndex).
function loadComparisonLinks() {
  const src = readFileSync(path.join(process.cwd(), 'js', 'comparison-links.js'), 'utf8');
  const ctx = { window: {}, document: {}, Map, Set, console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx.window.ComparisonLinks;
}

test.describe('comparison-links: norm()', () => {
  test('lowercases, strips spaces/punctuation, and drops parentheticals', () => {
    const { norm } = loadComparisonLinks();
    expect(norm('LangChain (Python)')).toBe('langchain');
    expect(norm('Hugging Face')).toBe('huggingface');
    expect(norm('HuggingFace')).toBe('huggingface');
    expect(norm('llama.cpp')).toBe('llamacpp');
    expect(norm('Orq.ai')).toBe('orqai');
    expect(norm('Competitor 1')).toBe('competitor1');
    expect(norm(null)).toBe('');
  });

  test('a superset name does not collapse to the base name', () => {
    const { norm } = loadComparisonLinks();
    expect(norm('HuggingFace Inference')).not.toBe(norm('Hugging Face'));
  });
});

test.describe('comparison-links: buildIndex()', () => {
  test('maps normalized tool names to slugs across both tracks', () => {
    const { buildIndex, norm } = loadComparisonLinks();
    const data = {
      users: [{ subcategories: [{ tools: [{ name: 'Andi', slug: 'andi' }] }] }],
      developers: [{ subcategories: [{ tools: [
        { name: 'Humanloop', slug: 'humanloop' },
        { name: 'PromptLayer', slug: 'promptlayer' },
      ] }] }],
    };
    const idx = buildIndex(data);
    expect(idx.get(norm('Humanloop'))).toBe('humanloop');
    expect(idx.get(norm('promptlayer'))).toBe('promptlayer');
    expect(idx.get(norm('Andi'))).toBe('andi');
  });

  test('drops keys where two different slugs collide (ambiguous → never link)', () => {
    const { buildIndex, norm } = loadComparisonLinks();
    const data = {
      users: [],
      developers: [{ subcategories: [{ tools: [
        { name: 'Foo Bar', slug: 'foo-bar' },
        { name: 'FooBar', slug: 'foobar-other' },
      ] }] }],
    };
    const idx = buildIndex(data);
    expect(idx.has(norm('foobar'))).toBe(false);
  });

  test('indexes only tools that have both a name and a slug', () => {
    const { buildIndex, norm } = loadComparisonLinks();
    const data = {
      users: [],
      developers: [{ subcategories: [{ tools: [
        { name: 'NoSlug' },
        { slug: 'no-name' },
        { name: 'Real', slug: 'real' },
      ] }] }],
    };
    const idx = buildIndex(data);
    // Only the fully-formed tool is indexed — the name-only and slug-only
    // entries are excluded. (A placeholder like "Competitor 1" therefore has
    // no key simply because it is never a catalog tool; that "stays plain"
    // behavior is exercised end-to-end in the browser E2E suite.)
    expect([...idx.keys()]).toEqual([norm('Real')]);
    expect(idx.get(norm('Real'))).toBe('real');
  });
});

// Load landscapeData from js/data.js (same technique as data-integrity.spec.js).
function loadLandscapeData() {
  const src = readFileSync(path.join(process.cwd(), 'js', 'data.js'), 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src + '\n;this.__data = landscapeData;', ctx);
  return ctx.__data;
}

function forEachTool(data, cb) {
  ['users', 'developers'].forEach((track) =>
    (data[track] || []).forEach((category) =>
      (category.subcategories || []).forEach((sub) =>
        (sub.tools || []).forEach((tool) => cb(tool))
      )
    )
  );
}

test.describe('comparison-links: never-broken invariant', () => {
  test('every catalog slug resolves to a built /tools/{slug}/ page', () => {
    const siteDir = path.join(process.cwd(), '_site');
    test.skip(!fs.existsSync(siteDir), '_site not built — run: bundle exec jekyll build');
    const data = loadLandscapeData();
    const missing = [];
    forEachTool(data, (tool) => {
      if (!tool.slug) return;
      const page = path.join(siteDir, 'tools', tool.slug, 'index.html');
      if (!fs.existsSync(page)) missing.push(tool.slug);
    });
    expect(missing).toEqual([]);
  });

  test('tool permalink format still matches the linker URL template (/tools/:slug/)', () => {
    const cfg = readFileSync(path.join(process.cwd(), '_config.yml'), 'utf8');
    expect(cfg).toMatch(/permalink:\s*\/tools\/:slug\//);
  });
});

test.describe('comparison-links: browser E2E', () => {
  // A: controlled synthetic table — deterministic coverage of every branch.
  test('links catalog competitors only; leaves Feature/self/placeholder/non-catalog/nested plain', async ({ page }) => {
    await page.goto('/tools/orq-ai/');
    await page.waitForFunction(() => window.ComparisonLinks && window.landscapeData);
    const r = await page.evaluate(() => {
      const wrap = document.createElement('div');
      wrap.className = 'comparison';
      wrap.innerHTML =
        '<table><thead><tr>' +
          '<th>Feature</th>' +
          '<th>Orq.ai</th>' +
          '<th>Humanloop</th>' +
          '<th>TotallyNotARealTool</th>' +
          '<th>Competitor 1</th>' +
          '<th><span class="x">Humanloop</span></th>' +
        '</tr></thead><tbody><tr>' +
          '<td>Open Source</td><td>No</td><td>Humanloop</td><td>x</td><td>y</td><td>z</td>' +
        '</tr></tbody></table>';
      document.querySelector('.tool-content').appendChild(wrap);
      window.ComparisonLinks.linkComparisonCompetitors();
      const th = wrap.querySelectorAll('thead th');
      const href = (c) => { const a = c.querySelector('a'); return a ? a.getAttribute('href') : null; };
      return {
        feature: href(th[0]),
        self: href(th[1]),
        humanloop: href(th[2]),
        fake: href(th[3]),
        placeholder: href(th[4]),
        nested: href(th[5]),
        bodyLinks: wrap.querySelectorAll('tbody a').length,
      };
    });
    expect(r.feature).toBeNull();
    expect(r.self).toBeNull();
    expect(r.humanloop).toBe('/tools/humanloop/');
    expect(r.fake).toBeNull();
    expect(r.placeholder).toBeNull();
    expect(r.nested).toBeNull();
    expect(r.bodyLinks).toBe(0);
  });

  // B: real rendered table matches expected computed independently from data.js.
  test('real Orq.ai table matches expected links derived from data.js', async ({ page }) => {
    await page.goto('/tools/orq-ai/');
    await page.waitForFunction(() => window.ComparisonLinks && window.landscapeData);
    const rows = await page.evaluate(() => {
      const { norm, buildIndex } = window.ComparisonLinks;
      const index = buildIndex(window.landscapeData);
      const self = 'orq-ai';
      const out = [];
      document.querySelectorAll('div.comparison table').forEach((table) => {
        table.querySelectorAll('thead th').forEach((cell, i) => {
          if (i === 0) return;
          if (cell.children.length) return;
          const text = cell.textContent;
          const slug = index.get(norm(text));
          const expected = (slug && slug !== self) ? '/tools/' + slug + '/' : null;
          const a = cell.querySelector('a.comparison-competitor-link');
          out.push({ text: text, expected: expected, actual: a ? a.getAttribute('href') : null });
        });
      });
      return out;
    });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.actual).toBe(row.expected);
  });

  // C: click-through — the SPA router navigates in-place to the linked tool page
  // (no full reload). A marker set before the click must survive the swap.
  test('clicking a linked competitor SPA-navigates to its tool page', async ({ page }) => {
    await page.goto('/tools/orq-ai/');
    await page.waitForFunction(() => window.ComparisonLinks && window.landscapeData);
    await page.evaluate(() => { window.__navMarker = 'orq-ai'; });
    const link = page.locator('div.comparison a.comparison-competitor-link[href="/tools/humanloop/"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/tools\/humanloop\/?$/);
    await expect(page.locator('h1')).toContainText('Humanloop');
    // Survives => in-place SPA nav. undefined => a full page reload happened.
    expect(await page.evaluate(() => window.__navMarker)).toBe('orq-ai');
  });

  // D: idempotency — re-init does not double-wrap ANY linked cell.
  test('re-running toolPageInit does not double-wrap links', async ({ page }) => {
    await page.goto('/tools/orq-ai/');
    await page.waitForFunction(() => window.ComparisonLinks && window.landscapeData);
    const counts = await page.evaluate(() => {
      window.toolPageInit();
      window.toolPageInit();
      const linkedCells = [...document.querySelectorAll('div.comparison thead th')]
        .filter((c) => c.querySelector('a.comparison-competitor-link'));
      return {
        linkedCells: linkedCells.length,
        links: document.querySelectorAll('div.comparison thead th a.comparison-competitor-link').length,
        nested: document.querySelectorAll('div.comparison thead th a a').length,
      };
    });
    expect(counts.linkedCells).toBeGreaterThan(0);   // Orq.ai page links Humanloop/PromptLayer/LangSmith
    expect(counts.links).toBe(counts.linkedCells);   // exactly one link per linked cell (no double-wrap)
    expect(counts.nested).toBe(0);                   // no nested anchors
  });

  // E: graceful degradation — missing landscapeData is a silent no-op.
  test('missing landscapeData is a no-op and does not throw', async ({ page }) => {
    await page.goto('/tools/orq-ai/');
    await page.waitForFunction(() => window.ComparisonLinks);
    const outcome = await page.evaluate(() => {
      const wrap = document.createElement('div');
      wrap.className = 'comparison';
      wrap.innerHTML = '<table><thead><tr><th>Feature</th><th>Humanloop</th></tr></thead></table>';
      document.querySelector('.tool-content').appendChild(wrap);
      window.landscapeData = undefined;
      window.__comparisonIndex = undefined;
      let threw = false;
      try { window.ComparisonLinks.linkComparisonCompetitors(); }
      catch (_) { threw = true; }
      return { threw: threw, linked: wrap.querySelectorAll('a').length };
    });
    expect(outcome.threw).toBe(false);
    expect(outcome.linked).toBe(0);
  });
});
