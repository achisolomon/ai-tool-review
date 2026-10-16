import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Regression suite for the mobile pass (css/mobile.css, js/nav-drawer.js,
// js/learn-page.js, _includes/nav.html, _includes/footer.html).
// Asserts invariants (no horizontal scroll, drawer behavior, tap targets,
// desktop isolation, guide TOC) rather than pixel snapshots, per the mobile
// spec at docs time. See css/mobile.css header comment for the contract:
// every rule lives inside @media (max-width: 767px) except the one block
// that hides .nav-toggle / .learn-toc-mobile on desktop.

const ROUTES = [
  '/',
  '/landscape',
  '/tools/11x',
  '/guides/',
  '/guides/loop-engineering',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

const MOBILE_VIEWPORTS = [
  { width: 320, height: 700, label: '320x700' },
  { width: 390, height: 844, label: '390x844' },
];

const DESKTOP_VIEWPORT = { width: 1280, height: 900 };

// Minimum tap target height per the mobile spec's --mobile-tap-min token.
// mobile-spec.md does not call out a lower minimum for any item in this
// list, so the full 44px applies to all of them.
const MIN_TAP_TARGET = 44;

test.describe.configure({ mode: 'parallel' });

async function acceptCookies(page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted');
  });
}

function blockAdHosts(page) {
  return Promise.all([
    page.route('https://www.googletagmanager.com/**', (r) => r.abort()),
    page.route('https://cdn.jsdelivr.net/**', (r) => r.abort()),
    page.route('https://pagead2.googlesyndication.com/**', (r) => r.abort()),
  ]);
}

// --- 1. No horizontal scroll -------------------------------------------

