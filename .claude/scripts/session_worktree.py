#!/usr/bin/env python3
"""Per-session git worktree + reserved port for ai-tool-review.

Every Claude Code session gets its own isolated checkout of ai-tool-review
and its own dev-server port, so parallel sessions never fight over the same
working tree, the same test-results cache, or the same localhost port.

  start   (SessionStart) create NOTHING -- a hook is a non-interactive
          command and cannot prompt. It injects an instruction telling the
          assistant to agree a name with the user, then run `create`.
  create  (assistant, mid-session) `create <name> <session_id>` -- make the
          worktree under a name the user approved.
  end     (SessionEnd)   remove the worktree again -- but ONLY when it holds
          no work that would be lost.

Safety rule for `end`: a worktree is removed only if it is clean (no
modified, staged, untracked, or ignored files other than the helper-created
dependency symlink) AND its branch has no commits that are missing from the
repo's main checkout. Anything else is kept, and the reason is printed.
Losing a session's work to an automatic cleanup is far worse than leaving a
stale directory behind.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# The ai-tool-review main checkout. This file lives in its .claude/scripts;
# a copy inside a worktree (.worktrees/<name>/...) still resolves to main.
_here = Path(__file__).resolve().parents[2]
REPO_PATH = Path(str(_here).split("/.worktrees/")[0])
REPO_APP = ""  # the app lives at the repo root, not a subdirectory
# ai-tool-review/.worktrees is already gitignored there and in manual use
# for feature branches; session worktrees share that same convention.
WORKTREE_ROOT = REPO_PATH / ".worktrees"
STATE_DIR = REPO_PATH / ".claude" / "session-worktrees"  # gitignored
PORT_LOCK_DIR = STATE_DIR / "port-locks"

PORT_BASE = 8180
PORT_SPAN = 200


def git(repo: Path, *args: str) -> str:
    """Run git in `repo` and return stdout, raising on failure."""
    out = subprocess.run(
        ["git", "-C", str(repo), *args],
        capture_output=True,
        text=True,
        check=True,
    )
    return out.stdout.strip()


def git_ok(repo: Path, *args: str) -> tuple[bool, str]:
    """Run git in `repo`; return (success, combined output) instead of raising."""
    out = subprocess.run(
        ["git", "-C", str(repo), *args],
        capture_output=True,
        text=True,
    )
    return out.returncode == 0, (out.stdout + out.stderr).strip()


def slug(session_id: str) -> str:
    """Short, collision-resistant, filesystem- and branch-safe session token."""
    if not session_id:
        return "nosession"
    return hashlib.sha256(session_id.encode()).hexdigest()[:12]


def port_offset(session_id: str) -> int:
    """Deterministic per-session offset inside the port block.

    Derived from the session id so the same session always gets the same
    port across restarts, and two concurrent sessions almost never collide.
    Ports are checked for real availability before being handed out anyway.
    """
    return int.from_bytes(hashlib.sha256(session_id.encode()).digest()[:4], "big") % PORT_SPAN


def port_free(port: int) -> bool:
    """True if `port` looks free on localhost.

    The Bash tool's sandbox denies socket binds outright (errno EPERM), which
    is not the same fact as "something is already listening on this port"
    (EADDRINUSE). Treating them the same makes every candidate port in the
    whole reserved block look busy under the sandbox, even when only one is
    genuinely taken. On EPERM, fall back to a connect probe instead: a
    successful connect means something really is listening (busy);
    ECONNREFUSED means nothing is (free). Any other bind failure (genuine
    EADDRINUSE, etc.) keeps the original bind-based behavior.
    """
    import errno
    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            s.bind(("127.0.0.1", port))
            return True
        except OSError as exc:
            if exc.errno != errno.EPERM:
                return False

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.2)
        result = s.connect_ex(("127.0.0.1", port))
        return result != 0  # 0 = connected = something is listening = busy


def reserve_port(base: int, offset: int) -> int | None:
    """Reserve the first free port in the block for this session.

    The lock is not a socket holder, so a non-session process can still take
    a port. It does, however, make simultaneous sessions choose different
    ports until their worktrees are safely removed.
    """
    PORT_LOCK_DIR.mkdir(parents=True, exist_ok=True)
    for i in range(PORT_SPAN):
        candidate = base + (offset + i) % PORT_SPAN
        lock = PORT_LOCK_DIR / str(candidate)
        if not port_free(candidate):
            continue
        try:
            lock.mkdir()
        except FileExistsError:
            continue
        return candidate
    return None


def release_port(port: int) -> None:
    try:
        (PORT_LOCK_DIR / str(port)).rmdir()
    except OSError:
        pass


def state_file(session_id: str) -> Path:
    return STATE_DIR / f"{slug(session_id)}.json"


# ---------------------------------------------------------------- start ----


def name_taken(name: str) -> bool:
    """True if a worktree or branch already exists under this name."""
    if (WORKTREE_ROOT / name).exists():
        return True
    ok, _ = git_ok(REPO_PATH, "rev-parse", "--verify", name)
    return ok


def start(session_id: str) -> None:
    """SessionStart: create NOTHING. A hook is a non-interactive command,
    so it cannot ask for a name. Instead, defer creation and tell the
    assistant to agree a name with the user first, then run `create <name>`."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    WORKTREE_ROOT.mkdir(parents=True, exist_ok=True)

    sf = state_file(session_id)
    if sf.exists():
        # Resumed session that already named and created its worktree.
        try:
            state = json.loads(sf.read_text())
        except (json.JSONDecodeError, OSError):
            state = {}
        if state.get("worktree"):
            emit_start_context(state["worktree"], [], state.get("name", ""))
            return

    emit_pending_context(session_id)


