# Guard every sign-in path when auth backend unreachable — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop BOTH sign-in paths (toolbar `auth-ui.js` and card `auth-signin.js`) from bouncing users to a dead OAuth URL when the Supabase backend is unreachable — including the reported case where the backend dies *after* the page loads.

**Architecture:** Make `SupabaseClient.isDatabaseHealthy()` re-checkable via a `forceFresh` flag (the existing version memoizes for the whole page load, so a stale `true` survives a backend death). Add a fresh click-time re-check before `signInWithProvider` on the toolbar button and the card, plus a load-time disable on the card.

**Tech Stack:** Vanilla JS (IIFE modules on `window`), CSS, Playwright, Jekyll build.

---

## File Structure

- `js/supabase-client.js` (modify) — `isDatabaseHealthy(forceFresh = false)`.
- `js/auth-ui.js` (modify) — click-time fresh re-check on the toolbar `#auth-signin-btn`.
- `js/auth-signin.js` (modify) — load-time disable + click-time fresh re-check on card.
- `css/auth.css` (modify) — `.auth-signin-unavailable` + `.auth-signin-unavailable-note`.
- `tests/db-unavailable.spec.js` (modify) — stale-cache toolbar race + card cases.

Reachability contract: `window.SupabaseClient.isDatabaseHealthy(forceFresh?)` → `Promise<boolean>`, never throws. `forceFresh: true` bypasses the page-load cache. Missing function → treat as `false` (default-closed).

---

### Task 1: Make `isDatabaseHealthy` re-checkable (`forceFresh`)

**Files:**
- Modify: `js/supabase-client.js` (the `isDatabaseHealthy` function, ~lines 70-88)

- [ ] **Step 1: Replace the function**

Current:

```javascript
let _healthPromise = null;
function isDatabaseHealthy() {
    if (_healthPromise) return _healthPromise;
    _healthPromise = (async () => {
        try {
            const supabase = getSupabase();
            if (!supabase) return false;
            await withTimeout(
                supabase.from('tools').select('id', { head: true, count: 'exact' })
            );
            return true;
        } catch (_) {
            return false;
        }
    })();
    return _healthPromise;
}
```

Replace with:

```javascript
let _healthPromise = null;
// forceFresh: bypass the page-load memo and run a new probe (used by click-time
// sign-in re-checks so a backend that died after load is detected). The fresh
// result replaces the memo so later default callers see current state.
function isDatabaseHealthy(forceFresh = false) {
    if (_healthPromise && !forceFresh) return _healthPromise;
    _healthPromise = (async () => {
        try {
            const supabase = getSupabase();
            if (!supabase) return false;
            await withTimeout(
                supabase.from('tools').select('id', { head: true, count: 'exact' })
            );
            return true;
        } catch (_) {
            return false;
        }
    })();
    return _healthPromise;
}
```

- [ ] **Step 2: Sanity-check the build still loads the file**

Run: `cd "ai-tool-review" && node -e "require('fs').readFileSync('js/supabase-client.js','utf8'); console.log('ok')"`
Expected: `ok` (no syntax error from manual edit; full JS runs in browser).

- [ ] **Step 3: Commit**

```bash
git add js/supabase-client.js
git commit -m "feat(client): isDatabaseHealthy(forceFresh) bypasses page-load cache"
```

---

### Task 2: Failing test — stale-cache toolbar click race (the reported bug)

**Files:**
- Test: `tests/db-unavailable.spec.js` (add a new `test.describe` block)

- [ ] **Step 1: Write the failing test**

Append to `tests/db-unavailable.spec.js`:

```javascript
test.describe('Sign-in re-checks backend at click time', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.removeItem('suggestions_available');
      sessionStorage.removeItem('suggestions_available');
    });
  });

  test('toolbar: backend dying AFTER load does not bounce to dead OAuth URL', async ({ page }) => {
    // 1. Load healthy so the toolbar renders an enabled sign-in button and the
    //    health probe caches `true`.
    await page.goto('/');
    const signinBtn = page.locator('#auth-signin-btn');
    await expect(signinBtn).toBeVisible({ timeout: 8000 });

    // 2. Backend dies while the page sits open.
    await page.route('**://*.supabase.co/**', route => route.abort());

    // 3. Click sign-in.
    const urlBefore = page.url();
    await signinBtn.click();
    await page.waitForTimeout(1000);

    // 4. Must NOT have navigated to the dead OAuth authorize URL.
    expect(page.url()).not.toContain('supabase.co/auth/v1/authorize');
    expect(page.url()).toBe(urlBefore);
  });
});
```

- [ ] **Step 2: Run test to verify it FAILS**

