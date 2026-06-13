// Auth Parity Contract Test
// ==========================
// Every page that has a #login-required sign-in slot MUST use the shared
// AuthSignIn module and render BOTH provider buttons (GitHub + Google).
//
// This is a data-driven contract: add a page with #login-required and it is
// automatically covered here. It exists because admin.html once diverged from
// my-reviews.html (admin kept hardcoded single-provider markup while my-reviews
// migrated to the shared module), which shipped a broken admin sign-in.

import { test, expect } from '@playwright/test';

// Pages that present a sign-in card. Keep this list in sync with any new
// authenticated page. The static check (scripts/validate-auth-pages.js) fails
// the build if a page has #login-required but forgets js/auth-signin.js.
const AUTH_PAGES = [
  { path: '/admin.html', name: 'Admin' },
  { path: '/my-reviews.html', name: 'My Reviews' },
];

test.describe('Auth page parity (shared AuthSignIn module)', () => {
  for (const { path, name } of AUTH_PAGES) {
    test(`${name} (${path}) loads the shared AuthSignIn module`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
      await page.goto(path);

      const hasModule = await page.evaluate(() =>
        typeof window.AuthSignIn !== 'undefined' &&
        typeof window.AuthSignIn.renderCard === 'function' &&
        typeof window.AuthSignIn.initHandlers === 'function'
      );
      expect(hasModule, `${name} must load js/auth-signin.js`).toBe(true);
    });

    test(`${name} (${path}) renders both provider buttons via the module`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
      await page.goto(path);

      await page.waitForSelector('#login-required:not(.hidden)', { timeout: 8000 });

      const container = page.locator('.auth-signin-buttons');
      await expect(container, `${name} must render the shared .auth-signin-buttons container`).toBeVisible();

      const github = container.locator('.auth-provider-btn[data-provider="github"]');
      const google = container.locator('.auth-provider-btn[data-provider="google"]');
      await expect(github).toBeVisible();
      await expect(github).toContainText('Continue with GitHub');
      await expect(google).toBeVisible();
      await expect(google).toContainText('Continue with Google');
      await expect(container.locator('.auth-provider-btn')).toHaveCount(2);
    });
  }

  test('all auth pages render byte-identical sign-in button markup', async ({ page }) => {
    const markups = [];
    for (const { path } of AUTH_PAGES) {
      await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
      await page.goto(path);
      await page.waitForSelector('#login-required:not(.hidden)', { timeout: 8000 });
      markups.push(await page.locator('.auth-signin-buttons').innerHTML());
    }
    // Every page must share the exact same button markup (same module output).
    for (let i = 1; i < markups.length; i++) {
      expect(markups[i]).toBe(markups[0]);
    }
  });
});
