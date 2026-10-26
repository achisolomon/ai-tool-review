#!/usr/bin/env bash
# One entry point for every step of the tool-page-content fast path, so a
# session needs exactly one pre-approved, sandbox-excluded command pattern:
#   bash "<ai-tool-review>/.claude/scripts/tool-page.sh" <subcommand> ...
# (allowed + excluded from the sandbox in "ai landscape/.claude/settings.json").
# Always call the main checkout's copy; a worktree's copy also resolves to it.
#
# Subcommands:
#   start  <slug> <session_id>   create the session worktree (auto-named tool-<slug>)
#   exists <query>                find existing tool pages by file name / name / slug
#   urls   <url>...               HTTP status of each URL (follows redirects)
#   stars  <owner/repo>           GitHub API: stars, archived, fork, pushed_at, license
#   check  <session_id>           validate + generate + build + star lint + data tests
#   serve  <session_id>           start Jekyll on the worktree's port (background)
#   shot   <session_id> <slug>    phone-width full-page PNG of /tools/<slug>/ (for
#                                 Remote Control: send it with SendUserFile)
#   ship   <session_id> <message> commit everything the session changed, merge
#                                 origin/main, regenerate, check, push to main
#                                 (ONLY after the user said "ship it" in chat)
#   ci     <session_id> [slug..]  wait for CI + deploy, print live URL (or the failing tests); with slugs, wait until each page + its live js/data.js entry are served (ADMIN-READY)
#   cilog  <session_id>           failing tests + assertions of the latest Tests run
#   maindiff <session_id> <file>  diff a file between HEAD and origin/main (merge conflicts)
#   end    <session_id>           stop the server, remove the merged worktree
set -euo pipefail

SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPTS/../.." && pwd)"; REPO="${REPO%%/.worktrees/*}"   # main checkout
WT_PY="$SCRIPTS/session_worktree.py"
STATE_DIR="$REPO/.claude/session-worktrees"   # gitignored
SITE="https://$(cat "$REPO/CNAME" 2>/dev/null || echo aitoolreview.ai)"

die() { echo "✗ $*" >&2; exit 1; }
export LANG=C.UTF-8 LC_ALL=C.UTF-8   # the Ruby generator crashes on non-ASCII otherwise
rb() { if command -v rbenv >/dev/null 2>&1; then eval "$(rbenv init - bash 2>/dev/null)"; fi; }

state_file() {
  local h
  h="$(printf '%s' "$1" | shasum -a 256 | cut -c1-12)"
  echo "$STATE_DIR/$h.json"
}

# Prints the worktree path and port of this session (or dies).
wt_info() {
  local sf; sf="$(state_file "${1:?session_id required}")"
  [ -f "$sf" ] || die "no worktree for this session; run: start <slug> <session_id>"
  python3 - "$sf" <<'PY'
import json, sys
w = json.load(open(sys.argv[1])).get("worktree") or {}
if not w: sys.exit("no worktree recorded")
print(w["path"]); print(w["port"])
PY
}

wt_path() { wt_info "$1" | sed -n 1p; }
wt_port() { wt_info "$1" | sed -n 2p; }

cmd_start() {
  local slug="${1:?slug required}" sid="${2:?session_id required}"
  python3 "$WT_PY" create "tool-${slug}" "$sid" 2>&1 | grep -E "named|branch|refusing" || true
  wt_path "$sid" >/dev/null || die "worktree was not created"
  echo "WORKTREE=$(wt_path "$sid")"
  echo "PORT=$(wt_port "$sid")"
}

cmd_exists() {
  local q="${1:?query required}"
  cd "$REPO"
  { find data/_tools -iname "*${q}*" -name '*.md'
    grep -rliE "^(name|slug): \"?[^\"]*${q}" data/_tools --include='*.md' || true; } | sort -u
}

cmd_urls() {
  for u in "$@"; do
    curl -sL -o /dev/null --max-time 20 -w "%{http_code} $u\n" "$u" || echo "ERR $u"
  done
}

cmd_stars() {
  curl -s --max-time 20 "https://api.github.com/repos/${1:?owner/repo required}" | python3 -c '
import json, sys
d = json.load(sys.stdin)
if "full_name" not in d: sys.exit("not found: " + d.get("message", "?"))
lic = (d.get("license") or {}).get("spdx_id")
print("%s stars=%s archived=%s fork=%s pushed=%s license=%s homepage=%s" % (
    d["full_name"], d["stargazers_count"], d["archived"], d["fork"],
    d["pushed_at"][:10], lic, d.get("homepage") or "-"))
'
}

cmd_check() {
  local wt; wt="$(wt_path "$1")"
  cd "$wt"; rb
  npm run -s tool-page-check 2>&1 | grep -vE '^\S*\[[0-9]+/[0-9]+\] ' || { git checkout -q -- Gemfile.lock 2>/dev/null || true; die "check failed (see above)"; }
  # Bundler sometimes rewrites Gemfile.lock during the build; never ship that.
  git checkout -q -- Gemfile.lock 2>/dev/null || true
}

