# Lazy Supabase Decoupling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make landscape/search/tool-page content render with zero dependency on the Supabase CDN or database; load supabase-js lazily, in the background, only when auth/suggest/reviews is actually used.

**Architecture:** Add one `ensureSupabase()` lazy loader in `supabase-client.js` that injects the CDN `<script>` on demand and resolves when `window.supabase` exists. Remove the static render-blocking `<script>` from all 8 pages. The toolbar paints auth state instantly from the cached localStorage session (no library); auth/DB entry points `await ensureSupabase()` before their first client call.

**Tech Stack:** Vanilla JS (no framework), Jekyll (Liquid layouts), Playwright tests, Ruby/`bundle exec jekyll build`.

**Build/test note:** This environment needs rbenv Ruby. Prefix build/test shells with:
`export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"`
Playwright reuses a running server on :8080 (`reuseExistingServer`). After editing layouts/HTML, run `bundle exec jekyll build` before browser tests (server serves `_site`).

---

## File Structure

- `js/supabase-client.js` — add `ensureSupabase()` + export it; `getSupabase()` unchanged. Add `getCachedSession()` helper (reads localStorage token, no network/lib).
- `js/auth-ui.js` — toolbar renders from cached session first; background `ensureSupabase()` reconcile; sign-in click awaits `ensureSupabase()`.
- `js/auth-signin.js` — provider sign-in handler awaits `ensureSupabase()` before `signInWithProvider`.
- `js/suggest.js` — `open()` awaits `ensureSupabase()` before the auth check.
- `_layouts/tool.html` — reviews block awaits `ensureSupabase()` before first `getSupabase()`.
- 8 page/layout files — remove the static `<script ... supabase-js@2>` tag.
- `tests/global-setup.js` — revert the `cdn.jsdelivr.net` block (no longer a parse-time script).
- `tests/content-no-supabase.spec.js` — NEW: assert content pages make zero jsdelivr/supabase requests and still render tools.
- `tests/supabase-config.spec.js` — adapt `getSupabase returns a valid client` to first `await ensureSupabase()`.

---

## Task 1: Add `ensureSupabase()` + `getCachedSession()` to supabase-client.js

**Files:**
- Modify: `js/supabase-client.js` (after `getSupabase()`, around line 43; and the `window.SupabaseClient = {…}` export near end)
- Test: `tests/lazy-loader.spec.js` (new)

- [ ] **Step 1: Write the failing test**

Create `tests/lazy-loader.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('ensureSupabase lazy loader', () => {
  test.use({ proxy: undefined });

  test('window.supabase is NOT present on load, becomes present after ensureSupabase()', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Library must NOT be auto-loaded.
    expect(await page.evaluate(() => typeof window.supabase)).toBe('undefined');

    // ensureSupabase() injects it and resolves.
    const loaded = await page.evaluate(async () => {
      await window.SupabaseClient.ensureSupabase();
      return typeof window.supabase;
    });
    expect(loaded).toBe('object');

    // getSupabase() now returns a client.
    expect(await page.evaluate(() => window.SupabaseClient.getSupabase() !== null)).toBe(true);
  });

  test('ensureSupabase() is idempotent (one script tag even if called twice)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const count = await page.evaluate(async () => {
      await Promise.all([window.SupabaseClient.ensureSupabase(), window.SupabaseClient.ensureSupabase()]);
      return document.querySelectorAll('script[src*="supabase-js@2"]').length;
    });
    expect(count).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; npx playwright test tests/lazy-loader.spec.js --reporter=line`
Expected: FAIL — `ensureSupabase` is not a function (and/or `window.supabase` is `object` because the static tag still loads it). This is correct pre-state; Task 9 removes the static tag.

- [ ] **Step 3: Add `ensureSupabase()` and `getCachedSession()`**

In `js/supabase-client.js`, insert immediately after the `getSupabase()` function (after line 43):

