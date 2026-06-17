import { test, expect } from '@playwright/test';

test.describe('Cookie Consent Banner', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to reset consent state
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('banner appears on first visit when no consent is saved', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('#cookie-consent');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('We use cookies for analytics and personalized ads');
  });

  test('banner has Accept and Reject buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#cookie-accept')).toBeVisible();
    await expect(page.locator('#cookie-accept')).toHaveText('Accept');

    await expect(page.locator('#cookie-reject')).toBeVisible();
    await expect(page.locator('#cookie-reject')).toHaveText('Reject');
  });

  test('clicking Accept hides banner and saves consent', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('#cookie-consent');
    await expect(banner).toBeVisible();

    await page.locator('#cookie-accept').click();

    // Banner should be hidden
    await expect(banner).toBeHidden();

    // localStorage should have 'accepted'
    const consent = await page.evaluate(() => localStorage.getItem('cookie_consent'));
    expect(consent).toBe('accepted');
  });

  test('clicking Reject hides banner and saves rejection', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('#cookie-consent');
    await expect(banner).toBeVisible();

    await page.locator('#cookie-reject').click();

    // Banner should be hidden
    await expect(banner).toBeHidden();

    // localStorage should have 'rejected'
    const consent = await page.evaluate(() => localStorage.getItem('cookie_consent'));
    expect(consent).toBe('rejected');
  });

  test('banner does not appear on subsequent visit after Accept', async ({ page, context }) => {
    await page.goto('/');
    await page.locator('#cookie-accept').click();

    // Open a new page in same context (shares localStorage)
    const newPage = await context.newPage();
    await newPage.goto('/');

    const banner = newPage.locator('#cookie-consent');
    await expect(banner).toBeHidden();
    await newPage.close();
  });

  test('banner does not appear on subsequent visit after Reject', async ({ page, context }) => {
    await page.goto('/');
    await page.locator('#cookie-reject').click();

    // Open a new page in same context (shares localStorage)
    const newPage = await context.newPage();
    await newPage.goto('/');

    const banner = newPage.locator('#cookie-consent');
    await expect(banner).toBeHidden();
    await newPage.close();
  });

  test('privacy policy link is present and correct', async ({ page }) => {
    await page.goto('/');

    const privacyLink = page.locator('#cookie-consent a[href="/privacy.html"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveText('Privacy Policy');
  });
});

test.describe('Google Consent Mode Integration', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('consent defaults to denied before user interaction', async ({ page }) => {
    await page.goto('/');

    // Check that dataLayer has the default consent with denied values
    const hasDefaultConsent = await page.evaluate(() => {
      return window.dataLayer.some(entry =>
        entry[0] === 'consent' &&
        entry[1] === 'default' &&
        entry[2]?.analytics_storage === 'denied'
      );
    });

    expect(hasDefaultConsent).toBe(true);
  });

  test('Accept updates consent to granted', async ({ page }) => {
    await page.goto('/');
    await page.locator('#cookie-accept').click();

    // Check dataLayer for consent update with granted
    const hasGrantedConsent = await page.evaluate(() => {
      return window.dataLayer.some(entry =>
        entry[0] === 'consent' &&
        entry[1] === 'update' &&
        entry[2]?.analytics_storage === 'granted' &&
        entry[2]?.ad_storage === 'granted'
      );
    });

    expect(hasGrantedConsent).toBe(true);
  });

  test('Reject keeps consent denied', async ({ page }) => {
    await page.goto('/');
    await page.locator('#cookie-reject').click();

    // Check dataLayer for consent update with denied
    const hasDeniedConsent = await page.evaluate(() => {
      return window.dataLayer.some(entry =>
        entry[0] === 'consent' &&
        entry[1] === 'update' &&
        entry[2]?.analytics_storage === 'denied' &&
        entry[2]?.ad_storage === 'denied'
      );
    });

    expect(hasDeniedConsent).toBe(true);
  });

  test('previously accepted consent is restored on page load', async ({ page }) => {
    // Set consent before navigating
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });

    await page.goto('/');

    // Check that consent was updated to granted on load
    const hasGrantedConsent = await page.evaluate(() => {
      return window.dataLayer.some(entry =>
        entry[0] === 'consent' &&
        entry[1] === 'update' &&
        entry[2]?.analytics_storage === 'granted'
      );
    });

    expect(hasGrantedConsent).toBe(true);
  });
});
