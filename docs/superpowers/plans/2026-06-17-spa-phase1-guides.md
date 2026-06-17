# SPA Phase 1 — Guides/Article Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring individual article pages (`/guides/:slug/`) into the SPA router so the shared toolbar loads once and navigation to/from articles is a client-side content swap, not a full reload.

**Architecture:** Generalize the router from an exact-match `PAGE_INITS` map to pattern-based `ROUTES` with `:param` support. Add a shared script bootstrap (`spa-scripts.html`) so every SPA page can initialize any other page. Convert the article layout (`learn.html`) to expose a re-callable `articlePageInit()` (TOC building) and wrap its swappable region in `#page-content`. Add `data-spa-head` head-metadata swapping so article meta/title stay accurate during in-session navigation.

**Tech Stack:** Vanilla JS (no framework), Jekyll/Liquid templates, Playwright tests, Node static server (`server.js`).

---

## Background: current state (verified)

- `js/router.js` uses exact-match `PAGE_INITS = { '/', '/landscape.html', '/guides/' }`. Click handler gates on `PAGE_INITS.hasOwnProperty(pathname)` ([router.js:101](js/router.js#L101)).
- `_layouts/learn.html` (article layout): loads **no** router.js and **no** page-init scripts; uses `<main class="learn-layout">` (no `#page-content`); has an inline `DOMContentLoaded` TOC-building script (lines 209–252); article head tags are inline (lines 8–16), not the tool-only `head-seo.html`.
- `guides.html`: loads `supabase-client.js`, `auth-ui.js`, `router.js` only — **not** app.js/landscape.js/hero-map/card-glow/data.js.
- `landscape.html`: loads data.js, landscape.js, hero-map, card-glow, router.js — **not** app.js.
- `index.html`: loads the full set + router.js.
- Article cards already link to `/guides/:slug/` (the `/learn/` builder bug was fixed in commit `f9b578d`).
- "No reload" test pattern: set `window.__spaLoaded = true` after load; assert it survives navigation.

## File Structure

- **Create** `_includes/spa-scripts.html` — single source of the common SPA script bundle (data.js, app.js, landscape.js, hero-map.js, card-glow.js, router.js). Loaded on all SPA pages.
- **Modify** `js/router.js` — pattern routing (`ROUTES` + `matchRoute`), head-metadata swap, register `/guides/:slug/`.
- **Modify** `js/learn-page.js` — NEW file holding `window.articlePageInit()` (the TOC logic extracted from learn.html).
- **Modify** `_layouts/learn.html` — add `#page-content`, `data-spa-head` on head tags, load `spa-scripts.html`, replace inline TOC script with `learn-page.js` + init call.
- **Modify** `index.html`, `landscape.html`, `guides.html` — replace per-page script lists with `{% include spa-scripts.html %}` (so every page loads the same set). Add `data-spa-head` to swappable head tags.
- **Create** `tests/spa-guides.spec.js` — Phase 1 test groups (A3, A5, A6, D, E for guides).

---

## Task 1: Shared SPA script bootstrap include

**Files:**
- Create: `_includes/spa-scripts.html`
- Test: `tests/spa-guides.spec.js`

- [ ] **Step 1: Write the failing test**

Create `tests/spa-guides.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('SPA Phase 1: shared bootstrap', () => {
  test('article page loads router.js and page-init functions', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const has = await page.evaluate(() => ({
      router: typeof window.SpaRouter,
      appInit: typeof window.appInit,
      landscapeInit: typeof window.landscapeInit,
    }));
    expect(has.router).toBe('object');
    expect(has.appInit).toBe('function');
    expect(has.landscapeInit).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/spa-guides.spec.js -g "shared bootstrap"`
Expected: FAIL — `has.router` is `'undefined'` (learn.html loads no router.js yet).

- [ ] **Step 3: Create the bootstrap include**

Create `_includes/spa-scripts.html`:

```html
<!-- Shared SPA script bundle. Loaded on every SPA page so the router can
     initialize any destination page after a content swap. Single source of
     truth — pages include this instead of listing scripts individually. -->
<script src="{{ '/js/data.js' | relative_url }}"></script>
<script src="{{ '/js/app.js' | relative_url }}"></script>
<script src="{{ '/js/landscape.js' | relative_url }}"></script>
<script src="{{ '/js/hero-map.js' | relative_url }}"></script>
<script src="{{ '/js/card-glow.js' | relative_url }}"></script>
<script src="{{ '/js/learn-page.js' | relative_url }}"></script>
<script src="{{ '/js/router.js' | relative_url }}"></script>
```

- [ ] **Step 4: Add the include to learn.html (temporary placement to pass the test)**

In `_layouts/learn.html`, after line 207 (`<script src="{{ '/js/auth-ui.js' | relative_url }}"></script>`), add:

```html
  {% include spa-scripts.html %}
```

(Task 5 finishes the learn.html refactor; this gets the bootstrap loading now.)

- [ ] **Step 5: Build and run test to verify it passes**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "shared bootstrap"`
Expected: FAIL still — `learn-page.js` does not exist yet (404), and `window.appInit` requires app.js to load without error. If app.js throws on the article page (missing DOM elements), guard is handled in Task 5. For now expect router + landscapeInit defined; appInit may be undefined.

NOTE: This task intentionally lands the bundle; the appInit assertion fully passes after Task 5 (idempotent inits). Adjust the test to assert only `router` and `landscapeInit` here, and add the `appInit` assertion in Task 5.

Revise the test from Step 1 to:

```javascript
    expect(has.router).toBe('object');
    expect(has.landscapeInit).toBe('function');
```

Run again. Expected: FAIL until `learn-page.js` exists (router.js is last script; a 404 on learn-page.js blocks nothing since scripts load independently). Actually router will be defined. Expected: PASS for router + landscapeInit.

- [ ] **Step 6: Commit**

```bash
git add _includes/spa-scripts.html _layouts/learn.html tests/spa-guides.spec.js
git commit -m "feat(spa): shared script bootstrap include for SPA pages"
```

---

## Task 2: Pattern-based routing in router.js

**Files:**
- Modify: `js/router.js:4-12` (PAGE_INITS → ROUTES), `js/router.js:87-88` (init lookup), `js/router.js:101` (click guard)
- Test: `tests/spa-guides.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `tests/spa-guides.spec.js`:

```javascript
test.describe('SPA Phase 1: route matching', () => {
  test('matchRoute resolves static and param routes with correct precedence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(() => ({
      guidesIndex: !!window.SpaRouter.matchRoute('/guides/'),
      article: !!window.SpaRouter.matchRoute('/guides/some-slug/'),
      home: !!window.SpaRouter.matchRoute('/'),
      unknown: !!window.SpaRouter.matchRoute('/nope/'),
      articleSlug: window.SpaRouter.matchRoute('/guides/some-slug/')?.params?.slug,
    }));
    expect(r.guidesIndex).toBe(true);
    expect(r.article).toBe(true);
    expect(r.home).toBe(true);
    expect(r.unknown).toBe(false);
    expect(r.articleSlug).toBe('some-slug');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/spa-guides.spec.js -g "route matching"`
Expected: FAIL — `window.SpaRouter.matchRoute` is not a function.

- [ ] **Step 3: Replace PAGE_INITS with ROUTES + matchRoute**

In `js/router.js`, replace lines 4–12:

```javascript
    const ROUTES = [
        { pattern: '/',               init: () => {
            if (window.appInit) window.appInit();
            if (window.HeroMap) window.HeroMap.start();
            if (window.CardGlow) window.CardGlow.init();
        } },
        { pattern: '/landscape.html', init: () => { if (window.landscapeInit) window.landscapeInit(); } },
        { pattern: '/guides/',        init: () => { /* guides index — static */ } },
        { pattern: '/guides/:slug/',  init: () => { if (window.articlePageInit) window.articlePageInit(); } },
    ];

    // Compile a route pattern to a regex; ':name' segments become capture groups.
    function compile(pattern) {
        const names = [];
        const rx = pattern.replace(/:[^/]+/g, (m) => { names.push(m.slice(1)); return '([^/]+)'; });
        return { re: new RegExp('^' + rx + '$'), names };
    }

    // Exact patterns first, then param patterns, so '/guides/' beats '/guides/:slug/'.
    const COMPILED = ROUTES
        .map(r => ({ ...r, ...compile(r.pattern), isParam: r.pattern.includes(':') }))
        .sort((a, b) => (a.isParam === b.isParam) ? 0 : a.isParam ? 1 : -1);

    function matchRoute(pathname) {
        for (const r of COMPILED) {
            const m = r.re.exec(pathname);
            if (m) {
                const params = {};
                r.names.forEach((n, i) => { params[n] = m[i + 1]; });
                return { init: r.init, params };
            }
        }
        return null;
    }
```

- [ ] **Step 4: Update the init lookup in navigate()**

In `js/router.js`, replace lines 87–88 (`const init = PAGE_INITS[toPathname]; if (init) init();`) with:

```javascript
            const route = matchRoute(toPathname);
            if (route) route.init(route.params);
```

- [ ] **Step 5: Update the click guard**

In `js/router.js`, replace line 101 (`if (!PAGE_INITS.hasOwnProperty(pathname)) return;`) with:

```javascript
        if (!matchRoute(pathname)) return;
```

- [ ] **Step 6: Export matchRoute**

In `js/router.js`, replace line 112 (`window.SpaRouter = { navigate };`) with:

```javascript
    window.SpaRouter = { navigate, matchRoute };
```

- [ ] **Step 7: Build and run test to verify it passes**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "route matching"`
Expected: PASS.

- [ ] **Step 8: Run existing SPA tests to confirm no regression**

Run: `npm test -- tests/spa-navigation.spec.js`
Expected: PASS (all existing tests still green).

- [ ] **Step 9: Commit**

```bash
git add js/router.js tests/spa-guides.spec.js
git commit -m "feat(spa): pattern-based routing with :param support"
```

---

## Task 3: Extract article TOC into re-callable articlePageInit()

**Files:**
- Create: `js/learn-page.js`
- Modify: `_layouts/learn.html:209-252` (remove inline TOC script)
- Test: `tests/spa-guides.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `tests/spa-guides.spec.js`:

```javascript
test.describe('SPA Phase 1: article init', () => {
  test('articlePageInit builds TOC from article headings', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    // TOC should be populated on direct load
    const count = await page.locator('#toc-list li').count();
    expect(count).toBeGreaterThan(0);
    expect(typeof await page.evaluate(() => window.articlePageInit)).toBe('function');
  });

  test('articlePageInit is idempotent (no duplicate TOC entries on re-run)', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const before = await page.locator('#toc-list li').count();
    await page.evaluate(() => window.articlePageInit());
    const after = await page.locator('#toc-list li').count();
    expect(after).toBe(before);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/spa-guides.spec.js -g "article init"`
Expected: FAIL — `window.articlePageInit` is undefined (still inline `DOMContentLoaded`).

- [ ] **Step 3: Create learn-page.js with idempotent init**

Create `js/learn-page.js`:

```javascript
// Article (guide) page init. Builds the in-article TOC from h2/h3 headings and
// wires scroll-spy. Exposed as window.articlePageInit() so the SPA router can
// re-run it after a content swap. Idempotent: clears the TOC before rebuilding.
(function () {
  'use strict';

  let observer = null;

  function articlePageInit() {
    const tocList = document.getElementById('toc-list');
    if (!tocList) return;

    // Idempotent: tear down any previous run.
    if (observer) { observer.disconnect(); observer = null; }
    tocList.innerHTML = '';

    const headings = document.querySelectorAll('.learn-content h2, .learn-content h3');
    headings.forEach(function (h) {
      if (!h.id) {
        h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      const li = document.createElement('li');
      if (h.tagName === 'H3') li.classList.add('toc-h3');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(h.id);
        if (target) {
          const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
          history.replaceState(null, '', '#' + h.id);
        }
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });

    const tocLinks = tocList.querySelectorAll('a');
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove('toc-active'); });
          const active = tocList.querySelector('a[href="#' + entry.target.id + '"]');
          if (active) active.classList.add('toc-active');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { observer.observe(h); });
  }

  window.articlePageInit = articlePageInit;

  // First load: run on DOMContentLoaded (router handles subsequent SPA navs).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', articlePageInit);
  } else {
    articlePageInit();
  }
})();
```

- [ ] **Step 4: Remove the inline TOC script from learn.html**

In `_layouts/learn.html`, delete the entire inline `<script>` block at lines 209–252 (the `DOMContentLoaded` TOC builder). Leave the `spa-scripts.html` include (added in Task 1) which now loads `learn-page.js`.

- [ ] **Step 5: Build and run test to verify it passes**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "article init"`
Expected: PASS — TOC populated on load, `articlePageInit` is a function, re-run produces no duplicates.

- [ ] **Step 6: Commit**

```bash
git add js/learn-page.js _layouts/learn.html tests/spa-guides.spec.js
git commit -m "feat(spa): extract article TOC into idempotent articlePageInit()"
```

---

## Task 4: Add #page-content landmark to the article layout

**Files:**
- Modify: `_layouts/learn.html:126` (`<main class="learn-layout">`) and its matching `</main>` (line 195)
- Test: `tests/spa-guides.spec.js`

**Design note:** The TOC sidebar (`.learn-toc`) and the article body both live inside `<main class="learn-layout">`. The whole `<main>` is the swappable region, so `#page-content` goes on the `<main>` element. After swap, `articlePageInit()` rebuilds the TOC from the new content.

- [ ] **Step 1: Write the failing test**

Add to `tests/spa-guides.spec.js`:

```javascript
test.describe('SPA Phase 1: DOM prerequisites', () => {
  test('article page has #page-content', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/spa-guides.spec.js -g "DOM prerequisites"`
Expected: FAIL — no `#page-content` on article page.

- [ ] **Step 3: Add id to the main element**

In `_layouts/learn.html` line 126, change:

```html
  <main class="learn-layout">
```

to:

```html
  <main class="learn-layout" id="page-content">
```

- [ ] **Step 4: Build and run test to verify it passes**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "DOM prerequisites"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add _layouts/learn.html tests/spa-guides.spec.js
git commit -m "feat(spa): add #page-content landmark to article layout"
```

---

## Task 5: Unify script loading across SPA pages + idempotent inits

**Files:**
- Modify: `index.html:153-161`, `landscape.html:177-184`, `guides.html:61-64` (replace script lists with `spa-scripts.html`)
- Verify: `js/app.js` `appInit()` and `js/landscape.js` `landscapeInit()` are safe when their DOM is absent (article/guides pages)
- Test: `tests/spa-guides.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `tests/spa-guides.spec.js`:

```javascript
test.describe('SPA Phase 1: cross-page nav from article', () => {
  test('article → search works without full reload and search initializes', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });

    await page.locator('[data-spa-link][href="/"]').click();

    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true); // no reload
    expect(page.url()).toMatch(/localhost:\d+\/$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/spa-guides.spec.js -g "cross-page nav from article"`
Expected: FAIL — search content swaps but `#search-input` interactions may break, or appInit throws because guides/article don't load app.js (before this task). Likely the click also doesn't navigate via SPA because `/` is now matched but app.js absent → appInit guard skips, content swaps, but `#search-input` is part of swapped HTML so it appears; the failure mode to fix is appInit not running. Confirm the failing assertion before proceeding.

**IMPORTANT:** Each page's script block has `{% include nav-scripts.html %}` between the page scripts and `router.js`. **That line MUST stay** (it wires the toolbar). The replacements below preserve it.

- [ ] **Step 3: Replace index.html script block with the shared include**

In `index.html`, replace lines 153–161:

```html
    <script src="js/supabase-client.js"></script>
    <script src="js/auth-ui.js"></script>
    <script src="js/data.js?t=1780999110"></script>
    <script src="js/app.js?t=1781340001"></script>
    <script src="js/landscape.js?t=1717430601"></script>
    <script src="js/hero-map.js?t=1781270001"></script>
    <script src="js/card-glow.js?t=1781270001"></script>
    {% include nav-scripts.html %}
    <script src="/js/router.js"></script>
```

with:

```html
    <script src="js/supabase-client.js"></script>
    <script src="js/auth-ui.js"></script>
    {% include nav-scripts.html %}
    {% include spa-scripts.html %}
```

(`spa-scripts.html` already loads router.js as its last line, so the standalone router.js line is removed.)

- [ ] **Step 4: Replace landscape.html script block**

In `landscape.html`, replace lines 177–184:

```html
    <script src="js/supabase-client.js"></script>
    <script src="js/auth-ui.js"></script>
    <script src="js/data.js?t=1780999110"></script>
    <script src="js/landscape.js?t=1717430601"></script>
    <script src="/js/hero-map.js"></script>
    <script src="/js/card-glow.js"></script>
    {% include nav-scripts.html %}
    <script src="/js/router.js"></script>
```

with:

```html
    <script src="js/supabase-client.js"></script>
    <script src="js/auth-ui.js"></script>
    {% include nav-scripts.html %}
    {% include spa-scripts.html %}
```

- [ ] **Step 5: Replace guides.html script block**

In `guides.html`, replace lines 61–64:

```html
  <script src="/js/supabase-client.js"></script>
  <script src="/js/auth-ui.js"></script>
  {% include nav-scripts.html %}
  <script src="/js/router.js"></script>
```

with:

```html
  <script src="/js/supabase-client.js"></script>
  <script src="/js/auth-ui.js"></script>
  {% include nav-scripts.html %}
  {% include spa-scripts.html %}
```

- [ ] **Step 6: Guard appInit/landscapeInit against missing DOM**

`appInit` (js/app.js:22) dereferences `#action-input` and other elements (js/app.js:251+); `landscapeInit` (js/landscape.js:2) uses `#landscape` (js/landscape.js:31). When the shared bundle loads on a page lacking those elements, the router's init guards (`if (window.appInit)`) still call them, so each init must early-return when its DOM is absent.

At the very start of the `appInit` body (immediately after `window.appInit = function appInit() {` on js/app.js:22), add:

```javascript
    if (!document.getElementById('action-input')) return;
```

At the very start of the `landscapeInit` body (immediately after `window.landscapeInit = function landscapeInit() {` on js/landscape.js:2), add:

```javascript
    if (!document.getElementById('landscape')) return;
```

(These prevent errors when the bundle loads on a page whose DOM isn't present — the router calls the correct init after the swap, when the DOM exists.)

- [ ] **Step 7: Build and run the cross-page test**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "cross-page nav from article"`
Expected: PASS — article→search swaps content, `__spaLoaded` survives, search input visible.

- [ ] **Step 8: Run full existing SPA suite for regressions**

Run: `npm test -- tests/spa-navigation.spec.js`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add index.html landscape.html guides.html js/app.js js/landscape.js tests/spa-guides.spec.js
git commit -m "feat(spa): unify script loading via spa-scripts.html; guard page inits"
```

---

## Task 6: SPA navigation to article pages (article cards + nav)

**Files:**
- Verify: article cards already have correct `/guides/:slug/` href; add `data-spa-link`
- Modify: `guides.html:32` (Jekyll article card), `build-spa-site.js:33` (SPA-built card)
- Test: `tests/spa-guides.spec.js`

- [ ] **Step 1: Write the failing test (A3 + A6)**

Add to `tests/spa-guides.spec.js`:

```javascript
test.describe('SPA Phase 1: navigate to articles', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('A3: clicking an article card navigates without full reload', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.locator('a.article-card[data-spa-link]').first().click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
    expect(page.url()).toMatch(/\/guides\/.+\//);
  });

  test('A6: browser back from article restores guides index', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.locator('a.article-card[data-spa-link]').first().click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });
    await page.goBack();
    await expect(page.locator('.article-card').first()).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
    expect(page.url()).toMatch(/\/guides\/$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/spa-guides.spec.js -g "navigate to articles"`
Expected: FAIL — `a.article-card[data-spa-link]` not found (cards lack the attribute).

- [ ] **Step 3: Add data-spa-link to the Jekyll article card**

In `guides.html` line 32, change:

```html
    <a href="{{ article.url | relative_url }}" class="article-card">
```

to:

```html
    <a href="{{ article.url | relative_url }}" data-spa-link class="article-card">
```

- [ ] **Step 4: Add data-spa-link to the SPA-built article card**

In `build-spa-site.js` line 33, change:

```javascript
    return `<a href="/guides/${a.slug}/" class="article-card">
```

to:

```javascript
    return `<a href="/guides/${a.slug}/" data-spa-link class="article-card">
```

- [ ] **Step 5: Build and run test to verify it passes**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "navigate to articles"`
Expected: PASS — A3 (no reload) and A6 (back button) green.

- [ ] **Step 6: Commit**

```bash
git add guides.html build-spa-site.js tests/spa-guides.spec.js
git commit -m "feat(spa): article cards navigate via SPA router"
```

---

## Task 7: Head-metadata swap on navigation

**Files:**
- Modify: `js/router.js` `fetchPage()` and `navigate()` (head swap)
- Modify: `_layouts/learn.html:8-16` (mark article head tags with `data-spa-head`)
- Test: `tests/spa-guides.spec.js`

- [ ] **Step 1: Write the failing test (D1–D3 for articles)**

Add to `tests/spa-guides.spec.js`:

```javascript
test.describe('SPA Phase 1: head metadata swap', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('title and description update when navigating to an article', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const card = page.locator('a.article-card[data-spa-link]').first();
    const expectedTitlePart = await card.locator('h2').textContent();
    await card.click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });

    const title = await page.title();
    expect(title).toContain(expectedTitlePart.trim());

    const desc = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content'));
    expect(desc).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/spa-guides.spec.js -g "head metadata swap"`
Expected: FAIL — title updates (already handled) but meta description does not swap (still the guides-index description).

- [ ] **Step 3: Mark article head tags with data-spa-head**

In `_layouts/learn.html`, replace lines 8–16:

```html
  <title>{{ page.title }} | AI Guides | AI Tool Review</title>
  <meta name="description" content="{{ page.description }}">
  {% if page.hero_image %}
  <meta property="og:image" content="{{ page.hero_image | absolute_url }}">
  <meta property="og:title" content="{{ page.title }}">
  <meta property="og:description" content="{{ page.description }}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="{{ page.hero_image | absolute_url }}">
  {% endif %}
```

with:

```html
  <title>{{ page.title }} | AI Guides | AI Tool Review</title>
  <meta name="description" content="{{ page.description }}" data-spa-head>
  {% if page.hero_image %}
  <meta property="og:image" content="{{ page.hero_image | absolute_url }}" data-spa-head>
  <meta property="og:title" content="{{ page.title }}" data-spa-head>
  <meta property="og:description" content="{{ page.description }}" data-spa-head>
  <meta name="twitter:card" content="summary_large_image" data-spa-head>
  <meta name="twitter:image" content="{{ page.hero_image | absolute_url }}" data-spa-head>
  {% endif %}
```

- [ ] **Step 4: Add data-spa-head to guides.html index meta so swap clears stale tags**

In `guides.html`, find the meta description (near line 16, the canonical block). Add `data-spa-head` to its `<meta name="description">` tag (and og: tags if present) so navigating away from the index correctly removes them. Inspect first:

Run: `grep -n 'meta name="description"\|og:\|canonical' guides.html`

For each `<meta name="description">` / `og:` tag in the guides index head, append ` data-spa-head`. (Leave canonical handling to direct loads; do not mark canonical unless an article canonical exists to replace it — articles here have no explicit canonical, so skip canonical for Phase 1.)

- [ ] **Step 5: Implement head swap in router.js**

In `js/router.js` `fetchPage()`, change the return (lines 47–49) to also return head nodes:

```javascript
        const content = doc.getElementById('page-content');
        const title = doc.querySelector('title')?.textContent ?? document.title;
        const headNodes = Array.from(doc.querySelectorAll('head [data-spa-head]'));
        return { innerHTML: content?.innerHTML ?? '', title, headNodes };
```

In `navigate()`, after `document.title = pageData.title;` (line 77), add:

```javascript
            // Swap head metadata so in-session navigation keeps meta/og accurate.
            document.head.querySelectorAll('[data-spa-head]').forEach(n => n.remove());
            pageData.headNodes.forEach(n => document.head.appendChild(n.cloneNode(true)));
```

- [ ] **Step 6: Build and run test to verify it passes**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "head metadata swap"`
Expected: PASS — title + description reflect the article after navigation.

- [ ] **Step 7: Run full Phase 1 + existing SPA suites**

Run: `npm test -- tests/spa-guides.spec.js tests/spa-navigation.spec.js`
Expected: PASS (all green).

- [ ] **Step 8: Commit**

```bash
git add js/router.js _layouts/learn.html guides.html tests/spa-guides.spec.js
git commit -m "feat(spa): swap [data-spa-head] metadata on navigation"
```

---

## Task 8: Toolbar "load once" verification (E1, E2)

**Files:**
- Test only: `tests/spa-guides.spec.js`

- [ ] **Step 1: Write the test**

Add to `tests/spa-guides.spec.js`:

```javascript
test.describe('SPA Phase 1: toolbar loads once', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('E2: auth container HTML persists across guides → article nav', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const before = await page.locator('#auth-container').innerHTML();
    await page.locator('a.article-card[data-spa-link]').first().click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });
    const after = await page.locator('#auth-container').innerHTML();
    expect(after).toBe(before);
  });

  test('E1: nav-init auth init does not re-run on SPA nav (AuthUI.init call count)', async ({ page }) => {
    await page.addInitScript(() => {
      window.__authInitCalls = 0;
      const orig = Object.getOwnPropertyDescriptor(window, 'AuthUI');
      Object.defineProperty(window, 'AuthUI', {
        configurable: true,
        get() { return this.__AuthUI; },
        set(v) {
          this.__AuthUI = v;
          if (v && typeof v.init === 'function') {
            const realInit = v.init.bind(v);
            v.init = function (...args) { window.__authInitCalls++; return realInit(...args); };
          }
        },
      });
    });
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const initial = await page.evaluate(() => window.__authInitCalls);
    await page.locator('a.article-card[data-spa-link]').first().click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(300);
    const afterNav = await page.evaluate(() => window.__authInitCalls);
    expect(afterNav).toBe(initial); // toolbar/auth not re-initialized on SPA nav
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `eval "$(rbenv init -)" && bundle exec jekyll build && npm test -- tests/spa-guides.spec.js -g "toolbar loads once"`
Expected: E2 PASS. E1 — if it FAILS, the toolbar is being re-initialized (investigate: nav-scripts.html / nav-init.js should not be in `#page-content`, so its scripts are stripped on swap and never re-run). If E1 fails, confirm `nav-init.js` and `#auth-container` live OUTSIDE `#page-content` (in `<header>`), which they do per `_includes/nav.html` inside `<header class="header">`.

- [ ] **Step 3: Commit**

```bash
git add tests/spa-guides.spec.js
git commit -m "test(spa): verify toolbar loads once across guides navigation"
```

---

## Task 9: Manual browser verification + full regression

**Files:** none (verification only)

- [ ] **Step 1: Clean rebuild and serve**

Run:
```bash
eval "$(rbenv init -)" && pkill -f jekyll 2>/dev/null; sleep 1; rm -rf _site
bundle exec jekyll serve --port 8080 --detach
sleep 2
```

- [ ] **Step 2: Manual checklist (open localhost:8080)**

Verify by clicking (not just curl):
- `/guides/` → click an article card → URL changes, content swaps, **no full page flash**, TOC appears.
- On the article, the toolbar is identical to home; Admin/auth state unchanged (no re-flicker).
- Click `Search` in the toolbar from the article → search page works (type a query, autocomplete responds).
- Browser back → returns to guides index.
- Direct-load an article URL in a new tab → full correct page (toolbar, TOC, content).

- [ ] **Step 3: Run the entire test suite**

Run: `npm test`
Expected: All green (Phase 1 + existing).

- [ ] **Step 4: Commit any fixes, then final commit**

```bash
git add -A
git commit -m "test(spa): Phase 1 guides — full regression green"
```

---

## Self-Review Notes (addressed)

- **Spec coverage:** Router generalization (Task 2), articles into SPA (Tasks 3–6), head swap (Task 7), SPA-aware article links (Task 6), toolbar load-once (Task 8). Tool pages are explicitly Phase 2 — not in this plan.
- **Correction vs spec:** Spec assumed `articlePageInit()` is a no-op; the article layout actually has a TOC script, so Task 3 makes it a real idempotent init. Documented.
- **Correction vs spec:** Spec's head-swap referenced tool `head-seo.html`; for articles the head tags are inline in `learn.html`, so Task 7 marks those instead.
- **New foundation:** Shared `spa-scripts.html` bundle (Task 1, 5) — required because pages previously loaded only their own scripts; without it, cross-page SPA nav swaps HTML but never inits the destination.
- **Idempotency:** `articlePageInit()` clears TOC + disconnects observer before rebuild (Task 3).
- **Type consistency:** `matchRoute(pathname) → { init, params }`, `params.slug`, `articlePageInit()`, `window.SpaRouter.{navigate, matchRoute}`, `data-spa-head`, `#page-content` used consistently across tasks.