```javascript
// Lazy CDN loader. The supabase-js library is NOT loaded on page load — content
// pages (search/landscape/tool) never need it. Auth/DB entry points call this to
// inject it on demand, in the background. Memoized: one injection, shared promise.
let _supabaseLibPromise = null;
function ensureSupabase() {
    if (window.supabase) return Promise.resolve(window.supabase);
    if (_supabaseLibPromise) return _supabaseLibPromise;
    _supabaseLibPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src*="supabase-js@2"]');
        const timer = setTimeout(() => reject(new Error('supabase-cdn-timeout')), DB_TIMEOUT_MS);
        function onReady() { clearTimeout(timer); window.supabase ? resolve(window.supabase) : reject(new Error('supabase-cdn-failed')); }
        if (existing) {
            existing.addEventListener('load', onReady, { once: true });
            existing.addEventListener('error', () => { clearTimeout(timer); reject(new Error('supabase-cdn-failed')); }, { once: true });
            if (window.supabase) onReady();
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        s.async = true;
        s.addEventListener('load', onReady, { once: true });
        s.addEventListener('error', () => { clearTimeout(timer); reject(new Error('supabase-cdn-failed')); }, { once: true });
        document.head.appendChild(s);
    });
    // A failed load must not be cached permanently — allow a later retry.
    _supabaseLibPromise.catch(() => { _supabaseLibPromise = null; });
    return _supabaseLibPromise;
}

// Read the cached Supabase auth session from localStorage WITHOUT the library or
// network. supabase-js uses no custom storageKey, so the key is
// `sb-<project-ref>-auth-token` where <project-ref> is the SUPABASE_URL subdomain.
// Returns the parsed session object (has .user, .access_token) or null.
function getCachedSession() {
    try {
        const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
        const raw = localStorage.getItem(`sb-${ref}-auth-token`);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // supabase-js stores either the session directly or { currentSession }.
        return parsed?.currentSession || parsed?.access_token ? (parsed.currentSession || parsed) : null;
    } catch (_) {
        return null;
    }
}
```

- [ ] **Step 4: Export the new functions**

In the `window.SupabaseClient = {` object (near end of file), add `ensureSupabase,` and `getCachedSession,` to the exported members (next to `getSupabase,`).

- [ ] **Step 5: Run test (still expect the load assertion to fail until Task 9)**

Run: `npx playwright test tests/lazy-loader.spec.js -g "idempotent" --reporter=line`
Expected: the idempotent test PASSES (ensureSupabase exists and injects one tag). The first test's `typeof window.supabase === 'undefined'` assertion still FAILS because the static tag in the page still loads it — that is fixed in Task 9.

- [ ] **Step 6: Commit**

```bash
git add js/supabase-client.js tests/lazy-loader.spec.js
git commit -m "feat(supabase): add lazy ensureSupabase() loader + getCachedSession()

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Toolbar paints from cached session, reconciles in background

**Files:**
- Modify: `js/auth-ui.js` `initAuthDropdown()` (lines 98–162)
- Test: covered by Task 8 (`content-no-supabase`) + manual

- [ ] **Step 1: Replace the health-gate/getCurrentUser block with cached-first render**

In `js/auth-ui.js`, replace the block from line 116 (`// If the DB is unreachable…`) through line 161 (end of the `onAuthStateChange` listener) with:

