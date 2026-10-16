# Brief: speed up "/tool-page-content" for new AI tool pages

## Context

The user runs `/tool-page-content <url(s)>` roughly daily to add 1+ new tool
pages to the `ai-tool-review` Jekyll site (repo:
`/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/ai-tool-review`,
GitHub: achisolomon/ai-tool-review, pushes directly to `main`, no branch
protection, no PR required).

A just-finished session adding 5 tool pages (markitdown.tech, firecrawl/anydoc,
Amitro123/anydocSkill, meetily.ai, xtool-org/xtool) plus fixing an existing
stub (NVIDIA/OpenShell) took far longer than it should have — almost all of
the time was environment/process overhead, not actual content work. The user
wants a follow-up session to fix the *process* so future single-tool (or
small-batch) additions are fast and don't need manual tool approvals.

**Goal for the new session:** make `/tool-page-content` (or a leaner
successor flow) fast for the common case of 1 tool at a time, running with
minimal/no interactive approvals, while still landing verified, working pages
on `main`.

## What actually ate the time (root causes, already fixed once this session)

1. **Session-worktree port reservation fails inside the Bash sandbox.**
   `/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/session_worktree.py`
   binds a test socket per candidate port to check availability. The Bash
   tool's default OS sandbox (macOS Seatbelt) blocks all socket binds, so
   every port in the 8180-8379 range appears "busy" and `create` fails with
   `refusing: no free reserved port is available` — even though in reality
   only one port (8181, a leftover Jekyll server) was actually taken.
   **Fix used:** run the script with `dangerouslyDisableSandbox: true`.
   **Better fix for next session:** decide whether per-tool-page work even
   needs a dedicated worktree (see Decision 1 below) — if not, this whole
   class of friction disappears for the common case.

2. **`ruby`/`bundle` resolve to system Ruby 2.6.10 unless rbenv is
   initialized — but rbenv + the correct Ruby were ALREADY installed.**
   This was a false alarm that cost real time: plain `ruby -v` /
   `bundle -v` in a fresh shell hit macOS's system Ruby 2.6.10 (no
   rbenv/asdf shims active), which can't satisfy `Gemfile.lock`'s
   `BUNDLED WITH 2.5.11` (needs Ruby >= 3.0), so `bundle exec jekyll
   build` failed. **This looked like a missing toolchain but wasn't one.**
   The machine already has `rbenv` (`/opt/homebrew/bin/rbenv`) with Ruby
   `3.2.4` installed (`~/.rbenv/versions/3.2.4`), matching this repo's
   `.ruby-version`, plus a working `vendor/bundle` with Jekyll 4.4.1
   already installed in the main checkout. The ONLY missing step was:
   ```bash
   eval "$(rbenv init -)"   # then ruby -v reports 3.2.4, bundle exec jekyll works
   ```
   The project's own `.husky/pre-push` hook already does exactly this
   (`eval "$(rbenv init - 2>/dev/null)"` at the top) — which is why pushing
   from the main checkout worked fine even when ad-hoc shell commands run
   earlier in the same session failed. **Do not reinstall Ruby via
   Homebrew or reinstall bundler** — a previous pass in this session
   mistakenly did that (`brew install ruby` → Ruby 4.0.5 at
   `/opt/homebrew/opt/ruby`, plus a separate bundler 2.5.11 gem install
   under a custom `GEM_HOME`) before discovering rbenv was already correct.
   That Homebrew Ruby install is harmless but unnecessary; the new session
   should just always run `eval "$(rbenv init -)"` at the start of any
   shell command block that needs `ruby`/`bundle`/`jekyll`, exactly like
   the pre-push hook does, instead of exporting a different PATH.
   **If a worktree's `vendor/bundle` is missing Jekyll** (fresh worktrees
   don't inherit it — see point 3), run `bundle install` there with rbenv
   already initialized; it will reuse the rbenv-managed Ruby and just needs
   to populate that one worktree's `vendor/bundle` once.

3. **Worktree node_modules gets symlinked automatically; vendor/ (Ruby
   gems) does not.** `session_worktree.py`'s `link_node_modules()` only
   handles `node_modules`. A fresh worktree has no `vendor/`, so `bundle
   install` must be run fresh per worktree (slow — compiles native
   extensions like `google-protobuf`, `sass-embedded`). If worktrees are
   kept in the new flow, either (a) extend the script to also symlink/share
   a Ruby gem cache across worktrees, or (b) install gems once to a
   machine-wide `GEM_HOME` instead of a per-worktree `vendor/bundle` path so
   every worktree reuses the same installed gems without recompiling.

4. **The worktree's base branch drifted behind `origin/main` during the
   session** because an automated job (`refresh-stars.yml`, a GitHub Action
   that does a daily `chore(stars): daily refresh` commit to main) landed
   while work was in progress. This caused a real merge conflict on
   `js/data.js` (a generated file — must be regenerated from merged
   markdown sources, never hand-merged) and on the one existing page being
   edited. **Fix pattern that worked:** `git merge --no-commit --no-ff
   origin/main`, resolve markdown conflicts by hand (keep the verified
   content), then `npm run generate` to regenerate `js/data.js` fresh rather
   than resolving its conflict markers directly, then `git add -A && git
   commit`. For a fast single-tool flow, minimize how long a branch lives
   before merging, to shrink the odds of hitting this.

