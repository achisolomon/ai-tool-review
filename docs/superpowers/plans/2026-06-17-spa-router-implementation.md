# SPA Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable instant client-side navigation between Search (`/`), Landscape (`/landscape.html`), and Guides (`/guides/`) pages by swapping content without full-page reloads, preserving the hero background constellation and avoiding re-initialization of shared bootstrap code.

**Architecture:** The router uses re-callable page init hooks exposed on `window` (appInit, landscapeInit, HeroMap, CardGlow) and markup slots (#page-content, data-spa-link attributes) to intercept navigation clicks, fetch page content via X-SPA-Request header, swap DOM, and trigger re-initialization. The design follows TDD with unit tests verifying init APIs, DOM prerequisites, and navigation behavior.

**Tech Stack:** Vanilla JavaScript (router.js), Playwright tests, history.pushState/popstate, DOMParser for HTML parsing, CSS custom properties for state tracking.

**Status:** All implementation is complete. This plan captures verification and test execution.

---

## File Structure

### Core Implementation Files (Already Written)

- **`js/router.js`** (114 lines) — SPA router singleton with PAGE_INITS map, navigate() function, click delegation, popstate handler.
- **`js/app.js`** — Wrapped homepage initialization in `window.appInit()` function; preserves original DOMContentLoaded flow.
- **`js/landscape.js`** — Wrapped landscape page initialization in `window.landscapeInit()` function.
- **`js/hero-map.js`** — Exposed `window.HeroMap = { start, stop }` for re-init on navigation; handles canvas re-acquisition after DOM swap.
- **`js/card-glow.js`** — Exposed `window.CardGlow = { init }` for re-init; deduplicates event listeners on re-init.

### HTML Files Modified

- **`index.html`** — Added `id="page-content"` slot wrapping main search content; added `id="search-input"` landmark for test detection.
- **`landscape.html`** — Added `id="page-content"` slot wrapping landscape content.
- **`guides.html`** — Added `id="page-content"` slot wrapping guides content.
- **`_includes/nav.html`** — Added `data-spa-link` attribute to Search, Landscape, and Guides nav links.

### Test File

- **`tests/spa-navigation.spec.js`** (13 tests) — Verifies HeroMap API, init function exposure, DOM prerequisites, navigation behavior, title updates, active-link styling, popstate handling.

---

## Verification Tasks

All implementation is complete per the spec. The following tasks verify the implementation is correct and ready to ship.

### Task 1: Verify Init Hooks Are Idempotent

**Files:**
- Test: `tests/spa-navigation.spec.js`
- Source: `js/app.js`, `js/landscape.js`, `js/hero-map.js`, `js/card-glow.js`

**Goal:** Ensure that calling `window.appInit()` and `window.landscapeInit()` multiple times in sequence does not cause duplicate event listeners, double-bound handlers, or memory leaks.

- [ ] **Step 1: Run the existing spa-navigation test suite**

```bash
cd /Users/achisolomon/Documents/Git-Achi-gmail/ai\ landscape/ai-tool-review/.worktrees/spa-router
npx playwright test tests/spa-navigation.spec.js -v
```

Expected output: All 13 tests pass (or list any failures for debugging).

- [ ] **Step 2: Manually verify HeroMap re-initialization in the browser**

```bash
npx playwright test tests/spa-navigation.spec.js -v --debug
```

In the Playwright inspector, navigate to `/`, then inspect `window.HeroMap` state:
- Verify canvas is re-acquired on each `HeroMap.start()` (comment in code confirms this: line 131).
- Verify `rafId` is cleared on `stop()` and reassigned on `start()` (lines 121–141).
- Verify no multiple RAF callbacks run simultaneously.

- [ ] **Step 3: Verify CardGlow listener deduplication**

In the same debug session, open dev console and run:
```javascript
// Before navigating, count listeners on first #results-grid
let card1 = document.getElementById('results-grid');
console.log('Listeners on first load:', card1.__cardGlowHandler ? 'bound' : 'not bound');

// Navigate to landscape, then back to search
// Then check:
let card2 = document.getElementById('results-grid');
console.log('Listeners after navigation:', card2.__cardGlowHandler ? 'bound' : 'not bound');
console.log('Are they the same object?', card1.__cardGlowHandler === card2.__cardGlowHandler);
```

Verify that the handler is rebound (not duplicated) — the old listener is removed before the new one is added (code at lines 14–16 confirms this).

- [ ] **Step 4: Commit verification results**

If all tests pass and manual verification confirms idempotency, commit:

```bash
git add tests/spa-navigation.spec.js
git commit -m "test: verify SPA init hooks are idempotent

All 13 spa-navigation tests pass. Manual verification confirms:
- HeroMap canvas is re-acquired on start(), canvas context is reused
- CardGlow listener is deduplicatd (old removed before new added)
- No memory leaks or duplicate handlers observed

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Verify Router Click Delegation and Navigation

**Files:**
- Test: `tests/spa-navigation.spec.js`
- Source: `js/router.js`

**Goal:** Confirm that clicking data-spa-link nav links triggers client-side navigation (no full reload), URL updates, content swaps, and title changes.

- [ ] **Step 1: Run navigation behavior tests**

```bash
npx playwright test tests/spa-navigation.spec.js -v -g "Client-side navigation"
```

Expected output:
- "clicking Landscape nav link swaps content without full reload" — PASS
- "clicking Search nav link from landscape swaps content without full reload" — PASS

These tests verify:
- Content swap (locating #landscape or #search-input after navigation).
- No full reload (window.__spaLoaded flag persists).
- URL update (page.url() matches expected route).

- [ ] **Step 2: Verify non-SPA links still work**

Create a test in your browser (or add to the spec as an edge case):
```javascript
// On the search page, navigate to a non-SPA page (e.g., /about)
// Verify it triggers a full reload (normal link behavior)
```

Current router logic (line 101) only intercepts clicks on links with `data-spa-link` **and** a pathname in `PAGE_INITS`, so other links bypass the router — this is correct.

- [ ] **Step 3: Verify title updates**

Run a debug session:
```bash
npx playwright test tests/spa-navigation.spec.js -v --debug
```

In the browser, navigate from Search to Landscape. Verify the page title in the browser tab matches the `<title>` from landscape.html. Run:
```javascript
console.log(document.title);
```

Should show something like "AI Landscape — AI Tool Review" (from landscape.html's <title> tag).

- [ ] **Step 4: Commit navigation verification**

```bash
git add tests/spa-navigation.spec.js
git commit -m "test: verify router click delegation and navigation

Client-side navigation tests pass:
- Click delegation works for [data-spa-link] elements
- Content swaps without full reload (window state preserved)
- URL updates via history.pushState
- Page title updates correctly
- Non-SPA links bypass router and reload normally

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Verify Popstate and Browser Back/Forward

**Files:**
- Test: `tests/spa-navigation.spec.js`
- Source: `js/router.js` (lines 106–110)

**Goal:** Confirm that browser back/forward buttons work, popstate re-navigates correctly, and teardown (HeroMap.stop) targets the correct page.

- [ ] **Step 1: Run popstate tests**

```bash
npx playwright test tests/spa-navigation.spec.js -v -g "popstate"
```

Expected output: Popstate tests pass (check the full test file for popstate coverage).

- [ ] **Step 2: Manual browser test: back/forward navigation**

```bash
npx playwright test tests/spa-navigation.spec.js -v --debug
```

In the browser:
1. Load `/` (search page).
2. Click Landscape link → navigate to `/landscape.html`.
3. Click Search link → navigate back to `/`.
4. Press browser back button → should return to `/landscape.html`.
5. Press browser forward button → should return to `/`.

Verify:
- Content swaps correctly on each navigation.
- URL updates correctly.
- HeroMap animation is running on search page, stopped on landscape (inspect `rafId` in console).

- [ ] **Step 3: Verify teardown logic**

In debug mode, run:
```javascript
// On search page
console.log('rafId before leaving:', window.HeroMap._rafId); // Check internal state

// Click Landscape link
// HeroMap.stop() should be called (router.js:37-39)
// Then HeroMap.start() should NOT be called for landscape (PAGE_INITS['/landscape.html'] doesn't include it)

// Click back to search
// HeroMap.start() should be called (PAGE_INITS['/'] includes it)
console.log('rafId after returning:', window.HeroMap._rafId); // Should be running
```

Verify that the animation is stopped when navigating away from `/` and resumed when returning.

- [ ] **Step 4: Commit popstate verification**

```bash
git add tests/spa-navigation.spec.js
git commit -m "test: verify popstate and browser back/forward

Popstate behavior verified:
- Back/forward buttons navigate correctly
- Teardown (HeroMap.stop) called when leaving search page
- Init (HeroMap.start) called when returning to search page
- Content swaps correctly on history traversal

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Verify DOM Prerequisites

**Files:**
- Test: `tests/spa-navigation.spec.js` ("SPA: DOM prerequisites" describe block)
- Source: `index.html`, `landscape.html`, `guides.html`, `_includes/nav.html`

**Goal:** Ensure all three SPA pages have the required #page-content slot and all three nav links have data-spa-link attribute.

- [ ] **Step 1: Run DOM prerequisite tests**

```bash
npx playwright test tests/spa-navigation.spec.js -v -g "DOM prerequisites"
```

Expected output: All 4 tests pass:
- "nav.html has data-spa-link on Search, Landscape, Guides links" (count = 3)
- "index.html has #page-content"
- "landscape.html has #page-content"
- "guides.html has #page-content"

- [ ] **Step 2: Verify no inline scripts in swapped content**

The router (line 47) extracts only `#page-content` innerHTML, bypassing any `<script>` tags in the fetched HTML. Verify this is expected:
- All page-specific initialization must live in the corresponding `PAGE_INITS` hook (appInit, landscapeInit, etc.).
- Inline scripts in the fetched content will **not** run.

Check each page's content:
- Search page: initialization in `js/app.js` via `window.appInit()`.
- Landscape page: initialization in `js/landscape.js` via `window.landscapeInit()`.
- Guides page: static content, no init needed.

Run a quick grep to ensure no critical inline scripts are embedded in the swapped regions:
```bash
grep -n "<script" index.html landscape.html guides.html
```

All `<script>` tags should be in `<head>` or outside `#page-content`, not inside the content slot.

- [ ] **Step 3: Commit DOM verification**

```bash
git add tests/spa-navigation.spec.js
git commit -m "test: verify DOM prerequisites for SPA

DOM prerequisite tests pass:
- All 3 nav links (Search, Landscape, Guides) have data-spa-link
- All 3 pages have #page-content slot
- No inline scripts embedded in swappable content

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Verify Router Exposes window.SpaRouter.navigate

**Files:**
- Source: `js/router.js` (line 112)
- Test: Manual verification (not yet in spa-navigation.spec.js)

**Goal:** Confirm that the router's `navigate()` function is exposed for programmatic use.

- [ ] **Step 1: Add test for window.SpaRouter API**

Open `tests/spa-navigation.spec.js` and add a new test block:

```javascript
test.describe('SPA: Router API', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('window.SpaRouter.navigate is a function', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const has = await page.evaluate(() => typeof window.SpaRouter?.navigate === 'function');
    expect(has).toBe(true);
  });

  test('window.SpaRouter.navigate navigates programmatically', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Programmatically navigate to landscape
    await page.evaluate(() => window.SpaRouter.navigate('/landscape.html'));
    
    // Wait for content swap
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    
    // Verify URL updated
    expect(page.url()).toMatch(/landscape/);
  });
});
```

- [ ] **Step 2: Run the new test**

```bash
npx playwright test tests/spa-navigation.spec.js -v -g "Router API"
```

Expected output: Both tests pass.

- [ ] **Step 3: Commit API verification**

Edit `tests/spa-navigation.spec.js` to add the above test block, then:

```bash
git add tests/spa-navigation.spec.js
git commit -m "test: verify window.SpaRouter.navigate API

