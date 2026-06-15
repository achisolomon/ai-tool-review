(function () {
    'use strict';

    const PAGE_INITS = {
        '/': () => {
            if (window.appInit) window.appInit();
            if (window.HeroMap) window.HeroMap.start();
            if (window.CardGlow) window.CardGlow.init();
        },
        '/landscape.html': () => { if (window.landscapeInit) window.landscapeInit(); },
        '/guides/':        () => { /* static — no JS init needed */ },
    };

    function normalize(href) {
        try {
            const u = new URL(href, location.origin);
            return u.pathname;
        } catch (_) {
            return href;
        }
    }

    // Track the current pathname so popstate can compare against it
    let currentPathname = normalize(location.href);

    // Guard against concurrent navigations (race condition when two fetches run in parallel)
    let navigating = false;

    function updateActiveLink(pathname) {
        document.querySelectorAll('[data-spa-link]').forEach(a => {
            const linkPath = normalize(a.getAttribute('href'));
            a.classList.toggle('nav-active', linkPath === pathname);
        });
    }

    function teardown(fromPathname) {
        if (fromPathname === '/' && window.HeroMap) {
            window.HeroMap.stop();
        }
    }

    async function fetchPage(href) {
        const res = await fetch(href, { headers: { 'X-SPA-Request': '1' } });
        if (!res.ok) throw new Error(`fetch ${href} → ${res.status}`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.getElementById('page-content');
        const title = doc.querySelector('title')?.textContent ?? document.title;
        return { innerHTML: content?.innerHTML ?? '', title };
    }

    async function navigate(href, pushState = true, fromOverride) {
        if (navigating) return;

        const fromPathname = fromOverride !== undefined ? fromOverride : normalize(location.href);
        const toPathname = normalize(href);

        if (toPathname === fromPathname) return;

        navigating = true;
        teardown(fromPathname);

        let pageData;
        try {
            pageData = await fetchPage(href);
        } catch (err) {
            navigating = false;
            location.href = href;
            return;
        }

        try {
            const slot = document.getElementById('page-content');
            if (!slot) { location.href = href; return; }
            slot.innerHTML = pageData.innerHTML;

            document.title = pageData.title;
            if (pushState) {
                history.pushState({ spa: true, href }, pageData.title, href);
            }

            currentPathname = toPathname;
            updateActiveLink(toPathname);

            window.scrollTo(0, 0);

            const init = PAGE_INITS[toPathname];
            if (init) init();

            document.dispatchEvent(new CustomEvent('spa:navigate', { detail: { href, pathname: toPathname } }));
        } finally {
            navigating = false;
        }
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('[data-spa-link]');
        if (!a) return;
        const href = a.getAttribute('href');
        const pathname = normalize(href);
        if (!PAGE_INITS.hasOwnProperty(pathname)) return;
        e.preventDefault();
        navigate(href);
    });

    window.addEventListener('popstate', (e) => {
        const prevPathname = currentPathname;
        const href = e.state?.href ?? location.pathname;
        navigate(href, false, prevPathname);
    });

    window.SpaRouter = { navigate };
})();
