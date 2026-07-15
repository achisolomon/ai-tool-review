# Competitor Links in Comparison Tables — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-link competitor names in every tool page's "How It Compares" table to their own catalog page (`/tools/{slug}/`), entirely client-side, with no `.md` edits.

**Architecture:** A new browser module (`js/comparison-links.js`) reads the already-loaded `landscapeData`, builds a normalized `name → slug` index, and rewrites matching header-row cells in `div.comparison table` into internal links. It hooks into the existing idempotent `toolPageInit()` so it runs on direct load and after every SPA content swap. Links are built only from catalog slugs, so they can never 404.

**Tech Stack:** Vanilla ES5-style JS (matches `js/tool-page.js`), Jekyll/kramdown (build), Playwright (tests, one runner), Node `vm` for browser-less unit/invariant specs.

**Spec:** `docs/superpowers/specs/2026-07-14-competitor-links-design.md`

---

## File Structure

| File | Create/Modify | Responsibility |
|------|---------------|----------------|
| `js/comparison-links.js` | Create | The linker: `norm()`, `buildIndex()`, `linkComparisonCompetitors()`. Exposes `window.ComparisonLinks`. |
| `js/tool-page.js` | Modify (`toolPageInit`) | One call to run the linker on every render. |
| `_includes/spa-scripts.html` | Modify | Load `comparison-links.js` before `tool-page.js`. |
| `css/tool.css` | Modify (append) | Subtle `.comparison-competitor-link` style. |
| `tests/comparison-links.spec.js` | Create | All three test layers (unit, invariant, E2E). |

## Notes for the implementer (read once)

- **Build command:** use `bundle exec jekyll build` to regenerate `_site/`. **Do NOT run `npm run build`** — its `prebuild` step regenerates `js/data.js` and reshuffles ~11k lines (filesystem-order churn we must not commit). We are not adding/removing tools, so `js/data.js` must stay untouched.
- **`_site/` is gitignored** — builds never get committed. Safe to rebuild freely.
- **Data shape** (`landscapeData` in `js/data.js`): `data.users` and `data.developers` are arrays of categories; each category has `.subcategories[]`; each subcategory has `.tools[]`; each tool has `.name` and `.slug`. (Same shape iterated by `tests/data-integrity.spec.js`.)
- **Tool page URL / build path:** permalink `/tools/:slug/` → served from `_site/tools/{slug}/index.html`.
- **Real fixture page:** `/tools/orq-ai/`. Its comparison header is `Feature | Orq.ai | Humanloop | PromptLayer | LangSmith`. All of `humanloop`, `promptlayer`, `langsmith` are catalog slugs, so all three link; `Orq.ai` is the page's own tool and must stay unlinked.
- **Run tests:** `npx playwright test tests/comparison-links.spec.js`. The Playwright `webServer` auto-runs `node server.js` (serves `_site/`). Rebuild `_site` before running browser tests so they see your changes.

---

### Task 1: Linker module + Layer-1 unit tests (browser-less)

**Files:**
- Create: `tests/comparison-links.spec.js`
- Create: `js/comparison-links.js`

- [ ] **Step 1: Write the failing unit tests**

Create `tests/comparison-links.spec.js` with exactly this content (later tasks append more `describe` blocks to the same file):

```js
// Competitor-links tests. Layers:
//   1. Pure-function unit tests (browser-less, vm-loaded) — this file, below.
//   2. Never-broken invariant (browser-less) — added in Task 2.
//   3. Browser E2E (Playwright page) — added in Task 4.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
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

  test('ignores tools missing name or slug; placeholder names are absent', () => {
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
    expect(idx.get(norm('Real'))).toBe('real');
    expect(idx.get(norm('Competitor 1'))).toBeUndefined();
    expect(idx.size).toBe(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test tests/comparison-links.spec.js`
Expected: FAIL — `ENOENT` reading `js/comparison-links.js` (module not created yet).

- [ ] **Step 3: Create the linker module**

Create `js/comparison-links.js` with exactly this content:

```js
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
        a.setAttribute('data-spa-link', ''); // SPA router only intercepts [data-spa-link] anchors
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/comparison-links.spec.js`
Expected: PASS (all `norm()` and `buildIndex()` tests green).

- [ ] **Step 5: Commit**

```bash
git add js/comparison-links.js tests/comparison-links.spec.js
git commit -m "feat: add comparison-links module with norm/buildIndex unit tests"
```

---

### Task 2: Never-broken invariant test (browser-less)

