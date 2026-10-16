# Project facts
Binding constraints for every agent. Changed only with the user's agreement.

## Product
- Name: AI Tool Review (ai-tool-review)
- Purpose (one line): Jekyll site that reviews and maps AI tools; new tool pages are added roughly daily.
- Greenfield or existing: Existing

## Constraints
- Mandated stack / languages: Jekyll 4.4 (Ruby 3.2.4 via rbenv, `.ruby-version`), Node >= 24 scripts, Playwright tests. Tool pages are markdown in `data/_tools/{track}/{category}/{subcategory}/{slug}.md`; `js/data.js` is generated (`npm run generate`), never hand-edited or hand-merged.
- Cloud / hosting: GitHub Pages style static site; CI on GitHub Actions (`Tests` workflow, daily `refresh-stars.yml` commits to main).
- Compliance and data sensitivity: No secrets in repo. Public content only.
- Budget envelope (monthly infra, third-party APIs): No new paid resources.
- Timeline / deadline: none

## Repository
- Hosting: GitHub `achisolomon/ai-tool-review`, a submodule of the parent `ai landscape` repo. Pushes go directly to `main` (no PRs, no branch protection).
- Branching: task branches from `main`; agents commit locally; push/merge only with user approval
- Layout overrides: tooling lives in `scripts/`, `.husky/`, `.claude/skills/`; session-worktree tooling lives in the PARENT repo at `ai landscape/.claude/scripts/session_worktree.py`.
- GitHub Project: `achisolomon/ai-tool-review` #1 (ai-tool-review-internal-project, https://github.com/users/achisolomon/projects/1)

## Toolchain facts (do not re-diagnose)
- rbenv + Ruby 3.2.4 are installed and correct. A fresh shell only needs `eval "$(rbenv init -)"`. Never reinstall Ruby or bundler.
- The Bash sandbox blocks socket binds; `session_worktree.py create` needs to run unsandboxed.
- Fresh worktrees get `node_modules` symlinked but not `vendor/`.

## Preferences
- Architecture working mode: Fast
- Subagent models must be passed explicitly (haiku for search/format, sonnet for review/synthesis, opus for complex work).
- Never use the em dash character in any output.
- User reviews changes on localhost before commit/push.
