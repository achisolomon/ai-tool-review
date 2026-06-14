# Guard sign-in when the auth backend is unreachable

**Date:** 2026-06-14
**Status:** Design — pending implementation plan

## Problem

When the Supabase project host (`*.supabase.co`) is unreachable, the sign-in
flow fails badly. Clicking sign-in calls `signInWithOAuth`, which redirects the
browser to `https://<project>.supabase.co/auth/v1/authorize?...`. If that host is
down, the user is bounced to a browser error page (`ERR_CONNECTION_TIMED_OUT`)
with no explanation — the "jump out of the blue" observed during the 2026-06-14
Supabase `.co` TLD routing incident.

**What already exists (discovered during planning):**

- `supabase-client.js` exports `isDatabaseHealthy()` — a probe
  (`withTimeout(supabase.from('tools').select('id', {head, count}))`, ~4s via
  `DB_TIMEOUT_MS`) that returns `true`/`false` and never throws. **It memoizes
  the result in `_healthPromise` for the whole page load.**
- The **toolbar** button (`auth-ui.js`) calls `isDatabaseHealthy()` **on load**
  and, if unreachable, removes the auth control. `tests/db-unavailable.spec.js`
  covers this load-time case.

**The bug (observed):** the dead-end still happens from the toolbar after the
page has been open a few minutes — clicking sign-in bounces to
`…supabase.co/auth/v1/authorize` → `ERR_CONNECTION_TIMED_OUT`. Two causes:

1. **Stale cache.** `isDatabaseHealthy()` memoizes the first (healthy) result for
   the entire page load. If the backend goes down *after* load (free-tier pause,
   `.co` incident, network blip), the cached `true` is never refreshed.
2. **No click-time guard on the toolbar.** `auth-ui.js`'s sign-in click handler
   calls `signInWithProvider` directly with **no** re-check — so even a fresh
   check wasn't wired in. The card (`auth-signin.js`) has no guard at all.

**The fix (three parts):**

1. Give `isDatabaseHealthy(forceFresh = false)` a `forceFresh` option that
   bypasses/refreshes the memoized promise, so a click-time re-check does a real
   round-trip.
2. **Toolbar (`auth-ui.js`):** add a click-time `isDatabaseHealthy(true)`
   re-check before `signInWithProvider`; if unreachable, do not redirect — show a
   message and re-render the control as unavailable.
3. **Card (`auth-signin.js`):** add load-time disable + click-time
   `isDatabaseHealthy(true)` re-check (the path on `admin.html`,
   `my-suggestions.html`, `my-reviews.html`, `suggest.js`).

This is a real, recurring failure mode. We close every sign-in path —
load-time **and** the stale-cache click-time race.

## Scope

**In scope:** guard the sign-in buttons (toolbar + sign-in card) so they never
redirect to a dead OAuth URL, and communicate "temporarily unavailable."

**Out of scope (YAGNI):** site-wide degraded-mode banner; disabling Suggest /
My Reviews / Admin; periodic background health polling. Read-only browsing of
tools is unaffected and needs no changes.

## Approach

Reuse `SupabaseClient.isDatabaseHealthy()` but make it **re-checkable** via a
`forceFresh` flag, then add a **click-time re-check** to BOTH sign-in paths
(toolbar `auth-ui.js` and card `auth-signin.js`), plus a load-time disable on the
card. The toolbar already disables on load; the missing piece there is the
click-time fresh re-check that defeats the stale cache.

Rejected alternatives:

- **New `checkReachable()` helper:** redundant — extend `isDatabaseHealthy()`
  instead. YAGNI.
- **Leave `auth-ui.js` untouched:** rejected — the observed dead-end comes from
  the toolbar after the cache goes stale. It must get the click-time re-check.
- **Periodic background poller:** overkill. YAGNI.

## Components

### 1. `js/supabase-client.js` — make the probe re-checkable

Change `isDatabaseHealthy()` to accept `forceFresh`:

```
function isDatabaseHealthy(forceFresh = false)
```

- When `forceFresh` is falsy: existing behavior (return memoized `_healthPromise`
  if present, else create it). Preserves the one-probe-per-load contract used by
  load-time gates.
- When `forceFresh` is truthy: ignore any cached promise, run a new probe, and
  store it as the new `_healthPromise` (so subsequent default callers see the
  refreshed result). Still `withTimeout`, still never throws.

### 2. `js/auth-ui.js` — toolbar sign-in button (click-time re-check)

