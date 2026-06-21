import { test, expect } from '@playwright/test';

test.describe('SPA: ambient background', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  // The ambient background (ambient.js) replaced HeroMap. It is a self-contained
  // IIFE with no global API; the contract is that the canvas + aura mount on the
  // page (site-wide, via _includes/ambient.html).
  test('the ambient canvas and cursor aura mount on the page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ambient-bg')).toBeAttached();
    await expect(page.locator('#cursor-glow')).toBeAttached();
    // canvas got sized by the engine (width set on the element)
    const sized = await page.locator('#ambient-bg').evaluate(c => c.width > 0 && c.height > 0);
    expect(sized).toBe(true);
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
    // The three nav-text links plus the logo (also SPA-navigable home link) carry data-spa-link.
    const navLinks = await page.locator('.nav-link-text[data-spa-link]').count();
    expect(navLinks).toBe(3);
    await expect(page.locator('.logo[data-spa-link]')).toHaveCount(1);
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

    await page.locator('.nav-link-text[href="/"]').click();

    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });

    const flag = await page.evaluate(() => window.__spaLoaded);
    expect(flag).toBe(true);
    expect(page.url()).toMatch(/localhost:\d+\/$/);
  });

  test('clicking Guides nav link from search swaps content without full reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });

    await page.locator('[data-spa-link][href="/guides/"]').click();

    // Wait on the URL (reliable nav signal) before asserting content/flags.
    await page.waitForURL(/\/guides\/$/, { timeout: 5000 });
    await expect(page.locator('.learn-index h1').or(page.locator('#page-content h1'))).toBeVisible({ timeout: 5000 });

    const flag = await page.evaluate(() => window.__spaLoaded);
    expect(flag).toBe(true);
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
    const searchIsActive = await page.locator('.nav-link-text[href="/"]').evaluate(
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

  test('ambient background persists after navigating back to search from landscape', async ({ page }) => {
    // The constellation canvas (#ambient-bg) is site-wide and lives outside the
    // SPA content slot, so it persists across route changes (no per-page restart).
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ambient-bg')).toBeAttached();
    await page.locator('.nav-link-text[href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });

    await expect(page.locator('#ambient-bg')).toBeAttached();
  });

  test('page-level cursor aura tracks the mouse after returning to search', async ({ page }) => {
    // Single page-level aura (Single-Glow-Source rule): pointermove sets
    // --mouse-x/--mouse-y on <html>; there is no per-card glow.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    await page.locator('.nav-link-text[href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });

    await page.mouse.move(430, 320);
    await page.waitForTimeout(60);
    const mouseX = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--mouse-x'));
    expect(mouseX).toBe('430px');
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

test.describe('SPA: Guides page integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('guides direct load: no raw Jekyll tags visible', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('{%');
    expect(body).not.toContain('{{');
    expect(body).not.toContain('permalink');
  });

  test('guides direct load: no front matter visible', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/^---/m);
    expect(text).not.toContain('layout: null');
  });

  test('guides direct load: article cards are rendered', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const count = await page.locator('.article-card').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('guides direct load: article cards have title, description and date', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const card = page.locator('.article-card').first();
    await expect(card.locator('h2')).not.toBeEmpty();
    await expect(card.locator('p')).not.toBeEmpty();
    await expect(card.locator('.article-meta')).not.toBeEmpty();
  });

  test('guides direct load: external resources section is present', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.external-resources')).toBeVisible();
    await expect(page.locator('.external-link-card').first()).toBeVisible();
  });

  test('guides direct load: .learn-index provides centered layout', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.learn-index')).toBeVisible();
    const maxWidth = await page.locator('.learn-index').evaluate(el =>
      getComputedStyle(el).maxWidth
    );
    expect(maxWidth).toBe('800px');
  });

  test('guides via SPA nav: no Jekyll tags visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/guides/"]').click();
    await expect(page.locator('.learn-index')).toBeVisible({ timeout: 5000 });
    const body = await page.locator('#page-content').innerText();
    expect(body).not.toContain('{%');
    expect(body).not.toContain('permalink');
  });

  test('guides via SPA nav: article cards are rendered with correct styling', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/guides/"]').click();
    await expect(page.locator('.learn-index')).toBeVisible({ timeout: 5000 });
    const count = await page.locator('.article-card').count();
    expect(count).toBeGreaterThanOrEqual(1);
    // Card border should be visible (not zero width)
    const border = await page.locator('.article-card').first().evaluate(el =>
      getComputedStyle(el).borderWidth
    );
    expect(border).not.toBe('0px');
  });

  test('guides via SPA nav: .learn-index is centered (max-width 800px)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/guides/"]').click();
    await expect(page.locator('.learn-index')).toBeVisible({ timeout: 5000 });
    const maxWidth = await page.locator('.learn-index').evaluate(el =>
      getComputedStyle(el).maxWidth
    );
    expect(maxWidth).toBe('800px');
  });

  test('guides via SPA nav: external resources section is present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/guides/"]').click();
    await expect(page.locator('.learn-index')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.external-resources')).toBeVisible();
  });
});

