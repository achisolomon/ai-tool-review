import { test, expect } from '@playwright/test';

test.describe('SPA Phase 1: shared bootstrap', () => {
  test('article page loads router.js and page-init functions', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const has = await page.evaluate(() => ({
      router: typeof window.SpaRouter,
      landscapeInit: typeof window.landscapeInit,
    }));
    expect(has.router).toBe('object');
    expect(has.landscapeInit).toBe('function');
  });
});

test.describe('SPA Phase 1: route matching', () => {
  test('matchRoute resolves static and param routes with correct precedence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(() => ({
      guidesIndex: !!window.SpaRouter.matchRoute('/guides/'),
      article: !!window.SpaRouter.matchRoute('/guides/some-slug/'),
      home: !!window.SpaRouter.matchRoute('/'),
      unknown: !!window.SpaRouter.matchRoute('/nope/'),
      articleSlug: window.SpaRouter.matchRoute('/guides/some-slug/')?.params?.slug,
      guidesIndexParams: window.SpaRouter.matchRoute('/guides/')?.params,
    }));
    expect(r.guidesIndex).toBe(true);
    expect(r.article).toBe(true);
    expect(r.home).toBe(true);
    expect(r.unknown).toBe(false);
    expect(r.articleSlug).toBe('some-slug');
    expect(r.guidesIndexParams).toEqual({});
  });
});

test.describe('SPA Phase 1: article init', () => {
  test('articlePageInit builds TOC from article headings', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const count = await page.locator('#toc-list li').count();
    expect(count).toBeGreaterThan(0);
    expect(await page.evaluate(() => typeof window.articlePageInit)).toBe('function');
  });

  test('articlePageInit is idempotent (no duplicate TOC entries on re-run)', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const before = await page.locator('#toc-list li').count();
    await page.evaluate(() => window.articlePageInit());
    const after = await page.locator('#toc-list li').count();
    expect(after).toBe(before);
  });
});

test.describe('SPA Phase 1: DOM prerequisites', () => {
  test('article page has #page-content', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
  });
});

test.describe('SPA Phase 1: cross-page nav from article', () => {
  test('article → search works without full reload and search initializes', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });

    await page.locator('.nav-link-text[href="/"]').click();

    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true); // no reload
    expect(page.url()).toMatch(/localhost:\d+\/$/);
  });
});

test.describe('SPA Phase 1: navigate to articles', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('A3: clicking an article card navigates without full reload', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.locator('a.article-card[data-spa-link]').first().click();
    // Wait on the URL (reliable nav signal — the index already has an h1).
    await page.waitForURL(/\/guides\/.+\//, { timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
  });

  test('A6: browser back from article restores guides index', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.locator('a.article-card[data-spa-link]').first().click();
    await page.waitForURL(/\/guides\/.+\//, { timeout: 5000 });
    await page.goBack();
    await page.waitForURL(/\/guides\/$/, { timeout: 5000 });
    await expect(page.locator('.article-card').first()).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
  });
});

test.describe('SPA Phase 1: toolbar loads once', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('E2: auth container HTML persists across guides → article nav', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const before = await page.locator('#auth-container').innerHTML();
    await page.locator('a.article-card[data-spa-link]').first().click();
    await page.waitForURL(/\/guides\/.+\//, { timeout: 5000 });
    const after = await page.locator('#auth-container').innerHTML();
    expect(after).toBe(before);
  });

  test('E1: AuthUI.init does not re-run on SPA nav (call count stable)', async ({ page }) => {
    // Instrument AuthUI.init BEFORE any script assigns window.AuthUI, by intercepting
    // the property setter. Counts every call to AuthUI.init across the page lifetime.
    await page.addInitScript(() => {
      window.__authInitCalls = 0;
      let _authui;
      Object.defineProperty(window, 'AuthUI', {
        configurable: true,
        get() { return _authui; },
        set(v) {
          _authui = v;
          if (v && typeof v.init === 'function' && !v.__counted) {
            const realInit = v.init.bind(v);
            v.init = function (...args) { window.__authInitCalls++; return realInit(...args); };
            v.__counted = true;
          }
        },
      });
    });
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400); // let nav-init.js run
    const initial = await page.evaluate(() => window.__authInitCalls);

    await page.locator('a.article-card[data-spa-link]').first().click();
    await page.waitForURL(/\/guides\/.+\//, { timeout: 5000 });
    await page.waitForTimeout(400);
    const afterNav = await page.evaluate(() => window.__authInitCalls);

    expect(initial).toBeGreaterThanOrEqual(1); // sanity: auth wired on first load
    expect(afterNav).toBe(initial);            // not re-initialized on SPA nav
  });
});

test.describe('SPA Phase 1: head metadata swap', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('title and description update when navigating to an article', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });

    // Capture the index's description so we can prove the swap actually changed it.
    const indexDesc = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content'));

    const card = page.locator('a.article-card[data-spa-link]').first();
    const expectedTitlePart = await card.locator('h2').textContent();
    await card.click();

    // Wait for the SPA navigation to actually complete (URL changes to the article).
    // The guides index already has an h1 in #page-content, so waiting on the URL
    // is the reliable signal that the swap finished.
    await page.waitForURL(/\/guides\/.+\//, { timeout: 5000 });

    const title = await page.title();
    expect(title).toContain(expectedTitlePart.trim());

    // The description node must be swapped to the article's — different from the index's.
    const articleDesc = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content'));
    expect(articleDesc).toBeTruthy();
    expect(articleDesc).not.toBe(indexDesc);

    // Canonical must point at the article URL, not the stale /guides/ index.
    const canonical = await page.evaluate(() =>
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'));
    expect(canonical).toMatch(/\/guides\/.+\//);
  });

  test('reverse: home retains its meta after article → home navigation', async ({ page }) => {
    // Guards against the swap stripping the destination page's head tags and
    // leaving none (regression: index.html meta must be data-spa-head too).
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const homeDesc = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content'));
    expect(homeDesc).toBeTruthy();

    // Home → Guides → first article (SPA), then back to home via the Search nav link.
    await page.locator('[data-spa-link][href="/guides/"]').click();
    await page.waitForURL(/\/guides\/$/, { timeout: 5000 });
    await page.locator('a.article-card[data-spa-link]').first().click();
    await page.waitForURL(/\/guides\/.+\//, { timeout: 5000 });
    await page.locator('.nav-link-text[href="/"]').click();
    await page.waitForURL(/localhost:\d+\/$/, { timeout: 5000 });

    // The home page's own meta must be restored, not left empty.
    const restoredDesc = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content'));
    expect(restoredDesc).toBe(homeDesc);
    const ogTitle = await page.evaluate(() =>
      document.querySelector('meta[property="og:title"]')?.getAttribute('content'));
    expect(ogTitle).toBe('AI Tool Review');
  });
});