Proves that every slug the linker could ever emit resolves to a real built page (and that the permalink format still matches the linker's URL template). This is the "links never break" guarantee, checked across the whole catalog.

**Files:**
- Modify: `tests/comparison-links.spec.js` (append)

- [ ] **Step 1: Append the invariant tests**

Add this to the END of `tests/comparison-links.spec.js`:

```js
import fs from 'fs';

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
```

- [ ] **Step 2: Build the site so the invariant test has pages to check**

Run: `bundle exec jekyll build`
Expected: "done in N.NN seconds" and `_site/` populated. (Do NOT run `npm run build`.)

- [ ] **Step 3: Run the invariant tests to verify they pass**

Run: `npx playwright test tests/comparison-links.spec.js -g "never-broken"`
Expected: PASS — `missing` is empty (all ~448 slugs have a built page) and the permalink assertion matches.

- [ ] **Step 4: Confirm js/data.js was not modified by the build**

Run: `git status --porcelain js/data.js`
Expected: no output (clean). If it shows as modified, run `git checkout js/data.js` — the jekyll build must not touch it, but this guards against accidents.

- [ ] **Step 5: Commit**

```bash
git add tests/comparison-links.spec.js
git commit -m "test: add never-broken invariant for competitor-link slugs"
```

---

### Task 3: Browser E2E tests (authored RED — module not wired yet)

Write the full browser-level suite. It fails now because the built pages don't load `comparison-links.js` yet; Task 4 wires it and turns these green.

**Files:**
- Modify: `tests/comparison-links.spec.js` (append)

- [ ] **Step 1: Append the E2E tests**

Add this to the END of `tests/comparison-links.spec.js`:

```js
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
    expect(r.self).toBeNull();                    // page's own tool (Orq.ai)
    expect(r.humanloop).toBe('/tools/humanloop/'); // catalog competitor linked
    expect(r.fake).toBeNull();                    // non-catalog stays plain
    expect(r.placeholder).toBeNull();             // "Competitor 1" stays plain
    expect(r.nested).toBeNull();                  // nested-markup cell skipped
    expect(r.bodyLinks).toBe(0);                  // body cells never touched
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
          if (i === 0) return; // "Feature"
          if (cell.children.length) return; // skip nested-markup cells
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

  // C: click-through — router navigates to the linked tool page.
  test('clicking a linked competitor navigates to its tool page', async ({ page }) => {
    await page.goto('/tools/orq-ai/');
    await page.waitForFunction(() => window.ComparisonLinks && window.landscapeData);
    const link = page.locator('div.comparison a.comparison-competitor-link[href="/tools/humanloop/"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/tools\/humanloop\/?$/);
    await expect(page.locator('h1')).toContainText('Humanloop');
  });

  // D: idempotency — re-init does not double-wrap.
  test('re-running toolPageInit does not double-wrap links', async ({ page }) => {
    await page.goto('/tools/orq-ai/');
    await page.waitForFunction(() => window.ComparisonLinks && window.landscapeData);
    const counts = await page.evaluate(() => {
      window.toolPageInit();
      window.toolPageInit();
      const cell = [...document.querySelectorAll('div.comparison thead th')]
        .find((c) => c.querySelector('a.comparison-competitor-link'));
      return {
        anchors: cell ? cell.querySelectorAll('a').length : -1,
        nested: cell ? cell.querySelectorAll('a a').length : -1,
      };
    });
    expect(counts.anchors).toBe(1);
    expect(counts.nested).toBe(0);
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
```

- [ ] **Step 2: Run the E2E tests to verify they FAIL (red)**

Run: `npx playwright test tests/comparison-links.spec.js -g "browser E2E"`
Expected: FAIL — `waitForFunction(() => window.ComparisonLinks ...)` times out, because the current `_site` build does not load `comparison-links.js` yet. This is the expected red state before wiring.

- [ ] **Step 3: Commit the (failing) tests**

```bash
git add tests/comparison-links.spec.js
git commit -m "test: add browser E2E for competitor links (red until wired)"
```

---

### Task 4: Wire the module into the page + styling → E2E green

**Files:**
- Modify: `_includes/spa-scripts.html`
- Modify: `js/tool-page.js` (inside `toolPageInit`)
- Modify: `css/tool.css` (append)

- [ ] **Step 1: Load the module before tool-page.js**

In `_includes/spa-scripts.html`, find this line:

```html
<script src="{{ '/js/tool-page.js' | relative_url }}"></script>
```

Insert this line immediately BEFORE it:

```html
<script src="{{ '/js/comparison-links.js' | relative_url }}"></script>
```

- [ ] **Step 2: Call the linker from toolPageInit**

In `js/tool-page.js`, find the `toolPageInit` function:

```js
  function toolPageInit() {
    var tool = readToolData();
    if (!tool) return;
    wireSuggestEdit(tool);
    initReviews(tool);
  }
```

Replace it with:

```js
  function toolPageInit() {
    var tool = readToolData();
    if (!tool) return;
    wireSuggestEdit(tool);
    if (window.ComparisonLinks) window.ComparisonLinks.linkComparisonCompetitors();
    initReviews(tool);
  }
```

- [ ] **Step 3: Add the link styling**

Append to `css/tool.css`:

```css
/* Auto-linked competitor names in "How It Compares" tables. Subtle: signals
   clickability without turning the header row into a wall of blue. */
.comparison-competitor-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted currentColor;
}
.comparison-competitor-link:hover {
  text-decoration: underline;
}
```

- [ ] **Step 4: Rebuild the site**

Run: `bundle exec jekyll build`
Expected: build succeeds; `_site/js/comparison-links.js` now exists and `_site/tools/orq-ai/index.html` references it via the shared script bundle.

- [ ] **Step 5: Run the full spec to verify everything passes (green)**

Run: `npx playwright test tests/comparison-links.spec.js`
Expected: PASS — all layers green (unit, invariant, and the five E2E tests).

- [ ] **Step 6: Confirm js/data.js is still clean**

Run: `git status --porcelain js/data.js`
Expected: no output. If modified, `git checkout js/data.js`.

- [ ] **Step 7: Commit**

```bash
git add _includes/spa-scripts.html js/tool-page.js css/tool.css
git commit -m "feat: link competitor names in comparison tables to their tool pages"
```

---

### Task 5: Full-suite regression + verification

Ensure the change breaks nothing else and the feature is genuinely working.

**Files:** none (verification only)

- [ ] **Step 1: Rebuild and run the entire Playwright suite**

Run: `bundle exec jekyll build && npx playwright test`
Expected: PASS. Pay attention to `tests/tool-page.spec.js`, `tests/spa-tools.spec.js`, and `tests/data-integrity.spec.js` — they exercise the same pages/data and must remain green.

- [ ] **Step 2: Eyeball the feature on the real page (evidence, not assumption)**

Run: `node server.js` (in a background shell), then in a browser or with a quick check, load `http://localhost:8080/tools/orq-ai/` and confirm the "How It Compares" header shows Humanloop / PromptLayer / LangSmith as dotted-underline links, and clicking Humanloop lands on `/tools/humanloop/`. Stop the server when done.

- [ ] **Step 3: Confirm no stray changes**

Run: `git status`
Expected: clean working tree (all feature changes already committed; `_site/` is gitignored; `js/data.js` unchanged).

- [ ] **Step 4: Push**

```bash
git push -u origin claude/website-interviews-competitor-tools-4pwxm2
```

The existing draft PR (#17) will update automatically.

---

## Coverage map (spec → task)

| Spec case | Covered by |
|-----------|-----------|
| 1 catalog competitor linked | Task 3 E2E A + B |
| 2 non-catalog stays plain | Task 3 E2E A |
| 3 placeholder stays plain | Task 1 (buildIndex) + Task 3 E2E A |
| 4 own tool never linked (incl. variant) | Task 3 E2E A |
| 5 "Feature" cell plain | Task 3 E2E A |
| 6 name variants matched | Task 1 (norm) + Task 3 E2E B |
| 7 superset name not mislinked | Task 1 (norm) |
| 8 ambiguous collision dropped | Task 1 (buildIndex) |
| 9 body cells never touched | Task 3 E2E A |
| 10 multiple tables handled | Task 3 E2E B (iterates all `div.comparison table`) |
| 11 idempotent re-run | Task 3 E2E D |
| 12 landscapeData missing → no-op | Task 3 E2E E |
| 13 nested-markup cell skipped | Task 3 E2E A + E |
| 14 every href resolves (never 404) | Task 2 invariant |
| 15 click-through navigates | Task 3 E2E C |
| 16 permalink format matches template | Task 2 invariant |

## Self-Review notes

- **Spec coverage:** every one of the 16 cases maps to a concrete task above.
- **Types/naming consistency:** `norm`, `buildIndex`, `linkComparisonCompetitors`, `window.ComparisonLinks`, `window.__comparisonIndex`, and class `comparison-competitor-link` are used identically in the module, the wiring, and all tests.
- **No placeholders:** every code step contains complete, runnable content.
- **Build safety:** `bundle exec jekyll build` (never `npm run build`) is specified everywhere a build is needed, with an explicit `js/data.js` cleanliness check.