Run: `cd "ai-tool-review" && npx playwright test tests/db-unavailable.spec.js -g "backend dying AFTER load" --workers=1`
Expected: FAIL — current toolbar handler has no click-time re-check, so it calls `signInWithProvider` and the URL changes toward `…supabase.co/auth/v1/authorize`.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/db-unavailable.spec.js
git commit -m "test: toolbar sign-in must re-check backend at click (failing)"
```

---

### Task 3: Toolbar click-time fresh re-check (`auth-ui.js`)

**Files:**
- Modify: `js/auth-ui.js` (the `#auth-signin-btn` click handler in `setupDropdownHandlers`, ~lines 173-182)

- [ ] **Step 1: Replace the sign-in click handler**

Current:

```javascript
        // Sign in button
        if (signinBtn) {
            signinBtn.addEventListener('click', async function() {
                const { error } = await window.SupabaseClient.signInWithProvider('github');
                if (error) {
                    console.error('[AuthUI] Sign in failed:', error);
                    alert('Sign in failed: ' + error.message);
                }
            });
        }
```

Replace with:

```javascript
        // Sign in button — re-check backend reachability at CLICK time (fresh,
        // bypassing the page-load cache) so a backend that died after load does
        // not bounce the user to a dead OAuth URL.
        if (signinBtn) {
            signinBtn.addEventListener('click', async function() {
                this.disabled = true;
                const healthy = await window.SupabaseClient.isDatabaseHealthy(true);
                if (!healthy) {
                    // Collapse the control to the unavailable state instead of
                    // redirecting to a dead host.
                    alert('Sign-in is temporarily unavailable. Please try again in a few minutes.');
                    container.innerHTML = '';
                    return;
                }
                const { error } = await window.SupabaseClient.signInWithProvider('github');
                if (error) {
                    console.error('[AuthUI] Sign in failed:', error);
                    alert('Sign in failed: ' + error.message);
                    this.disabled = false;
                }
            });
        }
```

(Note: `container` is in scope — `setupDropdownHandlers(container)` receives it.)

- [ ] **Step 2: Run the failing test — expect PASS**

Run: `cd "ai-tool-review" && npx playwright test tests/db-unavailable.spec.js -g "backend dying AFTER load" --workers=1`
Expected: PASS — click triggers a fresh probe, which fails, so no redirect.

- [ ] **Step 3: Commit**

```bash
git add js/auth-ui.js
git commit -m "fix(auth): toolbar sign-in re-checks backend at click time"
```

---

### Task 4: Failing test — card disables when backend unreachable

**Files:**
- Test: `tests/db-unavailable.spec.js` (add to the same describe block)

- [ ] **Step 1: Write the failing test**

Add inside `test.describe('Sign-in re-checks backend at click time', ...)`:

```javascript
  test('admin card: provider buttons disabled + note shown, click does not navigate', async ({ page }) => {
    await page.route('**://*.supabase.co/**', route => route.abort());
    await page.goto('/admin.html');
    await page.waitForSelector('#login-required:not(.hidden)', { timeout: 8000 });

    const githubBtn = page.locator('.auth-provider-btn[data-provider="github"]');
    await expect(githubBtn).toBeDisabled({ timeout: 8000 });
    await expect(githubBtn).toHaveClass(/auth-signin-unavailable/);
    await expect(page.locator('.auth-signin-unavailable-note')).toBeVisible();

    const urlBefore = page.url();
    await githubBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    expect(page.url()).toBe(urlBefore);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "ai-tool-review" && npx playwright test tests/db-unavailable.spec.js -g "admin card" --workers=1`
Expected: FAIL — card has no guard yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/db-unavailable.spec.js
git commit -m "test: card sign-in must disable when backend unreachable (failing)"
```

---

### Task 5: Card health guard (`auth-signin.js`)

**Files:**
- Modify: `js/auth-signin.js` (add helpers before `initSignInHandlers`; modify `initSignInHandlers` ~lines 65-101)

- [ ] **Step 1: Add helpers before `initSignInHandlers`**

Insert after `renderSignInCard` (just before `function initSignInHandlers`):

```javascript
    const UNAVAILABLE_TEXT = 'Sign-in is temporarily unavailable. Please try again in a few minutes.';

    // Default-closed: missing client/function => unreachable.
    async function backendReachable(forceFresh) {
        try {
            const fn = window.SupabaseClient && window.SupabaseClient.isDatabaseHealthy;
            if (typeof fn !== 'function') return false;
            return await fn(!!forceFresh);
        } catch (_) {
            return false;
        }
    }

    function setUnavailable(container) {
        container.querySelectorAll('.auth-provider-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('auth-signin-unavailable');
            btn.setAttribute('title', 'Sign-in is temporarily unavailable');
        });
        if (!container.querySelector('.auth-signin-unavailable-note')) {
            const note = document.createElement('p');
            note.className = 'auth-signin-unavailable-note';
            note.textContent = UNAVAILABLE_TEXT;
            const slot = container.querySelector('.auth-signin-buttons') || container;
            slot.insertAdjacentElement('afterend', note);
        }
    }
