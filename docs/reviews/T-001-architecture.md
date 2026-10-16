# Code review — T-001, T-002
Date: 2026-10-16    Reviewed: commit 82cb1029 (T-001), commit 880e2130 (T-002)
Verdict: Request changes

## Summary
T-002 (package.json) is clean and matches its acceptance criteria exactly: additive-only diff,
`${PORT:-8080}` honored with the existing default preserved, new `tool-page-check` alias wired to
T-001's script. T-001's script gets the hard part right: the star-figure regex and frontmatter-strip
semantics in `check-star-figures.mjs` are byte-for-byte identical to the lookbehind regex in
`tests/data-integrity.spec.js:198`, cwd-independence via `BASH_SOURCE[0]` is correct, and every
`"${arr[@]}"` expansion is properly guarded by a `"${#arr[@]}" -gt 0` check first, which matters on
this machine's stock bash 3.2 (`set -u` throws `unbound variable` on a bare empty-array expansion in
that version, and this script avoids it everywhere). The blocking problem is the no-args file-detection
path: it only looks at `git diff` and `git diff --cached`, both of which are blind to untracked files.
A brand-new tool `.md` page, the single most common case this script exists to fast-check per the
brief, is untracked until `git add` runs, so its prose is never linted for a star figure and the chain
exits 0 regardless of a violation.

## Findings

| # | Severity | Area | Location | Problem | Recommended fix |
|---|---|---|---|---|---|
| 1 | Blocker | Correctness | scripts/tool-page-check.sh:59-65 | No-args file detection uses only `git diff --name-only` and `git diff --cached --name-only`, both of which omit untracked files. A freshly written tool `.md` under `data/_tools` (not yet `git add`ed) is invisible to the lint step. Verified empirically: creating an untracked file under `data/_tools` and running both diff commands against it produces no output from either. This defeats the acceptance criterion "running it after introducing a tool `.md` body containing e.g. '12k stars' exits non-zero at the lint step" for the realistic case of a brand-new page, since new pages are untracked, not already staged, right after being written. | Add `git ls-files --others --exclude-standard -- data/_tools` to the file sources (or switch entirely to `git status --porcelain -- data/_tools` parsed for `.md` paths), then dedupe with the existing `sort -u` before the `grep '\.md$'` filter. |
| 2 | Minor | Robustness | scripts/tool-page-check.sh:33-34 | `MAIN_CHECKOUT="$(cd "$REPO_ROOT/../.." && pwd)"` is computed unconditionally even when the script is run directly in the main checkout (not a worktree). In that case `../..` points two directories above the main checkout, not a sibling. The `[ "$MAIN_CHECKOUT" != "$REPO_ROOT" ]` guard prevents treating that as a false positive in the common case, but if a `vendor/bundle` directory happened to exist two levels above the main checkout by coincidence, this would symlink from the wrong place. Low likelihood, worth a one-line comment or an explicit check that `$REPO_ROOT` is actually inside a `.worktrees/` segment before trying the sibling-reuse path. | Either gate the reuse attempt on `$REPO_ROOT` containing `/.worktrees/`, or leave as is with a comment noting the guard's actual purpose, since current behavior is not wrong today, only fragile to a coincidence. |
| 3 | Nit | Clarity | scripts/tool-page-check.sh:62-63 | The `{ git diff ...; git diff --cached ...; } | sort -u | grep '\.md$' || true` line does three jobs in one pipeline (merge, dedupe, filter) ending in a blanket `|| true` that will also swallow a genuine `git` failure (e.g. not a git repo), not just "no matches." | Low risk here since the script already fails earlier if the repo isn't valid, but consider separating "no matches is fine" from "git itself failed" if this script grows. |

## What is done well
- Star-figure regex and frontmatter-stripping logic in `check-star-figures.mjs` match `tests/data-integrity.spec.js:198` verbatim, including the comment pointing back at the exact source line, so a local pass is a real guarantee rather than an approximation.
- Correct choice to shell out to Node for the lookbehind regex instead of grep, with the BSD/PCRE rationale documented inline.
- Every bash array expansion is guarded by a length check first, which avoids the classic `set -u` + empty-array crash on this machine's bash 3.2, without the developer necessarily having had to know that detail.
- `REPO_ROOT` resolution via `BASH_SOURCE[0]` is correct and was verified to resolve properly from a worktree's nested path.
- Fail-fast messages are one-line, point at the actual fix, and avoid raw stack traces, matching the task's intent.
- T-002 is a minimal, fully additive diff that does exactly what its acceptance criteria describe, with no collateral changes to other scripts.
- `serve:jekyll`'s `${PORT:-8080}` default is consistent with `playwright.config.js`'s own `PORT` default, so there is no divergence between the two.

## Handoffs
- Software Developer: fix Finding 1 (add untracked-file detection via `git ls-files --others --exclude-standard`) before this merges; it is the core scenario the fast path exists for. Findings 2 and 3 can be addressed in the same pass or deferred, at the Developer's discretion given their severity.
