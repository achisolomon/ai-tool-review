import { test, expect } from '@playwright/test';

test.describe('SPA: HeroMap API', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('window.HeroMap.stop and .start are functions', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const api = await page.evaluate(() => ({
      hasStop: typeof window.HeroMap?.stop === 'function',
      hasStart: typeof window.HeroMap?.start === 'function',
    }));
    expect(api.hasStop).toBe(true);
    expect(api.hasStart).toBe(true);
  });
});

test.describe('SPA: Page init APIs', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('window.appInit is a function on the search page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const has = await page.evaluate(() => typeof window.appInit === 'function');
    expect(has).toBe(true);
  });

  test('window.landscapeInit is a function on the landscape page', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    const has = await page.evaluate(() => typeof window.landscapeInit === 'function');
    expect(has).toBe(true);
  });
});

test.describe('SPA: DOM prerequisites', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('nav.html has data-spa-link on Search, Landscape, Guides links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const count = await page.locator('[data-spa-link]').count();
    expect(count).toBe(3);
  });

  test('index.html has #page-content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
  });

  test('landscape.html has #page-content', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
  });

  test('guides.html has #page-content', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
  });
});

test.describe('SPA: Client-side navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('clicking Landscape nav link swaps content without full reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });

    await page.locator('[data-spa-link][href="/landscape.html"]').click();

    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });

    const flag = await page.evaluate(() => window.__spaLoaded);
    expect(flag).toBe(true);

    expect(page.url()).toMatch(/landscape/);
  });

  test('clicking Search nav link from landscape swaps content without full reload', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });

    await page.locator('[data-spa-link][href="/"]').click();

    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });

    const flag = await page.evaluate(() => window.__spaLoaded);
    expect(flag).toBe(true);
    expect(page.url()).toMatch(/localhost:\d+\/$/);
  });

  test('clicking Guides nav link from search swaps content without full reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });

    await page.locator('[data-spa-link][href="/guides/"]').click();

    await expect(page.locator('.learn-index h1').or(page.locator('#page-content h1'))).toBeVisible({ timeout: 5000 });

    const flag = await page.evaluate(() => window.__spaLoaded);
    expect(flag).toBe(true);
    expect(page.url()).toMatch(/guides/);
  });

  test('topbar auth avatar persists across SPA navigation', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('cookie_consent', 'accepted');
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const beforeHTML = await page.locator('#auth-container').innerHTML();

    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });

    const afterHTML = await page.locator('#auth-container').innerHTML();
    expect(afterHTML).toBe(beforeHTML);
  });

  test('browser back button restores previous page content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });

    await page.goBack();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/localhost:\d+\/$/);
  });

  test('nav-active class moves to the current page link after SPA nav', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });

    const landscapeIsActive = await page.locator('[data-spa-link][href="/landscape.html"]').evaluate(
      el => el.classList.contains('nav-active')
    );
    const searchIsActive = await page.locator('[data-spa-link][href="/"]').evaluate(
      el => el.classList.contains('nav-active')
    );
    expect(landscapeIsActive).toBe(true);
    expect(searchIsActive).toBe(false);
  });
});

test.describe('SPA: Search page re-init', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('HeroMap restarts after navigating back to search from landscape', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });

    const heroMapExists = await page.evaluate(() => typeof window.HeroMap?.start === 'function');
    expect(heroMapExists).toBe(true);

    await expect(page.locator('#hero-map')).toBeAttached();
  });

  test('card-glow pointermove listener works after returning to search', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    await page.locator('[data-spa-link][href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });

    await page.fill('#action-input', 'cursor');
    await page.waitForSelector('.result-card', { timeout: 5000 });

    const card = page.locator('.result-card').first();
    await card.hover();
    const glowX = await card.evaluate(el => el.style.getPropertyValue('--glow-x'));
    expect(glowX).toBeTruthy();
  });
});

test.describe('SPA: Router API', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('window.SpaRouter.navigate is a function', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const has = await page.evaluate(() => typeof window.SpaRouter?.navigate === 'function');
    expect(has).toBe(true);
  });

  test('window.SpaRouter.navigate navigates programmatically', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.SpaRouter.navigate('/landscape.html'));
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/landscape/);
  });
});

test.describe('SPA: Full navigation sequence', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('full navigation: search -> landscape -> guides -> back', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#search-input')).toBeAttached();
    expect(page.url()).toMatch(/\/$/);

    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/landscape/);

    await page.locator('[data-spa-link][href="/guides/"]').click();
    await expect(page.locator('.learn-index h1').or(page.locator('#page-content h1'))).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/guides/);

    await page.locator('[data-spa-link][href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/\/$/);

    const activeCount = await page.locator('[data-spa-link][href="/"].nav-active').count();
    expect(activeCount).toBe(1);
  });
});