test.describe('SPA: Landscape page integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('landscape direct load: tools are rendered (non-zero count)', async ({ page }) => {
    await page.goto('/landscape.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    const count = await page.locator('#visible-count').innerText();
    expect(parseInt(count)).toBeGreaterThan(0);
  });

  test('landscape via SPA nav from search: tools are rendered', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    const count = await page.locator('#visible-count').innerText();
    expect(parseInt(count)).toBeGreaterThan(0);
  });

  test('landscapeInit does not crash on search page load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait a moment for any deferred scripts to run
    await page.waitForTimeout(500);
    const landscapeErrors = errors.filter(e => e.includes('landscape') || e.includes('addEventListener'));
    expect(landscapeErrors).toHaveLength(0);
  });
});

test.describe('SPA: Shell integrity after navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('no permalink/front matter text visible on search page load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('permalink');
    expect(text).not.toContain('---');
    expect(text).not.toContain('layout:');
  });

  test('no permalink/front matter text after SPA nav to landscape and back', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    await page.locator('.nav-link-text[href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('permalink');
    expect(text).not.toContain('layout:');
  });

  test('landscape footer legend does not appear on search page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const legendVisible = await page.locator('.legend').count();
    expect(legendVisible).toBe(0);
  });

  test('landscape footer legend does not bleed onto search page after SPA nav', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    await page.locator('.nav-link-text[href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    const legendCount = await page.locator('.legend').count();
    expect(legendCount).toBe(0);
  });

  test('sign-in button is present in nav after page load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    // Either sign-in button or user avatar should be present
    const signinOrAvatar = await page.locator('#auth-container').count();
    expect(signinOrAvatar).toBeGreaterThan(0);
  });

  test('sign-in button persists in nav after SPA navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const beforeHTML = await page.locator('#auth-container').innerHTML();

    await page.locator('[data-spa-link][href="/landscape.html"]').click();
    await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });

    const afterHTML = await page.locator('#auth-container').innerHTML();
    expect(afterHTML).toBe(beforeHTML);
  });

  test('Supabase health probe uses /auth/v1/health (no 401 console errors)', async ({ page }) => {
    const failedRequests = [];
    page.on('requestfailed', req => {
      if (req.url().includes('supabase') && req.url().includes('/rest/v1/')) {
        failedRequests.push(req.url());
      }
    });
    // Also catch 401s on rest/v1
    page.on('response', res => {
      if (res.url().includes('/rest/v1/') && res.status() === 401) {
        failedRequests.push(res.url());
      }
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    expect(failedRequests).toHaveLength(0);
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

    await page.locator('.nav-link-text[href="/"]').click();
    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    expect(page.url()).toMatch(/\/$/);

    const activeCount = await page.locator('.nav-link-text[href="/"].nav-active').count();
    expect(activeCount).toBe(1);
  });
});
