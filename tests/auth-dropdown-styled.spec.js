import { test, expect } from '@playwright/test';

// Regression guard for the "auth menu spilling open / unstyled" bug:
// pages that render the canonical toolbar MUST load css/auth.css, which hides
// .auth-dropdown-menu (opacity:0; visibility:hidden) until the avatar is clicked.
// When a page omitted auth.css, the logged-in dropdown (email / My Reviews /
// Sign out) rendered always-visible and unstyled in the top-right corner.
// See admin.html, about/contact/privacy/changes/my-reviews/my-suggestions.

const PAGES = [
  '/', '/landscape', '/guides/', '/admin',
  '/about', '/contact', '/privacy', '/changes',
  '/my-reviews', '/my-suggestions',
  '/tools/llamaparse/', '/guides/managing-ai-coding-tool-budgets/',
];

test.describe('Auth dropdown is styled (auth.css loaded) on every toolbar page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.route('https://pagead2.googlesyndication.com/**', r => r.abort());
  });

  for (const url of PAGES) {
    test(`${url}: auth dropdown menu is hidden by default (not spilling)`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const state = await page.evaluate(() => {
        const c = document.getElementById('auth-container');
        if (!c) return { ok: false, reason: 'no #auth-container' };
        // Render the same structure auth-ui.js produces when logged in.
        c.innerHTML =
          '<div class="auth-dropdown-container" id="auth-dropdown">' +
          '<div class="auth-dropdown-menu" role="menu">' +
          '<div class="auth-dropdown-header"><span class="auth-dropdown-email">x@y.com</span></div>' +
          '</div></div>';
        const menu = c.querySelector('.auth-dropdown-menu');
        const cs = getComputedStyle(menu);
        return { ok: true, opacity: cs.opacity, visibility: cs.visibility };
      });
      expect(state.ok, state.reason).toBe(true);
      // auth.css hides the menu until the container has .open
      expect(
        state.opacity === '0' || state.visibility === 'hidden',
        `auth.css not in effect on ${url} — dropdown would spill open (opacity=${state.opacity}, visibility=${state.visibility})`
      ).toBe(true);
    });
  }
});