```javascript
        // Cached-session-first: render the toolbar instantly from the session in
        // localStorage — no library, no network. Content pages stay Supabase-free
        // for logged-out visitors (the library is never loaded for them).
        const cached = window.SupabaseClient.getCachedSession?.() || null;
        const cachedUser = cached?.user || null;
        container.innerHTML = renderAuthDropdown(cachedUser, null);
        setupDropdownHandlers(container);

        // If there is a cached session, reconcile in the BACKGROUND: load the
        // library, confirm the session is still valid, refresh profile/avatar.
        // Logged-out visitors skip this entirely → Supabase never loads.
        if (cachedUser) {
            (async () => {
                try {
                    await window.SupabaseClient.ensureSupabase();
                    const user = await window.SupabaseClient.getCurrentUser();
                    let profile = null;
                    if (user) {
                        const { data } = await window.SupabaseClient.getUserProfile();
                        profile = data;
                        await window.SupabaseClient.updateLastSignIn();
                    }
                    container.innerHTML = renderAuthDropdown(user, profile);
                    setupDropdownHandlers(container);
                } catch (_) { /* CDN/DB down — keep the optimistic cached render */ }
            })();
        }

        // React to real auth events once the library is present (sign-in/out).
        function attachAuthListener() {
            if (typeof window.SupabaseClient.onAuthStateChange !== 'function') return;
            window.SupabaseClient.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                    const newUser = session?.user || null;
                    let newProfile = null;
                    if (newUser) {
                        const { data } = await window.SupabaseClient.getUserProfile();
                        newProfile = data;
                        await window.SupabaseClient.updateLastSignIn();
                    }
                    container.innerHTML = renderAuthDropdown(newUser, newProfile);
                    setupDropdownHandlers(container);
                }
            });
        }
        if (window.supabase) attachAuthListener();
        else if (cachedUser) window.SupabaseClient.ensureSupabase().then(attachAuthListener).catch(() => {});
```

Note: this removes the page-load `isDatabaseHealthy()` gate and the unconditional `getCurrentUser()` (which needed the library). Sign-in click (Task 3) keeps its own health re-check.

- [ ] **Step 2: Build and smoke-check render**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; bundle exec jekyll build 2>&1 | tail -1`
Then: `npx playwright test tests/auth-signin.spec.js --reporter=line`
Expected: existing auth-signin tests still PASS (they stub SupabaseClient; `getCachedSession?.()` optional-chains to undefined → null → renders "Sign in").

- [ ] **Step 3: Commit**

```bash
git add js/auth-ui.js
git commit -m "feat(auth-ui): paint toolbar from cached session, reconcile in background

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Sign-in click awaits ensureSupabase() (toolbar)

**Files:**
- Modify: `js/auth-ui.js` sign-in handler (lines 188–204)
- Test: `tests/db-unavailable.spec.js` (existing click-time test must still pass)

- [ ] **Step 1: Update the sign-in click handler**

In `js/auth-ui.js`, replace the `signinBtn` click handler body (lines 189–203) with:

```javascript
            signinBtn.addEventListener('click', async function() {
                this.disabled = true;
                try {
                    await window.SupabaseClient.ensureSupabase();
                } catch (_) {
                    alert('Sign-in is temporarily unavailable. Please try again in a few minutes.');
                    this.disabled = false;
                    return;
                }
                const healthy = await window.SupabaseClient.isDatabaseHealthy(true);
                if (!healthy) {
                    alert('Sign-in is temporarily unavailable. Please try again in a few minutes.');
                    this.disabled = false;
                    return;
                }
                const { error } = await window.SupabaseClient.signInWithProvider('github');
                if (error) {
                    console.error('[AuthUI] Sign in failed:', error);
                    alert('Sign in failed: ' + error.message);
                    this.disabled = false;
                }
            });
```

(Note: on the unhealthy path we re-enable the button rather than clearing the container, so the user can retry once the backend recovers.)

- [ ] **Step 2: Run the click-time test**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; bundle exec jekyll build 2>&1 | tail -1; npx playwright test tests/db-unavailable.spec.js -g "click time" --reporter=line`
Expected: PASS — clicking sign-in with the backend dead shows "temporarily unavailable" and does not navigate to a dead OAuth URL. (The test stub provides `ensureSupabase`; if it does not, see Task 7 which adds it to stubs.)

- [ ] **Step 3: Commit**

```bash
git add js/auth-ui.js
git commit -m "feat(auth-ui): sign-in click loads supabase-js on demand before OAuth

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Suggest-modal sign-in card awaits ensureSupabase()

**Files:**
- Modify: `js/auth-signin.js` `initSignInHandlers()` (line 69 click handler)

- [ ] **Step 1: Await ensureSupabase() before signInWithProvider**

In `js/auth-signin.js`, inside the click handler, immediately after `this.innerHTML = svg + ' Connecting...';` (line 77) and before the `try {` (line 79), insert:

