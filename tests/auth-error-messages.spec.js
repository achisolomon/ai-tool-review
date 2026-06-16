import { test, expect } from '@playwright/test';

// Regression: when sign-in fails (CDN/DB down, or signInWithProvider returns
// an error), the user must see a friendly message — never the raw internal
// error ("Supabase not initialized") — and the message must actually render
// somewhere visible. Before this fix:
//   1. The toolbar leaked "Sign in failed: Supabase not initialized" via alert().
//   2. The suggest-modal sign-in gate called showError(modal, msg), which only
//      looked for #suggest-form-error (a forms-only element) — the auth gate
//      card had no error slot at all, so the failure was silently swallowed
//      ("nothing happens when clicking GitHub/Google").

const FRIENDLY = 'Sign in is not available right now. Please try again in a few minutes.';

test.describe('Sign-in failures show a friendly message, never the raw internal error', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
  });

  test('toolbar: signInWithProvider error shows the friendly alert, not "Supabase not initialized"', async ({ page }) => {
    await page.goto('/');
    // Force the library to "load" (health check passes) but make the actual
    // sign-in call fail with the same internal message production hit.
    await page.evaluate(() => {
      window.SupabaseClient.ensureSupabase = async () => ({});
      window.SupabaseClient.isDatabaseHealthy = async () => true;
      window.SupabaseClient.signInWithProvider = async () => ({ error: { message: 'Supabase not initialized' } });
    });

    // page.click() blocks until any dialog it triggers is dismissed, so fire it
    // without awaiting yet, await the dialog, dismiss it, THEN await the click.
    const dialogPromise = page.waitForEvent('dialog', { timeout: 5000 });
    const clickPromise = page.locator('#auth-signin-btn').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe(FRIENDLY);
    expect(dialog.message()).not.toContain('Supabase not initialized');
    await dialog.dismiss();
    await clickPromise;
  });

  test('suggest modal: failed sign-in shows a visible friendly error in the auth gate (not silently nothing)', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.SupabaseClient.ensureSupabase = async () => ({});
      window.SupabaseClient.isAuthenticated = async () => false;
      window.SupabaseClient.signInWithProvider = async () => ({ error: { message: 'Supabase not initialized' } });
    });

    await page.locator('#suggest-open').click();
    const githubBtn = page.locator('.auth-provider-btn[data-provider="github"]');
    await expect(githubBtn).toBeVisible({ timeout: 5000 });
    await githubBtn.click();

    // The error must render visibly inside the modal's auth-gate error slot.
    const errorEl = page.locator('.suggest-auth-gate #auth-card-error');
    await expect(errorEl).toBeVisible({ timeout: 5000 });
    await expect(errorEl).toHaveText(FRIENDLY);
    await expect(errorEl).not.toContainText('Supabase not initialized');

    // The button must re-enable so the user can retry.
    await expect(githubBtn).toBeEnabled();
  });

  test('suggest modal: ensureSupabase() rejection (CDN down) falls back to the auth gate with no crash', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.SupabaseClient.ensureSupabase = async () => { throw new Error('supabase-cdn-timeout'); };
    });

    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    await page.locator('#suggest-open').click();
    // Falls back to the same auth-gate card — sign-in buttons are present.
    await expect(page.locator('.auth-provider-btn[data-provider="github"]')).toBeVisible({ timeout: 5000 });
    expect(pageErrors).toEqual([]);
  });
});
