# SPA Router — Extend to Tool & Article Pages — Design Spec

**Date:** 2026-06-17
**Status:** Approved, pre-implementation
**Builds on:** `2026-06-15-spa-router-design.md` (Phase 1 — the 3-page static router). This is **Phase 2**.

## Goal

Bring individual **tool pages** (`/tools/:slug/`) and **article/guide pages** (`/guides/:slug/`) into the SPA router so the shared toolbar (logo, nav, auth, admin badge) loads **once** and is never re-initialized when navigating between any pages. Eliminate the full-page reload — and the visible re-run of the auth/admin check — that currently happens when entering or moving between tool and article pages.

### Why
Today the router (`js/router.js`) only intercepts `/`, `/landscape.html`, `/guides/`. Tool and article pages are full page loads: the toolbar HTML is re-served and `nav-init.js` re-runs the auth init + admin DB check every time (the ~1s "Admin button pops in" the user observed). They don't even load `router.js`. The toolbar is now a single shared module (`_includes/nav.html`), so the remaining work is making the router cover these page types.

## Non-Goals
- No redesign of tool/article page content or styling.
- No change to how pages are generated/served on **direct load** (crawlers, deep links keep getting full correct HTML).

## Phasing

This ships as **two independent phases** with a checkpoint between them. Phase 1 must be working in the browser before Phase 2 begins.

- **Phase 1 — Guides/article pages** (low risk): Sections 1, 2, 4 (head swap for articles), and the article-link parts of Section 5. Delivers "load once" for articles and proves the router extension end-to-end.
- **Phase 2 — Tool pages** (high risk): Section 3 (the 570-line refactor), head swap for tool pages, and the tool-link parts of Section 5. Begins only after Phase 1 is verified working.

Each phase gets its own implementation plan and its own test runs.

---

## Architecture Overview

Five changes, layered foundation-first:

1. **Router generalization** — exact-match `PAGE_INITS` → pattern-based `ROUTES` with `:param` support.
2. **Article pages into SPA** — low risk; static content, add `#page-content` + load `router.js` + no-op route + `data-spa-link` on article cards.
3. **Tool-page JS refactor** — move ~570 lines of Liquid-interpolated inline JS into `js/tool-page.js` (`window.toolPageInit(slug)`), fed by an embedded JSON data island. Idempotent.
4. **Head-metadata swap** — router replaces `[data-spa-head]` nodes (SEO meta, og:, canonical, JSON-LD) on navigation.
5. **SPA-aware links** — convert `window.location.href = '/tools/...'` hard navigations to `SpaRouter.navigate(...)`.

---

## Section 1 — Router generalization (pattern routes)

Replace the exact-match map:

```js
const ROUTES = [
  { pattern: '/',               init: () => { appInit(); HeroMap.start(); CardGlow.init(); } },
  { pattern: '/landscape.html', init: () => landscapeInit() },
  { pattern: '/guides/',        init: () => {} },                  // guides index (static)
  { pattern: '/tools/:slug/',   init: (p) => toolPageInit(p.slug) },
  { pattern: '/guides/:slug/',  init: () => articlePageInit() },   // individual article
];
```

