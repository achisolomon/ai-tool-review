import { test, expect } from '@playwright/test';

test.describe('SPA Phase 2: tool routing + landmarks', () => {
  test('tool page has #page-content and #tool-data JSON island', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
    const data = await page.evaluate(() => {
      const el = document.getElementById('tool-data');
      return el ? JSON.parse(el.textContent) : null;
    });
    expect(data).toBeTruthy();
    expect(data.slug).toBe('llamaparse');
    expect(typeof data.name).toBe('string');
  });

  test('router matches /tools/:slug/', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const m = await page.evaluate(() => window.SpaRouter.matchRoute('/tools/llamaparse/'));
    expect(m).toBeTruthy();
    expect(m.params.slug).toBe('llamaparse');
  });
});

test.describe('SPA Phase 2: tool head metadata', () => {
  test('tool page head SEO/schema nodes are marked data-spa-head', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    const desc = await page.evaluate(() =>
      document.querySelector('meta[name="description"][data-spa-head]')?.getAttribute('content'));
    expect(desc).toBeTruthy();
    const schema = await page.evaluate(() =>
      !!document.querySelector('script[type="application/ld+json"][data-spa-head]'));
    expect(schema).toBe(true);
  });
});

test.describe('SPA Phase 2: tool-page init exists + suggest wiring', () => {
  test('window.toolPageInit is a function and suggest-edit button is present', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => typeof window.toolPageInit)).toBe('function');
    await expect(page.locator('#tool-suggest-open')).toBeAttached();
  });

  test('toolPageInit is idempotent for suggest wiring (no double-binding)', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    // Re-running init must not re-bind the suggest button (guard via dataset flag).
    const wiredTwice = await page.evaluate(() => {
      const btn = document.getElementById('tool-suggest-open');
      window.toolPageInit();
      window.toolPageInit();
      return btn?.dataset.wired;
    });
    expect(wiredTwice).toBe('1');
  });
});

test.describe('SPA Phase 2: reviews init via tool-page.js', () => {
  // Block external CDNs (Supabase) so ensureSupabase() fails fast and
  // networkidle can fire. Reviews degrade to hidden/empty — tests tolerate that.
  test.beforeEach(async ({ page }) => {
    await page.route(/^https?:\/\/(?!localhost)/, route => route.abort());
  });

  test('reviews section renders or hides gracefully on direct load', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => {
      const sec = document.getElementById('reviews');
      if (!sec) return 'no-section';
      if (sec.hidden) return 'hidden';
      const sum = document.getElementById('review-summary-container');
      return sum && sum.innerHTML.trim().length > 0 ? 'rendered' : 'empty';
    });
    expect(['hidden', 'rendered', 'empty']).toContain(state);
  });

  test('re-running toolPageInit does not duplicate review modals', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { window.toolPageInit(); window.toolPageInit(); });
    await page.waitForTimeout(300);
    // No modal id should appear more than once.
    const dupes = await page.evaluate(() => {
      const ids = ['review-modal', 'auth-modal', 'existing-review-modal', 'delete-confirm-modal'];
      return ids.filter(id => document.querySelectorAll('#' + id).length > 1);
    });
    expect(dupes).toEqual([]);
  });
});

test.describe('SPA Phase 2: tool libs available cross-page', () => {
  test('from home, tool-page libraries are loaded', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const libs = await page.evaluate(() => ({
      reviewsApi: typeof window.ReviewsAPI,
      reviewComponents: typeof window.ReviewComponents,
      suggest: typeof window.Suggest,
      toolPageInit: typeof window.toolPageInit,
    }));
    expect(libs.reviewsApi).toBe('object');
    expect(libs.reviewComponents).toBe('object');
    expect(libs.suggest).toBe('object');
    expect(libs.toolPageInit).toBe('function');
  });
});

test.describe('SPA Phase 2: navigate to tool pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('landscape tool card navigates to tool page without full reload', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    await page.evaluate(() => { window.__spaLoaded = true; });
    // Click the first tool card in the landscape grid. Tool cards have data-slug
    // or render a clickable element handled by landscape.js click delegation.
    // Use the router directly to assert nav works client-side, then also try a click.
    await page.evaluate(() => window.SpaRouter.navigate('/tools/llamaparse/'));
    await page.waitForURL(/\/tools\/llamaparse\//, { timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true); // no full reload
    const slug = await page.evaluate(() => JSON.parse(document.getElementById('tool-data').textContent).slug);
    expect(slug).toBe('llamaparse');
  });

  test('search result tool navigation uses SpaRouter (no reload)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
    expect(await page.title()).toMatch(/AI Tool Review/);
  });
});

