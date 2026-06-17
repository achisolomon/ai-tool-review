import { test, expect } from '@playwright/test';

// Tests for server.js clean-URL behavior.
//
// Root cause: the browser cached a Jekyll 301 redirect (/admin.html → /admin/)
// from a previous Jekyll dev session. Our custom server didn't issue that redirect,
// so the stale cache caused /admin to 404. The fix: server.js now redirects any
// *.html request (except /index.html) to its clean-URL equivalent, mirroring
// Jekyll's permalink behavior and healing stale browser caches.

test.describe('Server: clean-URL redirects', () => {
  test('/admin loads with 200 (not 404)', async ({ page }) => {
    const response = await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);
  });

  test('/admin.html redirects to /admin', async ({ request }) => {
    const response = await request.get('/admin.html', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('/admin');
  });

  test('/admin.html redirect chain resolves to 200', async ({ page }) => {
    const response = await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);
    expect(page.url()).toMatch(/\/admin$/);
  });

  test('/landscape.html redirects to /landscape', async ({ request }) => {
    const response = await request.get('/landscape.html', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('/landscape');
  });

  test('/my-reviews.html redirects to /my-reviews', async ({ request }) => {
    const response = await request.get('/my-reviews.html', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('/my-reviews');
  });

  test('/my-suggestions.html redirects to /my-suggestions', async ({ request }) => {
    const response = await request.get('/my-suggestions.html', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('/my-suggestions');
  });

  test('/index.html is NOT redirected (serves as-is)', async ({ request }) => {
    const response = await request.get('/index.html', { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test('/my-reviews clean URL loads with 200', async ({ page }) => {
    const response = await page.goto('/my-reviews', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);
  });

  test('/my-suggestions clean URL loads with 200', async ({ page }) => {
    const response = await page.goto('/my-suggestions', { waitUntil: 'domcontentloaded' });
    expect(response.status()).toBe(200);
  });
});
