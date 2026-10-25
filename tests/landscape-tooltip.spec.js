import { test, expect } from '@playwright/test';

// Regression spec for: hovering a landscape tool card, then clicking it to
// navigate (SPA) to the tool page, leaves the landscape tooltip stuck visible
// on screen. Root cause: js/landscape.js's card click calls
// window.SpaRouter.navigate() before mouseout can fire, and js/router.js's
// navigate() only swaps #page-content innerHTML — #tooltip lives outside
// #page-content (a sibling of the footer in landscape.html), so its
// '.visible' class and content survive the page swap untouched.
// Fix: js/router.js's teardown(fromPathname) calls window.landscapeTeardown()
// (defined in js/landscape.js) when leaving '/landscape' or '/landscape.html',
// which removes the 'visible' class and clears the tooltip's innerHTML.
test.describe('Landscape tooltip: SPA nav teardown', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('tooltip is hidden after clicking a hovered card to navigate to its tool page', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    // Expanded view avoids collapsed categories intercepting pointer events.
    await page.locator('.view-btn[data-view="all"]').click();

    const card = page.locator('.tool-card[data-slug="brave-search"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();

    // Precondition: hovering shows the tooltip with this card's content.
    const tooltip = page.locator('#tooltip');
    await expect(tooltip).toHaveClass(/visible/);
    await expect(tooltip).toContainText('Brave Search');
    await expect(tooltip).toContainText('Click to visit');

    await card.click();
    await page.waitForURL(/\/tools\//);

    // The tooltip node itself lives outside #page-content and survives the
    // SPA content swap; what must not survive is its 'visible' state/content.
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);
  });

  test('tooltip stays hidden through back/forward SPA navigation (popstate)', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await page.locator('.view-btn[data-view="all"]').click();

    const card = page.locator('.tool-card[data-slug="brave-search"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(page.locator('#tooltip')).toHaveClass(/visible/);

    await card.click();
    await page.waitForURL(/\/tools\//);
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);

    // Back to landscape (SPA popstate): teardown must not have left the
    // tooltip visible, and the landscape page itself must still render.
    await page.goBack();
    await page.waitForURL(/\/landscape/);
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });

    // Forward again to the tool page (SPA popstate).
    await page.goForward();
    await page.waitForURL(/\/tools\//);
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);
  });

  test('tooltip is hidden after SPA-navigating away from landscape via SpaRouter.navigate directly', async ({ page }) => {
    // A second, cheap path to the same teardown: trigger navigate()
    // programmatically (as any non-card SPA link on the landscape page would)
    // after a hover, instead of a card click. Proves teardown() fires on any
    // navigate() away from /landscape, not just the tool-card click handler.
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await page.locator('.view-btn[data-view="all"]').click();

    const card = page.locator('.tool-card[data-slug="brave-search"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(page.locator('#tooltip')).toHaveClass(/visible/);

    await page.evaluate(() => window.SpaRouter.navigate('/tools/brave-search/'));
    await page.waitForURL(/\/tools\//);
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);
  });

  test('tooltip content is cleared (not just hidden) after navigating away', async ({ page }) => {
    // Guards against a partial fix that only toggles the class but leaves
    // stale innerHTML behind (e.g. a future hover re-show bug elsewhere could
    // flash the previous tool's text before re-populating it).
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await page.locator('.view-btn[data-view="all"]').click();

    const card = page.locator('.tool-card[data-slug="brave-search"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(page.locator('#tooltip')).toContainText('Brave Search');

    await card.click();
    await page.waitForURL(/\/tools\//);

    const tooltipHtml = await page.locator('#tooltip').innerHTML();
    expect(tooltipHtml.trim()).toBe('');
  });

  test('tooltip stays hidden across a hard-loaded landscape, then back/forward (bfcache + popstate)', async ({ page }) => {
    // Distinct from the popstate test above: this starts with a real,
    // full-document load of /landscape (not an SPA arrival from another
    // page), so a goBack() afterwards may be served from the browser's
    // bfcache (a frozen snapshot of the DOM, including any '.visible'
    // tooltip at the moment of navigation) instead of going through
    // router.js's popstate handler at all. Either path must end with the
    // tooltip hidden.
    await page.goto('/landscape', { waitUntil: 'load' });
    await page.locator('.view-btn[data-view="all"]').click();

    const card = page.locator('.tool-card[data-slug="brave-search"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(page.locator('#tooltip')).toHaveClass(/visible/);

    await card.click();
    await page.waitForURL(/\/tools\//);
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);

    await page.goBack();
    await page.waitForURL(/\/landscape/);
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });

    await page.goForward();
    await page.waitForURL(/\/tools\//);
    await expect(page.locator('#tooltip.visible')).toHaveCount(0);
  });

  test.describe('mobile / touch', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });

    test('tooltip is not visible on the tool page after tapping a card on a touch viewport', async ({ page }) => {
      await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
      await page.locator('.view-btn[data-view="all"]').click();

      const card = page.locator('.tool-card[data-slug="brave-search"]');
      await card.scrollIntoViewIfNeeded();
      await card.tap();
      await page.waitForURL(/\/tools\//);

      await expect(page.locator('#tooltip.visible')).toHaveCount(0);
      const tooltipHtml = await page.locator('#tooltip').innerHTML();
      expect(tooltipHtml.trim()).toBe('');
    });
  });

  test('tooltip is hidden after leaving the landscape via a nav link while the tooltip is showing', async ({ page }) => {
    // The card-click path isn't the only way to leave /landscape while a
    // tooltip is visible: hovering a card and then using the top nav (a
    // [data-spa-link] that isn't a card) must teardown the tooltip too.
    // This exercises router.js's teardown(fromPathname) independently of
    // landscape.js's own click handler on .tool-card.
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await page.locator('.view-btn[data-view="all"]').click();

    const card = page.locator('.tool-card[data-slug="brave-search"]');
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    await expect(page.locator('#tooltip')).toHaveClass(/visible/);
    await expect(page.locator('#tooltip')).toContainText('Brave Search');

    await page.locator('a.nav-link[href="/"]').click();
    await page.waitForURL('/');

    await expect(page.locator('#tooltip.visible')).toHaveCount(0);
    const tooltipHtml = await page.locator('#tooltip').innerHTML();
    expect(tooltipHtml.trim()).toBe('');
  });
});
