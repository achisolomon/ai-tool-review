#!/usr/bin/env bash
# Stop hook: commit any uncommitted changes and push to the current branch.
# - No-op when the tree is clean.
# - Never commits/pushes on main or master (safety).
# - Never runs in a detached HEAD.
# - Commits are authored/committed as Claude <noreply@anthropic.com> so they
#   show as Verified and satisfy the git-check stop hook.
# Reads the hook JSON on stdin but does not need any of it; stdin is drained
# so the writer never blocks.
set -uo pipefail
cat >/dev/null 2>&1 || true   # drain stdin

# Resolve repo root (prefer the harness-provided project dir).
repo="${CLAUDE_PROJECT_DIR:-}"
if [ -z "$repo" ] || [ ! -d "$repo/.git" ]; then
  repo="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
fi
cd "$repo" 2>/dev/null || exit 0

# Must be on a real branch.
branch="$(git symbolic-ref --short -q HEAD)" || exit 0
[ -z "$branch" ] && exit 0
case "$branch" in
  main|master) exit 0 ;;
esac

# Nothing to commit -> silent no-op.
[ -z "$(git status --porcelain)" ] && exit 0

author_name="Claude"
author_email="noreply@anthropic.com"

# Stage only project source files; never stage secrets or build artifacts.
# Patterns mirroring .gitignore exclusions plus common sensitive file names.
secret_patterns='^\.env\|\.env\.\|secret\|credential\|\.pem$\|\.key$\|config-local\|supabase.*config\.js'
untracked_secrets="$(git ls-files --others --exclude-standard | grep -i "$secret_patterns" || true)"
if [ -n "$untracked_secrets" ]; then
  printf '{"systemMessage":"Auto-commit skipped: untracked file(s) match secret patterns — stage manually: %s"}\n' \
    "$(printf '%s' "$untracked_secrets" | tr '\n' ' ')"
  exit 0
fi

git add -A || exit 0
# Re-check after staging (e.g. everything was gitignored).
git diff --cached --quiet && exit 0

count="$(git diff --cached --name-only | wc -l | tr -d ' ')"

git \
  -c user.name="$author_name" \
  -c user.email="$author_email" \
  commit --quiet \
  --author="$author_name <$author_email>" \
  -m "chore: auto-commit working changes

Committed automatically at end of turn by the auto-commit-push Stop hook.

Co-Authored-By: Claude <noreply@anthropic.com>" || exit 0

# Push (best-effort with a few retries for transient network errors).
pushed=""
for delay in 0 2 4 8; do
  [ "$delay" != 0 ] && sleep "$delay"
  if git push -u origin "$branch" >/dev/null 2>&1; then
    pushed="yes"
    break
  fi
done

if [ -n "$pushed" ]; then
  printf '{"systemMessage":"Auto-committed %s file(s) and pushed to %s"}\n' "$count" "$branch"
else
  printf '{"systemMessage":"Auto-committed %s file(s) to %s (push failed — will retry next turn)"}\n' "$count" "$branch"
fi
exit 0
