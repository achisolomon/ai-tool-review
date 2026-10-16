// Article (guide) page init. Builds the in-article TOC from h2/h3 headings and
// wires scroll-spy. Exposed as window.articlePageInit() so the SPA router can
// re-run it after a content swap. Idempotent: clears the TOC before rebuilding.
(function () {
  'use strict';

  let observer = null;
  const MIN_MOBILE_TOC_HEADINGS = 2;

  // Smooth-scrolls to the heading, clearing the sticky header.
  function scrollToHeading(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);
  }

  function buildTocItem(h, onPick) {
    const li = document.createElement('li');
    if (h.tagName === 'H3') li.classList.add('toc-h3');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (onPick) onPick();
      scrollToHeading(h.id);
    });
    li.appendChild(a);
    return li;
  }

  // Phones hide the sidebar TOC, so give them a collapsed "Jump to section"
  // disclosure under the article header instead. Only css/mobile.css displays
  // it (display:none at >= 768px). Skipped when the article ships its own
  // inline outline, which learn.css already reveals on narrow screens.
  function buildMobileToc(headings) {
    const existing = document.querySelector('.learn-toc-mobile');
    if (existing) existing.remove();
    const header = document.querySelector('.learn-header');
    if (!header || headings.length < MIN_MOBILE_TOC_HEADINGS) return;
    if (document.querySelector('.learn-content .article-outline')) return;

    const details = document.createElement('details');
    details.className = 'learn-toc-mobile';
    const summary = document.createElement('summary');
    summary.textContent = 'Jump to section';
    const list = document.createElement('ol');
    const close = function () { details.open = false; };
    headings.forEach(function (h) { list.appendChild(buildTocItem(h, close)); });
    details.appendChild(summary);
    details.appendChild(list);
    header.insertAdjacentElement('afterend', details);
  }

  function articlePageInit() {
    const tocList = document.getElementById('toc-list');
    if (!tocList) return;

    // Idempotent: tear down any previous run.
    if (observer) { observer.disconnect(); observer = null; }
    tocList.innerHTML = '';

    const headings = document.querySelectorAll('.learn-content h2, .learn-content h3');
    headings.forEach(function (h) {
      if (!h.id) {
        h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      tocList.appendChild(buildTocItem(h));
    });
    buildMobileToc(headings);

    const tocLinks = tocList.querySelectorAll('a');
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove('toc-active'); });
          const active = tocList.querySelector('a[href="#' + entry.target.id + '"]');
          if (active) active.classList.add('toc-active');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { observer.observe(h); });
  }

  // Disconnect the scroll-spy observer when leaving an article so it doesn't
  // retain references to detached heading nodes. Called by the router's teardown.
  function articlePageTeardown() {
    if (observer) { observer.disconnect(); observer = null; }
  }

  window.articlePageInit = articlePageInit;
  window.articlePageTeardown = articlePageTeardown;

  // First load: run on DOMContentLoaded (router handles subsequent SPA navs).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', articlePageInit);
  } else {
    articlePageInit();
  }
})();
