# Local Supabase auth/DB outage — root cause + fix (handoff)

**Date:** 2026-06-15 (overnight session)
**Status:** ✅ FIXED on localhost:8080. Auth + DB verified working end-to-end in a real browser.

---

## TL;DR

Your Supabase project was **never broken**. The DB, auth, config, GRANTs, and your
two test users are all healthy (verified server-side via the Management API).

The real problem: **your machine/network can't open a TCP connection on :443 to the
specific Cloudflare edge IPs that DNS hands out for `*.supabase.co`**
(`104.18.38.10` / `172.64.149.246`). The browser gets `ERR_CONNECTION_TIMED_OUT`,
so the whole DB/auth stack *looks* down. Other Cloudflare edges route to the exact
same project fine.

The fix (no sudo, no network change, no /etc/hosts): `server.js` now runs a
**same-origin reverse-proxy** at `/__supabase/*` that forwards to a known-good
Cloudflare edge IP (preserving the real Host/SNI). On localhost the Supabase client
talks to `http://localhost:8080/__supabase` instead of the blocked direct URL.

---

## How it was proven (not a guess)

| Test | Result |
|------|--------|
| `curl` IPv4 → `*.supabase.co` (DNS edge) | `000` — TCP connect never completes |
| `curl -6` IPv6 | `000` (no AAAA records anyway) |
| Real Chromium browser at :8080 | `ERR_CONNECTION_TIMED_OUT` |
| Same host via edge `162.159.140.229` | **HTTP 200 in 0.4s** |
| Management API: project status | `ACTIVE_HEALTHY` (dev AND prod) |
| Management API: direct DB query | works — `postgres`, 2 users, 2 profiles |
| `user_profiles` GRANTs (server-side) | already present for anon + authenticated |
| Auth URL config | correct — Site URL + redirects = localhost:8080 |
| Edge logs before fix | empty (no traffic arriving = client can't connect) |
| Edge/auth logs after fix | show our sign-in + logout from localhost:8080 ✅ |

**Ruled out:** Supabase pause, missing GRANTs (migration 010), the 9 PM merge,
auth redirect URLs, the Pritunl VPN (disconnecting it didn't help), IPv6, DNS
resolver choice. The block is purely an upstream network path to those edge IPs.

## End-to-end browser verification (real Chromium at :8080)

```
App DB health probe ........ healthy: true
signInWithPassword ......... ok, hasSession: true
getCurrentUser ............. localdev-test@aitoolreview.ai
read own user_profiles (RLS) ✅ profile returned
read tools ................. ✅ 3 rows
updateLastSignIn (UPDATE) .. ✅ 204
signOut .................... ✅
```
All real Supabase calls returned 200/204. The "Sign in" and "+ Suggest" buttons
(which `a94d3f4` gates on DB health) are now visible = health gate is green.

---

## What changed (files)

- **`server.js`** — added a local-dev reverse-proxy (`/__supabase/*` → working CF
  edge, real Host/SNI preserved). Configurable via env:
  `SUPABASE_TARGET_HOST`, `SUPABASE_EDGE_IPS` (comma-list, failover order).
- **`js/supabase-client.js`** — on localhost, base URL becomes
  `window.location.origin + '/__supabase'`. Escape hatch: set
  `window.__SUPABASE_DIRECT = true` before the script to force the direct URL once
  the network path is fixed.
- **`_site/js/supabase-client.js`** — synced copy (server serves from `_site`).
  A `bundle exec jekyll build` will regenerate it from source.

## Run it

```bash
cd "ai-tool-review"
node server.js            # serves :8080 + the /__supabase proxy
# open http://localhost:8080  → sign in works
```
Server currently running in background (pid was 59536).

---

## ⚠️ Known limitation: browser OAuth (GitHub/Google)

Email/password + session auth + all DB/REST work through the proxy. **Browser-based
OAuth may not fully complete**, because the provider's final callback redirects to
the *real* `https://yewcxcvngvdtsnigtmwd.supabase.co/auth/v1/callback`, which the
browser still can't reach (same edge-IP block). Options:
1. Fix the underlying network so the direct domain is reachable (then set
   `window.__SUPABASE_DIRECT = true` and remove the proxy), **or**
2. Add `/etc/hosts` entries pinning the supabase hostnames to a working edge
   (needs sudo — I was not authorized to do this):
   ```
   162.159.140.229 yewcxcvngvdtsnigtmwd.supabase.co
   162.159.140.229 biclytfukihleuyfpvlr.supabase.co
   ```
   With that, OAuth works too and the proxy is unnecessary.

## CONFIRMED ROOT CAUSE: ISP (Bezeq) drops TCP/443 to two Cloudflare /24s

Proven, not theorized:
- ICMP/traceroute REACHES `104.18.38.10` (completes at hop 12), but **TCP SYN to
  :443 is dropped**; port **80 on the same IP is OPEN**.
- A **generic** `https://example.com` forced to `104.18.38.10:443` also times out →
  the block is the IP/port, NOT supabase-specific and NOT your code.
- Neighbor IPs in the same /16 (`104.18.1.10`, `104.18.39.10`, `104.18.100.10`) are
  OPEN on :443 → the filter is surgical: `104.18.38.0/24` + `172.64.149.0/24`.
- The bad route diverges at hop 7 onto `147.235.111.246` → `bezeqint.net` (Bezeq).
- Started ~21:00 on 2026-06-14 (matches "worked until 9 PM"). Nothing on the machine
  or in the Supabase project changed at that time (verified /etc/hosts, resolver,
  project status/events).

Your Supabase project DNS resolves to exactly those two blocked prefixes, so every
direct browser request — including the **OAuth callback**
`https://yewcxcvngvdtsnigtmwd.supabase.co/auth/v1/callback` — hangs (TCP SYN dropped),
showing "0 response headers / provisional headers". The callback URL is correct and
unchanged.

### Why OAuth still fails through the proxy
The proxy fixes server-side reachability (password auth + all DB work in the browser).
But OAuth's final hop is GitHub redirecting the BROWSER to the real
`supabase.co/auth/v1/callback` (GoTrue + the GitHub OAuth app both hardcode it). Only
a DNS-level redirect (or a working network) makes the browser reach a good edge.

### The recommended fix (restores OAuth to exactly yesterday's behaviour)
Add to `/etc/hosts` (needs sudo — verified edge, prod+dev both 200 via it):
```
162.159.140.229 yewcxcvngvdtsnigtmwd.supabase.co
162.159.140.229 biclytfukihleuyfpvlr.supabase.co
```
Then OAuth works again and the server.js proxy is unnecessary (revert it).

### Or fix at the source (no machine change)
- **Phone hotspot / different network** → bypasses Bezeq, works instantly (quick proof).
- **Restart the router** → may pick up a different route.
- **Contact Bezeq** → report TCP/443 blocked to Cloudflare `104.18.38.0/24` &
  `172.64.149.0/24`.
- Changing DNS resolver does NOT help — every resolver (system, 1.1.1.1, 8.8.8.8,
  DoH) returns the same two blocked IPs.

Once `curl https://yewcxcvngvdtsnigtmwd.supabase.co/auth/v1/health` returns 200
directly (no --resolve), revert `server.js` + `js/supabase-client.js` and rebuild.

---

## PROD ("ai-landscape-reviews", `biclytfukihleuyfpvlr`)

Prod is **also `ACTIVE_HEALTHY`** server-side. It only appeared "down" from THIS
machine for the same edge-IP reason. **Prod is almost certainly fine for real
users** on other networks — the live site uses the prod config and a normal
visitor's network reaches a working edge. Verify from a different network or phone
(mobile data) by loading the production site and signing in. No prod DB change
appears necessary. If you want belt-and-suspenders, the proxy pattern could be
added to the production host too, but that's likely unnecessary.

## Cleanup when done
- Revoke the Personal Access Token you pasted (`sbp_4415…`):
  https://supabase.com/dashboard/account/tokens
- Test user created/reused: `localdev-test@aitoolreview.ai` (delete if unwanted).
- To revert: `git checkout server.js js/supabase-client.js` and rebuild `_site`.