Added 2 new tests:
- window.SpaRouter.navigate is exposed and callable
- Programmatic navigation works via window.SpaRouter.navigate('/path')

Both tests pass.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Integration Test — Full Navigation Sequence

**Files:**
- Test: `tests/spa-navigation.spec.js` (add new test)

**Goal:** Create a comprehensive test that exercises the full navigation sequence: load search → navigate to landscape → navigate to guides → back to search, verifying content swaps, URL updates, and init hook execution at each step.

- [ ] **Step 1: Add integration test**

Add to `tests/spa-navigation.spec.js`:

```javascript
test.describe('SPA: Full navigation sequence', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('full navigation: search -> landscape -> guides -> back', async ({ page }) => {
    // Load search page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#search-input')).toBeAttached();
    let currentUrl = page.url();
    expect(currentUrl).toMatch(/\/$/);

    // Navigate to landscape
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/landscape/);

    // Navigate to guides
    await page.locator('[data-spa-link][href="/guides/"]').click();
    await expect(page.locator('#guides')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/guides/);

    // Navigate back to search via nav link
    await page.locator('[data-spa-link][href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/\/$/);

    // Verify nav-active styling updated correctly
    const activeLink = await page.locator('[data-spa-link][href="/"].nav-active').count();
    expect(activeLink).toBe(1);
  });
});
```

