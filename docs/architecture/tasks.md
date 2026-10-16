# Implementation Tasks
Updated: 2026-10-16

Scope: small process/tooling change (no Discovery/Gate 1/Gate 2 per
`docs/factory/status.md`). Source of truth for the "why" is
`docs/product/speed-up-tool-pages-brief.md`; the settled decisions below are
not re-opened (see `docs/factory/status.md` approvals log).

GitHub issues are NOT created for these tasks; this file is the only tracker,
per the user's instruction for this change.

| ID | Title | Depends on | Independent? | State |
|---|---|---|---|---|
| T-001 | One check script: rbenv init, validate, generate, build, star-figure lint, data-integrity test | - | yes | in-review |
| T-002 | package.json: honor `$PORT` in `serve:jekyll`; expose check script as npm script | T-001 | yes | in-review |
| T-003 | session_worktree.py: fix port-busy false positive, symlink vendor/, update start message | - | yes | todo |
| T-004 | Merge the three SKILL.md copies into the repo copy as single source of truth, with fast path up front | T-001, T-002 | no (reads T-001/T-002 output to write exact commands) | todo |
| T-005 | Permission allowlist for the check script and git/gh commands in ai-tool-review | T-001, T-002 | yes | todo |

Manual follow-ups that are NOT Developer tasks (listed here so nothing is
lost, owners noted):
- Team Lead: after T-004 merges, replace the other two SKILL.md copies
  (`~/.claude/skills/tool-page-content/SKILL.md` and
  `"ai landscape/.claude/skills/tool-page-content/SKILL.md"`) with symlinks
  to the repo copy's main-checkout path. Not done by the Developer because
  it touches paths outside this repo.
- Team Lead: add `eval "$(rbenv init -)"` to `~/.zshrc`. Outside repo scope,
  touches the user's shell profile.

## Rules these tasks must respect

- Fast path works in the main `ai-tool-review` checkout for 1-2 tools, no
  worktree (brief Decision 2; status.md approval 2026-10-16).
- Do not change the research subagent approach, or `scripts/validate-*.rb`,
  `scripts/generate-json.rb`, or any other validate/generate script's logic.
- `js/data.js` stays generated only; never hand-edited or hand-merged
  (project-facts.md).
