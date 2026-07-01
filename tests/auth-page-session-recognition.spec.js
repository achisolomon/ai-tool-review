import { test, expect } from '@playwright/test';

// Regression: after the lazy-Supabase decoupling removed the static
// supabase-js <script> tag from every page, getCurrentUser()/getSession()
// called getSupabase() directly — which returns null until the library is
// loaded. Full auth-gated pages (my-reviews.html, my-suggestions.html,
// admin.html) call getCurrentUser() on load WITHOUT ever calling
// ensureSupabase() themselves, so a genuinely signed-in user was always
// reported as signed out ("Sign in required" even when already authenticated,
// and the same screen reappears after a successful OAuth callback).
//
// Fix: getCurrentUser()/getSession()/signInWithProvider()/signOut()/
// onAuthStateChange() now call ensureSupabase() internally first.

test.describe('getCurrentUser() lazy-loads the library itself (does not require a caller to)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
  });

  test('window.supabase is not preloaded, yet getCurrentUser() still loads the library and queries auth', async ({ page }) => {
    // Block the Supabase CDN until we are ready, so the page's own async init
    // cannot resolve ensureSupabase() before our evaluate() captures `before`.
    // Without this guard, my-reviews.html's unconditional checkAuth() call races
    // against our snapshot and non-deterministically sets window.supabase first.
    let unblock;
    const cdnHeld = new Promise(resolve => { unblock = resolve; });
    await page.route('**/supabase-js@2**', async route => {
      await cdnHeld;
      await route.continue();
    });

    await page.goto('/my-reviews.html', { waitUntil: 'domcontentloaded' });

    // Confirm the static tag is really gone — the bug only reproduces when
    // the library is NOT already present at call time.
    expect(await page.evaluate(() => typeof window.supabase)).toBe('undefined');

    // Unblock the CDN so our explicit getCurrentUser() call can resolve.
    unblock();

    const result = await page.evaluate(async () => {
      // Before the fix, this returned null immediately (getSupabase() === null)
      // without ever attempting to load the library or query auth.getUser().
      const before = typeof window.supabase;
      const user = await window.SupabaseClient.getCurrentUser();
      const after = typeof window.supabase;
      return { before, after, user };
    });

    // The library must have been loaded as a SIDE EFFECT of calling
    // getCurrentUser() — proving the lazy-load now happens at the right layer.
    expect(result.before).toBe('undefined');
    expect(result.after).toBe('object');
    // No real session exists in this test, so user is null — but it must have
    // gone through a real auth.getUser() call, not short-circuited on a missing client.
    expect(result.user).toBeNull();
  });

  test('getSession() also lazy-loads the library (used by OAuth-callback pages to pick up the new session)', async ({ page }) => {
    await page.goto('/my-suggestions.html', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => typeof window.supabase)).toBe('undefined');

    const after = await page.evaluate(async () => {
      await window.SupabaseClient.getSession();
      return typeof window.supabase;
    });
    expect(after).toBe('object');
  });

  test('my-reviews.html: signed-out visitor sees the sign-in gate (no false "stuck loading")', async ({ page }) => {
    await page.goto('/my-reviews.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#login-required')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#loading-state')).toBeHidden();
  });

  test('admin.html: checkIsAdmin() lazy-loads the library too (was the same null-client gap)', async ({ page }) => {
    await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => typeof window.supabase)).toBe('undefined');
    const result = await page.evaluate(async () => {
      const r = await window.AdminAPI.checkIsAdmin();
      return { hasSupa: typeof window.supabase, result: r };
    });
    expect(result.hasSupa).toBe('object');
  });
});