- `matchRoute(pathname)` → `{ init, params }` or `null`.
- **Precedence:** exact patterns checked before `:param` patterns, so `/guides/` (index) wins over `/guides/:slug/`.
- Click handler ([router.js:101](js/router.js#L101)) changes from `PAGE_INITS.hasOwnProperty(pathname)` to `matchRoute(pathname) !== null`.
- `teardown(fromPathname)` stays; stateful pages (e.g. HeroMap on `/`) keep their teardown entry. Document that "stateful pages need a matching teardown."

### Adding a future page (self-documenting, goes in router.js header comment)
- **Static page:** add `<header class="header">{% include nav.html %}</header>` + `<main id="page-content">`, load `router.js`, add `{ pattern, init: () => {} }`.
- **Page with JS:** also add `js/<page>.js` exposing `window.<page>Init()`, register `{ pattern, init: () => <page>Init() }`.
- **Dynamic/templated:** same as above with a `:param` pattern; matcher extracts params, **no router change needed**.
- **Convention (the rule the whole design rests on):** a page's init MUST be an idempotent named function the router can call — never inline `<script>` that self-runs on load.

---

## Section 2 — Article pages into SPA (low risk)

Article pages use `_layouts/learn.html`, which is mostly static (no per-page JS).

- Add `id="page-content"` to the article `<main>` (currently `<main class="learn-layout">`).
- Load `js/router.js` on the learn layout (and ensure `app.js`/`landscape.js`/`hero-map.js`/`card-glow.js` are available so their inits resolve when navigating *to* those pages — or guard inits with `if (window.x)`).
- `articlePageInit()` is a no-op (static content), but exists so the route is registered.
- Article cards (`guides.html` line 32, `build-spa-site.js` line 33) get `data-spa-link`.

---

## Section 3 — Tool-page JS refactor (highest risk)

`_layouts/tool.html` has ~570 lines of inline JS interpolated by Liquid (`{{ page.* }}`, review data). For the router to re-run it on SPA nav, data must travel **with the HTML**, not be baked into a one-time inline script.

### Mechanism
1. **JSON data island** inside `#page-content`:
   ```html
   <script type="application/json" id="tool-data">
     { "slug": "...", "name": "...", "website": "...", ... }
   </script>
   ```
   Inert (`type="application/json"`) — copied in with the innerHTML swap, no double-execution.
2. **`js/tool-page.js`** exposes `window.toolPageInit(slug)`. On call it:
   - reads & parses `#tool-data`,
   - fetches reviews via existing `reviews-api.js`,
   - renders review summary/list; wires review form, star buttons, suggest-edit modal, delete dialog, auth handlers — same behavior as today, reading from JSON not Liquid.
3. Loads once via the SPA host (like `app.js`/`landscape.js`).

### Idempotency requirements (must be safe to re-run on every tool nav)
- **Modals** (review form, auth, delete) currently `insertAdjacentHTML('beforeend', ...)` onto `document.body` → would stack duplicates. Fix: remove existing instances first, OR move them inside `#page-content` so they swap out automatically.
- **Listeners** on elements inside `#page-content` are fine (old nodes discarded on swap). Listeners on `document`/`body` must be guarded against double-binding.
- **In-flight review fetch:** guard against late resolution painting the wrong tool — check current slug before rendering (or abort stale fetches).
- **stars.js / suggest modal:** expose and call their init from `toolPageInit()` so fresh DOM gets wired.

### Known failure modes this addresses (the "surprises")
1. Stacking duplicate modals → idempotent modal handling.
2. Double-fired listeners (double-post review, self-cancelling toggle) → guarded binding.
3. Stale async reviews painting wrong tool → slug guard.
4. Star/suggest not re-wired → explicit init calls.

---

## Section 4 — Head-metadata swap

Router keeps in-session head metadata accurate (approved: swap everything).

- Mark swappable head nodes with `data-spa-head` in `head-seo.html`, `schema-jsonld.html`, and canonical/og tags.
- `fetchPage()` already parses the fetched `doc`. On navigation: remove current `document.head` `[data-spa-head]` nodes, clone incoming `[data-spa-head]` nodes from `doc` into `document.head`. Title already handled.
- Pages without these tags (3 static pages) → graceful no-op.
- Won't touch stylesheets, scripts, or analytics (only `[data-spa-head]`).

---

## Section 5 — SPA-aware links

Convert hard navigations to router calls:
- `js/app.js` lines 608, 1136, 1149 (`window.location.href = '/tools/${slug}/'`) → `window.SpaRouter.navigate('/tools/${slug}/')` with fallback to `location.href` if `SpaRouter` absent.
- `js/landscape.js` line 309 → same.
- Article cards → `data-spa-link` (handled by click delegation, Section 2).

---

## Test Plan (~24 Playwright tests, extends `spa-navigation.spec.js` / `tool-page.spec.js`)

Technique: set `window.__noReload` on first load; if it survives navigation, no full reload happened (proves SPA). Reuse `reviews.spec.js` helpers; mock review API where a real session is needed.

### Group A — Routing & no-reload
- **A1** search-result tool card → `/tools/:slug/`, no reload
- **A2** landscape tool card → tool page, no reload
- **A3** article card on `/guides/` → `/guides/:slug/`, no reload
- **A4** tool→tool (A→B) swaps content, no reload
- **A5** `/guides/` index matches before `/guides/:slug/` (precedence)
- **A6** browser back from tool page restores previous page
- **A7** direct deep-load of `/tools/:slug/` serves full HTML (crawler path intact)

### Group B — Idempotency
- **B1** after A→B→A→B, exactly **one** review-form modal in DOM
- **B2** after multiple navs, exactly one auth modal & one delete dialog
- **B3** "show more" toggle fires once (text toggles, not self-cancels)
- **B4** review submit handler fires once (no double-post)
- **B5** star button toggles correctly after SPA nav
- **B6** suggest-edit modal opens after SPA nav

### Group C — Stale data / race
- **C1** fast A→B nav: B shows B's reviews, never A's
- **C2** `#tool-data` JSON matches current slug after nav

### Group D — Head metadata swap
- **D1** `document.title` = B's title after nav
- **D2** `<meta name="description">` = B's description
- **D3** `<link rel="canonical">` = B's URL
- **D4** og: tags reflect B
- **D5** JSON-LD `#schema` = B's structured data

### Group E — Toolbar "load once"
- **E1** `AuthUI.init` called once across tool→tool nav (spy on call count)
- **E2** auth avatar/admin badge HTML persists unchanged across tool nav

**Phase split:** Phase 1 (guides) covers A3, A5, A6 (article variants), the article cases of D1–D3, and E1–E2 across guides nav. Phase 2 (tools) covers A1, A2, A4, A7, all of B and C, full D, and E across tool nav.

Tests written TDD-style alongside each implementation task. Run via `npm test` (existing harness; no new infra).

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 570-line tool.html refactor introduces regressions | Two-mode test matrix (direct load + SPA nav) for every interactive feature; TDD per task |
| Idempotency bugs (dup modals, double listeners) | Group B tests; modal cleanup + guarded binding by design |
| Stale async data on fast nav | Group C tests; slug guard in `toolPageInit` |
| Head metadata drift hurts social previews | Group D tests; `data-spa-head` swap |
| Scripts re-executing on swap | Router extracts only innerHTML + JSON island (inert); page JS via init functions only |

## Prerequisite (done)

- `build-spa-site.js` article links corrected from `/learn/:slug/` to `/guides/:slug/` to match Jekyll's collection permalink (`_config.yml` learn → `/guides/:slug/`). Committed separately ahead of this work.

## Rollout
Foundation-first ordering: Section 1 (router) → Section 2 (articles, low risk, proves the extension) → Section 4 (head swap) → Section 3 (tool refactor, highest risk) → Section 5 (links) — with tests landing per section.
