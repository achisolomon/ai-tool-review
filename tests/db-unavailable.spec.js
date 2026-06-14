import { test, expect } from '@playwright/test';

// Emergency graceful-degradation behaviour: when the database host is
// unreachable, DB-dependent UI must not hang on a spinner or render controls
// (sign-in, Suggest) that lead nowhere. It should hide silently and fast.
//
// The health gate (supabase-client.js → isDatabaseHealthy) probes the Supabase
// REST endpoint with a raw fetch + 4s timeout. We simulate a dead DB by
// aborting every request to *.supabase.co, and a live DB by fulfilling the
// REST probe with a 200.

const SUPABASE_GLOB = '**://*.supabase.co/**';
const A_TOOL_PAGE = '/tools/abridge/';

async function killDatabase(page) {
  await page.route(SUPABASE_GLOB, route => route.abort());
}

async function reviveDatabase(page) {
  // Any HTTP response means the host answered → healthy.
  await page.route(SUPABASE_GLOB, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
}

test.describe('Graceful degradation when the DB is unavailable', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.removeItem('suggestions_available');
      sessionStorage.removeItem('suggestions_available');
    });
  });

  test('homepage: + Suggest hidden and no auth sign-in button / stuck spinner', async ({ page }) => {
    await killDatabase(page);
    await page.goto('/');

    await expect(page.locator('#suggest-open')).toBeHidden();
    // Health probe (4s timeout) resolves, then auth UI clears itself.
    await expect(page.locator('#auth-signin-btn')).toHaveCount(0, { timeout: 8000 });
    await expect(page.locator('.auth-loading')).toHaveCount(0);
  });

  test('tool page: reviews section hidden and "Suggest an edit" stays hidden', async ({ page }) => {
    await killDatabase(page);
    await page.goto(A_TOOL_PAGE);

    await expect(page.locator('#tool-suggest-open')).toBeHidden();
    // Hidden rather than stuck on "Loading reviews…".
    await expect(page.locator('#reviews')).toBeHidden({ timeout: 8000 });
  });

  test('healthy DB: + Suggest button becomes visible', async ({ page }) => {
    await reviveDatabase(page);
    await page.goto('/');
    await expect(page.locator('#suggest-open')).toBeVisible({ timeout: 8000 });
  });

  test('healthy DB: tool page reveals "Suggest an edit" and keeps reviews visible', async ({ page }) => {
    await reviveDatabase(page);
    await page.goto(A_TOOL_PAGE);
    await expect(page.locator('#tool-suggest-open')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#reviews')).toBeVisible();
  });
});

test.describe('Sign-in re-checks backend at click time', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.removeItem('suggestions_available');
      sessionStorage.removeItem('suggestions_available');
    });
  });

  test('toolbar: backend dying AFTER load does not bounce to dead OAuth URL', async ({ page }) => {
    // Phase 1: load with backend healthy so the toolbar renders an enabled sign-in button.
    await page.route('**://*.supabase.co/**', route => route.fulfill({ status: 200, body: '' }));
    await page.goto('/');
    const signinBtn = page.locator('#auth-signin-btn');
    await expect(signinBtn).toBeVisible({ timeout: 8000 });

    // Phase 2: backend dies — abort all Supabase requests from now on.
    await page.unroute('**://*.supabase.co/**');
    await page.route('**://*.supabase.co/**', route => route.abort());

    // Phase 3: click sign-in. Wait for the "temporarily unavailable" alert — this proves
    // the click handler completed its unhealthy branch (not just timed out). The DB probe
    // can take up to DB_TIMEOUT_MS=4000ms, so we give it 8s headroom.
    //
    // IMPORTANT: do NOT await signinBtn.click() before handling the dialog. Playwright's
    // click() blocks until any dialog it triggers is dismissed. If we await click() first,
    // the test is deadlocked: click() waits for the dialog to be dismissed, but we can
    // never dismiss it because click() hasn't returned yet. Instead, fire the click
    // without awaiting, then handle the dialog, then await the click promise.
    const urlBefore = page.url();
    const dialogPromise = page.waitForEvent('dialog', { timeout: 8000 });
    const clickPromise = signinBtn.click(); // fire but don't await yet
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('temporarily unavailable');
    await dialog.dismiss();
    await clickPromise; // click() can now complete (dialog dismissed)

    // Phase 4: must NOT have navigated to the dead OAuth authorize URL.
    // Note: we do NOT assert toHaveCount(0) on #auth-signin-btn because
    // supabase-js fires an onAuthStateChange('SIGNED_OUT') event when the
    // connection is killed, which causes auth-ui.js to re-render the button.
    // The dialog proof above is the definitive check.
    expect(page.url()).not.toContain('supabase.co/auth/v1/authorize');
    expect(page.url()).toBe(urlBefore);
  });
});