cmd_serve() {
  local wt port log pidf
  wt="$(wt_path "$1")"; port="$(wt_port "$1")"
  log="${TMPDIR:-/tmp}/tool-page-serve-$port.log"; pidf="$(state_file "$1").serve.pid"
  if curl -s -o /dev/null --max-time 2 "http://localhost:$port/"; then
    echo "already serving: http://localhost:$port/"; return
  fi
  ( cd "$wt"; rb; nohup bundle exec jekyll serve --port "$port" --host 127.0.0.1 >"$log" 2>&1 & echo $! >"$pidf" )
  for _ in $(seq 1 90); do
    [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "http://localhost:$port/" || true)" = "200" ] \
      && { echo "SERVING http://localhost:$port/"; return; }
    sleep 1
  done
  tail -5 "$log"; die "server did not come up on $port (log: $log)"
}

cmd_shot() {
  local sid="${1:?session_id required}" slug="${2:?slug required}" wt port out
  wt="$(wt_path "$sid")"; port="$(wt_port "$sid")"
  out="${TMPDIR:-/tmp}/tool-page-$slug.png"
  cmd_serve "$sid" >/dev/null
  ( cd "$wt" && URL="http://localhost:$port/tools/$slug/" OUT="$out" node -e '
    const { chromium } = require("@playwright/test");
    (async () => {
      const b = await chromium.launch();
      const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
      const r = await p.goto(process.env.URL, { waitUntil: "networkidle" });
      if (!r || r.status() !== 200) { console.error("HTTP " + (r && r.status())); process.exit(1); }
      await p.screenshot({ path: process.env.OUT, fullPage: true });
      await b.close();
    })().catch(e => { console.error(e.message); process.exit(1); });' ) || die "screenshot failed for /tools/$slug/"
  echo "SHOT $out"
}

cmd_ship() {
  local sid="${1:?session_id required}" msg="${2:?commit message required}" wt
  wt="$(wt_path "$sid")"; cd "$wt"; rb

  # The worktree belongs to this session alone, so commit everything it
  # changed (pages, tests, fixes), minus build noise and agent memory.
  git add -A -- . ':!Gemfile.lock' ':!.claude/agent-memory'
  git diff --cached --quiet || git commit -q -m "$msg"

  git fetch -q origin
  local out
  if ! out="$(git merge --no-ff --no-edit origin/main 2>&1)"; then
    if [ ! -f "$(git rev-parse --git-dir)/MERGE_HEAD" ]; then
      echo "$out" >&2
      die "merge with origin/main could not start (git output above); nothing was changed"
    fi
    local conflicts; conflicts="$(git diff --name-only --diff-filter=U)"
    if [ "$conflicts" = "js/data.js" ]; then
      git checkout -q --theirs js/data.js && git add js/data.js   # regenerated below
    else
      git merge --abort
      die "merge conflict in: $(echo $conflicts). For each file run
  maindiff $sid <file>
then edit the file in the worktree (keep main's changes plus yours) and run ship again."
    fi
  fi

  # Always regenerate after a merge: an auto-merged data.js can still be stale.
  cmd_check "$sid"
  git add -A js/data.js
  if [ -f "$(git rev-parse --git-dir)/MERGE_HEAD" ]; then git commit -q --no-edit; fi
  git diff --cached --quiet || git commit -q -m "chore: regenerate data.js after merging main"

  if [ -n "${DRY_RUN:-}" ]; then echo "DRY_RUN: would push $(git rev-parse --short HEAD) to main"; return; fi
  git push -q origin HEAD:main
  echo "PUSHED $(git rev-parse --short HEAD) to main"
  # Keep the main checkout current: it holds these scripts and is the base
  # for new worktrees. Fast-forward only, and only when it sits on main.
  if [ "$(git -C "$REPO" symbolic-ref --short -q HEAD)" = main ] \
     && git -C "$REPO" fetch -q origin && git -C "$REPO" merge -q --ff-only origin/main 2>/dev/null; then :
  else echo "note: main checkout not fast-forwarded (not on main or has local changes)"; fi
}

cmd_maindiff() {
  local sid="${1:?session_id required}" file="${2:?file path required}" wt
  wt="$(wt_path "$sid")"; cd "$wt"
  git fetch -q origin
  git diff "HEAD...origin/main" -- "$file"
}

cmd_ci() {
  local wt sha id
  local head
  wt="$(wt_path "$1")"; cd "$wt"; sha="$(git rev-parse HEAD)"
  for wf in "Tests" "Deploy to GitHub Pages"; do
    while :; do
      id=""
      for _ in $(seq 1 30); do
        # Skip "skipped" runs: a deploy left over from a cancelled Tests run that was re-run.
        id="$(gh run list --branch main --workflow "$wf" --limit 10 --json databaseId,headSha,conclusion \
              --jq ".[] | select(.headSha==\"$sha\" and .conclusion!=\"skipped\") | .databaseId" | head -1)"
        [ -n "$id" ] && break; sleep 5
      done
      [ -n "$id" ] || die "$wf run for $sha not found"
      if gh run watch "$id" --exit-status >/dev/null 2>&1; then
        echo "✓ $wf"; break
      elif [ "$(gh run view "$id" --json conclusion --jq .conclusion)" = cancelled ]; then
        # A newer push to main superseded this run (concurrent sessions):
        # follow main's latest commit, as long as it still contains ours.
        git fetch -q origin main
        head="$(git rev-parse origin/main)"
        if [ "$head" != "$sha" ] && git merge-base --is-ancestor "$sha" "$head"; then
          echo "↻ $wf run $id superseded; following main @ ${head:0:8}"
          sha="$head"
        else
          [ "$head" = "$sha" ] && die "$wf run $id was cancelled but nothing newer was pushed (likely the job timeout, e.g. a slow Playwright install); re-run it: gh run rerun $id"
          die "$wf run $id was cancelled and main does not contain $sha; ship again"
        fi
      else
        echo "✗ $wf failed (run $id). Failing tests:"
        cilog_run "$id"
        die "fix in the worktree, run check, then ship again (do not use raw gh/git)"
      fi
    done
  done
  echo "LIVE $SITE"
  # Admin approve matches pages via live js/data.js, so wait until each new
  # page and its data.js entry are actually served (Pages CDN lags the deploy).
  shift
  local slug ok
  for slug in "$@"; do
    ok=""
    for _ in $(seq 1 60); do
      if [ "$(curl -s -o /dev/null -w '%{http_code}' "$SITE/tools/$slug/")" = 200 ] \
         && curl -s "$SITE/js/data.js?v=$(date +%s)" | grep "\"slug\": *\"$slug\"" >/dev/null; then  # not grep -q: early exit SIGPIPEs curl, pipefail then fails
        ok=1; break
      fi
      sleep 10
    done
    [ -n "$ok" ] && echo "ADMIN-READY $slug ($SITE/tools/$slug/)" \
      || die "$slug not live after 10 min: page or js/data.js entry missing; do not approve yet"
  done
}

# Failing test names + assertion lines from a GitHub Actions run, no noise.
cilog_run() {
  gh run view "$1" --log-failed 2>&1 | cut -f3- | sed -E 's/^[0-9T:.-]+Z ?//; s/\x1b\[[0-9;]*m//g' \
    | grep -E '^\s+[0-9]+\) |Error:|Expected|Received|^\s+> *[0-9]+ \|' | awk '!seen[$0]++' | head -60
}

cmd_cilog() {
  local wt sha id
  wt="$(wt_path "${1:?session_id required}")"; cd "$wt"; sha="$(git rev-parse HEAD)"
  id="$(gh run list --branch main --workflow Tests --limit 10 --json databaseId,headSha,conclusion \
        --jq "([.[] | select(.headSha==\"$sha\")] + [.[] | select(.conclusion==\"failure\")])[0].databaseId")"
  [ -n "$id" ] && [ "$id" != "null" ] || die "no Tests run found for $sha"
  echo "Tests run $id:"; cilog_run "$id"
}

cmd_end() {
  local sid="${1:?session_id required}" pidf
  pidf="$(state_file "$sid").serve.pid"
  if [ -f "$pidf" ]; then kill "$(cat "$pidf")" 2>/dev/null || true; rm -f "$pidf"; fi
  python3 "$WT_PY" end "$sid" 2>&1 | tail -2
}

sub="${1:-}"; shift || true

# Inside the Bash sandbox, node_modules and .git are unreadable and npx falls
# back to a stray cached Playwright (MODULE_NOT_FOUND). That only happens when
# the call did not match the sandbox exclusion, so say exactly how to call it.
case "$sub" in
  start|check|serve|shot|ship|ci|cilog|end|maindiff)
    if ! cat "$REPO/node_modules/@playwright/test/package.json" >/dev/null 2>&1; then
      die "running inside the sandbox (node_modules unreadable). Re-run EXACTLY as:
  bash \"$SCRIPTS/tool-page.sh\" $sub $*
(no cd prefix, no env vars, no dangerouslyDisableSandbox). Do not debug further."
    fi ;;
esac

case "$sub" in
  start|exists|urls|stars|check|serve|shot|ship|ci|cilog|end|maindiff) "cmd_$sub" "$@" ;;
  *) sed -n '2,/^set -euo/p' "$0" | sed '$d'; exit 2 ;;
esac
