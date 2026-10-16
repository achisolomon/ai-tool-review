---
title: "Compaction Forgets. CLAUDE.md Doesn't."
slug: claude-md-survives-compaction
description: "Rules you type into chat can quietly disappear when a session is compacted. Put the rules that must always hold in CLAUDE.md, which Claude Code loads again on its own."
author: AI Tool Review
date: 2026-10-16
category: Claude Code
reading_time: 3
hero_image: /assets/images/learn/claude-md-survives-compaction.png
hero_image_alt: "A dark code-editor style card titled 'Compaction Forgets. CLAUDE.md Doesn't.' listing three points: compaction summarizes and summaries drop rules, CLAUDE.md is re-loaded on its own, and rules that must hold belong there, not in chat."
hero_image_caption: "Chat is temporary. Files are durable."
bottom_line: "Compaction is a summary, and summaries leave things out, including the rules you typed an hour ago. **If a rule must hold every session, write it into CLAUDE.md**, because that file is loaded again on its own and chat is not."
tags:
  - Claude Code
  - Context Engineering
  - CLAUDE.md
  - AI Agents
---

Early in a session you tell the agent "never edit the migrations folder" or "use pnpm, not npm". It follows the rule for an hour. Then the context gets compacted, and twenty minutes later it runs `npm install` as if you never said a word.

Nothing is broken. The rule lived in chat, and chat is what compaction rewrites.

## The tip

Treat chat as temporary and files as durable. When you state a rule that has to hold for the rest of the session, and for every session after it, put it in `CLAUDE.md` instead of (or as well as) typing it into the conversation. If you only need it for this session, re-state it after each compaction.

A short, specific `CLAUDE.md` section does the job:

```markdown
## Rules that always apply

- Package manager: pnpm. Never run npm or yarn.
- Do not edit files in db/migrations/. Create a new migration instead.
- Run `pnpm test --filter <package>` before saying a task is done.
- Public API types live in src/types/public.ts. Changing them needs my approval.
- Ask before adding a new dependency.
```

Keep each line a rule the agent can check itself against. "Write clean code" is not a rule. "Never edit db/migrations/" is.

## Why it works

Compaction turns a long conversation into a shorter summary so the session can keep going. A summary keeps what looks important to the current task and drops the rest. A constraint you mentioned once, two hundred messages ago, is exactly the kind of detail that gets compressed away.

`CLAUDE.md` is different. It is not part of the conversation history that gets summarized. Claude Code loads it on its own, so the rules in it come back after compaction without you doing anything.

There is a second benefit. A rule in a file is visible to the whole team, sits in version control, and applies to every new session and every teammate's agent. A rule typed into chat helps one session, until it doesn't.

## How to apply it

1. **Notice repeat instructions.** If you have typed the same correction twice, it belongs in a file.
2. **Move invariants to `CLAUDE.md`.** Package manager, forbidden folders, test commands, approval gates.
3. **Keep it short.** The file is loaded into every session, so every line costs context. Cut anything that is general advice rather than a rule.
4. **Write rules as checks.** "Do X" or "Never Y", with paths and commands spelled out.
5. **For session-only rules, re-inject them.** After a compaction, restate the goal and the constraints in one message, or brief the compaction itself (see [Don't Just /compact](/guides/compact-with-instructions/)).
6. **Review it like code.** Commit changes to `CLAUDE.md` with the rest of the change that made them necessary.

## Related

- [Don't Just /compact: Tell It What to Keep](/guides/compact-with-instructions/)
- [Work in a 250k Context Window, Not a 1M One](/guides/keep-context-under-250k/)
- [Define Done Before You Start: A Goal in Five Lines](/guides/define-done-goal-in-five-lines/)
- [Build Your Agent Factory, Not Your Vendor's](/guides/vendor-neutral-agent-factory/): keeping rules in Markdown files also makes them portable
- [Loop Engineering](/guides/loop-engineering/): the context.md pattern applies the same idea to long-running loops