- [ ] **Step 2: Run integration test**

```bash
npx playwright test tests/spa-navigation.spec.js -v -g "full navigation sequence"
```

Expected output: Test passes.

- [ ] **Step 3: Commit integration test**

```bash
git add tests/spa-navigation.spec.js
git commit -m "test: add full navigation sequence integration test

Added comprehensive test exercising:
- Load search page
- Navigate to landscape page
- Navigate to guides page
- Navigate back to search page
- Verify content swaps, URLs, and nav-active styling at each step

All navigation transitions work correctly without full reloads.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Run Full Test Suite and Ensure No Regressions

**Files:**
- Test: `tests/spa-navigation.spec.js`
- All affected source files

**Goal:** Run the entire test suite to confirm SPA implementation does not break existing functionality and all new tests pass.

- [ ] **Step 1: Run full spa-navigation test suite**

```bash
npx playwright test tests/spa-navigation.spec.js -v
```

Expected output: All tests pass (15+, including new ones from Tasks 5–6).

- [ ] **Step 2: Run broader test suite to check for regressions**

```bash
npx playwright test tests/navigation.spec.js tests/search.spec.js tests/landscape.spec.js -v
```

Expected output: All tests pass (no regressions in existing navigation, search, or landscape tests).

- [ ] **Step 3: Commit test results and summary**

If all tests pass, create a summary commit:

```bash
git add tests/spa-navigation.spec.js
git commit -m "test: SPA router implementation complete and verified

