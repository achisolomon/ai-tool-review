# AI Tool Review — Factory Status
Updated: 2026-10-16    Phase: Build loop (small change)    Next gate: push approval
GitHub Project: https://github.com/users/achisolomon/projects/1

## Gates
| Gate | Status | Date | Notes |
|---|---|---|---|
| Gate 1 — PRD | skipped (small change) | 2026-10-16 | Scope set by the user's brief |
| Gate 2 — Design | skipped (small change) | 2026-10-16 | |
| Gate 3 — Release | pending | | Push to main needs approval |

## Open questions for the user
| # | Question | Raised by | Blocking |
|---|---|---|---|
| 1 | T-005: user adds permissions.allow + sandbox.excludedCommands to `ai landscape/.claude/settings.json` by hand (entries in tasks.md T-005); auto mode blocks Claude from editing it | Developer | No (fast path works, just prompts more) |
| 2 | Local test: user wants to try the fast path on a real tool (next tool to add, e.g. tailscale.com) from this worktree, check it on localhost, THEN approve merge + push | Team Lead | Yes, before merge |

## Resume here (next session)
1. Work in worktree `ai-tool-review/.worktrees/fast-tool-page` (branch `fast-tool-page`, unmerged, all committed). The skill changes live only here until merged.
2. Add the next tool with the new fast path, but in this worktree: follow `.claude/skills/tool-page-content/SKILL.md` (fast path), run `npm run tool-page-check`, serve with `eval "$(rbenv init -)" && PORT=8212 npm run serve:jekyll` (unsandboxed), user checks `http://localhost:8212/tools/<slug>/`.
3. After the user OKs: merge `fast-tool-page` into `main`, ask before `git push origin main`, watch CI, bump the submodule pointer in the parent repo (ask before pushing it too).
4. After merge: replace `~/.claude/skills/tool-page-content/SKILL.md` and `ai landscape/.claude/skills/tool-page-content/SKILL.md` with symlinks to `ai-tool-review/.claude/skills/tool-page-content/SKILL.md` (main checkout).
5. Queued tools: herdr.dev, t3.codes, paseo.sh (same tag/subcategory as superset.sh, verify), tailscale.com (unrelated, networking).

## Approvals log
| Date | Action approved by the user | Scope |
|---|---|---|
| 2026-10-16 | Fast path is the default inside tool-page-content for 1-2 tools; worktree only for 3+ or on request | skill design |
| 2026-10-16 | ai-tool-review/.claude/skills/tool-page-content is canonical; the other two copies become symlinks | skill files |
| 2026-10-16 | Add permission allowlist for the fast-check script and git add/commit/push and gh run in ai-tool-review | project settings |
| 2026-10-16 | Add `eval "$(rbenv init -)"` to ~/.zshrc | user shell profile |
| 2026-10-16 | NOT approved: pushing to main without a per-push confirmation | |

## Log
- 2026-10-16 — T-001..T-004 done and committed on fast-tool-page; T-001 Blocker (untracked files) fixed; tool-page-check runs green in 5.5s. T-005 settings.json edit blocked by auto-mode classifier (Self-Modification), handed to the user.
- 2026-10-16 — Request: speed up adding a new tool page (brief: speed-up-tool-pages-brief.md). Worktree `fast-tool-page`, port 8212.
