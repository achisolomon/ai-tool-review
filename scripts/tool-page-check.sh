#!/usr/bin/env bash
# One fail-fast check for the tool-page fast path: rbenv init, validate,
# generate, build, the star-figure prose lint, then the one Playwright file
# that would catch a star-figure regression in CI. Each step reports a
# one-line fix instead of a raw stack trace before the chain stops.
#
# Usage:
#   scripts/tool-page-check.sh                 # lint changed/staged tool .md files
#   scripts/tool-page-check.sh path/to/a.md ... # lint only the given files
#
# Runs correctly from any cwd: it resolves the repo root from this script's
# own location, not from an assumption about where it was invoked.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

fail() {
    echo "✗ $1" >&2
    exit 1
}

echo "==> [1/6] Loading rbenv"
if command -v rbenv >/dev/null 2>&1; then
    eval "$(rbenv init - 2>/dev/null)"
else
    fail "rbenv not found on PATH. Fix: install rbenv, or if it's already installed, check PATH (do not reinstall Ruby/bundler)."
fi

echo "==> [2/6] Checking Ruby toolchain (vendor/bundle)"
if ! bundle exec jekyll --version >/dev/null 2>&1; then
    # Only treat "$REPO_ROOT/../.." as the main checkout when REPO_ROOT is
    # actually a session worktree (ai-tool-review/.worktrees/<name>); for any
    # other layout that path is unrelated and must not be symlinked from.
    MAIN_CHECKOUT=""
    case "$REPO_ROOT" in
        */.worktrees/*)
            CANDIDATE="$(cd "$REPO_ROOT/../.." && pwd)"
            [ -d "$CANDIDATE/vendor/bundle" ] && MAIN_CHECKOUT="$CANDIDATE"
            ;;
    esac
    if [ -n "$MAIN_CHECKOUT" ]; then
        echo "    vendor/ missing here; reusing the main checkout's vendor/bundle via symlink."
        ln -s "$MAIN_CHECKOUT/vendor" "$REPO_ROOT/vendor"
    else
        echo "    No sibling vendor/bundle to reuse; running 'bundle install' once for this checkout."
        bundle install || fail "bundle install failed. Fix: run 'eval \"\$(rbenv init -)\"' then 'bundle install' by hand to see the real error."
    fi
    bundle exec jekyll --version >/dev/null 2>&1 || fail "Jekyll still not runnable after vendor setup. Fix: run 'bundle exec jekyll --version' by hand to see the real error."
fi

echo "==> [3/6] npm run validate"
npm run validate || fail "npm run validate failed. Fix: see the duplicate-tool or tag error above and correct the offending .md file."

echo "==> [4/6] npm run generate"
npm run generate || fail "npm run generate failed. Fix: see the ruby/generator error above; js/data.js is generated only, never hand-edit it."

echo "==> [5/6] npm run build"
npm run build || fail "npm run build failed. Fix: see the Jekyll build error above (often a malformed frontmatter or liquid tag)."

echo "==> [6/6] Star-figure prose lint + data-integrity test"

target_files=()
if [ "$#" -gt 0 ]; then
    target_files=("$@")
else
    while IFS= read -r f; do
        [ -n "$f" ] && target_files+=("$f")
    done < <(
        {
            git diff --name-only -- data/_tools
            git diff --cached --name-only -- data/_tools
            # A brand-new tool page is untracked, not a diff against HEAD,
            # until it is staged -- without this, adding a new tool (the
            # main fast-path use case) would skip the star-figure lint.
            git ls-files --others --exclude-standard -- data/_tools
        } | sort -u | grep '\.md$' || true
    )
fi

md_files=()
if [ "${#target_files[@]}" -gt 0 ]; then
    for f in "${target_files[@]}"; do
        [ -f "$f" ] || continue
        case "$f" in
            *.md) md_files+=("$f") ;;
        esac
    done
fi

# Use Node (not grep) to evaluate the exact regex literal from
# tests/data-integrity.spec.js's "no tool description prose hardcodes a
# GitHub star figure" test (line ~198), so a local pass here guarantees that
# Playwright test also passes on this rule, not a re-derived approximation.
# BSD grep (macOS default) has no -P/PCRE support, so Node is the only way
# to run this exact lookbehind-based pattern portably.
if [ "${#md_files[@]}" -gt 0 ]; then
    if ! node "$SCRIPT_DIR/check-star-figures.mjs" "${md_files[@]}"; then
        fail "Star figures must live only in the key-stats badge, not in prose. Fix: rephrase (e.g. \"strong, fast-growing adoption, see badge for count\") instead of repeating the number a second time."
    fi
fi

npx playwright test tests/data-integrity.spec.js --workers=1 || fail "tests/data-integrity.spec.js failed. Fix: see the Playwright failure above."

echo "✓ All checks passed."
