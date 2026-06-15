# DB & CDN Resilience — Design Spec

**Date:** 2026-06-15
**Status:** Implemented locally on `main` (commit `de4116c` + uncommitted working tree). Not yet pushed. Captured here so the work can be rebuilt cleanly after a reset to `origin/main`.

## Problem

When the backend or a third-party CDN is unreachable, the site degrades badly:

1. **Supabase DB unreachable** (e.g. project paused/restored, network block). Supabase-js calls have no timeout → loading spinners spin forever; clicking sign-in bounces the browser toward a dead OAuth URL. Root backend cause: a pause/restore stripped the default schema GRANTs on `user_profiles`, so every profile query returned `permission denied`, breaking sign-in.
2. **supabase-js CDN (jsdelivr) unreachable.** The library is loaded as a **render-blocking `<script>`** placed *before* the site's own `data.js` and page-init scripts on every page. When jsdelivr is slow/down, the HTML parser stalls on it and `data.js` + `appInit`/`landscapeInit` never run → "0 tools shown", spinner forever. This bug is also present on production (same tag, no `defer`); prod simply isn't hitting the outage.

## Goals

- No infinite spinners. Every DB-dependent call fails fast (timeout).
- DB-dependent UI (sign-in, `+ Suggest`, `Suggest an edit`, reviews) hides silently when the DB is unreachable, rather than erroring or hanging.
- The page's own static content (search, landscape) renders even when the supabase-js CDN is unreachable.
- No behaviour change when everything is healthy.

## Design

### Layer 1 — Backend GRANT hotfix
- `supabase/migrations/010_grant_user_profiles.sql`: `GRANT SELECT, UPDATE ON public.user_profiles TO authenticated; GRANT SELECT ON public.user_profiles TO anon;` (idempotent).
- `008_user_profiles.sql`: backfilled with the same GRANTs and made idempotent (`IF NOT EXISTS`, `DROP TRIGGER/POLICY IF EXISTS`) so a from-scratch rebuild is correct. RLS decides *which* rows; GRANT decides table access at all — both layers required.

### Layer 2 — Timeouts + health gate (`js/supabase-client.js`)
- `DB_TIMEOUT_MS = 4000`.
- `withTimeout(promise, ms)` — `Promise.race` against a timeout that rejects with `db-timeout`.
- `isDatabaseHealthy(forceFresh=false)` — memoized per-page-load probe. Uses a **raw `fetch` HEAD** to `SUPABASE_URL + '/rest/v1/'` with `AbortController` (NOT supabase-js, whose internal retry can mask an unreachable host). ANY HTTP response (even 401/404/permission) = healthy; only network error/timeout = unhealthy. `forceFresh` re-probes (used at sign-in click time so a backend that died after load is caught).
- `getCurrentUser`, `getSession`, `listMySuggestions`, `isSuggestionsAvailable` wrapped in `withTimeout` (each returns a safe value on timeout).
- `isSuggestionsAvailable()` **fails open**: only a definitive table-missing error (`42P01` / `PGRST204`) means unavailable; timeouts / auth errors / unexpected PostgREST codes do NOT hide the button (fixes "appears then disappears" for authed users).

### Layer 3 — Consumers gate on health
- `js/auth-ui.js`: if `isDatabaseHealthy()` is false, clear `#auth-container` (no forever-spinner, no dead sign-in button). Guarded with `typeof … === 'function'` so test stubs without the method still render. Sign-in click handler re-checks `isDatabaseHealthy(true)` before redirecting; if unhealthy, alert "Sign-in is temporarily unavailable" and bail (never navigate to dead OAuth URL).
- `js/suggest.js` bootstrap: **two-layer gate** — check `isDatabaseHealthy()` FIRST (DB down → `suggestions-disabled`, hide all entry points incl. tool-page `#tool-suggest-open`), then `isSuggestionsAvailable()` (table missing → disabled). Without the health-first check, a fully unreachable DB leaves the tool-page button visible (because `isSuggestionsAvailable` fails open).
- `_layouts/tool.html`: reviews section hides (`reviewsSection.hidden = true`) when `isDatabaseHealthy()` is false, instead of "Loading reviews…" forever. Guarded for stubs.

### Layer 4 — CDN non-blocking (the "0 tools" fix)
- Add `defer` to the supabase-js CDN `<script>` in all 8 files: `index.html`, `landscape.html`, `guides.html`, `admin.html`, `my-suggestions.html`, `my-reviews.html`, `_layouts/tool.html`, `_layouts/learn.html`.
- Safe because `getSupabase()` is lazy (guards on `window.supabase`) and `isDatabaseHealthy()` needs only `SUPABASE_URL` (raw fetch), not the library. `defer` runs the CDN at end-of-parse, before `DOMContentLoaded`, so auth/init handlers still find `window.supabase`.
- **Known gap at time of capture:** homepage verified fixed under a *hanging* CDN; landscape's data/init also confirmed to run, but a full end-to-end "431 tools shown" assertion under a hung CDN was still being stabilised (stats render races the `commit` wait in the test). Revisit when rebuilding.

### Auth perf (commit `de4116c`, related)
- `getCurrentUser()` uses `getSession()` (localStorage, no network) instead of `getUser()` (server round-trip) → instant auth reads on every nav.
- `getUserProfile()` caches in `sessionStorage` keyed by user ID; `forceFresh` bypasses on real `SIGNED_IN`.
- `updateLastSignIn()` removed from page-load path; only fires on actual `SIGNED_IN`.

## Tests
- `tests/db-unavailable.spec.js` — DB-down hides `+ Suggest`/auth/reviews; DB-up reveals them; sign-in click does not navigate to dead OAuth URL. (5 tests, passing.)
- `tests/cdn-resilience.spec.js` — page renders its own data when jsdelivr **hangs** (must simulate a hang via an unresolved route, NOT `route.abort()`, which unblocks instantly and hides the bug). Use `waitUntil: 'commit'` since a hung render-blocking script delays DCL.
- `tests/suggest.spec.js` — stubs updated with `isDatabaseHealthy`; fail-open cases (timeout→visible, auth-error→visible).

## Files touched
`js/supabase-client.js`, `js/auth-ui.js`, `js/nav-init.js`, `js/suggest.js`, `_layouts/tool.html`, `_layouts/learn.html`, `index.html`, `landscape.html`, `guides.html`, `admin.html`, `my-suggestions.html`, `my-reviews.html`, `supabase/migrations/008_user_profiles.sql`, `supabase/migrations/010_grant_user_profiles.sql`, `tests/db-unavailable.spec.js`, `tests/cdn-resilience.spec.js`, `tests/suggest.spec.js`.

## Rebuild order after reset
1. Apply migration 010 to prod DB (and 008 backfill) — fixes sign-in at the backend.
2. Layer 2 (supabase-client timeouts + health gate).
3. Layer 3 (auth-ui, suggest bootstrap, tool.html gates).
4. Layer 4 (`defer` on CDN — independent, highest user-visible impact).
5. Tests.

## Recovery pointer
Committed auth-resilience: SHA `de4116c`. Uncommitted CDN-defer / suggest-gate / migration-010 work was in the working tree at capture time — if reset+clean is run, recover from this spec (rebuild) since untracked files are deleted by `git clean`. The `defer` change is a one-line edit per file (8 files). Recover committed pieces with `git checkout 61ed540 -- <path>`.
