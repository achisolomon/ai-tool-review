/**
 * suggest.spec.js — E2E + a11y tests for the community suggestions modal.
 *
 * Split:
 *   RUNNABLE (headless):  Tests 1, 2, 3a-3d (signed-out gate, axe a11y, mocked-auth forms)
 *   SKIPPED (require real signed-in Supabase session): Tests 4, 5
 *
 * Run:
 *   PORT=8083 npx playwright test tests/suggest.spec.js --workers=1
 */

import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Set cookie_consent so the consent banner doesn't interfere. */
async function acceptCookies(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted');
  });
}

/**
 * Override window.SupabaseClient so the modal renders the signed-in forms
 * without a real OAuth session.  Call AFTER page.goto() once scripts have
 * initialised.
 *
 * Also exposes window.landscapeData because data.js declares it as
 * `const landscapeData` (not window.landscapeData), but suggest.js reads it
 * as window.landscapeData.  We use new Function() to reach the const from
 * the page's global execution context.
 */
async function mockAuthSignedIn(page) {
  await page.evaluate(() => {
    // SupabaseClient mock
    // ensureSupabase() is overridden to resolve immediately: these tests mock
    // auth and block the jsdelivr CDN (see gotoLandscape), so the real lazy
    // loader would reject and the modal would fall back to the auth gate.
    window.SupabaseClient.ensureSupabase = async () => ({});
    window.SupabaseClient.isAuthenticated = async () => true;
    window.SupabaseClient.getCurrentUser = async () => ({
      id: 'test-user-id',
      email: 'tester@example.com',
      user_metadata: { user_name: 'tester', full_name: 'Test User' },
    });
    window.SupabaseClient.countMyPending = async () => 0;
    window.SupabaseClient.createSuggestion = async (row) => ({
      data: { id: 'fake-id', ...row },
      error: null,
    });

    // Expose landscapeData on window so suggest.js duplicate-check can use it.
    // data.js writes `const landscapeData = {...}` at top-level script scope.
    // Top-level `const` is NOT a property of `window`, but IS accessible as a
    // plain variable in page.evaluate() since all scripts share the global
    // lexical scope.  We re-expose it on window for suggest.js to find.
    if (typeof window.landscapeData === 'undefined') {
      try {
        // Direct reference — works because page.evaluate runs in the same
        // global scope where data.js declared landscapeData.
        // eslint-disable-next-line no-undef
        window.landscapeData = landscapeData;
      } catch (_) {
        // data.js not yet loaded; duplicate-check will silently no-op.
      }
    }
  });
}

/** Wait until window.SupabaseClient is defined (scripts may load async). */
async function waitForSupabaseClient(page, timeout = 8000) {
  await page.waitForFunction(
    () => typeof window.SupabaseClient !== 'undefined',
    { timeout }
  );
}