5. **`npm run serve:jekyll` hardcodes `--port 8080`**, ignoring any `PORT`
   env var, despite the worktree setup message telling the user to run
   `PORT=8365 npm run serve`. If multiple worktrees need to serve
   concurrently, either fix the npm script to honor `$PORT`
   (`bundle exec jekyll serve --port ${PORT:-8080}`) or always invoke
   `bundle exec jekyll serve --port <assigned-port>` directly instead of
   the npm script.

## What did NOT cause slowness (don't "fix" these)

- The 6 parallel research subagents (haiku model, per the user's global
  `~/.claude/CLAUDE.md` agent-model-selection rule) ran in under a minute
  total combined and produced good, well-cited material. Keep using
  background subagents for source research — they are not the bottleneck.
- `npm run validate` / `npm run generate` / `node scripts/validate-data-js.js`
  are all fast (seconds) and are not what made this slow.
- The content-writing itself (6 tool pages, following
  `~/.claude/skills/tool-page-content/SKILL.md`'s template) was not slow.

## Decisions already made by the user (carry these forward, don't re-ask)

1. **No toolchain install is needed — rbenv + Ruby 3.2.4 are already
   correctly installed.** The only thing a fresh shell is missing is
   `eval "$(rbenv init -)"`. Just run that once at the top of any script
   block that calls `ruby`/`bundle`/`jekyll`/`bundle exec jekyll`, exactly
   like `.husky/pre-push` already does — don't export a different PATH or
   reinstall anything. If it's worth doing once, add
   `eval "$(rbenv init -)"` to `~/.zshrc` so every new shell (including
   Claude Code's) has it automatically; note this briefly in the project's
   CLAUDE.md so no future session re-diagnoses "Ruby is broken" from
   scratch when it's really just an uninitialized shim.
2. **For a single simple tool page (the common case, e.g. adding
   `https://herdr.dev/`), skip the dedicated worktree entirely.** Work
   directly in the main `ai-tool-review` checkout, run the fast
   validate→generate→build chain (no Playwright — that's seconds, not
   minutes), then commit and push directly to `main` (matches existing repo
   convention: `git log` shows direct single-commit tool-page merges like
   "Add Bazak tool page", "feat: add looot tool page", no PRs). Reserve
   worktrees + the full worktree/port dance for multi-tool batches, risky
   changes, or when the user explicitly wants isolation.
3. The user explicitly flagged that approvals/manual confirmation steps are
   a big part of the perceived slowness ("without tools approving, without
   approving commands, it should be totally automated"). The new session
   should design the fast path to minimize interactive tool-approval
   prompts for the routine case — e.g. by using `dangerouslyDisableSandbox`
   deliberately and consistently for the known-safe local build/validate
   commands in this one repo, rather than hitting a sandbox denial and
   re-asking every time, and by not pausing for low-stakes judgment calls
   that the skill/template already answers (e.g. category taxonomy lookups
   it already does deterministically).

## Suggested starting point for the new session (not mandatory, just a lead)

A reasonable deliverable would be a **leaner variant command/skill** (e.g.
`/tool-page-quick` or a fast-path branch inside `tool-page-content`) that for
the single/dual-tool case:
1. Skips `session_worktree.py` and works in the main checkout directly.
2. Fetches the one or two sources directly (WebFetch, not a subagent
   detour) since research for 1-2 tools doesn't need parallelism.
3. Writes the page(s) following the existing
   `~/.claude/skills/tool-page-content/SKILL.md` template/taxonomy (reuse
   it, don't rewrite it).
4. Runs `eval "$(rbenv init -)" && npm run validate && npm run generate &&
   npm run build` once, straight through — no PATH/GEM_HOME exports needed,
   just rbenv init (see point 2 above).
5. Before committing, greps the new/edited `.md` file bodies (frontmatter
   stripped) against this exact regex and fixes any hit, so CI doesn't
   bounce the push back:
   ```js
   /(?<![\/\d])\b\d[\d.,]*\s*[kK]?\+?\s*(github\s+)?stars?\b/i
   ```
   This is `tests/data-integrity.spec.js`'s "no tool description prose
   hardcodes a GitHub star figure" test (line ~194) — it bans any digit
   followed by the word "star(s)" anywhere in a tool page's body (not just
   outside the key-stats badge — literally anywhere, including inside
   `<span>` text and markdown tables, as long as the number and "star(s)"
   end up adjacent after whitespace). Only the dedicated `key-stats` badge
   markup is exempt, because its number and "GitHub Stars" label sit in
   separate `<span>` elements with a tag boundary between them, which the
   regex doesn't cross. **This bit a real batch this session** — all 5 new
   pages plus the OpenShell edit cited exact star counts in prose
   (pros/cons bullets, comparison tables) and CI failed on the first push;
   the fix was rephrasing each bullet to drop the literal figure (e lesson:
   write star-count color commentary as "strong/fast-growing adoption,
   see badge for count" rather than spelling out the number a second time.
   Running this grep locally before commit would have caught it before any
   push, let alone a CI round-trip.
6. Runs the fast, low-RAM-safe regression instead of the full suite:
   `npx playwright test tests/data-integrity.spec.js --workers=1` (14
   tests, ~1 second) — this is the file that would have caught the
   star-figure bug above, and it's cheap enough to always run locally
   regardless of free RAM. Still rely on CI for the full ~637-test suite.
7. Commits and pushes straight to `main` (matching existing repo
   convention: this repo's `.husky/pre-commit` and `.husky/pre-push` hooks
   already run `validate`/`generate`/`build`/`validate:*` automatically on
   every commit/push — so step 4 is partly a dry-run/fail-fast of what the
   hooks enforce anyway, not redundant busywork).
8. Reports back with the live page URL once CI/deploy is confirmed green,
   without pausing mid-flow for confirmations the user has already
   pre-approved via this brief.

The new session should treat points 1-3 in "Decisions already made" as
settled, not open questions, and should feel free to ask the user only about
things genuinely not covered here (e.g. exact command/skill naming, whether
to deprecate the worktree path for single tools entirely vs. keep it as an
opt-in flag).

## Current state of the repo (as of this brief)

- `main` has two commits from the original session, both pushed to
  `origin/main`:
  - `3795aeb9` — the 5 new tool pages (markitdown.tech, anydoc, anydocSkill,
    meetily, xtool) + the NVIDIA OpenShell content fix.
  - `03d195ae` — a follow-up fix after CI run `38883414596` ("Tests")
    went **red** on the first push: `tests/data-integrity.spec.js`'s
    "no tool description prose hardcodes a GitHub star figure" test failed
    because all 6 pages cited exact star counts in prose. Fixed by
    rephrasing those 6 bullets/table cells to drop the literal figure (see
    the detailed regex and rule under point 5 of "Suggested starting
    point" above). This fix was verified locally (`npx playwright test
    tests/data-integrity.spec.js --workers=1` → 14/14 passed) before
    pushing. **Check `gh run list --branch main --limit 3` for the newest
    run's outcome** (run id `38884509614` or later) rather than assuming
    green — it was still in flight when this brief was last updated.
  - **Take this as the concrete worked example for point 5 above**: it's
    exactly the kind of CI round-trip the new fast-path flow should
    prevent by checking locally before the first push, not after.
- The worktree used for the original batch,
  `ai-tool-review/.worktrees/new-tool-pages-batch`, is still present on
  disk and should be safe to remove once confirmed merged+clean (the
  session-end hook does this automatically if the worktree is clean and
  fully merged — don't force-remove it manually unless the auto-cleanup
  didn't run). The CI-fix commit (`03d195ae`) was made directly in the
  **main checkout**, not that worktree, per Decision 2 above.

## Tool requests queued during this session (not yet built — hand these to whichever session picks up next)

The user asked for these mid-session, after the original 5-tool batch was
already in flight, specifically so this session could stay focused on
finishing/fixing the batch rather than context-switching. Build these next,
using whichever flow (current `/tool-page-content` or the new fast path)
is ready first:

1. **https://herdr.dev/** — not yet researched or built.
2. **https://t3.codes/** — not yet researched or built. User said this is
   "like superset and herder" (see note 5).
3. **https://tailscale.com/** — not yet researched or built. Tailscale is
   an established, well-known product (zero-config mesh VPN / WireGuard-
   based networking) — should be a fast, well-documented page to write,
   good first real-world test of the new fast path once it exists. Note:
   this one does NOT belong in the superset/herdr/t3/paseo grouping below
   — it's unrelated (networking, not coding agents).
4. **https://paseo.sh/** — not yet researched or built. User explicitly
   said it belongs in the same tag/subcategory as superset.sh and
   herdr.dev (see note 5). The `.sh` naming pattern matches superset.sh.
5. **Grouping instruction from the user, confirmed by checking the
   existing page:** superset.sh, herdr.dev, t3.codes, and paseo.sh should
   share a category/subcategory or at least a tag. **Already checked:**
   `data/_tools/developers/ai-coding/coding-agents/superset.md` describes
   Superset as "a desktop app that orchestrates 100+ AI coding agents in
   parallel using isolated Git worktrees" — `track: developers`,
   `category: ai-coding`, `subcategory: coding-agents`, tags `agents`,
   `workflow-automation`, `api-available`. The naming pattern (`.sh`,
   `.dev`, `.codes` — all short technical TLDs) and the user's explicit
   "like superset" for t3.codes strongly suggest herdr.dev, t3.codes, and
   paseo.sh are the same genre: parallel/multi-agent coding-orchestration
   tools. **Still verify, don't assume** — fetch each site and confirm it
   actually does multi-agent/worktree-based coding orchestration before
   filing it under `ai-coding/coding-agents`; if any of them turns out to
   be something else entirely, place it correctly and just share a tag
   (e.g. `agents` + `workflow-automation`) with superset.sh instead of
   forcing the same subcategory.