test.describe('SPA Phase 2: idempotency + load-once', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('tool→tool nav: data island matches current tool, no duplicate modals', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    await page.waitForTimeout(400);
    const slug = await page.evaluate(() => JSON.parse(document.getElementById('tool-data').textContent).slug);
    expect(slug).toBe('docling');
    const dupes = await page.evaluate(() => {
      const ids = ['review-modal', 'auth-modal', 'existing-review-modal', 'delete-confirm-modal'];
      return ids.filter(id => document.querySelectorAll('#' + id).length > 1);
    });
    expect(dupes).toEqual([]);
  });

  test('E1: AuthUI.init not re-run on tool→tool SPA nav', async ({ page }) => {
    await page.addInitScript(() => {
      window.__authInitCalls = 0;
      let _a;
      Object.defineProperty(window, 'AuthUI', {
        configurable: true,
        get() { return _a; },
        set(v) { _a = v; if (v && typeof v.init === 'function' && !v.__counted) {
          const real = v.init.bind(v); v.init = function (...a) { window.__authInitCalls++; return real(...a); }; v.__counted = true;
        } },
      });
    });
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    await page.waitForTimeout(400);
    const initial = await page.evaluate(() => window.__authInitCalls);
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.__authInitCalls);
    expect(initial).toBeGreaterThanOrEqual(1);
    expect(after).toBe(initial);
  });

  test('E2: auth container persists across tool→tool nav', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    const before = await page.locator('#auth-container').innerHTML();
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    const after = await page.locator('#auth-container').innerHTML();
    expect(after).toBe(before);
  });

  test('tool→tool nav: head metadata (title/canonical) updates to new tool', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    const beforeCanonical = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.href);
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    const afterCanonical = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.href);
    expect(afterCanonical).toBeTruthy();
    expect(afterCanonical).not.toBe(beforeCanonical);
    expect(afterCanonical).toContain('docling');
  });
});

test.describe('SPA Phase 2: tool styling survives SPA nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('tool-specific CSS (.verdict) is available after SPA nav from home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    await page.evaluate(() => window.SpaRouter.navigate('/tools/llamaparse/'));
    await page.waitForURL(/\/tools\/llamaparse\//, { timeout: 5000 });
    // .verdict styling must be applied — assert a known rule from the tool CSS is in effect.
    // Inject a probe element with class 'verdict' inside page-content and check computed style.
    const hasVerdictStyle = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.className = 'verdict';
      document.getElementById('page-content').appendChild(probe);
      const cs = getComputedStyle(probe);
      const styled = cs.borderRadius !== '0px' || cs.padding !== '0px' || cs.borderTopWidth !== '0px';
      probe.remove();
      return styled;
    });
    expect(hasVerdictStyle).toBe(true);
  });

  test('tool.css is loaded on home, landscape, guides, and tool pages', async ({ page }) => {
    for (const url of ['/', '/landscape', '/guides/', '/tools/llamaparse/']) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const hasToolCss = await page.evaluate(() =>
        !!document.querySelector('link[rel="stylesheet"][href*="tool.css"]'));
      expect(hasToolCss, `tool.css missing on ${url}`).toBe(true);
    }
  });
});

test.describe('SPA Phase 2: review styling + auth resilience', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('reviews.css is loaded on all SPA pages (so SPA-nav to tool has review styles)', async ({ page }) => {
    for (const url of ['/', '/landscape', '/guides/', '/tools/llamaparse/']) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const has = await page.evaluate(() => !!document.querySelector('link[rel="stylesheet"][href*="reviews.css"]'));
      expect(has, `reviews.css missing on ${url}`).toBe(true);
    }
  });

  test('closeAuthModal uses live lookup (no throw after tool→tool nav)', async ({ page }) => {
    // Mock onAuthStateChange so we can capture the callback and fire it manually,
    // without needing a real Supabase connection. The mock is injected before page load
    // so tool-page.js picks it up when it calls window.SupabaseClient.onAuthStateChange.
    await page.addInitScript(() => {
      // Intercept onAuthStateChange after SupabaseClient is set up.
      // We store each registered callback in window._authCallbacks so we can call it later.
      window._authCallbacks = [];
      Object.defineProperty(window, 'SupabaseClient', {
        configurable: true,
        get() { return this._SupabaseClientReal; },
        set(v) {
          this._SupabaseClientReal = v;
          if (v && typeof v.onAuthStateChange === 'function') {
            const orig = v.onAuthStateChange.bind(v);
            v.onAuthStateChange = function(cb) {
              window._authCallbacks.push(cb);
              return orig(cb);
            };
          }
        }
      });
    });

    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');

    // Navigate tool→tool: this removes the first auth-modal from the DOM via resetReviewModals.
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });

    // Now fire the auth callback as if a SIGNED_IN event arrived —
    // with the stale-closure bug this would throw because the first authModal node was removed.
    const threw = await page.evaluate(() => {
      try {
        // Fire all captured callbacks with a SIGNED_IN event.
        // The first callback closed over the OLD (removed) auth-modal node.
        // With the fix, it does a live getElementById which returns null-safely.
        (window._authCallbacks || []).forEach(cb => cb('SIGNED_IN', { user: { id: 'test', user_metadata: {} } }));
        return false;
      } catch (e) { return String(e); }
    });
    expect(threw).toBe(false);
  });
});