- Load-time behavior unchanged (already removes control if unhealthy on load).
- In `setupDropdownHandlers`, the existing `#auth-signin-btn` click handler must,
  before `signInWithProvider('github')`, `await isDatabaseHealthy(true)`. If
  `false`: do **not** redirect; surface the unavailable copy (reuse the page's
  alert/toast path already present) and re-render the auth control via
  `initAuthDropdown` so it collapses to the unavailable state. If `true`: proceed
  as today.

### 3. `js/auth-signin.js` — sign-in card

Reachability source: `window.SupabaseClient.isDatabaseHealthy`.

- **`renderSignInButtons()` / `renderSignInCard()`** unchanged structurally.
- **`initSignInHandlers(container, onError)`** gains a load-time pre-check:
  `isDatabaseHealthy()` (cached is fine here). If `false` (or client absent):
  - set each `.auth-provider-btn` to `disabled`, add class
    `auth-signin-unavailable`, `title="Sign-in is temporarily unavailable"`;
  - insert an inline `.auth-signin-unavailable-note` with the copy below.
- **Click handler:** before `signInWithProvider(provider)`, `await
  isDatabaseHealthy(true)` (fresh). If `false`: show the note, do **not**
  redirect, re-enable the button for retry. If `true`: proceed as today.

Default-closed: a missing `isDatabaseHealthy` function is treated as unreachable.

### 2. `css/auth.css` — styling + copy

- `.auth-signin-unavailable`: muted appearance, `cursor: not-allowed`,
  reduced opacity.
- `.auth-signin-unavailable-note`: small muted message block under the buttons.
- **User-facing copy:** "Sign-in is temporarily unavailable. Please try again in
  a few minutes."

## Data flow

```text
TOOLBAR (auth-ui.js):
  load → isDatabaseHealthy() (cached) → unhealthy: remove control (existing)
  click sign-in → isDatabaseHealthy(true) FRESH
      healthy    → signInWithProvider('github') → OAuth redirect (existing)
      unreachable→ no redirect; show unavailable copy; re-render control

CARD (auth-signin.js):
  initSignInHandlers() → isDatabaseHealthy() (cached)
      healthy    → provider buttons enabled (normal)
      unreachable→ buttons disabled + unavailable note shown
  click provider button → isDatabaseHealthy(true) FRESH
      healthy    → signInWithProvider(provider) → OAuth redirect (existing)
      unreachable→ show note, no redirect, re-enable for retry
```

The **fresh** (`forceFresh: true`) click-time check is the key fix for the
observed bug: it defeats the stale page-load cache when the backend dies while
the page sits open.

## Error handling

- The guard is non-fatal: it only degrades the card to "unavailable," never
  throws. `isDatabaseHealthy()` already swallows its own errors.
- **Default-closed on the sign-in path:** an unreachable/inconclusive probe (or a
  missing `isDatabaseHealthy`) is treated as **unavailable**. A false
  "unavailable" only asks the user to retry (safe); a false "reachable" would
  reintroduce the dead-end redirect we are fixing.

## Testing (Playwright)

Extend `tests/db-unavailable.spec.js` (host-abort pattern:
`page.route('**://*.supabase.co/**', route => route.abort())`).

- **Card, unreachable at load** (`admin.html`): provider buttons `disabled` +
  `auth-signin-unavailable`, `.auth-signin-unavailable-note` visible, click does
  not navigate.
- **Card, reachable** (regression): healthy host → buttons enabled, no note;
  `auth-signin.spec.js` still passes.
- **Stale-cache click race (the reported bug)** — the important new test:
  1. Load `/` with the host **healthy** so the toolbar renders an enabled
     sign-in button and `_healthPromise` caches `true`.
  2. **Then** start aborting `**://*.supabase.co/**` (simulating the backend
     dying while the page sits open).
  3. Click the toolbar sign-in button.
  4. Assert the page does **not** navigate to `…supabase.co/auth/v1/authorize`
     (URL stays on the site) — proving the fresh `isDatabaseHealthy(true)`
     re-check caught the now-dead backend.

## Files touched

- `js/supabase-client.js` — add `forceFresh` param to `isDatabaseHealthy()`.
- `js/auth-ui.js` — click-time `isDatabaseHealthy(true)` re-check on the toolbar
  sign-in button (load-time behavior unchanged).
- `js/auth-signin.js` — load-time disable + click-time fresh re-check on the card.
- `css/auth.css` — `.auth-signin-unavailable` + `.auth-signin-unavailable-note`.
- `tests/db-unavailable.spec.js` (extend) — card load case, regression, and the
  stale-cache toolbar click-race case.
