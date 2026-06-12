# GitHub Stars — Single Source of Truth + Daily Refresh

**Date:** 2026-06-13
**Status:** Approved (design), pending implementation plan

## Problem

GitHub star counts are shown incorrectly and inconsistently across the site.
The same tool can display **different star numbers on different pages**, and most
numbers are stale because they were hand-typed once and never updated.

Root cause: a tool's star count is **duplicated across five independent surfaces**
that have drifted apart:

| # | Location | How it's used | Notes |
|---|----------|---------------|-------|
| 1 | `github_stars:` in tool frontmatter (206 files) | Tool-page badge via `page.github_stars` | Current nominal source |
| 2 | Star figures inside description **prose** (~40 files) | Rendered as body text ("57K+ stars", "nearly 100K") | Worst drift — hand-typed, never refreshed |
| 3 | `js/data.js` (generated, 433 refs) | Landscape / cards / search | Derived from #1 by `generate-json.rb` |
| 4 | Supabase `github_stars` column | Read at runtime by `_layouts/tool.html` | Independent DB copy |
| 5 | `_layouts/tool.html` (~line 338) | Runtime JS overwrites badge with the **Supabase** number | Can conflict with #1 on the same page |

Because #2 and #4 were never synced to #1, and #5 overrides #1 at runtime, a single
page can show two different numbers and different pages disagree.

## Goal

- **Exactly one star number per tool**, sourced from GitHub.
- Never more than ~1 day old.
- Impossible for two surfaces to disagree.
- Recurring refresh costs **zero LLM tokens** (plain script + GitHub API).

## Solution Overview

`data/stars.json`, fetched live from GitHub once per day, becomes the **single source
of truth** for star counts. Every surface derives from it; none authors its own number.

```
[cron daily]
  scripts/fetch-stars.rb
    ├─ reads github_url: from data/_tools/**/*.md
    ├─ GitHub GraphQL API (one batched call)
    ├─ writes data/stars.json            (canonical cache)
    ├─ writes github_stars: back into frontmatter   (#1 derived)
    └─ updates Supabase github_stars column         (#4 derived)
  → commit if changed → existing deploy.yml rebuilds & publishes
       (generate-json.rb regenerates js/data.js from frontmatter → #3 derived)

[browser, tool page]
  js/stars.js → fetch data/stars.json → write live count into .star-count
              → formatted as "k" to match existing build-time render
              → always show last-known; on failure keep build-time fallback
```

## Components

### 1. `scripts/fetch-stars.rb` — recurring fetcher (token-free)

- Globs `data/_tools/**/*.md`, skips files whose basename starts with `_`.
- Parses YAML frontmatter; collects `slug` + `github_url:` for files that have a URL.
- Extracts `owner/repo` from each `github_url:`.
- Calls GitHub's **GraphQL API**, batching repos into one (or few) requests
  using aliased `repository(owner:, name:)` selections. Authenticated GraphQL allows
  5,000 points/hr; this stays far under the limit. Auth via `secrets.GITHUB_TOKEN`
  (auto-provided in Actions; for local runs read `ENV['GITHUB_TOKEN']`).
- Writes `data/stars.json`:
  ```json
  {
    "generated_at": "2026-06-13T04:00:00Z",
    "stars": {
      "n8n": { "count": 142318, "fetched_at": "2026-06-13T04:00:00Z" },
      "litellm-proxy": { "count": 18204, "fetched_at": "2026-06-13T04:00:00Z" }
    }
  }
  ```
- **Per-repo error** (renamed/deleted repo, 404, null node): log a warning, **keep the
  previous entry** from the existing `stars.json`, continue. One bad repo never drops
  the rest.
- **Hard failure** (missing token, total API/network outage, cannot write file):
  exit non-zero so GitHub emails the failed-run notification.
