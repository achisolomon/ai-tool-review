# ai-tool-review: notes for Claude

- Ruby: rbenv + Ruby 3.2.4 are already installed and correct. A fresh shell
  only needs `eval "$(rbenv init -)"` (same pattern as `.husky/pre-push`).
  Never reinstall Ruby or bundler; if `ruby -v`/`bundle` look wrong, it is
  almost always just an uninitialized shim, not a missing toolchain.
- `js/data.js` is generated only (`npm run generate`). Never hand-edit or
  hand-merge it.
- Adding or editing a tool page: follow the `tool-page-content` skill's fast
  path. Every step runs through `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" <cmd>`
  (absolute path, works from any directory), which is pre-approved and
  sandbox-excluded, so there are no permission prompts. It always uses an
  auto-named session worktree; never ask the user for a name.
- Star-figure rule: no tool page body may hardcode a digit immediately
  followed by "star(s)" in prose; only the key-stats badge may show the
  number. The `check` step lints this locally.
- Ask the user exactly once ("ship it?", with the localhost link) before
  pushing to `main`; ask nothing else.