```javascript
                try {
                    await window.SupabaseClient.ensureSupabase();
                } catch (_) {
                    if (onError) onError('Sign-in is temporarily unavailable. Please try again in a few minutes.');
                    this.disabled = false;
                    this.innerHTML = originalText;
                    return;
                }
```

- [ ] **Step 2: Run auth-signin + suggest auth-gate tests**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; bundle exec jekyll build 2>&1 | tail -1; npx playwright test tests/auth-signin.spec.js tests/suggest.spec.js -g "Signed-out gate" --reporter=line`
Expected: PASS (stubs provide `ensureSupabase` after Task 7; until then these stubs may need it — run after Task 7 if it fails here).

- [ ] **Step 3: Commit**

```bash
git add js/auth-signin.js
git commit -m "feat(auth-signin): load supabase-js on demand before provider sign-in

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Suggest modal open() awaits ensureSupabase()

**Files:**
- Modify: `js/suggest.js` `open()` (line 2205) and `openEditMode()` (line 1833)

- [ ] **Step 1: Await ensureSupabase() at the top of open()**

In `js/suggest.js`, inside `open()`, immediately after line 2210 (`}` closing the `mode === 'edit'` branch) and before line 2212 (`// Remember trigger…`), insert:

```javascript
    // Load the library on demand before any auth/DB call. If the CDN is down,
    // show the auth gate's graceful error rather than throwing.
    try {
      await window.SupabaseClient.ensureSupabase();
    } catch (_) {
      const modal = mountAndOpen('Suggest a change', renderAuthGate());
      if (window.AuthSignIn) window.AuthSignIn.initHandlers(modal, (err) => showError(modal, err));
      return;
    }
```

- [ ] **Step 2: Await ensureSupabase() at the top of openEditMode()**

In `js/suggest.js`, inside `openEditMode()` (line 1833), as the first statement of the function body, insert:

```javascript
    try { await window.SupabaseClient.ensureSupabase(); } catch (_) { return; }
```

- [ ] **Step 3: node --check**

Run: `node --check js/suggest.js`
Expected: no output (valid syntax).

- [ ] **Step 4: Run suggest suite**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; bundle exec jekyll build 2>&1 | tail -1; npx playwright test tests/suggest.spec.js --reporter=line`
Expected: PASS (after Task 7 adds `ensureSupabase` to stubs).

- [ ] **Step 5: Commit**

```bash
git add js/suggest.js
git commit -m "feat(suggest): load supabase-js on demand when the modal opens

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Tool-page reviews await ensureSupabase()

**Files:**
- Modify: `_layouts/tool.html` reviews block (the `DOMContentLoaded` handler at line 283; health-gate at 304–308)

- [ ] **Step 1: Await ensureSupabase() before the health gate / getSupabase()**

In `_layouts/tool.html`, in the reviews `DOMContentLoaded` handler, replace the existing health-gate block (lines 303–308, the `if (typeof window.SupabaseClient?.isDatabaseHealthy …) { … reviewsSection.hidden = true; … }`) with:

```javascript
      // Reviews need the library + DB. Load it on demand; if the CDN or DB is
      // unreachable, hide the whole reviews section rather than spinning forever.
      try {
        await window.SupabaseClient.ensureSupabase();
      } catch (_) {
        reviewsSection.hidden = true;
        return;
      }
      if (typeof window.SupabaseClient?.isDatabaseHealthy === 'function') {
        const healthy = await window.SupabaseClient.isDatabaseHealthy();
        if (!healthy) {
          reviewsSection.hidden = true;
          return;
        }
      }
```

- [ ] **Step 2: Build + run tool-page + reviews tests**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; bundle exec jekyll build 2>&1 | tail -1; npx playwright test tests/tool-page.spec.js tests/reviews.spec.js --reporter=line`
Expected: PASS (these tests run with jsdelivr reachable in CI, so `ensureSupabase()` resolves and reviews load as before).

- [ ] **Step 3: Commit**

```bash
git add _layouts/tool.html
git commit -m "feat(tool-page): load supabase-js on demand before loading reviews

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Add ensureSupabase to test stubs + revert global-setup block

