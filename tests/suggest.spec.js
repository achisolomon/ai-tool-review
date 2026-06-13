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
  await newToolCard.click();

  // Clicking Next replaces the modal body (detaching the button). Fire a genuine
  // DOM click (via evaluate, since Playwright's native click errors when the
  // target detaches mid-click) and let it bubble naturally — NO stopPropagation.
  // The backdrop handler must NOT misread the bubbling click from the now-detached
  // button as a backdrop click; this exercises the isConnected guard in suggest.js.
  const nextBtn = modal.locator('#suggest-chooser-next');
  await expect(nextBtn).toBeEnabled();
  await page.evaluate(() => document.querySelector('#suggest-chooser-next')?.click());

  // Regression guard: the modal stays open after Next (did not close).
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
    await acceptCookies(page);
  });

  // -----------------------------------------------------------------------
  // 3a — Slug derivation
  // -----------------------------------------------------------------------

  test('3a: typing a tool name auto-derives the slug; invalid slug shows validity error', async ({ page }) => {
    const modal = await openNewToolForm(page);

    const nameInput = modal.locator('#suggest-name');
    const slugInput = modal.locator('#suggest-slug');

    // Type the name — the input event should auto-fill the slug
    await nameInput.fill('Letta AI');
    await nameInput.dispatchEvent('input');

    // Wait for slug to be derived (SuggestLogic.slugify is synchronous inside the handler)
    await expect(slugInput).toHaveValue('letta-ai', { timeout: 2000 });

    // Now type an invalid slug directly and trigger input event
    await slugInput.fill('INVALID SLUG!');
    await slugInput.dispatchEvent('input');

    // setCustomValidity should mark it invalid
    const validity = await slugInput.evaluate((el) => ({
      valid: el.validity.valid,
      message: el.validationMessage,
    }));
    expect(validity.valid).toBe(false);
    expect(validity.message.length).toBeGreaterThan(0);
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

  test('3c: credit consent checkbox, name field, and permanence disclosure are present; unchecking hides name field', async ({ page }) => {
    await openNewToolForm(page);

    // The form is long; scroll to the credit section at the bottom.
    await page.evaluate(() => {
      const el = document.querySelector('#suggest-public-credit');
      if (el) el.scrollIntoView({ block: 'center' });
    });

    // Use page.evaluate to verify presence and the toggle behaviour in a single
    // roundtrip — avoids the cross-tick locator staleness that causes flakiness
    // when Playwright re-queries the DOM after each async await.
    const result = await page.evaluate(() => {
      const checkbox = document.querySelector('#suggest-public-credit');
      const nameWrapper = document.querySelector('#suggest-credit-name-wrapper');
      const nameField = document.querySelector('#suggest-credit-name');
      const disclosure = document.querySelector('.suggest-credit-disclosure');

      if (!checkbox || !nameWrapper || !nameField || !disclosure) {
        return {
          ok: false,
          error: 'Missing elements: ' + [
            !checkbox && '#suggest-public-credit',
            !nameWrapper && '#suggest-credit-name-wrapper',
            !nameField && '#suggest-credit-name',
            !disclosure && '.suggest-credit-disclosure',
          ].filter(Boolean).join(', '),
        };
      }

      const initiallyChecked = checkbox.checked;
      const disclosureText = disclosure.textContent;
      const initiallyHidden = nameWrapper.hidden;

      // Simulate uncheck
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      const hiddenAfterUncheck = nameWrapper.hidden;

      // Simulate re-check
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      const hiddenAfterRecheck = nameWrapper.hidden;

      return {
        ok: true,
        initiallyChecked,
        disclosureHasPermanently: disclosureText.includes('permanently'),
        initiallyHidden,         // should be false (visible)
        hiddenAfterUncheck,      // should be true (hidden)
        hiddenAfterRecheck,      // should be false (visible again)
      };
    });

    expect(result.ok).toBe(true);
    expect(result.initiallyChecked).toBe(true);
    expect(result.disclosureHasPermanently).toBe(true);
    expect(result.initiallyHidden).toBe(false);    // wrapper visible initially
    expect(result.hiddenAfterUncheck).toBe(true);  // hidden after uncheck
    expect(result.hiddenAfterRecheck).toBe(false); // visible after re-check
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

    // Slug should have been auto-derived; ensure it's valid
    const slugInput = modal.locator('#suggest-slug');
    await slugInput.fill('test-tool-xyz');
    await slugInput.dispatchEvent('input');

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
