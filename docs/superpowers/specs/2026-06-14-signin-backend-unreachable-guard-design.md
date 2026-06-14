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

The current code only guards against the Supabase **library** failing to load
(`if (!supabase) ...`). It has **no concept of "library loaded, but the host is
unreachable."** `getCurrentUser()` and `signInWithOAuth()` have no timeout, so a
dead host produces hangs and dead-end redirects instead of a clear message.

This is a real, recurring failure mode (free-tier auto-pause, platform
incidents). We want the UI to fail gracefully on the sign-in path only.

## Scope

**In scope:** guard the sign-in buttons (toolbar + sign-in card) so they never
redirect to a dead OAuth URL, and communicate "temporarily unavailable."

**Out of scope (YAGNI):** site-wide degraded-mode banner; disabling Suggest /
My Reviews / Admin; periodic background health polling. Read-only browsing of
tools is unaffected and needs no changes.

## Approach (chosen: A)

Add a single reachability helper to `SupabaseClient` and wire it into the two
sign-in entry points. Both UIs pre-check on load (to render a disabled
"unavailable" state) and re-check on click (safety net in case status changed).

Rejected alternatives:
- **B — wrap only `signInWithProvider`:** runs only on click, so it cannot do the
  load-time disable. Doesn't meet "both."
- **C — periodic background poller:** overkill for guarding a button. YAGNI.

## Components

### 1. `js/supabase-client.js` — `checkReachable()`

```
async function checkReachable(timeoutMs = 4000) → boolean
```

- Issues `fetch(`${SUPABASE_URL}/auth/v1/health`, { signal, headers: { apikey } })`
  with an `AbortController` aborting after `timeoutMs` (default **4000ms**).
- Returns `true` on **any** HTTP response (including 4xx — the host is up and
  answering). Returns `false` on network error, DNS failure, timeout, or abort.
- Never throws — all failures are caught and mapped to `false`.
- Exported on `window.SupabaseClient`. Single source of truth for reachability.

Rationale for "any response = reachable": we are testing whether the host
answers, not whether health is 200. A 401/403/404 still proves the connection
path works, so the OAuth redirect would also connect.

### 2. `js/auth-ui.js` — toolbar sign-in button

- In `initAuthDropdown`, when rendering the **logged-out** state, `await
  checkReachable()`. If `false`:
  - render the button with `disabled`, class `auth-signin-unavailable`,
    `title="Sign-in is temporarily unavailable"`, label "Sign-in unavailable".
- In the existing sign-in click handler, before calling `signInWithProvider`,
  `await checkReachable()`. If `false`: show the inline unavailable state and do
  **not** redirect; re-enable shortly so the user can retry.

### 3. `js/auth-signin.js` — sign-in card (GitHub / Google buttons)

- Same pattern in `initSignInHandlers`: pre-check disables both provider buttons
  with an unavailable note; click re-checks before redirect.

### 4. `css/auth.css` — styling + copy

- `.auth-signin-unavailable`: muted appearance, `cursor: not-allowed`.
- Inline message style for the unavailable note.
- **User-facing copy:** "Sign-in is temporarily unavailable. Please try again in
  a few minutes."

## Data flow

```
page load → render logged-out sign-in UI → checkReachable()
    reachable  → button enabled (normal)
    unreachable→ button disabled + unavailable copy

user clicks enabled button → checkReachable() (re-check)
    reachable  → signInWithProvider() → OAuth redirect (existing behavior)
    unreachable→ inline unavailable copy, no redirect, re-enable for retry
```

## Error handling

- `checkReachable()` is non-fatal everywhere; it only ever degrades the UI to
  "unavailable," never throws.
- **Default-closed on the sign-in path:** an inconclusive/timed-out probe is
  treated as **unreachable**. A false "unavailable" only asks the user to retry
  (safe), whereas a false "reachable" reintroduces the dead-end redirect we're
  fixing.

## Testing (Playwright)

- **Unreachable:** route `**/auth/v1/health` to abort/timeout →
  - toolbar button and card buttons render disabled with the unavailable copy;
  - clicking does **not** navigate away from the page.
- **Reachable (regression):** route `**/auth/v1/health` to 200 →
  - buttons enabled; clicking triggers the OAuth redirect (existing behavior
    preserved).
- Cover both `auth-ui.js` (toolbar) and `auth-signin.js` (card) entry points.

## Files touched

- `js/supabase-client.js` — add `checkReachable`, export it.
- `js/auth-ui.js` — pre-check + click re-check on toolbar button.
- `js/auth-signin.js` — pre-check + click re-check on card buttons.
- `css/auth.css` — unavailable state + message styling.
- `tests/` — new spec(s) for unreachable + reachable paths.
