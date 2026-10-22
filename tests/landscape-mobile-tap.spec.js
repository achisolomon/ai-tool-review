import { test, expect, devices } from '@playwright/test';

// Regression spec for: on mobile, tapping a tool icon on the landscape does
// nothing (the card shows its sticky :hover border but never opens the tool
// page). Root cause: #tooltip lives outside #page-content in landscape.html,
// so when the landscape is reached by SPA navigation (home -> nav link) the
// router only swaps #page-content in and no #tooltip exists. A tap fires a
// synthetic mouseover -> showTooltip() threw on the null tooltip, then the
// click handler's hideTooltip() threw before SpaRouter.navigate() ran.
// Fix: landscapeInit() creates #tooltip when the page doesn't have one.
//
// Also covers going back to a directly loaded /landscape (clean URL): the
// router had no '/landscape' route, so landscapeInit() never re-ran and the
// landscape came back empty with nothing to tap.
const { defaultBrowserType, ...pixel } = devices['Pixel 7'];
test.use(pixel);

test.describe('Landscape: mobile tap opens the tool page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  // Expand the first category + subcategory (mobile starts collapsed) and
  // tap the centre of the second card's icon, like a finger would.
  async function tapToolIcon(page) {
    const category = page.locator('#landscape .category').first();
    await expect(category).toBeVisible();
    if (await category.evaluate(el => el.classList.contains('collapsed'))) {
      await category.locator('.category-header').tap();
    }
    const sub = category.locator('.subcategory').first();
    if (await sub.evaluate(el => el.classList.contains('collapsed'))) {
      await sub.locator('.subcategory-header').tap();
    }
    const card = sub.locator('.tool-card').nth(1);
    await card.scrollIntoViewIfNeeded();
    const icon = card.locator('.tool-icon');
    await expect(icon).toBeVisible();
    const slug = await card.getAttribute('data-slug');
    const box = await icon.boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    return slug;
  }

  test('tap on a tool icon opens its tool page (direct load)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });

    const slug = await tapToolIcon(page);
    await page.waitForURL(new RegExp(`/tools/${slug}/`));
    expect(errors).toEqual([]);
  });

  test('tap on a tool icon opens its tool page after SPA navigation from home', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.SpaRouter.navigate('/landscape.html'));
    await page.waitForURL(/\/landscape/);
    await expect(page.locator('#landscape .tool-card').first()).toBeAttached();

    const slug = await tapToolIcon(page);
    await page.waitForURL(new RegExp(`/tools/${slug}/`));
    expect(errors).toEqual([]);
  });

  test('landscape re-renders and stays tappable after Back from a tool page', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    const first = await tapToolIcon(page);
    await page.waitForURL(new RegExp(`/tools/${first}/`));

    await page.goBack();
    await page.waitForURL(/\/landscape/);
    await expect(page.locator('#landscape .tool-card').first()).toBeAttached();

    const second = await tapToolIcon(page);
    await page.waitForURL(new RegExp(`/tools/${second}/`));
  });
});
