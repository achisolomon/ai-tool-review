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
