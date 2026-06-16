# Lazy, Background-Only Supabase Loading — Design Spec

**Date:** 2026-06-15
**Status:** Approved design. Supersedes the "Layer 4 — CDN defer" approach in `2026-06-15-db-cdn-resilience-design.md` (defer was insufficient: a hung deferred script keeps `DOMContentLoaded` from firing, so page init never runs).

## Principle

The site is static. Content — landscape, tool pages, search — renders from the self-hosted `js/data.js` and must **never** wait for, call, or reference Supabase or its CDN. Supabase exists only for authentication, reviews, and suggestions. It loads **once, in the background, on demand**, so the user never perceives it.

## Problem being solved

Today every page loads `@supabase/supabase-js` from jsdelivr as a render-blocking `<script>` placed *before* the site's own `data.js`/init scripts. When jsdelivr is slow or unreachable (intermittent, network-dependent — observed both HTTP 000/10s and HTTP 200/0.3s from the same machine within minutes), the browser stalls and the landscape shows "0 tools". `defer` does not fix this: page init runs on `DOMContentLoaded`, and the browser will not fire `DOMContentLoaded` until all `defer` scripts finish — including the hung one. Confirmed empirically: with a hanging deferred CDN, `dclFired=false`, `readyState=interactive` (stuck), landscape shows 0 tools even though `landscapeData` and `landscapeInit` exist in memory.

The library is ~199 KB, downloaded by every visitor on every page, purely for features most visitors never use.

## Architecture

Single chokepoint: `js/supabase-client.js` is the ONLY file that touches `window.supabase` (`getSupabase()` at the `createClient` call). All ~22 other consumers go through `getSupabase()` / `window.SupabaseClient.*`. This makes lazy loading a localized change.

### Component 1 — `ensureSupabase()` (new, in `supabase-client.js`)
- Dynamically injects `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">` (async) into `<head>`.
- Returns a memoized promise that resolves when `window.supabase` is defined, rejects on timeout (reuse `DB_TIMEOUT_MS`, or a dedicated CDN timeout) or script `onerror`.
- Idempotent: at most one injection; concurrent callers share the promise; resolves immediately if `window.supabase` already exists.
- `getSupabase()` stays **synchronous** and unchanged (returns the client if the lib is present, else null). It no longer assumes the lib was loaded at parse time.

### Component 2 — Page markup (all 8 pages)
Remove the static `<script ... supabase-js@2>` tag from: `index.html`, `landscape.html`, `guides.html`, `admin.html`, `my-suggestions.html`, `my-reviews.html`, `_layouts/tool.html`, `_layouts/learn.html`. Nothing loads Supabase at parse time. `data.js` + page-init run immediately, independent of CDN/DB. This permanently fixes the blank-content-on-CDN-blip.

### Component 3 — Toolbar auth (`auth-ui.js`, every page) — cached-session-first
- Read the Supabase session token from `localStorage` synchronously. supabase-js uses no custom `storageKey`, so the default key is `sb-<project-ref>-auth-token`, where `<project-ref>` is the subdomain of `SUPABASE_URL` (e.g. `biclytfukihleuyfpvlr` from `https://biclytfukihleuyfpvlr.supabase.co`). Derive it from `SUPABASE_URL` rather than hardcoding. Token present → render avatar (display name/initial can come from the cached token's user metadata); absent → render "Sign in". No library, no network, instant on every page.
- Logged-out visitor on a static page → nothing further happens; **Supabase never loads**.
- Token present → kick off `ensureSupabase()` in the background to reconcile/refresh the session, then re-render the avatar/menu if state changed (e.g. token expired → revert to "Sign in").
- Keep the existing `isDatabaseHealthy()` semantics for DB-down handling; health probe is a raw `fetch` and does not need the library.

### Component 4 — Auth/DB entry points — await the loader
User-action entry points await `ensureSupabase()` before their first DB call, then proceed as today:
- Sign-in click (`auth-ui.js`): already re-checks `isDatabaseHealthy(true)`; add `await ensureSupabase()` before `signInWithProvider`. On reject → existing "Sign-in is temporarily unavailable" alert.
- Suggest modal (`suggest.js`): await before any `createSuggestion`/probe that needs the client. The bootstrap's health/availability gating stays.
- Reviews on tool pages (`_layouts/tool.html` inline + `reviews-api.js`): await before the first `getSupabase()` use; on reject hide the reviews section (existing behaviour).

## Data flow

```
Page load
  → content renders from data.js              (no Supabase, no CDN)
  → toolbar reads localStorage session         → paints avatar / "Sign in" instantly
Logged-out visitor on static page              → Supabase NEVER loads
User clicks Sign in / opens Suggest, OR a cached session exists
  → ensureSupabase() injects lib (background)  → then DB/auth call
```

## Error handling
- `ensureSupabase()` rejects on CDN timeout / script error. Entry points surface the existing "temporarily unavailable" fallback; content is never affected.
- `isDatabaseHealthy()` continues to guard DB-reachable-but-unhealthy separately (raw fetch, no library).
- `getSupabase()` returning null (lib not yet loaded) must never throw in any consumer — verify each caller already null-guards (most do via `if (!supabase) return …`).

## Testing
- **Content independence:** load `/` and `/landscape.html`; assert ZERO network requests to `cdn.jsdelivr.net` and `*.supabase.co`, and that tools render (`431 tools shown`). This is the core regression guard.
- **Logged-out toolbar:** no session in localStorage → "Sign in" visible, no library loaded.
- **Sign-in click:** triggers `ensureSupabase()`; with CDN reachable → OAuth proceeds; with CDN hung → "temporarily unavailable", no navigation to dead URL (existing `db-unavailable` test, adapted).
- **Cached-session reconcile:** seed a localStorage token → avatar paints immediately; background load reconciles.
- Existing suites (`db-unavailable`, `suggest`, `reviews`, `tool-page`, `supabase-config`) still pass. Note: `supabase-config: getSupabase returns a valid client` must now first await `ensureSupabase()` (or the test seeds the lib) since the lib is no longer auto-loaded.
- Remove the temporary `cdn.jsdelivr.net` block added to `tests/global-setup.js` — with no parse-time CDN script, it is unnecessary; tests that need the library call `ensureSupabase()` (lib served normally), tests asserting independence intercept per-test.

## Files touched
`js/supabase-client.js` (add `ensureSupabase`), `js/auth-ui.js` (cached-session-first render + await on sign-in), `js/suggest.js` (await at entry), `js/reviews-api.js` and/or `_layouts/tool.html` (await before reviews load), all 8 HTML/layout files (remove static script tag), `tests/global-setup.js` (revert jsdelivr block), new `tests/content-no-supabase.spec.js`, adapt `tests/supabase-config.spec.js`.

## Out of scope
- The **SPA router** (commit `113c53e`) keep/drop is a separate decision, resolved before any push. This spec does not depend on it.
- Self-hosting the library (vs. jsdelivr) is a possible future hardening; not required here since content no longer depends on the CDN at all.

## Recovery / context
Builds on resilience work already on `origin/main` (timeouts, `isDatabaseHealthy`, health gates in auth-ui/nav-init). Prior session SHAs: `de4116c` (auth-resilience), `61ed540` (SPA). Backup of earlier uncommitted work: `/tmp/resilience-backup-20260615/`.