**Files:**
- Modify: `tests/suggest.spec.js` (the `SUPABASE_CLIENT_STUB_*` objects)
- Modify: `tests/global-setup.js` (remove `cdn.jsdelivr.net` from BLOCKED_HOSTS)

- [ ] **Step 1: Add ensureSupabase + getCachedSession to every SupabaseClient stub**

In `tests/suggest.spec.js`, each stub literal `window.SupabaseClient = { … }` must include these members (add alongside the existing ones):

```javascript
    ensureSupabase: async () => ({}),
    getCachedSession: () => null,
```

Find every `window.SupabaseClient = {` in the file and add both lines.

- [ ] **Step 2: Revert the jsdelivr proxy block**

In `tests/global-setup.js`, remove `'cdn.jsdelivr.net',` and its preceding comment block (the 6 lines added earlier: the comment starting `// jsdelivr serves…` through `'cdn.jsdelivr.net',`) from `BLOCKED_HOSTS`. The set returns to the 5 ad hosts only.

- [ ] **Step 3: node --check + run suggest suite**

Run: `node --check tests/suggest.spec.js && export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; npx playwright test tests/suggest.spec.js --reporter=line`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/suggest.spec.js tests/global-setup.js
git commit -m "test: add ensureSupabase to stubs; revert jsdelivr proxy block

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Content-independence regression test

**Files:**
- Create: `tests/content-no-supabase.spec.js`

- [ ] **Step 1: Write the test**

Create `tests/content-no-supabase.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

// Core decoupling guarantee: content pages render WITHOUT any request to the
// supabase CDN (jsdelivr) or the database host. A logged-out visitor on a
// static page must never trigger a Supabase load.
test.describe('Content pages are Supabase-independent', () => {
  test.use({ proxy: undefined });

  for (const path of ['/', '/landscape.html']) {
    test(`${path} renders tools with zero supabase/jsdelivr requests`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
      const hits = [];
      page.on('request', req => {
        const u = req.url();
        if (u.includes('cdn.jsdelivr.net') || u.includes('supabase.co')) hits.push(u);
      });

      await page.goto(path, { waitUntil: 'domcontentloaded' });
      // Give any (incorrect) lazy load a chance to fire.
      await page.waitForTimeout(1500);

      expect(await page.evaluate(() => typeof window.landscapeData)).toBe('object');
      expect(hits, `unexpected supabase/CDN requests:\n${hits.join('\n')}`).toEqual([]);
      // window.supabase must NOT have been loaded.
      expect(await page.evaluate(() => typeof window.supabase)).toBe('undefined');
    });
  }

  test('landscape shows a non-zero tool count', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await expect.poll(async () => page.evaluate(() => {
      const m = document.body.innerText.match(/(\d+)\s*tools shown/i);
      return m ? parseInt(m[1], 10) : 0;
    }), { timeout: 5000 }).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run — expect FAIL before Task 9**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; npx playwright test tests/content-no-supabase.spec.js --reporter=line`
Expected: FAIL — the static `<script>` still loads jsdelivr, so `hits` is non-empty and `window.supabase` is `object`. This proves the test guards the behavior. Task 9 makes it pass.

- [ ] **Step 3: Commit**

```bash
git add tests/content-no-supabase.spec.js
git commit -m "test: assert content pages make zero supabase/CDN requests (currently red)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Remove the static supabase-js tag from all 8 pages (the decoupling)

**Files:**
- Modify: `index.html`, `landscape.html`, `guides.html`, `admin.html`, `my-suggestions.html`, `my-reviews.html`, `_layouts/tool.html`, `_layouts/learn.html`

- [ ] **Step 1: Remove the tag everywhere (handles both `defer` and non-defer forms)**

Run:

```bash
cd "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/ai-tool-review"
for f in index.html landscape.html guides.html admin.html my-suggestions.html my-reviews.html _layouts/tool.html _layouts/learn.html; do
  perl -0777 -i -pe 's{[ \t]*<script (?:defer |async )?src="\{\{ '"'"'/js/supabase-js[^"]*'"'"' \| relative_url \}\}"></script>\n}{}g; s{[ \t]*<script (?:defer |async )?src="https://cdn\.jsdelivr\.net/npm/\@supabase/supabase-js\@2"></script>\n}{}g' "$f"
