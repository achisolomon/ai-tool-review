// Article (guide) page init. Builds the in-article TOC from h2/h3 headings and
// wires scroll-spy. Exposed as window.articlePageInit() so the SPA router can
// re-run it after a content swap. Idempotent: clears the TOC before rebuilding.
(function () {
  'use strict';

  let observer = null;

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
      const li = document.createElement('li');
      if (h.tagName === 'H3') li.classList.add('toc-h3');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(h.id);
        if (target) {
          const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
          history.replaceState(null, '', '#' + h.id);
        }
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });

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
