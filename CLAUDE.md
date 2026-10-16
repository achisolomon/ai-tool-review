# ai-tool-review: notes for Claude

- Ruby: rbenv + Ruby 3.2.4 are already installed and correct. A fresh shell
  only needs `eval "$(rbenv init -)"` (same pattern as `.husky/pre-push`).
  Never reinstall Ruby or bundler; if `ruby -v`/`bundle` look wrong, it is
  almost always just an uninitialized shim, not a missing toolchain.
- `js/data.js` is generated only (`npm run generate`). Never hand-edit or
  hand-merge it; if a full regenerate's reshuffle diff is the problem, use
  the surgical-edit option in the tool-page-content skill instead.
- Adding or editing a tool page: use the `tool-page-content` skill's fast
  path (always in an auto-named session worktree, never ask the user for
  a name) and run
  `npm run tool-page-check` before every commit.
- Star-figure rule: no tool page body may hardcode a digit immediately
  followed by "star(s)" in prose; only the key-stats badge may show the
  number. `npm run tool-page-check` lints this locally before you push.
- Never push to `main` without asking the user, every time, right before
  the push.