done
```

- [ ] **Step 2: Verify zero remaining static tags**

Run: `grep -rn 'supabase-js@2' index.html landscape.html guides.html admin.html my-suggestions.html my-reviews.html _layouts/tool.html _layouts/learn.html | grep -v "ensureSupabase"`
Expected: no output (no static `<script>` tag remains; the only reference to the URL is inside `ensureSupabase()` in the JS).

- [ ] **Step 3: Build + run the content-independence + lazy-loader tests**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; bundle exec jekyll build 2>&1 | tail -1; npx playwright test tests/content-no-supabase.spec.js tests/lazy-loader.spec.js --reporter=line`
Expected: PASS — content pages make zero jsdelivr/supabase requests, `window.supabase` is undefined on load, `ensureSupabase()` loads it on demand, landscape shows >0 tools.

- [ ] **Step 4: Commit**

```bash
git add index.html landscape.html guides.html admin.html my-suggestions.html my-reviews.html _layouts/tool.html _layouts/learn.html
git commit -m "feat: remove static supabase-js script; content fully CDN/DB-decoupled

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Adapt supabase-config test + full-suite verification

**Files:**
- Modify: `tests/supabase-config.spec.js` (`getSupabase returns a valid client`, line 49)

- [ ] **Step 1: Make the test load the library first**

In `tests/supabase-config.spec.js`, change the `getSupabase returns a valid client` test's evaluate body to await the loader:

```javascript
        const hasClient = await page.evaluate(async () => {
            await window.SupabaseClient.ensureSupabase();
            const client = window.SupabaseClient?.getSupabase();
            return client !== null && typeof client === 'object';
        });
```

(Replaces the `setTimeout(500)` + `getSupabase()` body. The library is no longer auto-loaded, so the test must trigger it.)

- [ ] **Step 2: Build, then run the FULL suite**

Run: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; bundle exec jekyll build 2>&1 | tail -1; npx playwright test --workers=4 --reporter=line 2>&1 | tail -15`
Expected: all pass (modulo the known dead-dev-DB tests that require a live DB, which are pre-existing). Specifically confirm `content-no-supabase`, `lazy-loader`, `db-unavailable`, `suggest`, `reviews`, `tool-page`, `supabase-config` are green.

- [ ] **Step 3: Manual smoke (optional but recommended)**

Run server: `export PATH="$HOME/.rbenv/shims:$PATH" && eval "$(rbenv init - 2>/dev/null)"; PORT=8080 node server.js &`
- Open `http://localhost:8080/landscape.html` → tools render immediately even if jsdelivr/Supabase are blocked.
- Toolbar shows "Sign in" instantly with no network to supabase.co on load.

- [ ] **Step 4: Commit**

```bash
git add tests/supabase-config.spec.js
git commit -m "test: load supabase-js on demand in getSupabase config test

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** Component 1 → Task 1; Component 2 (remove tag) → Task 9; Component 3 (toolbar cached-first) → Tasks 2–3; Component 4 (entry points) → Tasks 3,4,5,6; tests → Tasks 1,7,8,10; global-setup revert → Task 7. All covered.
- **Ordering:** The decoupling tag-removal (Task 9) lands AFTER the loader + entry points exist, so the app never has a window where neither the static tag nor `ensureSupabase()` provides the library. Tests written before their fix where practical (Tasks 1, 8 are red until Task 9).
- **Type consistency:** `ensureSupabase()` and `getCachedSession()` names are used identically across tasks and stubs.
- **Known external dependency:** Tasks needing the real library to load (reviews, supabase-config, lazy-loader) require jsdelivr reachable at test time; on a network where jsdelivr is down, those specific assertions will fail for environmental reasons — the content-independence tests (Task 8) do NOT need jsdelivr and are the core guarantee.
