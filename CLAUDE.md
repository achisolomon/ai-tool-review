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
- Ask the user exactly once ("ship it?", with the localhost link and the
  `shot` screenshot sent via SendUserFile, for phone/Remote Control use)
  before pushing to `main`; ask nothing else.

## Web research: deep mode ON

This project overrides the global lean default. Tool reviews need thorough, verified web research.

- Research runs in a subagent, not the main session. Use model `haiku` to gather and `sonnet` to synthesize. Always pass `model` explicitly.
- Per tool, check these sources: official site and pricing page, docs or changelog, G2 or Capterra, Reddit or Hacker News threads, one or two independent reviews, and the company's LinkedIn or press page.
- Fetch full pages for pricing, features and limits. Snippets are not enough for those.
- Every claim in a review needs a source URL. Follow the source-verification skill. If a claim has no official source, mark it "unverified" or leave it out.
- Prefer sources from the last 12 months. Note the date of each source.
- Stop when two independent sources agree on each key fact, or after about 15 fetches per tool, whichever comes first. Say what is still unconfirmed.
- The subagent returns a compact summary: fact, source URL, date, confidence. It does not return raw page text.
- Do not repeat a search or fetch already in the session notes. Write findings to a short notes file in the worktree, so a later session does not redo them.
