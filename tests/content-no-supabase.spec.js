import { test, expect } from '@playwright/test';

// Core decoupling guarantee: content pages render WITHOUT any request to the
// supabase CDN (jsdelivr) or the database host. A logged-out visitor on a
// static page must never trigger a Supabase load.
test.describe('Content pages are Supabase-independent', () => {
  test.use({ proxy: undefined });

  for (const path of ['/', '/landscape.html']) {
    test(`${path} renders tools with zero supabase/jsdelivr requests`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
      const hits = [];
      page.on('request', req => {
        const u = req.url();
        if (u.includes('cdn.jsdelivr.net') || u.includes('supabase.co')) hits.push(u);
      });

      await page.goto(path, { waitUntil: 'domcontentloaded' });
      // Give any (incorrect) lazy load a chance to fire.
      await page.waitForTimeout(1500);

      expect(await page.evaluate(() => typeof window.landscapeData)).toBe('object');
      expect(hits, `unexpected supabase/CDN requests:\n${hits.join('\n')}`).toEqual([]);
      // window.supabase must NOT have been loaded.
      expect(await page.evaluate(() => typeof window.supabase)).toBe('undefined');
    });
  }

  test('landscape shows a non-zero tool count', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await expect.poll(async () => page.evaluate(() => {
      const m = document.body.innerText.match(/(\d+)\s*tools shown/i);
      return m ? parseInt(m[1], 10) : 0;
    }), { timeout: 5000 }).toBeGreaterThan(0);
  });
});
