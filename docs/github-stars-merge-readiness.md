# GitHub Stars Refresh — Merge-Readiness Report

**Branch:** `feat/github-stars-refresh`
**Prepared:** 2026-06-14
**Merge commit (main → branch):** `294fe78`
**Code-review fixes:** `1b0834a`
**Backup tag:** `backup/stars-pre-merge` (pre-merge tip `a9eeb91`)
**Verdict:** ✅ **Ready to merge.** All tests green, all conflicts resolved, code-review findings addressed.

---

## 1. What this branch delivers

A single-source-of-truth pipeline for GitHub star counts:
- `data/stars.json` — canonical star data, fetched daily from the GitHub GraphQL API.
- `scripts/stars_lib.rb` + `fetch-stars.rb` — fetch, merge (keep-previous-on-error), derive `github_stars` into tool frontmatter + a Supabase column, with HTTP timeouts and typed errors.
- `js/stars.js` — client renders the canonical count into the tool-page badge (floor-formatted to match the Liquid build-time render), always falling back to the build value, never hiding.
- `.github/workflows/refresh-stars.yml` — daily cron that fetches, regenerates `js/data.js`, commits, and pushes to main (which redeploys).
- Data hygiene: 6 broken tool URLs fixed, 6 fabricated/dead tools removed, stale `tools.json`/`tools.min.json` artifacts removed, landscape/search "NaN stars" + exact-number-hover bugs fixed.

The feature was reviewed incrementally during implementation (each task got spec + quality review). This report covers the **merge** and a **final holistic pre-merge review**.

---

## 2. Merge — conflicts resolved (4 files)

Merged `origin/main` (which had advanced +21 commits) **into the branch** — `main` was never modified.

| File | Conflict | Resolution |
|------|----------|------------|
| `.husky/pre-push` | Ours ran the full Playwright suite on pre-push; **main moved Playwright to CI** and made pre-push run only static validations | **Took main's version** (the current team workflow — faster pushes, full suite in CI). Our now-moot port-8080 Playwright block was dropped. |
| `playwright.config.js` | Our `PORT`-forwarding worktree flexibility vs main's `globalSetup` + blocking-proxy + `PREPUSH` worker logic | **Merged both:** kept our `PORT=${PORT}` command forwarding + `${PORT}` baseURL, and main's `PREPUSH`-aware `reuseExistingServer`. |
| `data/_tools/.../repo-forensics.md` | **modify/delete** — main deleted the tool, we'd edited it (stars seeding) | **Honored main's deletion** (verified the tool is gone from main entirely, not relocated; our edits were only stars data, nothing to preserve). |
| `js/data.js` | generated file | **Regenerated** from the merged data (`npm run generate`) rather than hand-merging. |

`js/app.js` auto-merged cleanly — critically, the merge **preserved** this branch's `formatStars` floor-guard fix (`typeof count !== 'number' || !isFinite(count) || count < 0`), confirmed by review (an auto-merge can silently drop such a change; it did not here).

**Post-merge:** 420 tools, Jekyll build OK, all validators pass, all stars feature files intact.

---

## 3. Final code review — findings & fixes

Two parallel senior reviews (Ruby/workflow/security; client/merge-coherence). The feature is mature; the review confirmed it and surfaced a few low-friction hardening items.

### Fixed before merge (commit `1b0834a`)

| # | Sev | File | Finding | Fix |
|---|-----|------|---------|-----|
| 1 | **Medium** | `fetch-stars.rb` | `File.write(stars_path, …)` is non-atomic. An interrupted run (OOM/eviction) leaves a half-written `stars.json`; the next run's `JSON.parse` then throws and the job fails **forever** (unrecoverable lock-out). | Write to `stars.json.tmp` then `File.rename` (atomic on POSIX). Also wrapped the prior-file read in `rescue JSON::ParserError → {}` so a corrupt file self-heals on the next run instead of failing. |
| 2 | **Low** | `fetch-stars.rb` | Frontmatter write had no integer guard, while `sync_supabase` did — a malformed API value could write a non-integer into a `.md` file. | Added `star['count'].is_a?(Integer)` guard before the frontmatter update (now consistent with the Supabase path). |
| 3 | **Low** | `refresh-stars.yml` | Unqualified `git push` could push to a non-default branch if dispatched manually. | Made explicit: `git push origin HEAD:main`. |
| 4 | **Low** | `test_stars_lib.rb` | No test for a fully-nil API response (the keep-previous safety net). | Added `test_nil_response_keeps_previous_and_does_not_crash`. **33/33 unit tests.** |

### Reviewed and intentionally NOT changed (acceptable)

- **Rate-limit retry/backoff:** a daily cron tolerates a missed day; the 15-min timeout + GITHUB_TOKEN's 5,000-points/hr budget (≈100 points used) make secondary rate-limiting unlikely. A transient 403 fails safe (no write, CI alert).
- **`cache: 'no-cache'` on the stars.json fetch:** redundant given the build-time `?t=` cache-bust, but harmless.
- **YAML-escape of the injected `github_url`:** GitHub repo URLs can't contain quotes; defense-in-depth only.
- **Per-row Supabase PATCH error handling:** the whole sync is already wrapped non-fatally; frontmatter is the source of truth, Supabase is secondary.

### Security posture (confirmed sound)

- **No infinite loop:** `refresh-stars.yml` triggers only on `schedule`/`workflow_dispatch` (never on push). Its push triggers `deploy.yml`, which only builds+deploys — it never pushes back.
- **No secret exposure:** `GITHUB_TOKEN`/`SUPABASE_SERVICE_KEY` are passed via `env:` and read as `ENV[…]`; never printed. Commit identity is the canonical `github-actions[bot]`.
- **No injection from a poisoned API response:** only `stargazerCount` (typed `Int!`) and locally-sourced slugs flow into committed files. No YAML/shell/JS injection surface.
- **Client XSS-safe:** `js/stars.js` writes the count via `textContent` (not `innerHTML`), behind a `typeof === 'number'` guard.
- **Ruby 2.6 / 3.2:** no version-specific idioms; runs on CI's 3.2 and local 2.6 alike.

---

## 4. Test results — all green

| Suite | Result |
|-------|--------|
| Ruby unit (`test_stars_lib.rb`) | **33 / 33** (0 failures) |
| Playwright full suite (`PORT=8082`) | **409 / 409 passed**, 0 failed, 0 skipped |
| `npm run validate` (duplicate slugs) | pass (420 tools) |
| `npm run validate:data` | pass (21 categories) |
| `npm run validate:workflows` | pass |
| `npm run validate:auth-pages` | pass |
| Jekyll build | OK |

Notably, the **full Playwright suite is 100% green** — the merge pulled in main's `global-setup.js` blocking proxy, which eliminates the external-CDN-hang flakiness; the star tests are hermetic (`blockExternal` + floor-math assertions).

---

## 5. Merge-readiness verdict

✅ **This branch is ready to merge.**

- All conflicts resolved correctly (main's workflow-policy changes adopted; our feature + port-flexibility preserved; deletion honored).
- Final review found only low-friction hardening items — the merge-relevant ones (atomic write, integer guard, explicit push) are fixed; the rest are acceptable as-is.
- Every test passes (409 Playwright + 33 unit + 4 validators + build).
- Security posture verified: no loop, no secret exposure, no injection, XSS-safe.

`main` is untouched. Backup tag `backup/stars-pre-merge` is available if a rollback of the merge is ever needed.