- Push to `main` is never pre-approved inside the skill or any allowlist; the
  skill always asks the user once, immediately before the push, no earlier
  and no later in the flow (status.md: "NOT approved: pushing to main
  without a per-push confirmation").
- No new paid resources, no secrets in repo (project-facts.md).
- Never use the em dash character in any file this change produces or edits.

---

### T-001. One check script: rbenv init, validate, generate, build, star-figure lint, data-integrity test

- Goal: a single script, `scripts/tool-page-check.sh`, that replaces the
  manual "run validate, then generate, then build, then remember the regex,
  then remember the one Playwright file" sequence with one fail-fast call.
  This is what lets the fast path run as one command instead of a chain of
  separately-approved ones.
- Scope:
  - New file `scripts/tool-page-check.sh` (bash, executable).
  - Steps, in order, each failing fast with a clear one-line error pointing
    at the fix (not a stack trace) before moving to the next:
    1. `eval "$(rbenv init - 2>/dev/null)"` (same pattern as
       `.husky/pre-commit` and `.husky/pre-push`; do not export a different
       PATH or GEM_HOME).
    2. `npm run validate`
    3. `npm run generate`
    4. `npm run build`
    5. The star-figure regex lint: for each `.md` file passed as an argument
       to the script (or, with no arguments, every changed-but-uncommitted
       tool `.md` file under `data/_tools`, via `git diff --name-only` and
       `git diff --cached --name-only` filtered to that path), strip
       frontmatter and test the body against the exact regex from
       `tests/data-integrity.spec.js:198`:
       `/(?<![\/\d])\b\d[\d.,]*\s*[kK]?\+?\s*(github\s+)?stars?\b/i`.
       Report every offending file and the matched text; this must be the
       same regex, not a re-derived approximation, so a local pass
       guarantees the Playwright test (next step) also passes on this rule.
    6. `npx playwright test tests/data-integrity.spec.js --workers=1`
  - Vendor/bundle handling for worktrees (needed because fresh worktrees
    have no `vendor/`, confirmed absent in this worktree at session start):
    before step 2, check `bundle exec jekyll --version` quickly; if it
    fails because gems are missing, try reusing the main checkout's
    `vendor/bundle` first (symlink `vendor` to
    `../../vendor` relative to the worktree, i.e. the main checkout's
    `vendor/`, the same pattern as `link_node_modules`); only fall back to
    running `bundle install` in the worktree if no main-checkout `vendor/`
    exists to reuse. This logic is also needed standalone for T-003 (the
    symlink-on-create path); T-001 only needs the runtime fallback inside
    the script itself, for the case a worktree is used without having gone
    through `session_worktree.py create` (e.g. an older worktree).
  - Must run correctly from the main checkout directly (no worktree,
    cwd-independent; use the script's own directory to find the repo root,
    not an assumption about cwd).
- Rules: brief point 5 (exact regex, must match
  `tests/data-integrity.spec.js` verbatim), brief point 6 (this exact
  Playwright invocation, not the full suite), "do not change the
  validate/generate scripts themselves" (settled decision 5).
- Acceptance:
  - Running `scripts/tool-page-check.sh` with no arguments in the main
    checkout, with no new/changed tool `.md` files, exits 0 and completes
    the full chain.
  - Running it after introducing a tool `.md` body containing e.g.
    "12k stars" exits non-zero at the lint step with the offending file and
    line-level context, without running the Playwright step.
  - Running it from a worktree whose `vendor/` is missing but whose sibling
    main checkout has `vendor/bundle` populated completes without a fresh
    `bundle install` (verify by timing or by checking no native extension
    compile output appears).
  - Script is executable (`chmod +x`) and uses `#!/usr/bin/env bash` with
    `set -euo pipefail` (so a failure anywhere stops the chain, matching the
    hooks' `|| exit 1` fail-fast style).
- Reviews needed: architecture (self, this task), security (no secrets
  touched, no new external calls, skip is fine), finops (no).
- Independent: yes.

### T-002. package.json: honor `$PORT`; expose check script as npm script

- Goal: close brief root cause 5 (hardcoded `--port 8080`), and give the
  check script from T-001 a discoverable `npm run` entry point consistent
  with the project's existing script-naming convention.
- Scope: `package.json` only.
  - Change `"serve:jekyll": "bundle exec jekyll serve --port 8080"` to
    `"serve:jekyll": "bundle exec jekyll serve --port ${PORT:-8080}"`.
  - Add `"tool-page-check": "bash scripts/tool-page-check.sh"` to `scripts`.
- Rules: brief point 5 (exact fix spelled out there); no change to any other
  existing script.
- Acceptance:
  - `PORT=8212 npm run serve:jekyll` binds on 8212 (verify with `curl -s -o
    /dev/null -w "%{http_code}" http://localhost:8212` once Jekyll is up).
  - `npm run serve:jekyll` with no `PORT` set still binds on 8080 (no
    regression for the common case / existing docs that reference 8080).
  - `npm run tool-page-check` runs T-001's script.
- Depends on: T-001 (the script must exist for the npm alias to mean
  anything, though the package.json edit itself has no code dependency).
- Reviews needed: architecture (self), security (no), finops (no).
- Independent: yes (small, isolated edit; can be done in parallel with
  T-001's drafting and reconciled at review).

### T-003. session_worktree.py: fix port false-positive, symlink vendor/, update start message

- Goal: close brief root causes 1 and 3. Stop every port in the 8180-8379
  range reporting "busy" under the Bash sandbox (which blocks socket binds,
  not just the ports actually in use), and stop every fresh worktree needing
  a from-scratch `bundle install` (slow native-extension compiles) when the
  main checkout already has a populated `vendor/bundle`.
- Scope: `"/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/session_worktree.py"`
  (parent repo, outside this submodule; editing it is in scope for this
  change because the brief names it directly as a root cause and the
  Architect's project-facts.md records it as the session-worktree tooling
  location).
  - `port_free()`: `socket.bind()` raising `OSError` with `errno == EPERM`
    (sandbox denial) must not be treated the same as "port in use"
    (`EADDRINUSE`). On `EPERM`, fall back to a connect probe
    (`s.connect_ex(("127.0.0.1", port))`; a connection that succeeds means
    something is listening there, i.e. busy; `ECONNREFUSED` means free) so a
    sandboxed bind failure doesn't make every candidate port look taken. On
    any other `OSError` (genuine `EADDRINUSE`), keep today's behavior
    (treat as busy).
  - `link_node_modules()`: extend or duplicate it as a `link_vendor()` (or
    generalize to `link_shared_dir(name)` called for both `node_modules` and
    `vendor`) that symlinks `vendor` from the main checkout the same way,
    including the same `.git/info/exclude` entry so the symlink doesn't make
    the worktree look permanently dirty. Call it from `create()` alongside
    `link_node_modules`.
  - `emit_pending_context()` and `emit_start_context()`: add a line stating
    that single tool-page additions (1-2 tools) skip the worktree entirely
    and are done directly in the main checkout, matching the brief's
    Decision 2 and the skill's new fast path (T-004); the worktree flow
    remains for 3+ tools or an explicit request. This keeps the per-session
    forced-worktree prompt from steering a one-tool session into
    unnecessary isolation.
- Rules: brief root causes 1 and 3; project-facts.md toolchain fact "the
  Bash sandbox blocks socket binds"; project-facts.md toolchain fact "fresh
  worktrees get node_modules symlinked but not vendor/".
- Acceptance:
  - Unit-testable logic (`port_free`'s fallback branch) is covered by a
    small script-level check: simulate `EPERM` (e.g. monkeypatch
    `socket.socket.bind` in a throwaway test invocation) and confirm it does
    not report every port busy.
  - A freshly created worktree has a `vendor` symlink pointing at the main
    checkout's `vendor/`, verified with `ls -la <worktree>/vendor`, and
    `git -C <worktree> status --porcelain` does not list it as untracked.
  - The SessionStart message text (printed via `create` to stderr, or via
    the hook's JSON `additionalContext`) contains the "single tool-page
    additions skip the worktree" note.
  - No change to `reserve_port`, `release_port`, the `end()` safety checks,
    or any other function not named above.
- Depends on: none (independent of the skill rewrite; T-004 can reference
  the resulting message wording but does not need T-003 done first to be
  drafted).
- Reviews needed: architecture (self), security (review the EPERM fallback
  doesn't open a port-scanning concern beyond localhost; it's localhost-only
  and already the existing pattern, so low risk), finops (no), devops (no,
  this is session tooling not deployment, but flag for awareness since it
  touches the parent repo's `.claude/` outside this submodule).
- Independent: yes.

### T-004. Merge the three SKILL.md copies into one canonical fast-path skill

- Goal: one skill file, with a short, explicit fast path at the top for the
  1-2-tool case (exact commands, no mid-flow pauses except the single push
  confirmation, then watch CI and report the live URL), that keeps the
  taxonomy table, frontmatter template, HTML content structure, "DO NOT
  include" list, and `js/data.js` sync guidance that the three existing
  copies between them already cover well.
- Scope: `.claude/skills/tool-page-content/SKILL.md` in this repo (the
  repo copy; becomes canonical per settled decision 2 / status.md approval).
  Do not edit the other two copies; the Team Lead symlinks them after this
  merges (noted above as a manual follow-up, not a task).
  - Reconcile the three sources read for this design:
    - `~/.claude/skills/tool-page-content/SKILL.md` (425 lines): has the
      Iron Law decision graph, "Step 0: check if tool already exists",
      taxonomy table, valid tags table, frontmatter template, all 7 content
      sections, source-verification checklist, "DO NOT include" tutorials
      rule, GitHub-stars-via-API rule, common mistakes table, post-creation
      steps, reference examples.
    - the repo copy (current, pre-merge) and the parent-repo copy: URL
      pre-flight checks (GitHub 200/404/redirect, website liveness,
      `gh repo view` for archived/stale), and the repo copy's `js/data.js`
      sync section (surgical edit vs. full regenerate, with the `LANG=C.UTF-8
      LC_ALL=C.UTF-8` note and the "regeneration reorders the whole file"
      warning) which the other two copies lack entirely and which T-001's
      script does not replace (the script runs `npm run generate` as its
      canonical path; keep the surgical-edit option documented for cases
      where a full regenerate's reshuffle diff is undesirable).
  - New structure, top to bottom:
    1. A short "Fast path (default for 1-2 tools)" section, first in the
       file, giving the exact sequence: work in the main checkout (no
       worktree, per settled decision 1); fetch sources directly with
       WebFetch for 1-2 tools (brief point 2: skip the subagent detour at
       this scale; for 3+ tools keep using the parallel research subagents,
       unaffected by this change per settled decision 5); write the page
       following the taxonomy/template below; run
       `npm run tool-page-check` (T-001/T-002); if it exits 0, stage and
       commit; ask the user once, immediately before pushing, for push
       confirmation (never pre-approved, per project-facts.md and
       status.md); push; run `gh run watch` (or `gh run list --branch main
       --limit 1` polled) on the resulting CI run; report the live page URL
       once green, or the failure if red.
    2. A short "Multi-tool / batch path (3+ tools, or on request)" pointer
       to the worktree flow (`session_worktree.py create`, per-worktree
       vendor/node_modules symlinks from T-003), kept brief since this path
       is unchanged.
    3. The existing Step 0 duplicate-check, taxonomy table, valid tags
       table, frontmatter template, content structure sections 1-7, URL
       pre-flight checks, `js/data.js` sync section, "DO NOT include" rules,
       common mistakes table, reference examples: carried over, de-duped,
       not rewritten from scratch.
  - Explicitly state the star-figure rule (brief point 5's regex and
    rationale) inline in the fast path step that calls the check script, so
    a reader understands why that step exists without cross-referencing the
    brief.
  - State the GitHub stars verification rule once (API, not web search; not
    repeated three times as in the current merge sources).
- Rules: settled decisions 1, 2, 5; project-facts.md ("js/data.js is
  generated, never hand-edited or hand-merged"; keep this explicit since
  the merged file documents a surgical hand-edit option as an alternative,
  which must be framed as "when a full regenerate's reshuffle is the
  problem," not as routine practice); "never use the em dash character."
- Acceptance:
  - File is at `.claude/skills/tool-page-content/SKILL.md`, frontmatter
    `description` mentions both URL validation and the fast path so the
    skill is discoverable for either need.
  - Fast path section is readable standalone (a developer could follow just
    that section for the common case without reading the rest).
  - No content from any of the three source copies is silently dropped
    without being represented somewhere in the merged file (taxonomy, tags,
    frontmatter fields, content sections, URL checks, data.js sync, common
    mistakes). If something is deliberately dropped as obsolete, say so in
    the PR/commit description, not just by omission.
  - No em dash character anywhere in the file (`grep -n '—' SKILL.md`
    returns nothing).
- Depends on: T-001, T-002 (the fast path's exact commands must name the
  real script and npm alias those tasks produce, not a placeholder).
- Reviews needed: architecture (self), UX/UI (no), security (no, it is
  documentation).
- Independent: no. Drafting the exact command block needs T-001/T-002's
  final script name and npm alias to be correct; everything else in this
  task (taxonomy/template merge) could be drafted in parallel and
  reconciled, but keep it as one task to avoid a split review on a single
  file.

### T-005. Permission allowlist for the check script and git/gh in ai-tool-review

- Goal: close the brief's root cause 3 (approvals/manual confirmation
  overhead) for the routine, already-safe commands, per settled decision 3 /
  status.md approval ("Add a permission allowlist for the fast-check script
  and git add/commit/push and `gh run` in ai-tool-review").
- Scope: `"/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/settings.json"`
  (parent repo; this is where the existing `permissions.allow` list for this
  workspace already lives, confirmed by inspection: the ai-tool-review
  submodule itself has no separate `.claude/settings.json` of its own found
  in this review).
  - Add allow entries for, scoped to this repo's working directory pattern
    consistent with the existing entries' style (e.g.
    `Bash(cd ai-tool-review && ...)` or a bare command pattern matching how
    existing entries like `Bash(git -C ai-tool-review worktree list)` are
    written):
    - `Bash(bash scripts/tool-page-check.sh *)` and/or
      `Bash(npm run tool-page-check)` (both forms, to cover direct and
      npm-aliased invocation).
    - `Bash(git -C ai-tool-review add *)`, `Bash(git -C ai-tool-review commit *)`.
    - `Bash(git -C ai-tool-review push *)`, allowed to run without a
      per-command approval PROMPT from the permission system, but this does
      NOT change the skill's own behavior: the skill (T-004) still asks the
      user in-conversation before invoking it, every time. The allowlist
      entry removes tool-approval friction; it is not the user's standing
      approval to push unattended. This distinction must be stated in this
      task's acceptance criteria, not just assumed.
    - `Bash(gh run list *)`, `Bash(gh run watch *)`, `Bash(gh run view *)`
      scoped to the ai-tool-review repo's runs.
  - Do not add `gh pr create`, `gh pr merge`, or any allowlist entry that
    would let the skill push without the explicit per-push question.
- Rules: settled decision 3; contract rule 9.7 (push stays an action needing
  the user's explicit approval for that specific instance, even though the
  tool-approval prompt itself is removed by this allowlist); project-facts.md
  ("NOT approved: pushing to main without a per-push confirmation").
- Acceptance:
  - `git diff` on `settings.json` shows only additive entries in
    `permissions.allow`, following the existing array's style; no entry
    removed, no hook changed.
  - The new entries are scoped to the `ai-tool-review` directory/repo, not
    global allowlist entries that would apply to other projects under
    "ai landscape".
  - A written note (in this task's acceptance, surfaced in the review) that
    the push allowlist entry affects only the tool-approval prompt, not the
    skill's own user-facing "confirm before I push" step, so a future
    reader does not mistake this for removing the push gate itself.
  - JSON remains valid (`python3 -m json.tool settings.json` or equivalent
    parses without error).
- Depends on: T-001, T-002 (need the final script/npm-alias name to write
  the correct allow pattern).
- Reviews needed: architecture (self), security (yes, this is exactly the
  kind of permission-surface change Security should see, even though the
  user settled the decision in principle; Security confirms the scoping is
  narrow and the push gate language is correct).
- Independent: yes (edits a file none of the other tasks touch).

## Handoffs

- Software Developer: pick up T-001 through T-005 in the order above
  (T-001/T-002/T-003 can run in parallel; T-004 and T-005 both wait on
  T-001/T-002's final names).
- Security Engineer: review T-003's EPERM-fallback probe and T-005's
  permission-allowlist scoping once implemented.
- DevOps Engineer: aware-only on T-003 (parent-repo session tooling) and
  T-002 (serve port change); no action expected unless CI scripts reference
  the old hardcoded port 8080 elsewhere.
- Team Lead: after T-004 is done and reviewed, symlink the other two
  SKILL.md copies to the repo copy; add `eval "$(rbenv init -)"` to
  `~/.zshrc`; consider a short repo-root `CLAUDE.md` noting the rbenv fact
  (none exists yet, confirmed by inspection) so a future session doesn't
  re-diagnose "Ruby is broken" from scratch.
