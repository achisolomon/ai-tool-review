# Client-Side SPA Router — Design Spec

**Date:** 2026-06-15
**Status:** Implemented locally on `main` (commits `eea236e`, `5c178f7`, `6050be8`, `056a89d`, `61ed540` + uncommitted `js/router.js`, `js/card-glow.js`, `tests/spa-navigation.spec.js`). Not yet pushed. Candidate for discard; captured here so it can be rebuilt cleanly if desired. **This is a larger, riskier change than the resilience work and is the prime suspect for local fragility — keep it separate from the resilience fixes.**

## Goal

Make navigation between the three primary pages — Search (`/`), Landscape (`/landscape.html`), Guides (`/guides/`) — instant by swapping content client-side instead of full page reloads, preserving the constellation/hero background and avoiding re-running shared bootstrap (auth, nav) on every navigation.

## Design

### Re-callable page init (commits `5c178f7`, `eea236e`)
- `js/app.js`: wrap the homepage `DOMContentLoaded` body in `window.appInit()`; keep a `DOMContentLoaded` listener that calls it on first load.
- `js/landscape.js`: same pattern → `window.landscapeInit()`.
- `js/hero-map` (or equivalent): expose `window.HeroMap.start()` / `.stop()` so the router can tear down / restart the animated background on navigation.
- `js/card-glow.js`: expose `window.CardGlow.init()` for re-init after content swap.

### Markup slots (commit `6050be8`)
- Each SPA page wraps its swappable region in `#page-content`.
- Nav links that participate get `data-spa-link`.
- `index.html` gains a `#search-input` landmark for test detection.

### Router (`js/router.js`, commits `056a89d`, `61ed540`)
- `PAGE_INITS` maps pathname → init hook (`/` → appInit + HeroMap.start + CardGlow.init; `/landscape.html` → landscapeInit; `/guides/` → none).
- `navigate(href, pushState=true, fromOverride)`:
  - `navigating` boolean guard prevents concurrent-fetch races (commit `61ed540`).
  - `teardown(fromPathname)` stops HeroMap when leaving `/`.
  - `fetchPage(href)` fetches with header `X-SPA-Request: 1`, parses via `DOMParser`, extracts `#page-content` innerHTML + `<title>`.
  - On fetch failure or missing slot → hard `location.href = href` fallback.
  - Swaps innerHTML, sets title, `history.pushState`, updates `nav-active` via `[data-spa-link]`, `scrollTo(0,0)`, runs the page init, dispatches `spa:navigate`.
- Click delegation on `[data-spa-link]`: only intercepts if the target pathname is in `PAGE_INITS`; otherwise normal navigation.
- `popstate` handler re-navigates (no pushState), passing the previous pathname so teardown targets the right page.
- Exposes `window.SpaRouter = { navigate }`.
- Loaded in all 3 SPA pages.

## Tests
- `tests/spa-navigation.spec.js` — 13 tests: HeroMap stop/start API, `window.appInit`/`landscapeInit` exposure, navigation/title/active-link/popstate behaviour.

## Known risks / why it may be discarded
- Re-running `appInit`/`landscapeInit` after a DOM swap must be idempotent — duplicate event listeners, double-bound handlers, or stale closures are easy to introduce.
- Content swap bypasses the per-page `<script>` tags in the fetched document — any page-specific inline script in the swapped HTML will NOT run. Init must be fully captured in the `PAGE_INITS` hooks.
- Interaction with the resilience work: both touch page init timing. They were developed in parallel and their combination was not fully verified.
- The CDN-defer fix (resilience spec) is orthogonal and more important; do not let the SPA rewrite block shipping it.

## Files touched
`js/router.js` (new), `js/app.js`, `js/landscape.js`, `js/card-glow.js`, hero-map module, `index.html`, `landscape.html`, `guides.html` (slots + `data-spa-link` + router script), `tests/spa-navigation.spec.js`.

## Rebuild order if revived
1. Re-callable init (`appInit`/`landscapeInit`/`HeroMap`/`CardGlow`) — verify idempotency in isolation first.
2. Markup slots + `data-spa-link`.
3. Router + tests.
4. Verify against the resilience work (esp. CDN-defer and health gates) together before pushing.

## Recovery pointer
The 6 implemented commits (SPA + auth-resilience) are at SHA `61ed540` (parent chain back to `487c63b` = origin/main baseline at capture time). After a reset to origin/main, recover any file with:
`git checkout 61ed540 -- <path>`  or inspect with `git show 61ed540:<path>`.