- After updating `stars.json`, the script also:
  - writes the fresh `count` into each tool file's `github_stars:` frontmatter (#1), and
  - updates the Supabase `github_stars` column for matching tools (#4), via the
    service-role key in `secrets`. (If Supabase creds are absent, log and skip the DB
    step without failing the run — frontmatter + stars.json are the user-facing path.)

### 2. `data/stars.json` — canonical cache

Committed to the repo. Served as a static asset at `/data/stars.json`. This is the
single source of truth consumed by the client and the derived surfaces.

### 3. Derived surfaces (no longer hand-authored)

- **Frontmatter `github_stars:` (#1)** — written by the daily job, not by humans.
- **`js/data.js` (#3)** — regenerated from frontmatter by the existing
  `scripts/generate-json.rb` during build; no change needed beyond it picking up the
  refreshed frontmatter.
- **Supabase column (#4)** — written by the daily job.

### 4. `js/stars.js` — client renderer

- Loaded on tool pages (via `_layouts/tool.html`).
- Fetches `data/stars.json` (relative path; `baseurl` is empty — custom domain
  `aitoolreview.ai`). Use a cache-busting query consistent with the site's existing
  `?t=` convention, or rely on the daily commit changing the file.
- Looks up the current page's `slug`, writes `count` into the existing `.star-count`
  element, formatted to match the build-time render `{{ count | divided_by: 1000 }}k`
  (e.g. 142318 → "142k"). No visual jump.
- **Always renders last-known count; never hides.** On fetch failure, the
  Jekyll-rendered fallback number simply remains.

### 5. Remove the Supabase badge override (#5)

`_layouts/tool.html` (~line 338) currently overwrites the badge with the Supabase
`github_stars`. Remove/realign this so the badge's number comes only from the
build-time frontmatter render + `js/stars.js`, making it impossible for the badge to
disagree with itself. (The Supabase column still exists and is kept in sync for any
other consumers, but it is not a second renderer of the badge.)

### 6. `scripts/resolve-github-urls.rb` — one-time backfill (token-saving)

For the ~81 tools that have a `github_stars:` number but **no** `github_url:`:

- Calls GitHub's **search API** (`GET /search/repositories?q=<tool name>`).
- Scores candidates by name match + proximity of candidate stars to the existing
  hardcoded number (a tool listed at "50000" matching a repo at ~140k is a red flag).
- **High confidence** → auto-writes `github_url:` into frontmatter.
- **Low confidence / ambiguous / no repo** → writes nothing; emits a report line, e.g.
  `MANUAL: obsidian → obsidianmd/obsidian? (released app; repo is plugins only)`.
- Human reviews only the flagged list, not all 81. Closed-source tools (ChatGPT,
  Midjourney) correctly resolve to no repo and keep no stars.

Runs once; its output feeds the daily refresh.

### 7. Prose cleanup — one-time

The ~40 description files embed star figures inside flowing sentences
("nearly 100K GitHub stars", "57,400+ stars", "22K stars" in comparison tables).
**Remove the specific numbers** and reword to evergreen phrasing
("widely adopted, fast-growing", "strong OSS community"). The badge is the single place
a star number appears, so body text can never drift.

### 8. `.github/workflows/refresh-stars.yml`

- Triggers: `schedule` (daily cron, ~04:00 UTC) + `workflow_dispatch`.
- Steps: checkout → setup Ruby → run `scripts/fetch-stars.rb` → if `stars.json` /
  frontmatter changed, commit and push to `main`.
- The existing `deploy.yml` (triggered by the Tests workflow on `main`) rebuilds and
  republishes. Confirm during implementation that the auto-commit triggers the deploy
  chain; if not, add a `workflow_dispatch` of deploy or run Jekyll build in this
  workflow.
- Uses `secrets.GITHUB_TOKEN` for the API and the Supabase service key for the DB sync.

## Staleness Guarantee

The page always shows the last-known count (per design decision). The "≤ 1 day old"
guarantee therefore rests on the daily job succeeding:

- `generated_at` is written into `stars.json` every run (freshness marker).
- Hard failures exit non-zero → GitHub failed-run email.
- Partial (per-repo) failures are logged and skipped without dropping other tools.

No client-side hiding or CI staleness gate (explicitly chosen for simplicity).

## Error Handling Summary

| Failure | Behavior |
|---------|----------|
| One repo renamed/deleted/404 | Log warning, keep previous `stars.json` entry, continue |
| GitHub API down / no token | Exit non-zero → GitHub emails failed run |
| Supabase creds missing | Log + skip DB sync; do not fail the run |
| Client fetch of stars.json fails | Keep build-time fallback number on the badge |
| Backfill can't resolve a repo | Flag for manual review; write nothing |

## Out of Scope

- Client-side staleness hiding / CI staleness gate (rejected by design).
- Historical star trend tracking / sparklines.
- Refreshing tools that have no GitHub repo (closed-source).
- Refactoring unrelated frontmatter fields.

## Testing

- `fetch-stars.rb`: unit-test URL→owner/repo parsing; mock GraphQL response → assert
  `stars.json` shape; assert a 404'd repo keeps its prior entry.
- `resolve-github-urls.rb`: assert high-confidence auto-write vs. low-confidence flag on
  fixture inputs.
- `stars.js`: Playwright test asserting the badge renders the `stars.json` count
  (formatted `k`) and falls back to the build-time number when the fetch is blocked.
- Consistency check (CI or test): assert no description prose contains a hardcoded
  star figure, and that the badge value equals the `stars.json` value for a sample tool.
