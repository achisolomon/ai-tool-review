// Mobile quick-action bar (_includes/mobile-cta-bar.html, styled in
// css/mobile.css, which keeps it display:none at >= 768px).
//   - Picks the button set for the current route and re-evaluates after every
//     SPA navigation (the bar lives outside #page-content, so it persists).
//   - Tool-page buttons proxy a click to the existing header chips, so they
//     inherit those handlers (review auth gate, Suggest.open) unchanged, and
//     hide themselves when the chip is absent.
//   - Publishes the cookie banner's live height as --cookie-banner-h so the
//     bar stacks directly above the banner instead of overlapping it.
(function () {
  'use strict';

  var SUGGEST_ROUTES = ['/', '/index.html', '/landscape', '/landscape.html'];
  var TOOL_ROUTE = /^\/tools\/[^/]+\/?$/;
  var ACTIVE_CLASS = 'has-cta-bar';

  function bar() { return document.getElementById('mobile-cta-bar'); }

  function modeFor(pathname) {
    if (SUGGEST_ROUTES.indexOf(pathname) !== -1) return 'suggest';
    if (TOOL_ROUTE.test(pathname)) return 'tool';
    return null;
  }

  function proxyTarget(btn) {
    var id = btn.getAttribute('data-cta-proxy');
    return id ? document.getElementById(id) : null;
  }

  function requiredSection(btn) {
    var id = btn.getAttribute('data-cta-requires');
    return id ? document.getElementById(id) : null;
  }

  // A button is usable when it belongs to the active mode and its source
  // trigger is live: proxies need their target chip on the page, plus any
  // required section present and not hidden (#reviews is hidden by
  // tool-page.js when the reviews backend is down, which would leave
  // "Write a review" dead); the suggest button keeps whatever `hidden` state
  // nav-init.js gave it.
  function isUsable(btn, mode) {
    if (btn.getAttribute('data-cta-mode') !== mode) return false;
    if (btn.hasAttribute('data-cta-requires')) {
      var section = requiredSection(btn);
      if (!section || section.hidden) return false;
    }
    if (btn.hasAttribute('data-cta-proxy')) return proxyTarget(btn) !== null;
    return !btn.hidden;
  }

  // Re-evaluate when a required section is hidden/shown asynchronously.
  var sectionObserver = window.MutationObserver ? new MutationObserver(update) : null;

  function watchRequiredSections(el) {
    if (!sectionObserver) return;
    sectionObserver.disconnect();
    Array.prototype.forEach.call(el.querySelectorAll('[data-cta-requires]'), function (btn) {
      var section = requiredSection(btn);
      if (section) sectionObserver.observe(section, { attributes: true, attributeFilter: ['hidden'] });
    });
  }

  function update() {
    var el = bar();
    if (!el) return;
    var mode = modeFor(location.pathname);
    var buttons = el.querySelectorAll('.mobile-cta-btn');
    var visibleCount = 0;
    Array.prototype.forEach.call(buttons, function (btn) {
      var usable = mode !== null && isUsable(btn, mode);
      btn.classList.toggle('is-off', !usable);
      if (usable) visibleCount++;
    });
    el.hidden = visibleCount === 0;
    document.documentElement.classList.toggle(ACTIVE_CLASS, visibleCount > 0);
  }

  function watchCookieBanner() {
    var banner = document.querySelector('.cookie-banner');
    if (!banner || !window.ResizeObserver) return;
    var root = document.documentElement;
    var publish = function () {
      var height = banner.isConnected ? banner.offsetHeight : 0;
      root.style.setProperty('--cookie-banner-h', height + 'px');
    };
    new ResizeObserver(publish).observe(banner);
    publish();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('#mobile-cta-bar [data-cta-proxy]');
    if (!btn) return;
    var target = proxyTarget(btn);
    if (target) target.click();
  });

  function refresh() {
    var el = bar();
    if (el) watchRequiredSections(el);
    update();
  }

  document.addEventListener('spa:navigate', refresh);

  function init() {
    refresh();
    watchCookieBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
