(function () {
    'use strict';

    // Route table. Each init(params) receives matched URL params as { [name]: string }.
    // Within each group (static, then param), declaration order is the tiebreaker —
    // declare more specific patterns first.
    const ROUTES = [
        { pattern: '/',               init: () => {
            if (window.appInit) window.appInit();
            if (window.HeroMap) window.HeroMap.start();
            if (window.CardGlow) window.CardGlow.init();
        } },
        { pattern: '/landscape.html', init: () => { if (window.landscapeInit) window.landscapeInit(); } },
        { pattern: '/guides/',        init: () => { /* guides index — static */ } },
        { pattern: '/guides/:slug/',  init: () => { if (window.articlePageInit) window.articlePageInit(); } },
        { pattern: '/tools/:slug/',   init: (p) => { if (window.toolPageInit) window.toolPageInit(p.slug); } },
    ];

    // Compile a route pattern to a regex; ':name' segments become capture groups.
    function compile(pattern) {
        const names = [];
        // Escape regex metacharacters in the literal parts, then turn ':name'
        // segments into capture groups. Escaping first keeps '.' in paths like
        // '/landscape.html' literal instead of a wildcard.
        const escaped = pattern.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
        const rx = escaped.replace(/:[^/]+/g, (m) => { names.push(m.slice(1)); return '([^/]+)'; });
        return { re: new RegExp('^' + rx + '$'), names };
    }

    // Exact patterns first, then param patterns, so '/guides/' beats '/guides/:slug/'.
    const COMPILED = ROUTES
        .map(r => ({ ...r, ...compile(r.pattern), isParam: r.pattern.includes(':') }))
        .sort((a, b) => (a.isParam === b.isParam) ? 0 : a.isParam ? 1 : -1);

    function matchRoute(pathname) {
        for (const r of COMPILED) {
            const m = r.re.exec(pathname);
            if (m) {
                const params = {};
                r.names.forEach((n, i) => { params[n] = m[i + 1]; });
                return { init: r.init, params };
            }
        }
        return null;
    }

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
        // Leaving an article: disconnect its scroll-spy observer.
        if (/^\/guides\/.+\//.test(fromPathname) && window.articlePageTeardown) {
            window.articlePageTeardown();
        }
    }

    async function fetchPage(href) {
        const res = await fetch(href, { headers: { 'X-SPA-Request': '1' } });
        if (!res.ok) throw new Error(`fetch ${href} → ${res.status}`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const content = doc.getElementById('page-content');
        const title = doc.querySelector('title')?.textContent ?? document.title;
        const headNodes = Array.from(doc.querySelectorAll('head [data-spa-head]'));
        return { innerHTML: content?.innerHTML ?? '', title, headNodes };
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
            // Swap head metadata so in-session navigation keeps meta/og accurate.
            document.head.querySelectorAll('[data-spa-head]').forEach(n => n.remove());
            pageData.headNodes.forEach(n => document.head.appendChild(n.cloneNode(true)));
            if (pushState) {
                history.pushState({ spa: true, href }, pageData.title, href);
            }

            currentPathname = toPathname;
            updateActiveLink(toPathname);

            window.scrollTo(0, 0);

            const route = matchRoute(toPathname);
            if (route) route.init(route.params);

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
        if (!matchRoute(pathname)) return;
        e.preventDefault();
        navigate(href);
    });

    window.addEventListener('popstate', (e) => {
        const prevPathname = currentPathname;
        const href = e.state?.href ?? location.pathname;
        navigate(href, false, prevPathname);
    });

    window.SpaRouter = { navigate, matchRoute };
})();
