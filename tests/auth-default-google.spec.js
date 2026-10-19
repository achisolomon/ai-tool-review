import { test, expect } from '@playwright/test';

// Regression: the header "Sign in" button was hardcoded to GitHub OAuth, so
// users landed on GitHub's login page instead of Google's consent screen
// (which shows our verified "AI Tool Review" brand). Google is the default
// provider everywhere, and is listed first wherever both are offered.

test.describe('Google is the default sign-in provider', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
  });

  test('header Sign in button signs in with Google, not GitHub', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.__signInProviders = [];
      window.SupabaseClient.ensureSupabase = async () => ({});
      window.SupabaseClient.isDatabaseHealthy = async () => true;
      window.SupabaseClient.signInWithProvider = async (provider) => {
        window.__signInProviders.push(provider);
        return { data: {}, error: null };
      };
    });

    await page.locator('#auth-signin-btn').click();

    await expect.poll(() => page.evaluate(() => window.__signInProviders))
      .toEqual(['google']);
  });

  test('sign-in card lists Google before GitHub', async ({ page }) => {
    await page.goto('/my-reviews.html');
    await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

    const providers = page.locator('.auth-signin-buttons .auth-provider-btn');
    await expect(providers.first()).toHaveAttribute('data-provider', 'google');
    await expect(providers.nth(1)).toHaveAttribute('data-provider', 'github');
  });

  test('review auth modal lists Google before GitHub', async ({ page }) => {
    await page.goto('/');
    const ids = await page.evaluate(() => {
      const wrap = document.createElement('div');
      wrap.innerHTML = window.ReviewComponents.renderAuthModal();
      return [...wrap.querySelectorAll('.auth-providers .btn-oauth')].map(b => b.id);
    });
    expect(ids).toEqual(['auth-google', 'auth-github']);
  });
});
