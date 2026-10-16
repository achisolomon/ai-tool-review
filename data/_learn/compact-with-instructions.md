---
title: "Don't Just /compact: Tell It What to Keep"
slug: compact-with-instructions
description: "A bare /compact lets the model decide what to remember. Passing instructions, such as the goal, decisions, evidence and next step, turns compaction into a deliberate handoff."
author: AI Tool Review
date: 2026-10-16
category: Claude Code
reading_time: 3
hero_image: /assets/images/learn/compact-with-instructions.png
hero_image_alt: "A dark code-editor style card titled 'Don't Just /compact' showing the command '/compact keep: goal, decisions, failing test, next step' and a list of what must survive compaction."
hero_image_caption: "Compaction is a handoff to your future self."
bottom_line: "When you compact, the summary is all the next stretch of work gets. **Tell /compact what to keep:** the goal, the decisions, the evidence, and the next proof you are working toward."
tags:
  - Claude Code
  - Context Engineering
  - AI Agents
---

You are two hours into a Claude Code session, the context is filling up, and you type `/compact`. The session continues, but something is off. The agent has forgotten why you rejected the first approach, or which test was failing, and you spend the next twenty minutes re-explaining. A bare `/compact` lets the model decide what matters. It does not know what you need next.

## The tip

`/compact` accepts instructions. Use them. Tell it what must survive and what you are about to do:

```text
/compact keep: the goal, decisions made and why, the failing test name and
its current error, files changed so far, and the next step. Drop the
exploration of approaches we rejected.
```

That is the whole trick. One sentence of instructions turns a generic summary into a briefing.

## Why it works

**A summary is lossy by design.** Compaction replaces the conversation with a shorter version of itself. Something has to go. Without instructions, the model guesses which parts are important, and it tends to keep what was discussed most, not what you need next.

**The next iteration needs specific things.** To keep working, the agent needs four things: the **goal**, the **decisions** already made (so it does not reopen them), the **evidence** so far (what passes, what fails, with exact names), and the **next proof** it is working toward. Everything else is optional.

**The context window is working memory, not the system of record.** Compaction is a handoff, and a good handoff has a brief. Treat it the way you would brief a colleague taking over your task: what we are doing, what we decided, where it stands, what comes next.

**Compaction is one of several options.** Before you compact, check it is the right move:

- **Continue:** same goal, and the history is still relevant.
- **Rewind:** the last stretch went down a failed path; remove it instead of summarizing it.
- **/compact:** same goal, too much history; keep the goal, decisions, evidence and next proof.
- **/clear:** new task; start from a clean context.
- **Subagent:** a side investigation; have it return a conclusion, evidence and its open questions, not its whole transcript.

## How to apply it

1. **Check what is filling the window.** Run `/context` to see what is using the space before you decide.
2. **Pick the right move.** If the task changed, `/clear` beats `/compact`. If the last attempt failed, rewind instead of carrying it forward.
3. **Write the keep list.** Goal, decisions, evidence (exact test names and errors), files touched, next step.
4. **Say what to drop.** Rejected approaches, long tool output, and resolved tangents.
5. **Read the result.** After compacting, ask the agent to restate the goal and next step in two lines. If it gets them wrong, correct it now, not three turns later.
6. **Move durable rules to a file.** Anything that must hold every session belongs in `CLAUDE.md`, not in a summary.

## Related

- [Compaction Forgets. CLAUDE.md Doesn't.](/guides/claude-md-survives-compaction/), for rules that must outlive every summary
- [Work in a 250k Context Window, Not a 1M One](/guides/keep-context-under-250k/), on when to compact or start fresh
- [Define Done Before You Start: A Goal in Five Lines](/guides/define-done-goal-in-five-lines/), the goal worth keeping
- [Don't Switch Models in the Middle of a Session](/guides/dont-switch-models-mid-session/)
- [Cut the Noise Before the Agent Reads It](/guides/cut-the-noise-before-the-agent-reads/)
- [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/)