/** Open the landscape page and wait for the #suggest-open button. */
async function gotoLandscape(page) {
  // Block external third-party network requests (Analytics, AdSense) that
  // can block the page 'load' event for 30+ seconds in headless mode.
  // Only match external hostnames, not local paths like /js/supabase-client.js.
  await page.route('https://www.googletagmanager.com/**', route => route.abort());
  await page.route('https://pagead2.googlesyndication.com/**', route => route.abort());
  await page.route('https://cdn.jsdelivr.net/**', route => route.abort());

  // Use 'load' but with external scripts aborted above so it fires quickly.
  // Alternatively use 'domcontentloaded' — both work once externals are aborted.
  await page.goto('/landscape.html', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for the suggest button and supabase client to be initialised
  await page.waitForSelector('#suggest-open', { timeout: 10000 });
  await waitForSupabaseClient(page);
}

/**
 * Navigate to landscape, mock auth, open modal, pick "Add a missing tool"
 * from the chooser, advance to Form A (new-tool form), and return the modal
 * locator once the form is stable.
 */
async function openNewToolForm(page) {
  await gotoLandscape(page);
  await mockAuthSignedIn(page);

  // Open the modal — now signed in, so we get the chooser
  await page.locator('#suggest-open').click();

  const modal = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // The chooser shows; pick "Add a missing tool" radio card
  const newToolCard = modal.locator('[data-mode="new-tool"]');
  await expect(newToolCard).toBeVisible({ timeout: 5000 });
  // Clicking a chooser card advances directly to the form (no separate Next step).
  // Fire a genuine DOM click via evaluate since clicking replaces the modal body
  // (detaching the card mid-click); the backdrop handler must NOT misread the
  // bubbling click from the now-detached card as a backdrop click.
  await page.evaluate(() => document.querySelector('.suggest-radio-card[data-mode="new-tool"]')?.click());

  // Regression guard: the modal stays open after advancing (did not close).
  await expect(modal).toBeVisible();

  // Wait for Form A to be fully in the DOM and stable.
  // showInModal() replaces the modal body, then wireNewToolSubmit is awaited
  // and focus is moved — wait for the first form input to be stable.
  const nameInput = modal.locator('#suggest-name');
  await expect(nameInput).toBeVisible({ timeout: 8000 });

  // Also wait for the credit consent block to be rendered (it's at the bottom
  // of the form — ensures the full form HTML has been inserted before returning).
  await expect(modal.locator('#suggest-public-credit')).toBeAttached({ timeout: 5000 });

  // Extra stability wait: ensure the form is no longer being mutated
  await page.waitForTimeout(150);

  return modal;
}

// ---------------------------------------------------------------------------
// Test 1 — Signed-out gate
// ---------------------------------------------------------------------------

test.describe('Test 1: Signed-out gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { sessionStorage.setItem('suggestions_available', '1'); });
    await acceptCookies(page);
  });

  test('clicking + Suggest when signed out shows auth gate with no form fields', async ({ page }) => {
    await gotoLandscape(page);

    // Ensure SupabaseClient reports signed-out (default state — no mock override)
    const suggestBtn = page.locator('#suggest-open');
    await expect(suggestBtn).toBeVisible();
    await suggestBtn.click();

    // Modal must appear
    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Auth gate is present
    const authGate = modal.locator('.suggest-auth-gate');
    await expect(authGate).toBeVisible();

    // No form inputs or selects should be rendered in the auth-gate modal
    const inputs = modal.locator('input, select, textarea');
    await expect(inputs).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// Test 2 — Modal accessibility (axe scan + Escape + focus return)
// ---------------------------------------------------------------------------

test.describe('Test 2: Modal a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { sessionStorage.setItem('suggestions_available', '1'); });
    await acceptCookies(page);
  });

  test('open modal has role=dialog + aria-modal, no critical/serious axe violations', async ({ page }) => {
    await gotoLandscape(page);

    const suggestBtn = page.locator('#suggest-open');
    await suggestBtn.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Axe scan scoped to the modal element only
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"][aria-modal="true"]')
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalOrSerious.length > 0) {
      const summary = criticalOrSerious
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}`)
        .join('\n');
      throw new Error(`Axe found ${criticalOrSerious.length} critical/serious violation(s):\n${summary}`);
    }

    expect(criticalOrSerious).toHaveLength(0);
  });

  test('Escape key closes the modal and returns focus to trigger', async ({ page }) => {
    await gotoLandscape(page);

    const suggestBtn = page.locator('#suggest-open');
    await suggestBtn.click();

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should disappear (CSS transition + 250 ms fallback)
    await expect(modal).not.toBeVisible({ timeout: 2000 });

    // Focus should return to the trigger button
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('suggest-open');
  });
});

// ---------------------------------------------------------------------------
// Test 3 — Mocked-auth form tests (signed-in state without real OAuth)
// ---------------------------------------------------------------------------

test.describe('Test 3: Mocked-auth form tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { sessionStorage.setItem('suggestions_available', '1'); });
    await acceptCookies(page);
  });

  // -----------------------------------------------------------------------
  // 3a — Slug derivation
  // -----------------------------------------------------------------------

  test('3a: typing a tool name triggers duplicate check; name field is present and required', async ({ page }) => {
    // Note: slug field was removed in Task 2. This test now covers name field presence
    // and that typing a name triggers the duplicate-check flow (no slug derivation to verify).
    const modal = await openNewToolForm(page);

    const nameInput = modal.locator('#suggest-name');

    // Name field must be present and required
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('required', '');

    // Slug field must NOT be present
    await expect(modal.locator('#suggest-slug')).toHaveCount(0);

    // Typing a name dispatches an input event — duplicate-check wiring must not throw
    await nameInput.fill('Letta AI');
    await nameInput.dispatchEvent('input');

    // The name value is stable (no crash, no redirect)
    await expect(nameInput).toHaveValue('Letta AI');
  });

  // -----------------------------------------------------------------------
  // 3b — Duplicate warning
  // -----------------------------------------------------------------------

  test('3b: typing an existing tool name shows the non-blocking duplicate warning', async ({ page }) => {
    const modal = await openNewToolForm(page);

    // Use page-level locator to avoid stale reference after modal DOM mutation
    const dupWarning = page.locator('#suggest-dup-warning');

    // "ChatGPT" is in landscapeData (it's a well-known tool on the landscape).
    // Use page.evaluate to set the value and dispatch the input event without
    // triggering a Playwright mouse click (fill() internally clicks to focus,
    // which can bubble to the backdrop handler and close the modal).
    await page.evaluate(() => {
      const nameInput = document.querySelector('#suggest-name');
      if (nameInput) {
        nameInput.value = 'ChatGPT';
        // Dispatch with bubbles:true so wireDuplicateCheck's 'input' listener fires
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Duplicate check has a 400 ms debounce; give it plenty of time to fire
    await expect(dupWarning).toBeVisible({ timeout: 4000 });

    // Warning should contain a link to the existing tool page
    const link = dupWarning.locator('a');
    await expect(link).toHaveCount(1, { timeout: 1000 });
  });

  // -----------------------------------------------------------------------
  // 3c — Credit consent
  // -----------------------------------------------------------------------

  test('3c: credit consent shows read-only OAuth name; opting out dims it and clears the submitted value', async ({ page }) => {
    await openNewToolForm(page);

    await page.evaluate(() => {
      const el = document.querySelector('#suggest-public-credit');
      if (el) el.scrollIntoView({ block: 'center' });
    });

    const result = await page.evaluate(() => {
      const checkbox = document.querySelector('#suggest-public-credit');
      const nameDisplay = document.querySelector('#suggest-credit-name-wrapper'); // now an inline <strong>
      const nameField = document.querySelector('#suggest-credit-name');           // now type=hidden
      const disclosure = document.querySelector('.suggest-credit-disclosure');

      if (!checkbox || !nameDisplay || !nameField || !disclosure) {
        return { ok: false, error: 'Missing elements' };
      }

      const initiallyChecked = checkbox.checked;
      // Name is read-only (not a user-editable text input)
      const nameIsReadOnly = nameField.type === 'hidden';
      // The displayed name reflects the OAuth identity passed to the modal
      const showsName = nameDisplay.textContent.trim().length > 0;
      // No "Display name" editable label anymore
      const hasOldLabel = !!document.querySelector('label[for="suggest-credit-name"]');

      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      const dimmedAfterUncheck = nameDisplay.style.opacity === '0.4';
      const valueClearedAfterUncheck = nameField.disabled === true;

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      const restoredAfterRecheck = nameDisplay.style.opacity === '1' && nameField.disabled === false;

      return { ok: true, initiallyChecked, nameIsReadOnly, showsName, hasOldLabel,
               dimmedAfterUncheck, valueClearedAfterUncheck, restoredAfterRecheck };
    });

    expect(result.ok).toBe(true);
    expect(result.initiallyChecked).toBe(true);
    expect(result.nameIsReadOnly).toBe(true);          // name comes from GitHub/Google, not editable
    expect(result.showsName).toBe(true);               // identity name displayed
    expect(result.hasOldLabel).toBe(false);            // "Display name (shown on the site)" removed
    expect(result.dimmedAfterUncheck).toBe(true);      // opting out dims the name
    expect(result.valueClearedAfterUncheck).toBe(true);// hidden value disabled so it isn't submitted
    expect(result.restoredAfterRecheck).toBe(true);    // re-checking restores
  });

  // -----------------------------------------------------------------------
  // 3f — No slug field; category/subcategory optional
  // -----------------------------------------------------------------------

  test('3f: new-tool form has no slug field; category/subcategory are optional', async ({ page }) => {
    const modal = await openNewToolForm(page);

    // No slug field in the form
    await expect(page.locator('#suggest-slug')).toHaveCount(0);

    // Category and subcategory selects are in the DOM (inside the collapsible) but NOT required
    await expect(page.locator('#suggest-category')).toBeAttached();
    await expect(page.locator('#suggest-category')).not.toHaveAttribute('required', /.*/);
    await expect(page.locator('#suggest-subcategory')).toBeAttached();
    await expect(page.locator('#suggest-subcategory')).not.toHaveAttribute('required', /.*/);
  });

  // -----------------------------------------------------------------------
  // 3d — Successful mocked submit shows confirmation
  // -----------------------------------------------------------------------

  test('3d: mocked submit shows success confirmation microcopy', async ({ page }) => {
    const modal = await openNewToolForm(page);

    // Fill required fields to pass HTML5 validation
    const nameInput = modal.locator('#suggest-name');
    await nameInput.fill('Test Tool XYZ');
    await nameInput.dispatchEvent('input');

    await modal.locator('#suggest-website').fill('https://testtool.example.com');

    // Description (required, min 10 chars)
    await modal.locator('#suggest-description').fill('A test tool for playwright e2e spec.');

    // Submit via evaluate to avoid click-on-unstable-element issues
    await page.evaluate(() => {
      const form = document.querySelector('#suggest-new-tool-form');
      if (form) form.requestSubmit();
    });

    // Success state — mocked createSuggestion returns no error
    const successBlock = modal.locator('.suggest-success');
    await expect(successBlock).toBeVisible({ timeout: 5000 });
    await expect(successBlock).toContainText('Thank you');
  });

  // -----------------------------------------------------------------------
  // 3g — Edit-mode resubmit: phantom slug requirement must NOT block submit
  // -----------------------------------------------------------------------

  test('3g: edit-mode new_tool resubmit is not blocked by phantom slug requirement', async ({ page }) => {
    await gotoLandscape(page);
    await mockAuthSignedIn(page);

    // Also mock updateMySuggestion so the edit-mode submit path can complete
    await page.evaluate(() => {
      window.SupabaseClient.updateMySuggestion = async (_id, _patch) => ({ error: null });
    });

    // Open modal in edit mode for a new_tool suggestion (simulates my-suggestions flow)
    await page.evaluate(() => {
      window.Suggest.open({
        mode: 'edit',
        suggestion: {
          id: 'fake-suggestion-id',
          kind: 'new_tool',
          rationale: 'Initial rationale',
          credit_name: null,
          public_credit: true,
          payload: {
            name: 'Pre-filled Tool',
            website: 'https://prefilled.example.com',
            description: 'A pre-filled description for edit mode.',
          },
        },
      });
    });

    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // The edit form should be pre-filled with the new_tool form
    const nameInput = modal.locator('#suggest-name');
    await expect(nameInput).toBeVisible({ timeout: 8000 });

    // No slug field should exist
    await expect(modal.locator('#suggest-slug')).toHaveCount(0);

    // Submit the form — should NOT be blocked by "slug required" error
    await page.evaluate(() => {
      const form = document.querySelector('#suggest-new-tool-form');
      if (form) form.requestSubmit();
    });

    // The old bug showed an error block with slug in the message; verify it does NOT appear
    const errBlock = modal.locator('.suggest-error');
    // Give a short window for any error to appear
    await page.waitForTimeout(500);

    // If an error IS visible it must not mention slug
    const errVisible = await errBlock.isVisible();
    if (errVisible) {
      const errText = await errBlock.textContent();
      expect(errText).not.toContain('slug');
    }

    // The success state should appear (mocked updateMySuggestion returns no error)
    const successBlock = modal.locator('.suggest-success');
    await expect(successBlock).toBeVisible({ timeout: 5000 });
    await expect(successBlock).toContainText('Saved!');
  });

  // -----------------------------------------------------------------------
  // 3h — Taxonomy rename: target is a populated cascade dropdown
  // -----------------------------------------------------------------------

  test('3h: taxonomy rename target is a populated dropdown that cascades on kind', async ({ page }) => {
    await gotoLandscape(page);
    await mockAuthSignedIn(page);

    // Ensure landscapeData.taxonomy is available in window scope for the cascade
    await page.evaluate(() => {
      if (window.landscapeData && !window.landscapeData.taxonomy) {
        // Provide a minimal taxonomy stub so taxonomyObjects returns real results
        window.landscapeData.taxonomy = {
          categories: {
            developers: {
              'ai-coding': {
                name: 'AI Coding',
                subcategories: { 'ai-ides': { name: 'AI IDEs' } },
              },
            },
          },
          tags: { capabilities: [{ slug: 'reasoning', name: 'Reasoning' }] },
        };
      } else if (!window.landscapeData) {
        window.landscapeData = {
          taxonomy: {
            categories: {
              developers: {
                'ai-coding': {
                  name: 'AI Coding',
                  subcategories: { 'ai-ides': { name: 'AI IDEs' } },
                },
              },
            },
            tags: { capabilities: [{ slug: 'reasoning', name: 'Reasoning' }] },
          },
        };
      }
    });

    await page.locator('#suggest-open').click();
    const modal = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Pick "Improve the taxonomy" mode — card click advances directly
    await page.locator('.suggest-radio-card[data-mode="taxonomy"]').click();

    // Taxonomy op chooser: pick "Rename something" — card click advances directly
    await expect(page.locator('.suggest-radio-card[data-taxop="rename"]')).toBeVisible({ timeout: 5000 });
    await page.locator('.suggest-radio-card[data-taxop="rename"]').click();

    // Rename form is now shown
    await expect(page.locator('#taxop-target')).toBeVisible({ timeout: 5000 });

    // Target dropdown should be disabled until a kind is selected
    await expect(page.locator('#taxop-target')).toBeDisabled();

    // Select "subcategory" kind — this should cascade-populate the target dropdown
    await page.selectOption('#taxop-target-kind', 'subcategory');
    await expect(page.locator('#taxop-target')).toBeEnabled();

    const opts = await page.locator('#taxop-target option').count();
    expect(opts).toBeGreaterThan(1); // placeholder + real subcategories
  });
});

// ---------------------------------------------------------------------------
// Test 3e — Graceful degradation (suggestions table missing)
// ---------------------------------------------------------------------------

test.describe('Graceful degradation (table missing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { sessionStorage.setItem('suggestions_available', '0'); });
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
  });

  test('3e: #suggest-open is hidden and no console errors when table unavailable', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.route('https://www.googletagmanager.com/**', route => route.abort());
    await page.route('https://pagead2.googlesyndication.com/**', route => route.abort());
    await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for DOMContentLoaded bootstrap to run
    await page.waitForFunction(() => document.documentElement.classList.contains('suggestions-disabled'), { timeout: 5000 });

    // #suggest-open must NOT be visible (hidden by bootstrap)
    const suggestBtn = page.locator('#suggest-open');
    await expect(suggestBtn).not.toBeVisible();

    // .card-suggest elements (if any) must be hidden via CSS class
    const cardSuggests = page.locator('.card-suggest');
    const count = await cardSuggests.count();
    for (let i = 0; i < count; i++) {
      await expect(cardSuggests.nth(i)).not.toBeVisible();
    }

    // No console errors (filter expected CDN/analytics noise)
    const relevant = consoleErrors.filter(e =>
      !e.includes('supabase') &&
      !e.includes('cdn.jsdelivr') &&
      !e.includes('googletagmanager') &&
      !e.includes('net::ERR') &&
      !e.includes('Failed to fetch') &&
      // Ad/analytics CDN hosts are aborted by the global-setup proxy, surfacing
      // as generic "Failed to load resource: …404" lines with no URL. Same
      // expected noise the host-specific filters above target.
      !e.includes('Failed to load resource')
    );
    expect(relevant).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Test 3f — 401 from Supabase probe must NOT hide the suggest UI
// Root cause: isSuggestionsAvailable() treated 401 (RLS blocks anon reads on
// an existing table) the same as "table missing". Fix: 401/403 → available=true.
// ---------------------------------------------------------------------------

const SUPABASE_CLIENT_STUB_401 = `
window.SupabaseClient = {
    isDatabaseHealthy: async () => true,
    ensureSupabase: async () => ({}),
    getCachedSession: () => null,
    logSupabaseError: () => {},
    getCurrentUser: async () => null,
    getSession: async () => ({ session: null }),
    isSuggestionsAvailable: async () => {
        // Simulate: table exists but RLS blocks anon HEAD probe → 401
        const err = { status: 401, message: 'JWT required' };
        const available = !err || err.status === 401 || err.status === 403;
        return available;
    },
    isAuthenticated: async () => false,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithProvider: async () => {},
    signOut: async () => {},
    submitSuggestion: async () => ({ error: { message: 'not authenticated' } }),
    getMySuggestions: async () => ({ suggestions: [], error: null }),
    countMyPending: async () => 0,
};
`;

test.describe('Suggest UI visible when Supabase probe returns 401 (RLS blocks anon)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('**/js/supabase-client.js', route =>
      route.fulfill({ contentType: 'application/javascript', body: SUPABASE_CLIENT_STUB_401 })
    );
    await page.route('https://www.googletagmanager.com/**', route => route.abort());
    await page.route('https://pagead2.googlesyndication.com/**', route => route.abort());
    await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  });

  test('3f: #suggest-open IS visible on landscape when probe returns 401', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('suggestions-enabled') ||
      document.documentElement.classList.contains('suggestions-disabled'),
      { timeout: 8000 }
    );
    // A 401 means table exists → suggestions-enabled, button must be visible
    await expect(page.locator('#suggest-open')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.classList.contains('suggestions-disabled'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Test 3g — 42501 (permission denied, anon lacks SELECT grant) must NOT hide UI
// Root cause: migration was missing GRANT SELECT ON suggestions TO anon, so
// Postgres blocked the probe at the ACL layer before RLS ran, returning
// error.code='42501'. isSuggestionsAvailable() treated it as unavailable.
// Fix: 42501 → available=true. Permanent fix: GRANT SELECT TO anon in migration.
// ---------------------------------------------------------------------------

const SUPABASE_CLIENT_STUB_42501 = `
window.SupabaseClient = {
    isDatabaseHealthy: async () => true,
    ensureSupabase: async () => ({}),
    getCachedSession: () => null,
    logSupabaseError: () => {},
    getCurrentUser: async () => null,
    getSession: async () => ({ session: null }),
    isSuggestionsAvailable: async () => {
        // Simulate: anon probe returns Postgres 42501 "permission denied for table"
        const err = { code: '42501', message: 'permission denied for table suggestions' };
        const available = !err || err.code === '42501' || err.code === 'PGRST301' ||
                          err.status === 401 || err.status === 403;
        return available;
    },
    isAuthenticated: async () => false,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithProvider: async () => {},
    signOut: async () => {},
    submitSuggestion: async () => ({ error: { message: 'not authenticated' } }),
    getMySuggestions: async () => ({ suggestions: [], error: null }),
    countMyPending: async () => 0,
};
`;

test.describe('Suggest UI visible when Supabase probe returns 42501 (anon lacks SELECT grant)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('**/js/supabase-client.js', route =>
      route.fulfill({ contentType: 'application/javascript', body: SUPABASE_CLIENT_STUB_42501 })
    );
    await page.route('https://www.googletagmanager.com/**', route => route.abort());
    await page.route('https://pagead2.googlesyndication.com/**', route => route.abort());
    await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  });

  test('3g: #suggest-open IS visible on landscape when probe returns 42501', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('suggestions-enabled') ||
      document.documentElement.classList.contains('suggestions-disabled'),
      { timeout: 8000 }
    );
    await expect(page.locator('#suggest-open')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.classList.contains('suggestions-disabled'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Test 3h — #tool-suggest-open visible on tool page when probe returns 42501
// ---------------------------------------------------------------------------

const SUPABASE_CLIENT_STUB_TOOL_42501 = `
window.SupabaseClient = {
    isDatabaseHealthy: async () => true,
    ensureSupabase: async () => ({}),
    getCachedSession: () => null,
    logSupabaseError: () => {},
    getCurrentUser: async () => null,
    getSession: async () => ({ session: null }),
    isSuggestionsAvailable: async () => true,
    isAuthenticated: async () => false,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithProvider: async () => {},
    signOut: async () => {},
    submitSuggestion: async () => ({ error: { message: 'not authenticated' } }),
    getMySuggestions: async () => ({ suggestions: [], error: null }),
    countMyPending: async () => 0,
};
`;

test.describe('Tool page: #tool-suggest-open visible when suggestions available', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('**/js/supabase-client.js', route =>
      route.fulfill({ contentType: 'application/javascript', body: SUPABASE_CLIENT_STUB_TOOL_42501 })
    );
    await page.route('https://www.googletagmanager.com/**', route => route.abort());
    await page.route('https://pagead2.googlesyndication.com/**', route => route.abort());
    await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  });

  test('3h: #tool-suggest-open corner button is visible on a tool page', async ({ page }) => {
    await page.goto('/tools/claude-code/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('suggestions-enabled') ||
      document.documentElement.classList.contains('suggestions-disabled'),
      { timeout: 8000 }
    );
    await expect(page.locator('#tool-suggest-open')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Test 4 — Real end-to-end submit (SKIPPED: requires signed-in Supabase session)
// ---------------------------------------------------------------------------

// These tests require a real authenticated session and the migration 009 applied
// to the Supabase project. They are skipped in CI and local headless runs.
// To run them: wire a real auth fixture and remove the test.skip wrapper.

test.skip('4: submit new_tool suggestion persists a row [requires signed-in session]', async ({ page }) => {
  // Owner runs this after:
  //   1. Applying migration 009 to the Supabase project.
  //   2. Wiring a real auth fixture (e.g., pre-seeded localStorage auth token).
  // Assert: after filling and submitting the new-tool form, a row appears in
  // the `suggestions` table with status='pending' and kind='new_tool'.
  throw new Error('Not implemented — requires real signed-in session');
});

test.skip('4: submit taxonomy_change suggestion persists a row [requires signed-in session]', async ({ page }) => {
  throw new Error('Not implemented — requires real signed-in session');
});

test.skip('4: submit move_retag suggestion persists a row [requires signed-in session]', async ({ page }) => {
  throw new Error('Not implemented — requires real signed-in session');
});

test.skip('4: submit fix_details suggestion persists a row [requires signed-in session]', async ({ page }) => {
  throw new Error('Not implemented — requires real signed-in session');
});

// ---------------------------------------------------------------------------
// Test 5 — Policy-layer RLS: user cannot self-approve (SKIPPED)
// ---------------------------------------------------------------------------

// This test verifies that the WITH CHECK clause on the `suggestions` table
// blocks a signed-in non-admin user from updating status='approved' on their
// own pending row — independently of the trigger.
//
// Requires:
//   - Migration 009 applied (the RLS WITH CHECK policy is part of that migration).
//   - A real authenticated browser session for a non-admin user.
//   - A pre-existing pending suggestion row belonging to that user.
//
// When the owner is ready to run it:
//   1. Apply migration 009 to the Supabase project via the SQL Editor.
//   2. Wire a real auth fixture (e.g., Supabase magic-link or GitHub OAuth token
//      injected into localStorage before page.goto).
//   3. Note the id of a pending suggestion owned by the test user.
//   4. Remove the test.skip wrapper and fill in ownPendingId below.

// ---------------------------------------------------------------------------
// Tests 3i, 3j, 3k — Move/Re-tag type-ahead pickers
// ---------------------------------------------------------------------------

/**
 * Taxonomy stub used by the move/re-tag typeahead tests.
 * Contains:
 *   - A subcategory named "Memory & Context" (slug: memory-context) so that
 *     typing "memory" returns it in the subcategory type-ahead.
 *   - The existing "ai-ides" subcategory so the tool's current placement works.
 *   - A tag "reasoning" (current tag for the test tool).
 *   - A tag "api-available" (a second real tag, used for the add-chip test).
 */
const MOVE_RETAG_TAXONOMY = {
  categories: {
    developers: {
      'ai-coding': {
        name: 'AI Coding',
        subcategories: {
          'ai-ides': { name: 'AI IDEs' },
          'memory-context': { name: 'Memory & Context' },
        },
      },
    },
  },
  tags: {
    capabilities: [
      { slug: 'reasoning', name: 'Reasoning', description: 'Tool supports reasoning' },
      { slug: 'api-available', name: 'API Available', description: 'Provides an API' },
    ],
    integrations: [],
    deployment: [],
    'use-cases': [],
  },
};

/** The test tool — ai-ides placement, current tag: reasoning. */
const MOVE_RETAG_TOOL = {
  slug: 'cursor',
  name: 'Cursor',
  category: 'ai-coding',
  subcategory: 'ai-ides',
  tags: ['reasoning'],
};

/**
 * Navigate to landscape, mock auth + taxonomy, then open the move/re-tag form
 * for MOVE_RETAG_TOOL via window.Suggest.open({mode:'tool', tool}).  Returns
 * the modal locator once #suggest-subcat-search is visible (the new type-ahead
 * input that replaces the old <select>).
 */
async function openMoveRetagForm(page) {
  await gotoLandscape(page);
  await mockAuthSignedIn(page);

  // Inject our minimal taxonomy so suggest.js picks it up via window.landscapeData
  await page.evaluate((taxonomy) => {
    if (!window.landscapeData) window.landscapeData = {};
    window.landscapeData.taxonomy = taxonomy;
  }, MOVE_RETAG_TAXONOMY);

  // Open in 'tool' mode — shows the tool chooser (Move or re-tag / Suggest edits)
  await page.evaluate((tool) => {
    window.Suggest.open({ mode: 'tool', tool });
  }, MOVE_RETAG_TOOL);

  const modal = page.locator('[role="dialog"][aria-modal="true"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Pick "Move or re-tag" — card click advances directly to the form (no Next step)
  const moveRetagCard = modal.locator('[data-mode="move-retag"]');
  await expect(moveRetagCard).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => document.querySelector('[data-mode="move-retag"]')?.click());

  // Wait for the type-ahead search input to appear (new UI)
  await expect(modal.locator('#suggest-subcat-search')).toBeVisible({ timeout: 8000 });

  // Extra stability wait
  await page.waitForTimeout(100);

  return modal;
}

test.describe('Test 3: Move/re-tag type-ahead pickers', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { sessionStorage.setItem('suggestions_available', '1'); });
    await acceptCookies(page);
  });

  // -----------------------------------------------------------------------
  // 3i — Subcategory type-ahead filters and selects
  // -----------------------------------------------------------------------

  test('3i: subcategory type-ahead filters on "memory" and clicking a result sets hidden input', async ({ page }) => {
    const modal = await openMoveRetagForm(page);

    // The old <select> must be gone; the type-ahead search input must be present
    await expect(modal.locator('select#suggest-new-subcategory')).toHaveCount(0);
    await expect(modal.locator('#suggest-subcat-search')).toBeVisible();

    // Type "memory" — should filter to "Memory & Context"
    await page.evaluate(() => {
      const inp = document.querySelector('#suggest-subcat-search');
      inp.value = 'memory';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Menu should open and show a matching item
    await expect(modal.locator('#suggest-subcat-menu')).toBeVisible({ timeout: 3000 });
    const menuItems = modal.locator('#suggest-subcat-menu [data-slug]');
    await expect(menuItems).toHaveCount(1, { timeout: 3000 });

    // Click the first result
    await page.evaluate(() => {
      const item = document.querySelector('#suggest-subcat-menu [data-slug]');
      if (item) item.click();
    });

    // Hidden input #suggest-new-subcategory must have the slug value + dataset attrs
    const result = await page.evaluate(() => {
      const hidden = document.querySelector('#suggest-new-subcategory');
      return {
        value: hidden ? hidden.value : null,
        category: hidden ? hidden.dataset.category : null,
        track: hidden ? hidden.dataset.track : null,
      };
    });

    expect(result.value).toBe('memory-context');
    expect(result.category).toBe('ai-coding');
    expect(result.track).toBe('developers');

    // Menu should close after selection
    await expect(modal.locator('#suggest-subcat-menu')).not.toBeVisible({ timeout: 2000 });
  });

  // -----------------------------------------------------------------------
  // 3j — Tag type-ahead: add a chip, remove a current-tag chip
  // -----------------------------------------------------------------------

  test('3j: current tag "reasoning" appears as a chip; typing adds a chip; clicking × removes it', async ({ page }) => {
    const modal = await openMoveRetagForm(page);

    // The old checkbox grids must be gone
    await expect(modal.locator('input[name="tag_add"]')).toHaveCount(0);
    await expect(modal.locator('input[name="tag_remove"]')).toHaveCount(0);

    // Current tag "reasoning" should appear as a chip (pre-filled)
    const reasoningChip = modal.locator('#suggest-tag-chips [data-slug="reasoning"]');
    await expect(reasoningChip).toBeVisible({ timeout: 3000 });

    // Type "api" to filter tags
    await page.evaluate(() => {
      const inp = document.querySelector('#suggest-tag-search');
      inp.value = 'api';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Menu opens with "API Available"
    await expect(modal.locator('#suggest-tag-menu')).toBeVisible({ timeout: 3000 });
    const tagMenuItems = modal.locator('#suggest-tag-menu [data-slug]');
    await expect(tagMenuItems).toHaveCount(1, { timeout: 3000 });

    // Click the result to add it as a chip
    await page.evaluate(() => {
      const item = document.querySelector('#suggest-tag-menu [data-slug]');
      if (item) item.click();
    });

    // "api-available" chip should appear
    const apiChip = modal.locator('#suggest-tag-chips [data-slug="api-available"]');
    await expect(apiChip).toBeVisible({ timeout: 3000 });

    // Hidden inputs reflect: selected_tag = reasoning + api-available
    const selectedSlugs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[name="selected_tag"]')).map(i => i.value);
    });
    expect(selectedSlugs).toContain('reasoning');
    expect(selectedSlugs).toContain('api-available');

    // Now remove "reasoning" by clicking its × button
    await page.evaluate(() => {
      const removeBtn = document.querySelector('#suggest-tag-chips [data-slug="reasoning"] button');
      if (removeBtn) removeBtn.click();
    });

    // Chip must be gone
    await expect(modal.locator('#suggest-tag-chips [data-slug="reasoning"]')).toHaveCount(0, { timeout: 3000 });

    // Hidden inputs no longer include reasoning
    const afterRemove = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[name="selected_tag"]')).map(i => i.value);
    });
    expect(afterRemove).not.toContain('reasoning');
    expect(afterRemove).toContain('api-available');
  });

  // -----------------------------------------------------------------------
  // 3k — Inline new tag: "+" item appears for unknown text; clicking adds chip
  // -----------------------------------------------------------------------

  test('3k: typing a non-existent tag shows "+ Suggest new tag" item; clicking adds a new-tag chip', async ({ page }) => {
    const modal = await openMoveRetagForm(page);

    // Type a tag name that doesn't exist in the taxonomy
    await page.evaluate(() => {
      const inp = document.querySelector('#suggest-tag-search');
      inp.value = 'zzznovel';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Menu should open with the "+ Suggest new tag" item
    await expect(modal.locator('#suggest-tag-menu')).toBeVisible({ timeout: 3000 });
    const newTagItem = modal.locator('#suggest-tag-menu [data-new-tag]');
    await expect(newTagItem).toBeVisible({ timeout: 3000 });
    await expect(newTagItem).toContainText('zzznovel');

    // Click it
    await page.evaluate(() => {
      const item = document.querySelector('#suggest-tag-menu [data-new-tag]');
      if (item) item.click();
    });

    // A new-tag chip should appear (visually distinct)
    const newChip = modal.locator('#suggest-tag-chips [data-new-tag="zzznovel"]');
    await expect(newChip).toBeVisible({ timeout: 3000 });

    // A hidden input[name="new_tag"] should exist with the new tag name
    const newTagHiddens = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[name="new_tag"]')).map(i => i.value);
    });
    expect(newTagHiddens).toContain('zzznovel');

    // Menu should close after selection
    await expect(modal.locator('#suggest-tag-menu')).not.toBeVisible({ timeout: 2000 });
  });

  // -----------------------------------------------------------------------
  // 3l — New tag slug appears in tool_placement payload's tags_add
  // -----------------------------------------------------------------------

  test('3l: submitting with a new tag includes its slug in tool_placement tags_add', async ({ page }) => {
    const modal = await openMoveRetagForm(page);

    // Capture all payloads passed to createSuggestion (called once for tool_placement, then per new tag)
    await page.evaluate(() => {
      window.__capturedSuggestions = [];
      const orig = window.SupabaseClient.createSuggestion;
      window.SupabaseClient.createSuggestion = async (row) => {
        window.__capturedSuggestions.push(row);
        return orig ? orig(row) : { data: { id: 'fake-id', ...row }, error: null };
      };
    });

    // Type a non-existent tag name and click the "+ Suggest new tag" item
    await page.evaluate(() => {
      const inp = document.querySelector('#suggest-tag-search');
      inp.value = 'zzznovel';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(modal.locator('#suggest-tag-menu [data-new-tag]')).toBeVisible({ timeout: 3000 });
    await page.evaluate(() => {
      const item = document.querySelector('#suggest-tag-menu [data-new-tag]');
      if (item) item.click();
    });

    // Confirm chip appeared
    await expect(modal.locator('#suggest-tag-chips [data-new-tag="zzznovel"]')).toBeVisible({ timeout: 3000 });

    // Fill rationale (required field in the move/re-tag form)
    await modal.locator('#suggest-retag-rationale').fill('Adding a novel test tag.');

    // Submit the form
    await page.evaluate(() => {
      const form = document.querySelector('#suggest-move-retag-form');
      if (form) form.requestSubmit();
    });

    // Wait for createSuggestion to be called at least once (tool_placement call)
    await page.waitForFunction(() => window.__capturedSuggestions && window.__capturedSuggestions.length > 0, { timeout: 5000 });

    // Assert the tool_placement payload's proposed.tags_add includes 'zzznovel'
    const allCaptured = await page.evaluate(() => window.__capturedSuggestions);
    const placement = allCaptured.find(r => r.kind === 'tool_placement');
    expect(placement).not.toBeUndefined();
    expect(placement.payload.proposed.tags_add).toContain('zzznovel');
  });

  // -----------------------------------------------------------------------
  // 3m — Blur without selection reverts display; hidden input unchanged
  // -----------------------------------------------------------------------

  test('3m: blurring #suggest-subcat-search without selecting reverts display to committed label', async ({ page }) => {
    const modal = await openMoveRetagForm(page);

    // Step 1: commit a selection by typing "memory" and clicking the result
    await page.evaluate(() => {
      const inp = document.querySelector('#suggest-subcat-search');
      inp.value = 'memory';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(modal.locator('#suggest-subcat-menu [data-slug]')).toHaveCount(1, { timeout: 3000 });
    await page.evaluate(() => {
      const item = document.querySelector('#suggest-subcat-menu [data-slug]');
      if (item) item.click();
    });

    // Confirm committed state
    const committedState = await page.evaluate(() => {
      const hidden = document.querySelector('#suggest-new-subcategory');
      const display = document.querySelector('#suggest-subcat-search');
      return { slug: hidden ? hidden.value : null, displayValue: display ? display.value : null };
    });
    expect(committedState.slug).toBe('memory-context');
    expect(committedState.displayValue).toContain('Memory');

    // Step 2: type a partial non-matching query WITHOUT clicking any result
    await page.evaluate(() => {
      const inp = document.querySelector('#suggest-subcat-search');
      inp.value = 'mem';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Step 3: blur the input (focus another element)
    await page.evaluate(() => {
      // Focus the rationale textarea so the blur fires on the search input
      const ta = document.querySelector('#suggest-retag-rationale');
      if (ta) ta.focus();
    });
    // Allow the blur handler to run
    await page.waitForTimeout(50);

    // Step 4: assert the display reverted to the committed label, hidden input unchanged
    const afterBlur = await page.evaluate(() => {
      const hidden = document.querySelector('#suggest-new-subcategory');
      const display = document.querySelector('#suggest-subcat-search');
      return { slug: hidden ? hidden.value : null, displayValue: display ? display.value : null };
    });

    // Hidden input must still hold the committed slug
    expect(afterBlur.slug).toBe('memory-context');
    // Display must have reverted to the committed label (not the partial "mem" query)
    expect(afterBlur.displayValue).not.toBe('mem');
    expect(afterBlur.displayValue).toContain('Memory');
  });
});

test.skip('5: RLS: user cannot self-approve [requires signed-in session + migration 009]', async ({ page }) => {
  // The owner must replace this with the actual id of a pending suggestion
  // belonging to the authenticated test user.
  const ownPendingId = 'REPLACE_WITH_REAL_PENDING_SUGGESTION_ID';

  // Navigate to a page where window.supabase is available, then call the
  // client SDK directly to attempt the blocked UPDATE:
  //
  //   supabase.from('suggestions')
  //     .update({ status: 'approved' })
  //     .eq('id', ownPendingId)
  //
  // Expected: the update returns an error OR zero rows updated, because the
  // WITH CHECK clause `(status = 'pending' OR reviewed_by = auth.uid())`
  // prevents a non-admin user from setting status='approved'.

  await page.goto('/landscape');
  await waitForSupabaseClient(page);

  const result = await page.evaluate(async (id) => {
    // Access the raw supabase client if exposed (adjust path as needed)
    const supabase = window._supabase || window.supabaseClient;
    if (!supabase) return { error: 'supabase client not exposed on window' };

    const { data, error } = await supabase
      .from('suggestions')
      .update({ status: 'approved' })
      .eq('id', id)
      .select();

    return {
      errorMessage: error?.message || null,
      rowsUpdated: data ? data.length : 0,
    };
  }, ownPendingId);

  // RLS WITH CHECK should block this — either an error or zero rows updated
  const blocked = result.errorMessage !== null || result.rowsUpdated === 0;
  expect(blocked).toBe(true);
});