def create(session_id: str, name: str, *, hook_event: bool = False) -> None:
    """Create this session's worktree under the requested name."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    WORKTREE_ROOT.mkdir(parents=True, exist_ok=True)

    name = re.sub(r"[^a-zA-Z0-9-]+", "-", (name or "").strip().lower()).strip("-")
    if not name:
        print("refusing: empty name", file=sys.stderr)
        sys.exit(1)

    sf = state_file(session_id)
    if sf.exists():
        try:
            existing = json.loads(sf.read_text())
        except (json.JSONDecodeError, OSError):
            existing = {}
        if existing.get("worktree"):
            print(
                f"refusing: this session already has a worktree named "
                f"'{existing.get('name', '?')}'",
                file=sys.stderr,
            )
            sys.exit(1)

    if name_taken(name):
        # Never block on a collision: pick the first free numbered variant.
        base, n = name, 2
        while name_taken(f"{base}-{n}"):
            n += 1
        name = f"{base}-{n}"

    if not (REPO_PATH / ".git").exists():
        print(f"refusing: missing git checkout at {REPO_PATH}", file=sys.stderr)
        sys.exit(1)

    offset = port_offset(session_id)
    wt = WORKTREE_ROOT / name
    port = reserve_port(PORT_BASE, offset)
    if port is None:
        print("refusing: no free reserved port is available", file=sys.stderr)
        sys.exit(1)

    # Branch from whatever the main checkout currently has checked out, so
    # the session starts from the same place the user last left the repo.
    try:
        head = git(REPO_PATH, "rev-parse", "HEAD")
    except subprocess.CalledProcessError:
        release_port(port)
        print("refusing: unable to resolve the checkout HEAD", file=sys.stderr)
        sys.exit(1)

    ok, out = git_ok(REPO_PATH, "worktree", "add", "-b", name, str(wt), head)
    if not ok:
        release_port(port)
        print(
            f"refusing: worktree not created "
            f"({out.splitlines()[-1] if out else 'unknown error'})",
            file=sys.stderr,
        )
        sys.exit(1)

    link_node_modules(REPO_PATH, wt)
    link_vendor(REPO_PATH, wt)

    worktree = {
        "path": str(wt),
        "branch": name,
        "port": port,
    }

    state = {
        "session_id": session_id,
        "slug": slug(session_id),
        "name": name,
        "worktree": worktree,
    }
    state_file(session_id).write_text(json.dumps(state, indent=2))

    emit_start_context(worktree, [], name, stream=None if hook_event else sys.stderr)


def link_shared_dir(name: str, source: Path, dest: Path) -> None:
    """Symlink `name` (e.g. "node_modules", "vendor") from the main checkout
    into the worktree, so it is usable immediately without a from-scratch
    reinstall, and exclude the symlink from `git status` so it never makes
    the worktree look permanently dirty (see note below)."""
    src = source / name
    dst = dest / name
    if src.is_dir() and not dst.exists():
        try:
            dst.symlink_to(src, target_is_directory=True)
        except OSError:
            return

    # A `<name>/` pattern (trailing slash) ignores a real directory but NOT
    # this symlink, which would then show as an untracked file and make the
    # worktree look dirty forever -- so end() could never clean it up.
    # Exclude it locally rather than touching the repo's tracked .gitignore.
    # Note this must go in the COMMON .git/info/exclude: git reads only that
    # one, not the per-worktree admin dir's copy.
    ok, common = git_ok(dest, "rev-parse", "--path-format=absolute", "--git-common-dir")
    if not ok or not common:
        return
    exclude = Path(common) / "info" / "exclude"
    try:
        exclude.parent.mkdir(parents=True, exist_ok=True)
        current = exclude.read_text() if exclude.exists() else ""
        if name not in current.split():
            with exclude.open("a") as fh:
                fh.write(f"\n# per-session worktree: symlinked deps\n{name}\n")
    except OSError:
        pass


def link_node_modules(source: Path, dest: Path) -> None:
    """Symlink node_modules from the main checkout so the worktree is usable
    immediately without a reinstall."""
    link_shared_dir("node_modules", source, dest)


def link_vendor(source: Path, dest: Path) -> None:
    """Symlink vendor/ (Ruby gems, via Bundler) from the main checkout so a
    fresh worktree doesn't need its own from-scratch `bundle install`
    (slow -- compiles native extensions like google-protobuf, sass-embedded)."""
    link_shared_dir("vendor", source, dest)


def emit_pending_context(session_id: str) -> None:
    """No worktree yet: instruct the assistant to get a name from the user."""
    script = Path(__file__).resolve()
    lines = [
        "WORKTREE ISOLATION IS PENDING FOR THIS SESSION.",
        "",
        "This project gives every session its own git worktree and dev-server",
        "port for ai-tool-review. Nothing has been created yet.",
        "",
        "Before you edit any file under ai-tool-review, or start any dev server:",
        "",
        "  TOOL PAGES (tool-page-content skill): skip the steps below and run",
        f"    bash \"{script.parent}/tool-page.sh\" start <slug> {session_id}",
        "  (pre-approved, no prompt), then follow the skill's fast path.",
        "",
        "  1. Pick a short kebab-case name YOURSELF from the user's first",
        "     message. Do NOT ask the user to name or confirm it (they asked not",
        "     to be asked). Tool-page work: tool-<slug> after the (first) tool,",
        "     e.g. tool-omnivoice. Anything else: a short description, e.g.",
        "     search-box-fix.",
        "  2. Run it (unsandboxed, it probes ports):",
        "",
        f"       python3 '{script}' create <name> {session_id}",
        "",
        "     A taken name never blocks: it gets a -2, -3, ... suffix, so",
        "     concurrent sessions cannot collide. Use the name it prints.",
        "",
        "That prints the worktree path and port to use. Until it has run, do",
        "NOT edit files in the main checkout (ai-tool-review) and do not start",
        "a dev server there -- there is no isolation yet.",
        "",
        "If the user's first message is unrelated to this project's code (a",
        "question, a doc lookup), you may skip naming entirely; just don't edit",
        "project code until a worktree exists.",
    ]
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": "\n".join(lines),
                }
            }
        )
    )


def emit_start_context(
    worktree: dict,
    notes: list[str],
    name: str = "",
    stream=None,
) -> None:
    """Report the session's isolation info.

    As SessionStart additional context (stdout JSON) when the hook runs, or
    as plain text on `stream` when `create` is invoked mid-session by the
    assistant.
    """
    if not worktree and not notes:
        return

    title = (
        f"This session's worktree is named '{name}'."
        if name
        else "This session has its own git worktree and dev-server port."
    )
    lines = [title,
             "Do ALL code work for ai-tool-review inside this path, not in the",
             "main checkout, and start the dev server on the port listed here.",
             ""]
    if worktree:
        lines.append(f"- {worktree['path']}  (branch {worktree['branch']}, port {worktree['port']})")
    for n in notes:
        lines.append(f"- note: {n}")
    if worktree:
        lines += [
            "",
            "Run the dev server with an explicit port, e.g.:",
            f"    cd {worktree['path']} && PORT={worktree['port']} npm run serve",
        ]
    lines += [
        "",
        "This worktree is removed automatically when the session ends, but",
        "ONLY if it is clean and holds no unmerged commits. Commit or merge",
        "anything worth keeping before finishing.",
    ]

    text = "\n".join(lines)
    if stream is not None:
        print(text, file=stream)
        return

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": text,
                }
            }
        )
    )


# ------------------------------------------------------------------ end ----


def unsafe_reason(wt: Path, branch: str) -> str | None:
    """Return why this worktree must NOT be deleted, or None if it is safe."""
    ok, dirty = git_ok(wt, "status", "--porcelain", "--ignored", "--untracked-files=all")
    if not ok:
        return "git status failed; refusing to guess"
    # Ignored paths cleanup may disregard: the shared dependency symlinks the
    # helper creates, plus build/test output that every tool-page check
    # regenerates (without these, no worktree that ran a build is ever cleaned).
    disposable = ("node_modules", "vendor", "_site", ".jekyll-cache",
                  ".sass-cache", "playwright-report", "test-results")
    relevant_changes = [
        line for line in dirty.splitlines()
        # git quotes non-ASCII paths ("!! \"_site/...\""), so drop the quote.
        if not (line.startswith("!! ")
                and line[3:].lstrip('"').split("/")[0] in disposable)
    ]
    if relevant_changes:
        return f"{len(relevant_changes)} uncommitted or ignored change(s)"

    # Commits on the session branch that no other branch in the repo contains.
    ok, out = git_ok(REPO_PATH, "branch", "--all", "--contains", branch)
    if ok:
        others = [
            b.strip().lstrip("* ").strip()
            for b in out.splitlines()
            if b.strip() and branch not in b
        ]
        if others:
            return None  # merged somewhere; safe to drop

    if branch_merged(branch):
        return None
    ok, count = git_ok(REPO_PATH, "rev-list", "--count", f"origin/main..{branch}")
    if ok and count.isdigit() and int(count) > 0:
        return f"{count} commit(s) not merged into main or origin/main"

    return None


def branch_merged(branch: str) -> bool:
    """True if every commit on the branch is in the local or remote main.

    tool-page.sh ship pushes with `git push origin HEAD:main`, so local main
    never moves and a plain `git branch -d` refuses a fully shipped branch.
    Fetch first so origin/main reflects what was actually pushed.
    """
    git_ok(REPO_PATH, "fetch", "-q", "origin", "main")
    return any(
        git_ok(REPO_PATH, "merge-base", "--is-ancestor", branch, target)[0]
        for target in ("HEAD", "origin/main")
    )


def delete_branch(branch: str) -> tuple[bool, str]:
    """Delete a session branch, forcing only once it is verified merged."""
    if not git_ok(REPO_PATH, "rev-parse", "--verify", "-q", branch)[0]:
        return True, ""  # already gone
    if branch_merged(branch):
        return git_ok(REPO_PATH, "branch", "-D", branch)
    return git_ok(REPO_PATH, "branch", "-d", branch)


def branch_unsafe_reason(branch: str) -> str | None:
    """Return why a branch must be kept when its worktree is already gone."""
    ok, _ = git_ok(REPO_PATH, "rev-parse", "--verify", "-q", branch)
    if not ok:
        return None  # branch already gone; nothing to lose
    if branch_merged(branch):
        return None
    ok, count = git_ok(REPO_PATH, "rev-list", "--count", f"origin/main..{branch}")
    if not ok:
        return "unable to verify whether its branch is merged"
    return f"{count} commit(s) not merged into main or origin/main"


def end(session_id: str) -> None:
    sf = state_file(session_id)
    if not sf.exists():
        return

    try:
        state = json.loads(sf.read_text())
    except (json.JSONDecodeError, OSError):
        return

    c = state.get("worktree")
    if not c:
        sf.unlink(missing_ok=True)
        return

    wt = Path(c["path"])
    branch = c["branch"]
    removed = False
    kept_reason = None

    if not wt.exists():
        # Already gone (removed by hand, or a previous end() run).
        git_ok(REPO_PATH, "worktree", "prune")
        reason = branch_unsafe_reason(branch)
        if reason:
            kept_reason = f"branch kept: {reason}"
        else:
            deleted, output = delete_branch(branch)
            if deleted:
                release_port(c["port"])
                removed = True
            else:
                kept_reason = f"branch kept: {output or 'git branch deletion failed'}"
    else:
        reason = unsafe_reason(wt, branch)
        if reason:
            kept_reason = f"kept: {reason}"
        else:
            # Do not force removal: ignored files and a concurrent write must
            # keep the worktree rather than silently deleting data.
            ok, out = git_ok(REPO_PATH, "worktree", "remove", str(wt))
            if ok:
                deleted, output = delete_branch(branch)
                if deleted:
                    release_port(c["port"])
                    removed = True
                else:
                    kept_reason = f"worktree removed but branch kept: {output or 'git branch deletion failed'}"
            else:
                kept_reason = f"kept: removal failed ({out.splitlines()[-1] if out else '?'})"

    if removed:
        print(f"removed worktree {wt}", file=sys.stderr)
        sf.unlink(missing_ok=True)
    else:
        print(f"{wt}  — {kept_reason}", file=sys.stderr)
        state["kept"] = kept_reason
        sf.write_text(json.dumps(state, indent=2))


def main() -> None:
    action = sys.argv[1] if len(sys.argv) > 1 else "start"

    # `create` is run by the assistant, not by a hook: its args are
    # `create <name> [session_id]`. The hook actions read their payload on stdin.
    name = ""
    argv_session = ""
    if action == "create":
        name = sys.argv[2] if len(sys.argv) > 2 else ""
        argv_session = sys.argv[3] if len(sys.argv) > 3 else ""
    else:
        argv_session = sys.argv[2] if len(sys.argv) > 2 else ""

    payload = {}
    if action != "create" and not sys.stdin.isatty():
        try:
            raw = sys.stdin.read()
            if raw.strip():
                payload = json.loads(raw)
        except (json.JSONDecodeError, OSError):
            payload = {}

    session_id = (
        payload.get("session_id")
        or argv_session
        or os.environ.get("CLAUDE_SESSION_ID")
        or ""
    )

    if action == "start":
        # Creates nothing; a resumed session that already has a worktree just
        # gets its path reported again. Safe on every SessionStart source.
        start(session_id)
    elif action == "create":
        create(session_id, name)
    elif action == "end":
        end(session_id)


if __name__ == "__main__":
    main()