```

- [ ] **Step 2: Add load-time pre-check in `initSignInHandlers`**

Immediately after `const buttons = container.querySelectorAll('.auth-provider-btn');`:

```javascript
        // Load-time gate: disable the card if the backend is already unreachable.
        backendReachable(false).then(ok => {
            if (!ok) setUnavailable(container);
        });
```

- [ ] **Step 3: Add click-time fresh re-check inside the existing click handler**

In the click handler's `try` block, BEFORE the existing `signInWithProvider` call, insert the fresh re-check so the start of `try` reads:

```javascript
                try {
                    // Re-check fresh at click time (defeats stale page-load cache).
                    const ok = await backendReachable(true);
                    if (!ok) {
                        setUnavailable(container);
                        this.disabled = false;
                        this.innerHTML = originalText;
                        if (onError) onError(UNAVAILABLE_TEXT);
                        return;
                    }

                    const { error } = await window.SupabaseClient.signInWithProvider(provider);
```

(Leave the rest of the `try`/`catch` body unchanged.)

- [ ] **Step 4: Run the card test — expect PASS**

Run: `cd "ai-tool-review" && npx playwright test tests/db-unavailable.spec.js -g "admin card" --workers=1`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/auth-signin.js
git commit -m "feat(auth): guard sign-in card when backend unreachable"
```

---

### Task 6: Style the unavailable state

**Files:**
- Modify: `css/auth.css` (append)

- [ ] **Step 1: Add styles**

Append to `css/auth.css`:

```css
/* Sign-in card: backend-unreachable state */
.auth-provider-btn.auth-signin-unavailable {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
}

.auth-signin-unavailable-note {
    margin: 12px 0 0;
    font-size: 0.875rem;
    color: var(--text-muted, #8a8f98);
    text-align: center;
    line-height: 1.4;
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `cd "ai-tool-review" && eval "$(rbenv init -)" && bundle exec jekyll build`
Expected: `done in N seconds`, no errors.

- [ ] **Step 3: Commit**

```bash
git add css/auth.css
git commit -m "style(auth): muted disabled state + note for unavailable sign-in"
```

---

### Task 7: Regression test — healthy backend unchanged

**Files:**
- Test: `tests/db-unavailable.spec.js`

- [ ] **Step 1: Write the regression test**

Add inside the same describe block:

```javascript
  test('admin card: healthy backend leaves provider buttons enabled, no note', async ({ page }) => {
    await page.goto('/admin.html');
    await page.waitForSelector('#login-required:not(.hidden)', { timeout: 8000 });

    const githubBtn = page.locator('.auth-provider-btn[data-provider="github"]');
    await expect(githubBtn).toBeEnabled({ timeout: 8000 });
    await expect(githubBtn).not.toHaveClass(/auth-signin-unavailable/);
    await expect(page.locator('.auth-signin-unavailable-note')).toHaveCount(0);
  });
```

- [ ] **Step 2: Run it**

Run: `cd "ai-tool-review" && npx playwright test tests/db-unavailable.spec.js -g "healthy backend leaves" --workers=1`
Expected: PASS (needs the dev Supabase host reachable — see caveat note).

- [ ] **Step 3: Commit**

```bash
git add tests/db-unavailable.spec.js
git commit -m "test: card sign-in stays enabled when backend healthy"
```

---

### Task 8: Full verification

- [ ] **Step 1: Run all auth + degradation specs**

Run: `cd "ai-tool-review" && npx playwright test tests/auth-signin.spec.js tests/auth-parity.spec.js tests/db-unavailable.spec.js --workers=1`
Expected: all PASS.

- [ ] **Step 2: Validations + build**

Run: `cd "ai-tool-review" && eval "$(rbenv init -)" && npm run validate && npm run validate:auth-pages && bundle exec jekyll build`
Expected: all pass, build `done`.

---

## Notes for the implementer

- **`.co` incident caveat:** the "healthy backend" regression (Task 7) and the load step of the toolbar race test (Task 2, step 1: load `/` healthy) rely on the dev Supabase host being reachable on localhost. If the active `.co` TLD incident is ongoing, the host may be unreachable, breaking these. In that case, **fulfill** the health probe for the "healthy" phase: `page.route('**://*.supabase.co/**', route => route.fulfill({ status: 200, body: '' }))` and only switch to `route.abort()` for the "backend dies" phase. The unreachable-only tests (Tasks 4-5) are unaffected.
- **RAM:** run Playwright with `--workers=1` when free RAM < ~4 GB to avoid OOM-killed workers.
- **Do not change the toolbar load-time behavior** in `auth-ui.js` — only add the click-time re-check. The load-time removal is covered by existing tests.