Full test suite results:
- spa-navigation.spec.js: 15 tests — ALL PASS
- navigation.spec.js: existing tests — NO REGRESSIONS
- search.spec.js: existing tests — NO REGRESSIONS
- landscape.spec.js: existing tests — NO REGRESSIONS

Implementation summary:
✓ Re-callable init hooks (appInit, landscapeInit, HeroMap, CardGlow)
✓ Markup slots (#page-content) and nav attributes (data-spa-link)
✓ Router with click delegation, fetch, DOM swap, history management
✓ Popstate and browser back/forward support
✓ Init idempotency verified
✓ No memory leaks or duplicate listeners
✓ Full integration test covering all three pages

Ready for code review and deployment.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Verification Checklist

Before marking the implementation as complete:

- [ ] All 15+ spa-navigation tests pass
- [ ] No regressions in navigation, search, landscape tests
- [ ] HeroMap stops when leaving `/` and restarts when returning
- [ ] CardGlow listeners are deduplicated (no memory leaks)
- [ ] Page titles update correctly on navigation
- [ ] Browser back/forward works
- [ ] Window.__spaLoaded flag persists (no full reload)
- [ ] window.SpaRouter.navigate is exposed and works
- [ ] All nav links have data-spa-link attribute
- [ ] All SPA pages have #page-content slot
- [ ] No inline scripts bypass the router

---

## Known Risks & Mitigation

**Risk 1: Init hook idempotency**
- **Mitigation:** Card-glow.js removes old listener before binding new (lines 14–16). HeroMap.start() stops first, then re-acquires canvas (lines 128–132). Test verifies this in Task 1.

**Risk 2: Inline scripts in swapped content don't run**
- **Mitigation:** All page init captured in PAGE_INITS hooks. Router skips <script> tags (extracts only innerHTML). Verified in Task 4.

**Risk 3: Race conditions on concurrent navigations**
- **Mitigation:** `navigating` boolean guard (line 27) prevents fetch races. Only one navigation runs at a time. Verified in tests.

**Risk 4: Interaction with resilience work**
- **Mitigation:** Both specs touched init timing. Implementation is complete. Verify together (not in scope of this plan) before final push.

---

## Execution Handoff

Plan complete. All implementation is already merged into this branch. Verification tasks require:

1. Running the test suite (`npx playwright test tests/spa-navigation.spec.js -v`)
2. Manual browser verification (debug mode, checking HeroMap state, popstate behavior)
3. Adding missing test (Task 5: window.SpaRouter.navigate API test)
4. Adding integration test (Task 6: full navigation sequence)
5. Running broader test suite to confirm no regressions (Task 7)

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
