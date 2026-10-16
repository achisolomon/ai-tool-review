// Mobile nav drawer (< 768px). The toolbar's own .nav-links element doubles as
// the drawer (styled in css/mobile.css), so there is no duplicated markup.
// Loaded once via _includes/nav-scripts.html. All listeners are delegated on
// document, so they keep working however the page content is swapped by the
// SPA router. On desktop the toggle is display:none and every handler below
// bails out early, so this script is a no-op there.
(function () {
  'use strict';

  var MOBILE_QUERY = window.matchMedia('(max-width: 767px)');
  var OPEN_CLASS = 'nav-open';
  var FOCUSABLE = 'a[href], button:not([disabled])';
  // Page siblings made inert while the drawer is open (cookie banner, page
  // content, footer), so neither Tab nor a screen reader can leave the drawer.
  var inertedSiblings = [];

  function toggleButton() { return document.getElementById('nav-toggle'); }
  function drawer() { return document.getElementById('nav-drawer'); }
  function isOpen() { return document.documentElement.classList.contains(OPEN_CLASS); }

  function setOpen(open, restoreFocus) {
    var btn = toggleButton();
    if (!btn) return;
    document.documentElement.classList.toggle(OPEN_CLASS, open);
    setPageInert(open, btn.closest('header'));
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      focusFirstLink();
    } else if (restoreFocus) {
      btn.focus();
    }
  }

  function setPageInert(inert, header) {
    inertedSiblings.forEach(function (el) { el.inert = false; });
    inertedSiblings = [];
    if (!inert || !header) return;
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el.contains(header) || el.inert || el.tagName === 'SCRIPT') return;
      el.inert = true;
      inertedSiblings.push(el);
    });
  }

  // Drawer items in visual order: the primary links (.nav-fixed) render above
  // the + Suggest / Admin group (.nav-variable) on mobile, the reverse of DOM
  // order. The auth control is excluded: it stays in the header bar.
  function drawerItems() {
    var nav = drawer();
    if (!nav) return [];
    var groups = ['.nav-fixed', '.nav-variable'];
    return groups.reduce(function (items, selector) {
      var group = nav.querySelector(selector);
      if (!group) return items;
      return items.concat(Array.prototype.filter.call(group.querySelectorAll(FOCUSABLE), isDrawerItem));
    }, []);
  }

  function isDrawerItem(el) {
    return !el.closest('#auth-container') && el.offsetParent !== null;
  }

  function focusFirstLink() {
    var items = drawerItems();
    if (items.length) items[0].focus();
  }

  // Keep Tab cycling through [toggle button + drawer items] in visual order
  // while the drawer is open. Focus is moved explicitly on every Tab because
  // the visual order differs from DOM order on mobile.
  function trapTab(e) {
    var cycle = [toggleButton()].concat(drawerItems());
    var step = e.shiftKey ? -1 : 1;
    var current = cycle.indexOf(document.activeElement);
    var next = (current + step + cycle.length) % cycle.length;
    e.preventDefault();
    cycle[current === -1 ? 0 : next].focus();
  }

  document.addEventListener('click', function (e) {
    if (!MOBILE_QUERY.matches) return;
    if (e.target.closest('#nav-toggle')) {
      setOpen(!isOpen(), false);
      return;
    }
    if (!isOpen()) return;
    var nav = drawer();
    var insideDrawer = nav && nav.contains(e.target) && !e.target.closest('#auth-container');
    // A drawer link or button was used (navigation or + Suggest), or the tap
    // landed on the scrim / page outside the drawer: either way, close.
    if (insideDrawer && !e.target.closest(FOCUSABLE)) return;
    setOpen(false, false);
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      setOpen(false, true);
    } else if (e.key === 'Tab') {
      trapTab(e);
    }
  });

  function closeOnDesktop(e) {
    if (!e.matches && isOpen()) setOpen(false, false);
  }

  if (MOBILE_QUERY.addEventListener) {
    MOBILE_QUERY.addEventListener('change', closeOnDesktop);
  } else if (MOBILE_QUERY.addListener) {
    MOBILE_QUERY.addListener(closeOnDesktop);
  }

  document.addEventListener('spa:navigate', function () {
    if (isOpen()) setOpen(false, false);
  });
})();