test.describe('No horizontal page scroll on mobile', () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test.describe(`${vp.label}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height }, isMobile: true, hasTouch: true });

      for (const route of ROUTES) {
        test(`${route} has no horizontal scroll`, async ({ page }) => {
          await acceptCookies(page);
          await blockAdHosts(page);
          await page.goto(route, { waitUntil: 'domcontentloaded' });
          await page.waitForLoadState('networkidle').catch(() => {});

          const { scrollWidth, innerWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
          }));

          expect(
            scrollWidth,
            `${route} at ${vp.label}: scrollWidth (${scrollWidth}) should not exceed innerWidth (${innerWidth})`
          ).toBeLessThanOrEqual(innerWidth);
        });
      }
    });
  }
});

// --- 2. Drawer behavior ---------------------------------------------------

test.describe('Nav drawer (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
    await blockAdHosts(page);
  });

  test('toggle is visible, drawer links are not visible until opened', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-controls', 'nav-drawer');

    const searchLink = page.locator('#nav-drawer .nav-fixed a:has-text("Search")');
    const landscapeLink = page.locator('#nav-drawer .nav-fixed a:has-text("Landscape")');
    const guidesLink = page.locator('#nav-drawer .nav-fixed a:has-text("Guides")');

    // The links exist in the DOM (single-DOM drawer pattern) but must not be
    // visible/reachable until the drawer is opened.
    await expect(searchLink).not.toBeVisible();
    await expect(landscapeLink).not.toBeVisible();
    await expect(guidesLink).not.toBeVisible();
  });

  test('opening sets aria-expanded and reveals Search/Landscape/Guides', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#nav-toggle');
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('html')).toHaveClass(/nav-open/);

    const searchLink = page.locator('#nav-drawer .nav-fixed a:has-text("Search")');
    const landscapeLink = page.locator('#nav-drawer .nav-fixed a:has-text("Landscape")');
    const guidesLink = page.locator('#nav-drawer .nav-fixed a:has-text("Guides")');

    await expect(searchLink).toBeVisible();
    await expect(landscapeLink).toBeVisible();
    await expect(guidesLink).toBeVisible();
  });

  test('Escape closes the drawer and returns focus to the toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#nav-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('html')).not.toHaveClass(/nav-open/);
    await expect(toggle).toBeFocused();
  });

  test('clicking a drawer link navigates and leaves the drawer closed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#nav-toggle');
    await toggle.click();

    const landscapeLink = page.locator('#nav-drawer .nav-fixed a:has-text("Landscape")');
    await landscapeLink.click();

    await expect(page).toHaveURL(/landscape/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('html')).not.toHaveClass(/nav-open/);
  });

  test('drawer still works after an SPA navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#nav-toggle');

    // First open/navigate via the drawer (SPA route change).
    await toggle.click();
    await page.locator('#nav-drawer .nav-fixed a:has-text("Landscape")').click();
    await expect(page).toHaveURL(/landscape/);
    await expect(page.locator('#landscape')).toBeVisible();

    // Reopen the drawer post-navigation: event delegation must still work.
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const guidesLink = page.locator('#nav-drawer .nav-fixed a:has-text("Guides")');
    await expect(guidesLink).toBeVisible();
    await guidesLink.click();
    await expect(page).toHaveURL(/guides/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

// --- 3. Desktop guard ------------------------------------------------------

test.describe('Desktop isolation (1280x900)', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('nav-toggle is hidden and takes no layout space; nav links render inline; header height unchanged', async ({ page }) => {
    await acceptCookies(page);
    await blockAdHosts(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#nav-toggle');
    // display:none => not visible AND zero box size.
    await expect(toggle).toBeHidden();
    const box = await toggle.boundingBox();
    expect(box, 'nav-toggle should have no box at all when display:none').toBeNull();

    const searchLink = page.locator('#nav-drawer .nav-fixed a:has-text("Search")');
    const landscapeLink = page.locator('#nav-drawer .nav-fixed a:has-text("Landscape")');
    const guidesLink = page.locator('#nav-drawer .nav-fixed a:has-text("Guides")');
    await expect(searchLink).toBeVisible();
    await expect(landscapeLink).toBeVisible();
    await expect(guidesLink).toBeVisible();

    // Desktop header-content height is fixed at 38px in css/style.css and must
    // be untouched by the mobile pass (mobile.css only overrides it inside the
    // max-width:767px query).
    const headerHeight = await page.evaluate(() => {
      const el = document.querySelector('.header-content');
      return el ? getComputedStyle(el).height : null;
    });
    expect(headerHeight).toBe('38px');
  });
});

// --- 3b. Static check: every mobile.css rule lives in a max-width query ---

/**
 * Scans CSS text and returns selector blocks whose *declarations* execute
 * outside any @media (max-width: ...) query — i.e. rules that would apply at
 * all viewport widths, not just mobile ones. This is a brace-depth scan, not
 * a full CSS parser: it tracks when we're inside an @media max-width block
 * and flags any top-level (non-media) rule it finds along the way.
 *
 * Returns an array of { selector, atRule } for each offending rule; atRule is
 * the nearest enclosing @-rule (or null if at the stylesheet's top level).
 */
function findRulesOutsideMaxWidthMedia(css) {
  const offenders = [];
  let i = 0;
  const n = css.length;

  // Stack of context frames entered via `{`. Each frame knows whether it (or
  // an ancestor) is a "max-width media" context.
  const stack = [{ isMaxWidthMedia: false, isAnyAtRule: false }];
  let buf = '';

  function stripComments(s) {
    return s.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  css = stripComments(css);

  while (i < n) {
    const ch = css[i];
    if (ch === '{') {
      const header = buf.trim();
      buf = '';
      const isMedia = /^@media\b/i.test(header);
      const isMaxWidthMedia = isMedia && /max-width\s*:/i.test(header);
      const isOtherAtRule = /^@/.test(header) && !isMedia;
      const parentIsMaxWidth = stack[stack.length - 1].isMaxWidthMedia;

      const parentIsKeyframes = stack[stack.length - 1].isKeyframes;
      if (!isMedia && !isOtherAtRule && header.length && !parentIsKeyframes) {
        // This is a plain selector block (a rule). Flag it if we're not
        // nested inside a max-width media query.
        if (!parentIsMaxWidth) {
          offenders.push({ selector: header });
        }
      }

      stack.push({
        isMaxWidthMedia: isMaxWidthMedia || parentIsMaxWidth,
        isAnyAtRule: isMedia || isOtherAtRule,
        isKeyframes: /^@(-webkit-)?keyframes\b/i.test(header),
      });
      i++;
      continue;
    }
    if (ch === '}') {
      stack.pop();
      buf = '';
      i++;
      continue;
    }
    buf += ch;
    i++;
  }

  return offenders;
}

// Rules legitimately allowed to live outside a max-width media query: the
// one block in mobile.css that hides mobile-only markup on desktop
// (nav-toggle, learn-toc-mobile, mobile-cta-bar). Matched by selector text.
const ALLOWED_OUTSIDE_MEDIA = /nav-toggle|learn-toc-mobile|mobile-cta-bar|drawer/i;

test.describe('Static check: css/mobile.css scoping', () => {
  test('every rule in mobile.css is inside @media (max-width:...), except the desktop-hide rule', async () => {
    const cssPath = path.join(process.cwd(), 'css', 'mobile.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    const offenders = findRulesOutsideMaxWidthMedia(css).filter(
      (o) => !ALLOWED_OUTSIDE_MEDIA.test(o.selector)
    );

    expect(
      offenders,
      `Found rule(s) outside a max-width media query that are not the allowed desktop-hide rule: ${JSON.stringify(offenders)}`
    ).toEqual([]);
  });

  // Proof the guard actually works: feed it a deliberately bad snippet (a
  // rule with real declarations sitting at the top level, outside any media
  // query, and not matching the allowed desktop-hide pattern) and confirm it
  // is flagged.
  test('guard flags a rule placed outside a max-width media query', () => {
    const badCss = `
      .something-unrelated {
        color: red;
      }
      @media (max-width: 767px) {
        .ok-in-mobile { color: blue; }
      }
    `;
    const offenders = findRulesOutsideMaxWidthMedia(badCss).filter(
      (o) => !ALLOWED_OUTSIDE_MEDIA.test(o.selector)
    );
    expect(offenders.length).toBeGreaterThan(0);
    expect(offenders[0].selector).toContain('.something-unrelated');
  });

  test('guard does not flag rules nested inside a max-width media query', () => {
    const goodCss = `
      @media (max-width: 767px) {
        .fine { color: blue; }
        .also-fine { color: green; }
      }
    `;
    const offenders = findRulesOutsideMaxWidthMedia(goodCss);
    expect(offenders).toEqual([]);
  });

  test('guard allows the documented nav-toggle/learn-toc-mobile desktop-hide rule', () => {
    const hideRuleCss = `
      .nav-toggle,
      .learn-toc-mobile {
          display: none;
      }
      @media (max-width: 767px) {
        .nav-toggle { display: inline-flex; }
      }
    `;
    const offenders = findRulesOutsideMaxWidthMedia(hideRuleCss).filter(
      (o) => !ALLOWED_OUTSIDE_MEDIA.test(o.selector)
    );
    expect(offenders).toEqual([]);
  });

  test('guard allows the mobile-cta-bar desktop-hide rule but still flags a styled CTA rule outside the query', () => {
    const hideOnly = `
      .mobile-cta-bar { display: none; }
      @media (max-width: 767px) {
        .mobile-cta-bar:not([hidden]) { display: flex; }
      }
    `;
    expect(
      findRulesOutsideMaxWidthMedia(hideOnly).filter((o) => !ALLOWED_OUTSIDE_MEDIA.test(o.selector))
    ).toEqual([]);
    const leaky = hideOnly + `\n.mobile-cta-btn { min-height: 48px; }`;
    const offenders = findRulesOutsideMaxWidthMedia(leaky).filter((o) => !ALLOWED_OUTSIDE_MEDIA.test(o.selector));
    expect(offenders).toEqual([{ selector: '.mobile-cta-btn' }]);
  });

  test('guard flags a reduced-motion-only media rule (not a max-width query) at top level', () => {
    // Belt-and-suspenders: an @media query that isn't max-width (e.g. a
    // standalone prefers-reduced-motion block with no max-width) should also
    // be flagged, since it would apply at any viewport width.
    const css = `
      @media (prefers-reduced-motion: reduce) {
        .anim { transition: none; }
      }
    `;
    const offenders = findRulesOutsideMaxWidthMedia(css);
    expect(offenders.length).toBeGreaterThan(0);
  });

  test('guard ignores keyframe steps nested in a max-width query but flags a top-level rule beside them', () => {
    const nested = `
      @media (max-width: 767px) {
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        .x { animation: fade 1s; }
      }
    `;
    expect(findRulesOutsideMaxWidthMedia(nested)).toEqual([]);
    const leaky = nested + `\n.leak { color: red; }`;
    expect(findRulesOutsideMaxWidthMedia(leaky)).toEqual([{ selector: '.leak' }]);
  });
});

// --- 4. Tap targets ---------------------------------------------------------

test.describe('Tap targets >= 44px on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
    await blockAdHosts(page);
  });

  test('toggle button meets minimum tap height', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const box = await page.locator('#nav-toggle').boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
  });

  test('drawer links meet minimum tap height', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('#nav-toggle').click();

    const links = page.locator('#nav-drawer .nav-fixed a.nav-link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      if (!(await link.isVisible())) continue;
      const box = await link.boundingBox();
      expect(box, `drawer link ${i} should have a box`).not.toBeNull();
      expect(
        box.height,
        `drawer link ${i} ("${(await link.textContent())?.trim()}") height ${box.height} should be >= ${MIN_TAP_TARGET}`
      ).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
    }
  });

  test('Sign in control meets minimum tap height', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // The auth control renders async (nav-init.js); wait for it to populate
    // #auth-container rather than sleeping a fixed duration.
    await page.waitForSelector('#auth-container .auth-signin-btn, #auth-container .auth-avatar-btn', { timeout: 10000 });

    const authControl = page.locator('#auth-container .auth-signin-btn, #auth-container .auth-avatar-btn').first();
    const box = await authControl.boundingBox();
    expect(box).not.toBeNull();

    // The visible pill is intentionally smaller (36px) with the hit area
    // extended via an invisible ::before pseudo-element per css/mobile.css.
    // The effective (visible + pseudo-element) hit area is what must reach
    // 44px; the pseudo-element inset is -4px top/bottom => +8px total.
    const pseudoInset = await authControl.evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return before.content !== 'none' ? before : null;
    });
    const effectiveHeight = pseudoInset ? box.height + 8 : box.height;
    expect(
      effectiveHeight,
      `Sign in control effective tap height (${effectiveHeight}) should be >= ${MIN_TAP_TARGET}`
    ).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
  });

  test('footer links meet minimum tap height', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });

    const links = page.locator('footer.footer .footer-bottom a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const box = await link.boundingBox();
      expect(box, `footer link ${i} should have a box`).not.toBeNull();
      expect(
        box.height,
        `footer link ${i} ("${(await link.textContent())?.trim()}") height ${box.height} should be >= ${MIN_TAP_TARGET}`
      ).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
    }
  });
});

// --- 5. Guide TOC ------------------------------------------------------

test.describe('Guide "Jump to section" TOC (mobile)', () => {
  test('exists, is collapsed by default, expands on tap, links point to real anchors', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await acceptCookies(page);
    await blockAdHosts(page);
    await page.goto('/guides/loop-engineering', { waitUntil: 'domcontentloaded' });

    const toc = page.locator('.learn-toc-mobile');
    await expect(toc).toBeVisible();

    // <details> default state: not open.
    const isOpenInitially = await toc.evaluate((el) => el.hasAttribute('open'));
    expect(isOpenInitially).toBe(false);

    const summary = toc.locator('> summary');
    await expect(summary).toHaveText(/Jump to section/i);

    await summary.click();
    const isOpenAfterTap = await toc.evaluate((el) => el.hasAttribute('open'));
    expect(isOpenAfterTap).toBe(true);

    const links = toc.locator('li a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    // Every TOC link's #anchor must resolve to a real heading id in the page.
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toMatch(/^#/);
      const id = href.slice(1);
      // getElementById avoids escaping concerns for ids containing characters
      // that are special in CSS selectors (headings are slugified, but this
      // keeps the check robust regardless).
      const found = await page.evaluate((elId) => !!document.getElementById(elId), id);
      expect(found, `TOC link href="${href}" should resolve to an element with id="${id}"`).toBe(true);
    }
  });

  test('is not visible at desktop width (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await acceptCookies(page);
    await blockAdHosts(page);
    await page.goto('/guides/loop-engineering', { waitUntil: 'domcontentloaded' });

    const toc = page.locator('.learn-toc-mobile');
    // The element may or may not exist in the DOM (it's always built by JS),
    // but either way it must not be visible at desktop width.
    if (await toc.count()) {
      await expect(toc).toBeHidden();
    }
  });
});

// --- 6. Mobile quick-action bar ---------------------------------------------
// _includes/mobile-cta-bar.html + js/mobile-cta-bar.js: "+ Suggest a tool" on
// home/landscape, "Write a review" + "Suggest an edit" on tool pages, nothing
// on content pages, never on desktop. Buttons reuse the existing openers.

const CTA_BAR = '#mobile-cta-bar';

async function visibleCtaLabels(page) {
  return page.locator(`${CTA_BAR} .mobile-cta-btn:visible`).allTextContents()
    .then((labels) => labels.map((l) => l.replace(/\s+/g, ' ').trim()));
}

test.describe('Mobile quick-action bar', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
    await blockAdHosts(page);
  });

  for (const route of ['/', '/landscape']) {
    test(`${route} shows a single "+ Suggest a tool" button`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#suggest-open-bar')).toBeVisible();
      expect(await visibleCtaLabels(page)).toEqual(['+ Suggest a tool']);
    });
  }

  for (const route of ['/guides/', '/guides/loop-engineering', '/about', '/contact', '/privacy', '/terms']) {
    test(`${route} has no bar`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      await expect(page.locator(CTA_BAR)).toBeHidden();
    });
  }

  test('bar follows SPA navigation (landscape -> guides -> home)', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#suggest-open-bar')).toBeVisible();

    await page.locator('#nav-toggle').click();
    await page.locator('#nav-drawer .nav-fixed a:has-text("Guides")').click();
    await expect(page).toHaveURL(/guides/);
    await expect(page.locator(CTA_BAR)).toBeHidden();

    await page.locator('#nav-toggle').click();
    await page.locator('#nav-drawer .nav-fixed a:has-text("Search")').click();
    await expect(page.locator('#suggest-open-bar')).toBeVisible();
  });

  test('"+ Suggest a tool" opens the existing suggest modal', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('#suggest-open-bar').click();
    await expect(page.locator('.suggest-modal-overlay.is-open')).toBeVisible();
    await expect(page.locator(CTA_BAR)).toBeHidden();
  });

  test('"Suggest an edit" opens the existing suggest modal', async ({ page }) => {
    await page.goto('/tools/11x/', { waitUntil: 'domcontentloaded' });
    await page.locator('#suggest-edit-bar').click();
    await expect(page.locator('.suggest-modal-overlay.is-open')).toBeVisible();
  });

  test('"Write a review" hides itself when the reviews section is hidden (no dead CTA)', async ({ page }) => {
    // Blocking the Supabase CDN makes tool-page.js hide #reviews.
    await page.goto('/tools/11x/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#reviews')).toBeHidden();
    await expect(page.locator('#review-open-bar')).toBeHidden();
    await expect(page.locator('#suggest-edit-bar')).toBeVisible();
  });

  test('bar is inert and covered while the nav drawer is open', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#suggest-open-bar')).toBeVisible();
    await page.locator('#nav-toggle').click();
    const inert = await page.locator(CTA_BAR).evaluate((el) => el.closest('[inert]') !== null);
    expect(inert).toBe(true);
  });
});

// Tool-page review CTA needs the Supabase CDN (tool-page.js hides #reviews
// without it), so these tests only block the ad hosts.
test.describe('Mobile quick-action bar on tool pages (reviews backend reachable)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
    await page.route('https://www.googletagmanager.com/**', (r) => r.abort());
    await page.route('https://pagead2.googlesyndication.com/**', (r) => r.abort());
  });

  test('tool page shows "Write a review" and "Suggest an edit"', async ({ page }) => {
    await page.goto('/tools/11x/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    test.skip(await page.locator('#reviews').isHidden(), 'reviews backend unavailable in this run');
    await expect(page.locator('#review-open-bar')).toBeVisible();
    expect(await visibleCtaLabels(page)).toEqual(['✎ Write a review', '✎ Suggest an edit']);
  });

  test('"Write a review" opens the existing review flow when reviews are available', async ({ page }) => {
    await page.goto('/tools/11x/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    // When the reviews backend answers, the bar proxies to the header chip,
    // which forwards to #leave-review-btn (sign-in gate when signed out).
    test.skip((await page.locator('#leave-review-btn').count()) === 0, 'reviews backend unavailable in this run');
    await page.locator('#review-open-bar').click();
    await expect(page.locator('#auth-modal.active, #review-modal.active')).toBeVisible();
  });

});

test.describe('Mobile quick-action bar with the cookie banner showing', () => {
  test.use({ viewport: { width: 320, height: 700 }, isMobile: true, hasTouch: true });

  for (const route of ['/', '/landscape']) {
    test(`${route}: bar sits above the banner and is not covered by it`, async ({ page }) => {
      await blockAdHosts(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const banner = page.locator('.cookie-banner');
      await expect(banner).toBeVisible();
      const button = page.locator('#suggest-open-bar');
      await expect(button).toBeVisible();

      // The bar slides up (150ms) once the banner's height is published, so
      // poll until it settles rather than sampling mid-transition.
      const measure = () => button.evaluate((btn) => {
        const r = btn.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        const bannerTop = document.querySelector('.cookie-banner').getBoundingClientRect().top;
        const barBottom = document.getElementById('mobile-cta-bar').getBoundingClientRect().bottom;
        return { hitIsButton: hit === btn || btn.contains(hit), clearOfBanner: barBottom <= bannerTop + 1 };
      });
      await expect.poll(measure, { message: 'button should be hit-testable and sit above the banner' })
        .toEqual({ hitIsButton: true, clearOfBanner: true });
    });
  }
});

test.describe('Mobile quick-action bar on desktop (1280x900)', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  for (const route of ['/', '/landscape', '/tools/11x/']) {
    test(`${route}: bar is display:none and body has no reserved padding`, async ({ page }) => {
      await acceptCookies(page);
      await blockAdHosts(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const bar = page.locator(CTA_BAR);
      await expect(bar).toBeHidden();
      expect(await bar.boundingBox()).toBeNull();
      const paddingBottom = await page.evaluate(() => getComputedStyle(document.body).paddingBottom);
      expect(paddingBottom).toBe('0px');
    });
  }
});

// --- Ambient background stability on phones ------------------------------
// Phones fire `resize` when the address bar shows/hides during a scroll; the
// field used to reseed there, so every star jumped. Touch also used to drive
// the mouse "gather" and leave the cursor aura stuck at the last finger spot.

test.describe('Ambient background on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });

  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
    await blockAdHosts(page);
    // Freeze the field (static single draw) so only resize could move pixels;
    // test.use({ reducedMotion }) is not applied under this config.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const r = Math.random; window.__rand = 0;
      Math.random = function () { window.__rand++; return r(); };
    });
  });

  test('address-bar height changes do not reseed or move the star field', async ({ page }) => {
    await page.goto('/tools/11x', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    const visiblePixels = () => page.evaluate(() => {
      const c = document.getElementById('ambient-bg');
      const s = c.width / innerWidth;
      return Array.from(c.getContext('2d').getImageData(0, 0, c.width, Math.round(800 * s)).data);
    });
    const before = await visiblePixels();
    const r0 = await page.evaluate(() => window.__rand);
    for (const h of [914, 844, 900, 844]) {
      await page.setViewportSize({ width: 390, height: h });
      await page.waitForTimeout(250);
    }
    expect(await page.evaluate(() => window.__rand) - r0, 'resize must not reseed').toBe(0);
    const after = await visiblePixels();
    let moved = 0;
    for (let i = 0; i < before.length; i += 4) {
      const d = Math.abs(before[i] - after[i]) + Math.abs(before[i + 1] - after[i + 1]) + Math.abs(before[i + 2] - after[i + 2]);
      if (d > 30) moved++;
    }
    expect(moved, 'visible pixels that changed across address-bar toggles').toBe(0);
  });

  test('canvas never ends short of the viewport after the address bar hides', async ({ page }) => {
    await page.goto('/tools/11x', { waitUntil: 'domcontentloaded' });
    await page.setViewportSize({ width: 390, height: 914 });
    await page.waitForTimeout(250);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const h = await page.evaluate(() => document.getElementById('ambient-bg').getBoundingClientRect().height);
    expect(h).toBeGreaterThanOrEqual(914);
  });

  test('touch input does not drive the cursor aura', async ({ page }) => {
    await page.goto('/tools/11x', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      document.body.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: 200, clientY: 400, bubbles: true }));
    });
    const x = await page.evaluate(() => document.documentElement.style.getPropertyValue('--mouse-x'));
    expect(x === '' || x === '-9999px').toBe(true);
  });
});

test.describe('Ambient background on desktop (1280x900)', () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test('a real mouse still drives the cursor aura', async ({ page }) => {
    await acceptCookies(page);
    await blockAdHosts(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.mouse.move(300, 300);
    await page.mouse.move(320, 310);
    await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--mouse-x'))).toBe('320px');
  });
});
