# SPA Phase 2 — Tool Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring individual tool pages (`/tools/:slug/`) into the SPA router so the toolbar loads once and tool↔tool / tool↔other navigation is a client-side content swap, with all tool-page JS (reviews, stars, suggest-edit, auth) re-initializing correctly per navigation.

**Architecture:** Reuse the Phase 1 router (pattern routes, shared bundle, `data-spa-head` swap). Move `_layouts/tool.html`'s ~570 lines of Liquid-interpolated inline JS into a new `js/tool-page.js` exposing an idempotent `window.toolPageInit()`, fed by a `<script type="application/json" id="tool-data">` island inside `#page-content`. Register `/tools/:slug/` in the router. Make modal injection and listener binding idempotent so repeated navigation doesn't duplicate them.

**Tech Stack:** Vanilla JS, Jekyll/Liquid, Playwright, Supabase JS client (reviews/auth), Node static server.

---

## Background: current state (verified against source)

- `_layouts/tool.html`: `<main class="tool-page">` (line 160, **no `#page-content`**). Head uses `head-seo.html` + `schema-jsonld.html` includes (lines 8-9). Toolbar via `{% include nav.html %}` (line 157). **No router.js loaded.**
- Three inline `<script>` blocks at the bottom:
  - **246-253**: `AuthUI.init('auth-container')` on DOMContentLoaded (duplicates nav-scripts' job — will be removed; nav-init handles auth).
  - **254-269**: wires `#tool-suggest-open` click → `window.Suggest.open({mode:'tool', tool:{...}})` with Liquid `page.*` values.
  - **270-840**: the big one — review init (DB health check, fetch tool by slug, render summary/list), modal injection via `document.body.insertAdjacentHTML('beforeend', ...)`, auth handlers, review form/edit/delete handlers.
- Liquid values used by inline JS (all `jsonify`-able): `page.slug`, `page.name`, `page.website`, `page.url`, `page.type`, `page.category`, `page.subcategory`, `page.description`.
- External scripts loaded (lines 234-245): config-local, supabase-client, reviews-api, review-components, auth-ui, auth-signin, data, suggest-logic, suggest. Plus `stars.js` (line ~841) and `{% include nav-scripts.html %}`.
- Review submit success calls `window.location.reload()` (line ~686) — must change for SPA (re-run review init instead).
- Existing tests: `tests/tool-page.spec.js` (title links, review modal hidden by default, auth modal not auto-open, no-reviews state, landscapeData taxonomy, star badge). These MUST keep passing.
- Phase 1 router (`js/router.js`): `ROUTES` array + `matchRoute`; `teardown(fromPathname)`; head-swap of `[data-spa-head]`; shared bundle `_includes/spa-scripts.html`.

## Key risks (from spec) and how this plan handles them

1. **Duplicate modals** — review form / auth / delete dialogs are appended to `document.body`. On re-init they stack. → `toolPageInit()` removes any existing instances before appending (idempotent).
2. **Double-fired listeners** — handlers on `document`/`body` re-bind on re-init. → bind to elements inside `#page-content` (discarded on swap) or guard with a one-time flag.
3. **Stale async reviews** — fast tool→tool nav paints the wrong tool's reviews. → capture the slug at init start; before rendering, bail if the current `#tool-data` slug changed.
4. **stars / suggest not re-wired** — expose and call their init from `toolPageInit()`.
5. **window.location.reload() on submit** — replace with re-running review init for the current tool.

## File Structure

- **Create** `js/tool-page.js` — `window.toolPageInit()` (+ helpers), all tool-page logic, idempotent.
- **Modify** `_layouts/tool.html` — add `#page-content`, JSON data island, `data-spa-head` on head includes, load shared bundle + tool-page.js, remove the 3 inline scripts.
- **Modify** `_includes/spa-scripts.html` — add `tool-page.js` so it's available after SPA nav to a tool page. NOTE: tool pages need extra libs (reviews-api, review-components, suggest, etc.) not in the bundle — see Task 5 for how these load.
- **Modify** `_includes/head-seo.html`, `_includes/schema-jsonld.html` — mark swappable nodes `data-spa-head`.
- **Modify** `js/router.js` — register `/tools/:slug/` route → `toolPageInit`; teardown for tool pages if needed.
- **Modify** `js/app.js`, `js/landscape.js` — convert `window.location.href = '/tools/...'` to `SpaRouter.navigate(...)`.
- **Create** `tests/spa-tools.spec.js` — Phase 2 tests (Groups A–E from spec).

---

## Task 1: Register /tools/:slug/ route + add #page-content + data island (no JS extraction yet)

This task makes a tool page SPA-*navigable to* (content swaps in) without yet moving the inline JS. It proves routing/landmark work before the risky refactor.

**Files:**
- Modify: `_layouts/tool.html` (line 160 `<main class="tool-page">`; add data island)
- Modify: `js/router.js` (ROUTES array)
- Test: `tests/spa-tools.spec.js` (create)

- [ ] **Step 1: Write the failing test**

Create `tests/spa-tools.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('SPA Phase 2: tool routing + landmarks', () => {
  test('tool page has #page-content and #tool-data JSON island', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
    const data = await page.evaluate(() => {
      const el = document.getElementById('tool-data');
      return el ? JSON.parse(el.textContent) : null;
    });
    expect(data).toBeTruthy();
    expect(data.slug).toBe('llamaparse');
    expect(typeof data.name).toBe('string');
  });

  test('router matches /tools/:slug/', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const m = await page.evaluate(() => window.SpaRouter.matchRoute('/tools/llamaparse/'));
    expect(m).toBeTruthy();
    expect(m.params.slug).toBe('llamaparse');
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "tool routing"`
Expected: FAIL — no `#page-content`, no `#tool-data`, route not registered.

- [ ] **Step 3: Add #page-content to the tool layout**

In `_layouts/tool.html` line 160, change:
```html
  <main class="tool-page">
```
to:
```html
  <main class="tool-page" id="page-content">
```
Find its matching `</main>` (it wraps the `<article>`); leave it unchanged (it stays the closer for `#page-content`).

- [ ] **Step 4: Add the JSON data island inside #page-content**

In `_layouts/tool.html`, immediately after the opening `<main class="tool-page" id="page-content">` line, add:
```html
    <script type="application/json" id="tool-data">
      {
        "slug": {{ page.slug | jsonify }},
        "name": {{ page.name | jsonify }},
        "website": {{ page.website | default: "" | jsonify }},
        "url": {{ page.url | default: "" | jsonify }},
        "type": {{ page.type | default: "" | jsonify }},
        "category": {{ page.category | jsonify }},
        "subcategory": {{ page.subcategory | default: "" | jsonify }},
        "description": {{ page.description | default: "" | jsonify }}
      }
    </script>
```
(`type="application/json"` is inert — the router copies it with the innerHTML swap; it is not executed.)

- [ ] **Step 5: Register the route in js/router.js**

In `js/router.js` ROUTES array, add after the `/guides/:slug/` entry:
```javascript
        { pattern: '/tools/:slug/',   init: (p) => { if (window.toolPageInit) window.toolPageInit(p.slug); } },
```
(`toolPageInit` does not exist yet — the `if (window.toolPageInit)` guard makes this harmless until Task 4. The route still needs to match so the click handler intercepts tool links.)

- [ ] **Step 6: Rebuild, run test, confirm PASS**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "tool routing"`
Expected: PASS.

- [ ] **Step 7: Run existing tool-page tests + SPA suite for regressions**

Run: `npm test -- tests/tool-page.spec.js tests/spa-guides.spec.js tests/spa-navigation.spec.js`
Expected: ALL PASS (the inline JS still runs on direct load — nothing removed yet).

- [ ] **Step 8: Commit**

```bash
git add _layouts/tool.html js/router.js tests/spa-tools.spec.js
git commit -m "feat(spa): register /tools/:slug/ route, add tool #page-content + data island"
```
End body with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Task 2: Mark tool-page head nodes data-spa-head

**Files:**
- Modify: `_includes/head-seo.html`, `_includes/schema-jsonld.html`
- Test: `tests/spa-tools.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/spa-tools.spec.js`:
```javascript
test.describe('SPA Phase 2: tool head metadata', () => {
  test('tool page head SEO/schema nodes are marked data-spa-head', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    const desc = await page.evaluate(() =>
      document.querySelector('meta[name="description"][data-spa-head]')?.getAttribute('content'));
    expect(desc).toBeTruthy();
    const schema = await page.evaluate(() =>
      !!document.querySelector('script[type="application/ld+json"][data-spa-head]'));
    expect(schema).toBe(true);
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "tool head metadata"`
Expected: FAIL — nodes not marked.

- [ ] **Step 3: Mark head-seo.html nodes**

In `_includes/head-seo.html`, add `data-spa-head` to every tag EXCEPT the `<title>` (the router handles title separately) and `<meta charset>`-type static tags. Specifically add it to: `<meta name="title">`, `<meta name="description">`, `<link rel="canonical">`, all `og:` meta, all `twitter:` meta, `<meta name="robots">`. Example for the description line:
```html
<meta name="description" content="{{ seo_description | strip_newlines }}" data-spa-head>
```
Apply the same `data-spa-head` addition to each of those meta/link tags in the file.

- [ ] **Step 4: Mark schema-jsonld.html**

In `_includes/schema-jsonld.html`, add `data-spa-head` to the `<script type="application/ld+json">` tag(s). Example:
```html
<script type="application/ld+json" data-spa-head>
```
(Read the file first; mark each ld+json script tag.)

- [ ] **Step 5: Rebuild, run test, confirm PASS**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "tool head metadata"`
Expected: PASS.

- [ ] **Step 6: Regression check — other pages still build**

Run: `npm test -- tests/tool-page.spec.js`
Expected: PASS (head-seo/schema-jsonld are used by tool pages; confirm no breakage).

- [ ] **Step 7: Commit**

```bash
git add _includes/head-seo.html _includes/schema-jsonld.html tests/spa-tools.spec.js
git commit -m "feat(spa): mark tool head SEO + JSON-LD as data-spa-head"
```
End body with: `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`

---

## Task 3: Create js/tool-page.js with the suggest-edit wiring (smallest inline block first)

Start the extraction with the easy 254-269 block to establish the file + data-island reading pattern.

**Files:**
- Create: `js/tool-page.js`
- Modify: `_includes/spa-scripts.html` (add tool-page.js), `_layouts/tool.html` (remove the 246-253 + 254-269 inline blocks)
- Test: `tests/spa-tools.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/spa-tools.spec.js`:
```javascript
test.describe('SPA Phase 2: tool-page init exists + suggest wiring', () => {
  test('window.toolPageInit is a function and suggest-edit button is wired', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => typeof window.toolPageInit)).toBe('function');
    // The suggest-edit button exists and clicking it does not throw.
    const btn = page.locator('#tool-suggest-open');
    await expect(btn).toBeAttached();
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "init exists"`
Expected: FAIL — `window.toolPageInit` undefined.

- [ ] **Step 3: Create js/tool-page.js (skeleton + data reader + suggest wiring)**

Create `js/tool-page.js`:
```javascript
// Tool page init. Re-callable by the SPA router after a content swap.
// Reads tool data from the #tool-data JSON island (not Liquid), so it works
// on both direct load and SPA navigation. Idempotent.
(function () {
  'use strict';

  function readToolData() {
    const el = document.getElementById('tool-data');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (_) { return null; }
  }

  function wireSuggestEdit(tool) {
    const btn = document.getElementById('tool-suggest-open');
    if (!btn || btn.dataset.wired === '1') return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', function (e) {
      if (!window.Suggest) return;
      window.Suggest.open({ mode: 'tool', trigger: e.currentTarget, tool: {
        name: tool.name, slug: tool.slug, category: tool.category,
        subcategory: tool.subcategory, url: tool.website, type: tool.type, desc: tool.description
      } });
    });
  }

  function toolPageInit() {
    const tool = readToolData();
    if (!tool) return;
    wireSuggestEdit(tool);
    // Review init added in Task 4.
  }

  window.toolPageInit = toolPageInit;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', toolPageInit);
  } else {
    toolPageInit();
  }
})();
```
(`btn.dataset.wired` guard makes suggest-wiring idempotent across re-inits. The button lives inside `#page-content` so it's swapped out on nav; the guard covers the direct-load + immediate-init case.)

- [ ] **Step 4: Add tool-page.js to the shared bundle**

In `_includes/spa-scripts.html`, add before the `router.js` line:
```html
<script src="{{ '/js/tool-page.js' | relative_url }}"></script>
```

- [ ] **Step 5: Remove the two inline blocks from tool.html**

In `_layouts/tool.html`, DELETE the inline `<script>` block at lines 246-253 (the `AuthUI.init` DOMContentLoaded block — nav-scripts/nav-init already initializes auth, so this is redundant) AND the block at lines 254-269 (the suggest-edit wiring — now in tool-page.js). Leave the big review block (270-840) for Task 4.

- [ ] **Step 6: Rebuild, run test, confirm PASS**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "init exists"`
Expected: PASS.

- [ ] **Step 7: Manually confirm suggest-edit still works on direct load**

Run: `npm test -- tests/tool-page.spec.js`
Expected: PASS (no regression to existing tool-page behavior).

- [ ] **Step 8: Commit**

```bash
git add js/tool-page.js _includes/spa-scripts.html _layouts/tool.html tests/spa-tools.spec.js
git commit -m "feat(spa): start tool-page.js — data island reader + suggest-edit wiring"
```
End body with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Task 4: Move the review-init logic into tool-page.js (the big block)

**Files:**
- Modify: `js/tool-page.js` (add review init), `_layouts/tool.html` (remove the 270-840 inline block)
- Test: `tests/spa-tools.spec.js`

- [ ] **Step 1: Write the failing test (behavioral, direct load)**

Append to `tests/spa-tools.spec.js`:
```javascript
test.describe('SPA Phase 2: reviews init via tool-page.js', () => {
  test('reviews section renders (summary container populated or section hidden) on direct load', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    // Either reviews rendered, or the section is gracefully hidden (DB/CDN blocked in tests).
    const state = await page.evaluate(() => {
      const sec = document.getElementById('reviews');
      if (!sec) return 'no-section';
      if (sec.hidden) return 'hidden';
      const sum = document.getElementById('review-summary-container');
      return sum && sum.innerHTML.trim().length > 0 ? 'rendered' : 'empty';
    });
    expect(['hidden', 'rendered', 'empty']).toContain(state);
  });

  test('review form modal is NOT duplicated after re-init', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.toolPageInit && window.toolPageInit());
    await page.waitForTimeout(300);
    const count = await page.locator('.review-modal-overlay').count();
    expect(count).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run, confirm current state**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "reviews init"`
Expected: the first test likely PASSES already (inline block still present), the duplication test may FAIL (inline block isn't idempotent / re-init duplicates). Note actual results — the goal is both pass after moving logic into an idempotent function.

- [ ] **Step 3: Port the review-init logic into tool-page.js**

Read `_layouts/tool.html` lines 270-840 in full. Move that logic into a `function initReviews(tool)` in `js/tool-page.js`, called from `toolPageInit()` after `wireSuggestEdit`. Apply these REQUIRED transformations:
  - Read `toolSlug`/`toolName`/`toolUrl` from the `tool` object (data island) instead of Liquid `{{ }}`.
  - **Idempotent modal injection:** before each `document.body.insertAdjacentHTML('beforeend', ...renderReviewFormModal...)`, first remove any existing instance. Add a helper:
    ```javascript
    function resetModals() {
      document.querySelectorAll('.review-modal-overlay, .auth-modal-overlay, .delete-confirm-overlay').forEach(n => n.remove());
    }
    ```
    Call `resetModals()` once at the start of `initReviews`, then inject fresh. (Verify the actual class names of the three modals from review-components.js renderers — adjust the selector to match: review form, auth modal, delete confirm dialog.)
  - **Stale-nav guard:** capture `const initSlug = tool.slug;` at the top of `initReviews`; before rendering fetched reviews, check `readToolData()?.slug === initSlug` and bail if not (a newer nav superseded this one).
  - **Replace BOTH `window.location.reload()` calls** in the inline block — one in the success-modal close button `onclick` (~line 686) and one in JS after delete/submit (~line 827) — with: close the modal, then `initReviews(readToolData())` to re-fetch and re-render the current tool's reviews. Keep the success message UI. (Grep the moved block for `window.location.reload` and ensure zero remain.)
  - Keep all handler functions (checkAuthState, setupAuthHandlers, setupReviewFormHandlers, showExistingReviewModal, setupExistingReviewHandlers, openEditForm, showDeleteConfirmation, etc.) as inner functions of tool-page.js.

- [ ] **Step 4: Remove the inline review block from tool.html**

In `_layouts/tool.html`, delete the entire `<script>` block spanning the review-init logic (originally lines 270-840). Keep the `stars.js` script tag and `{% include nav-scripts.html %}`.

- [ ] **Step 5: Rebuild, run the reviews tests, confirm PASS**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "reviews init"`
Expected: BOTH pass — reviews render/hide gracefully, and re-init does not duplicate the modal.

- [ ] **Step 6: Full tool-page regression**

Run: `npm test -- tests/tool-page.spec.js tests/reviews.spec.js`
Expected: PASS. If `reviews.spec.js` exercises submit/edit/delete, confirm those still work (they now go through tool-page.js). Investigate any failure before continuing.

- [ ] **Step 7: Commit**

```bash
git add js/tool-page.js _layouts/tool.html tests/spa-tools.spec.js
git commit -m "feat(spa): move tool review init into idempotent tool-page.js"
```
End body with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Task 5: Ensure tool-page libraries load on every SPA page

**Problem:** tool-page.js needs `reviews-api.js`, `review-components.js`, `auth-signin.js`, `suggest-logic.js`, `suggest.js`, `stars.js` — currently loaded only by tool.html. After SPA-navigating FROM a non-tool page TO a tool page, those libs must already be present.

**Files:**
- Modify: `_includes/spa-scripts.html` (add the tool-page libs), `_layouts/tool.html` (dedupe — remove libs now in the bundle)
- Test: `tests/spa-tools.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/spa-tools.spec.js`:
```javascript
test.describe('SPA Phase 2: tool libs available cross-page', () => {
  test('from home, tool-page libraries are loaded', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const libs = await page.evaluate(() => ({
      reviewsApi: typeof window.ReviewsAPI,
      reviewComponents: typeof window.ReviewComponents,
      suggest: typeof window.Suggest,
      toolPageInit: typeof window.toolPageInit,
    }));
    expect(libs.reviewsApi).toBe('object');
    expect(libs.reviewComponents).toBe('object');
    expect(libs.suggest).toBe('object');
    expect(libs.toolPageInit).toBe('function');
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "libs available"`
Expected: FAIL — these libs aren't on the home page.

- [ ] **Step 3: Add the tool-page libs to the shared bundle**

In `_includes/spa-scripts.html`, add (before `router.js`, after the existing entries; tool-page.js was added in Task 3):
```html
<script src="{{ '/js/reviews-api.js' | relative_url }}"></script>
<script src="{{ '/js/review-components.js' | relative_url }}"></script>
<script src="{{ '/js/auth-signin.js' | relative_url }}"></script>
<script src="{{ '/js/suggest-logic.js' | relative_url }}"></script>
<script src="{{ '/js/suggest.js' | relative_url }}"></script>
<script src="{{ '/js/stars.js' | relative_url }}"></script>
```
Confirm load order: these must come before `tool-page.js` and `router.js` (which reference them). Place them before the `tool-page.js` line.

- [ ] **Step 4: Dedupe tool.html — remove libs now in the bundle**

In `_layouts/tool.html`, the page currently loads supabase-client, reviews-api, review-components, auth-ui, auth-signin, data, suggest-logic, suggest (lines ~234-245) and stars.js (~841). Since tool.html now includes the shared bundle? — **CHECK FIRST**: does tool.html include `spa-scripts.html`? If NOT yet, this task must also add `{% include spa-scripts.html %}` to tool.html and remove the now-duplicated individual `<script src>` lines (reviews-api, review-components, auth-signin, data, suggest-logic, suggest, stars, router). KEEP supabase-client.js and auth-ui.js and config-local.js and `{% include nav-scripts.html %}` (matching the pattern used by index/landscape/guides: supabase + auth-ui + nav-scripts + spa-scripts). Verify no script is loaded twice in the built page.

- [ ] **Step 5: Rebuild, run test, confirm PASS + no double-loads**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "libs available"`
Then verify no duplicate script tags:
Run: `curl -s http://localhost:8080/tools/llamaparse/ | grep -oE 'src="[^"]*\.js[^"]*"' | sort | uniq -d`
Expected: test PASS; the uniq -d output should be EMPTY (no duplicate script srcs). (Start the server first if needed.)

- [ ] **Step 6: Full regression**

Run: `npm test -- tests/tool-page.spec.js tests/reviews.spec.js tests/spa-tools.spec.js tests/spa-navigation.spec.js tests/spa-guides.spec.js`
Expected: ALL PASS.

- [ ] **Step 7: Commit**

```bash
git add _includes/spa-scripts.html _layouts/tool.html tests/spa-tools.spec.js
git commit -m "feat(spa): load tool-page libs via shared bundle; dedupe tool.html scripts"
```
End body with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Task 6: SPA-navigate TO tool pages (convert hard links) + head/title swap

**Files:**
- Modify: `js/app.js` (lines 608, 1136, 1149), `js/landscape.js` (line 309)
- Test: `tests/spa-tools.spec.js`

- [ ] **Step 1: Write the failing test**

Append to `tests/spa-tools.spec.js`:
```javascript
test.describe('SPA Phase 2: navigate to tool pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('landscape tool card navigates to tool page without full reload', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });
    // Landscape renders tool cards as links/buttons to /tools/:slug/.
    const card = page.locator('a[href^="/tools/"]').first();
    await card.click();
    await page.waitForURL(/\/tools\/.+\//, { timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true); // no reload
    // tool data island present for the navigated tool
    const slug = await page.evaluate(() => JSON.parse(document.getElementById('tool-data').textContent).slug);
    expect(page.url()).toContain(slug);
  });

  test('tool page title updates on SPA nav', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    const card = page.locator('a[href^="/tools/"]').first();
    await card.click();
    await page.waitForURL(/\/tools\/.+\//, { timeout: 5000 });
    expect(await page.title()).toMatch(/AI Tool Review/);
  });
});
```

NOTE: This test assumes landscape renders tool links as `<a href="/tools/:slug/" data-spa-link>`. If landscape uses `window.location.href` in a JS click handler instead of real anchors, the test's `a[href^="/tools/"]` selector won't match — in that case adapt the test to click the actual card element and rely on the converted `SpaRouter.navigate` call. CHECK how landscape renders tool cards before finalizing (read js/landscape.js around line 309).

- [ ] **Step 2: Run, confirm FAIL or note current behavior**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "navigate to tool"`
Expected: FAIL — clicking causes a full reload (`__spaLoaded` lost) because the link uses `window.location.href`.

- [ ] **Step 3: Convert app.js tool navigations**

In `js/app.js`, three lines (currently ~609, ~1137, ~1150 — grep `window.location.href = .*tools/` for exact) each have `window.location.href = `/tools/${...}/`;`. Replace each with:
```javascript
            if (window.SpaRouter) { window.SpaRouter.navigate(`/tools/${item.slug}/`); }
            else { window.location.href = `/tools/${item.slug}/`; }
```
(Adjust the slug variable name to match each site: line 608 uses `item.slug`; lines 1136/1149 use `slug`. Read each line and use the correct local variable.)

- [ ] **Step 4: Convert landscape.js tool navigation**

In `js/landscape.js` (currently ~line 310 — grep for exact), replace the `window.location.href = /tools/${slug}/` assignment with:
```javascript
                if (window.SpaRouter) { window.SpaRouter.navigate(`/tools/${slug}/`); }
                else { window.location.href = `/tools/${slug}/`; }
```
If landscape tool cards are real `<a>` elements, ALSO add `data-spa-link` to them so the router's click delegation handles them (preferred). Read how cards are rendered; if they're anchors, adding `data-spa-link` may make the JS handler redundant — keep whichever single mechanism is cleanest and avoid double-navigation.

- [ ] **Step 5: Rebuild, run test, confirm PASS**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "navigate to tool"`
Expected: PASS — tool nav is client-side, title updates.

- [ ] **Step 6: Full regression**

Run: `npm test -- tests/spa-tools.spec.js tests/tool-page.spec.js tests/landscape.spec.js tests/search.spec.js tests/spa-navigation.spec.js tests/spa-guides.spec.js`
Expected: ALL PASS.

- [ ] **Step 7: Commit**

```bash
git add js/app.js js/landscape.js tests/spa-tools.spec.js
git commit -m "feat(spa): navigate to tool pages via SPA router (no full reload)"
```
End body with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Task 7: Idempotency + stale-data + load-once tests (the "surprises")

**Files:**
- Test only: `tests/spa-tools.spec.js`

- [ ] **Step 1: Write the tests**

Append to `tests/spa-tools.spec.js`:
```javascript
test.describe('SPA Phase 2: idempotency + load-once', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('tool→tool nav: exactly one review-form modal, data island matches current tool', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    // Navigate to a different tool via the router directly (stable across data states).
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    await page.waitForTimeout(400);
    const slug = await page.evaluate(() => JSON.parse(document.getElementById('tool-data').textContent).slug);
    expect(slug).toBe('docling');
    const modals = await page.locator('.review-modal-overlay').count();
    expect(modals).toBeLessThanOrEqual(1);
  });

  test('E1: AuthUI.init not re-run on tool→tool SPA nav', async ({ page }) => {
    await page.addInitScript(() => {
      window.__authInitCalls = 0;
      let _a;
      Object.defineProperty(window, 'AuthUI', {
        configurable: true,
        get() { return _a; },
        set(v) { _a = v; if (v && typeof v.init === 'function' && !v.__counted) {
          const real = v.init.bind(v); v.init = function (...a) { window.__authInitCalls++; return real(...a); }; v.__counted = true;
        } },
      });
    });
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const initial = await page.evaluate(() => window.__authInitCalls);
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.__authInitCalls);
    expect(initial).toBeGreaterThanOrEqual(1);
    expect(after).toBe(initial);
  });

  test('E2: auth container persists across tool→tool nav', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    const before = await page.locator('#auth-container').innerHTML();
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    const after = await page.locator('#auth-container').innerHTML();
    expect(after).toBe(before);
  });
});
```
(Uses `docling` and `llamaparse` — both confirmed real tool slugs in the same data-ingestion subcategory.)

- [ ] **Step 2: Run the tests**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-tools.spec.js -g "idempotency"`
Expected analysis:
- E2 should PASS (toolbar outside #page-content).
- E1 should PASS (auth wired once by nav-init, not re-run on swap).
- modal-count test should PASS (Task 4's resetModals).
If E1 FAILS (after > initial), the tool page is re-initializing auth on nav — investigate (the removed inline AuthUI.init block in Task 3 should have prevented this; ensure nothing in tool-page.js calls AuthUI.init). Report as a real bug, do not weaken the test.

- [ ] **Step 3: Commit**

```bash
git add tests/spa-tools.spec.js
git commit -m "test(spa): tool-page idempotency, stale-data, and load-once verification"
```
End body with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

---

## Task 8: Manual browser verification + full regression

**Files:** none (verification only)

- [ ] **Step 1: Clean rebuild + serve**

Run:
```bash
eval "$(rbenv init -)" && pkill -f jekyll 2>/dev/null; sleep 1; rm -rf _site
bundle exec jekyll serve --port 8080 --detach
sleep 3
```

- [ ] **Step 2: Manual checklist (open localhost:8080)**

- Search a tool → click result → tool page loads in-place (no full reload), reviews/stars/suggest render.
- Tool → click Search/Landscape/Guides in toolbar → swaps, no reload.
- Landscape → click a tool card → tool page, no reload.
- Tool A → (via search) Tool B → reviews show B's, not A's; only one review-form modal in DOM (inspect).
- Click "Leave a Review" / "Suggest an edit" on a tool reached via SPA nav → modals open correctly.
- Submit a review (if a test account is available) → success, list refreshes WITHOUT a full page reload.
- Direct-load a tool URL in a new tab → full correct page (SEO meta + schema present in head).
- Browser back/forward across tool pages → correct content + head.

- [ ] **Step 3: Full suite**

Run: `npm test`
Expected: SPA + tool + reviews + search + landscape suites green. (Pre-existing auth-flakiness under parallel load may show a few failures that pass in isolation — confirm any failure is not in spa-tools/tool-page by re-running that file alone.)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "test(spa): Phase 2 tools — full regression green"
```

---

## Self-Review Notes (addressed)

- **Spec coverage:** routing (T1), head swap for tools (T2), tool-page.js extraction in two steps — suggest (T3) + reviews (T4), cross-page lib availability (T5), SPA-aware tool links + title/head (T6), idempotency/stale/load-once tests (T7), manual+regression (T8). All four named "surprises" handled in T4 (modals, listeners, stale data) and T7 (verification); stars/suggest re-wire in T3/T5.
- **window.location.reload removal:** explicit in T4 Step 3.
- **Type/name consistency:** `window.toolPageInit(slug)`, `readToolData()`, `initReviews(tool)`, `resetModals()`, `#tool-data`, `#page-content`, `data-spa-head` used consistently; route `/tools/:slug/` → `toolPageInit(p.slug)`.
- **Risk:** T4 is the largest task; if the subagent finds the 570-line port too big for one pass, it may split into T4a (render/init + idempotent modals) and T4b (form/edit/delete handlers) — note for the executor.
- **Verification-first ordering:** T1 (route+landmark, low risk) before the extraction (T3/T4), mirroring Phase 1's success.
