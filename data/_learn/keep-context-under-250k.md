---
title: "Work in a 250k Context Window, Not a 1M One"
slug: keep-context-under-250k
description: "A 1M-token context window is a ceiling, not a target. Every turn re-sends the whole context, so long sessions get slower, more expensive and less precise. Our rule of thumb: past about 250k, summarize and start fresh."
author: AI Tool Review
date: 2026-10-16
category: Claude Code
reading_time: 4
hero_image: /assets/images/learn/keep-context-under-250k.png
hero_image_alt: "A dark code-editor style card titled 'Work in a 250k Context Window, Not a 1M One' listing three points: every turn re-sends the whole context, long contexts get slower, pricier and less precise, and past about 250k you should summarize and start fresh."
hero_image_caption: "The context window is working memory, not the system of record."
bottom_line: "Every turn pays for the whole context again, and precision drops as it grows. Treat **about 250k tokens as your working limit**: past it, write a handoff, start a fresh session, and keep the 1M window for the rare task that truly needs it."
tags:
  - Claude Code
  - Context Engineering
  - Cost Optimization
  - AI Agents
---

Large context windows are useful. They are also easy to misuse. When the model can hold a million tokens, it is tempting to never clear, never compact, and let one session run all day. That session gets slower and more expensive with every turn, and the answers get less sharp. A big window is a ceiling, not a target.

## The tip

Keep your working sessions to roughly 250k tokens of context. That number is our rule of thumb, not a hard limit from any vendor. When a session gets near it, write a handoff and start fresh:

```text
We're near the context limit I work with. Write a handoff for a fresh session:
goal, done-when, decisions and why, current state (files, passing/failing
tests by name), and the next step. Under 30 lines.
```

Then `/clear` and paste the handoff. Check where you are with `/context` (what is filling the window) and `/cost` (what the session has spent so far).

## Why it works

**Every turn re-sends everything.** A chat model has no memory between turns. Each request includes the full conversation so far: your messages, the agent's replies, every file it read and every tool output. Prompt caching makes the repeated part cheaper, but you still pay for it on every turn, and anything that breaks the cache sends it all again at full price. Cost per turn grows with context length, so the last hour of a very long session costs far more than the first.

**Long contexts lose precision.** Models do not attend to a huge context evenly. As it fills with stale tool output, abandoned approaches and superseded instructions, the details that matter now compete with noise. This is often called "context rot": the agent starts missing constraints you set earlier or mixing up old and new versions of a file.

**Long contexts are slower.** More input means more processing before the first token comes back. In an interactive session you feel it on every turn.

**The window is working memory, not the system of record.** Durable facts belong in files: the goal in a ticket, conventions in `CLAUDE.md`, progress in commits and tests. If losing the context would lose the work, the work is in the wrong place.

## How to apply it

1. **Check the meter.** Run `/context` regularly and look at what is using the space, not just the total.
2. **Trim what it reads.** Ask for errors-only logs, scoped searches and specific symbols instead of whole files. Less in, less re-sent.
3. **Compact with instructions** when the goal is unchanged but the history is long.
4. **Hand off and start fresh** near 250k, or when the task changes.
5. **Mine your sessions.** A tool like ccusage shows tokens and cost per session, so you can see which sessions ran long and what they cost.
6. **Save the 1M window for real need,** like reading a large codebase once for a specific question, not for a day of accumulated chat.

## Related

- [Don't Just /compact: Tell It What to Keep](/guides/compact-with-instructions/)
- [Don't Switch Models in the Middle of a Session](/guides/dont-switch-models-mid-session/)
- [Cut the Noise Before the Agent Reads It](/guides/cut-the-noise-before-the-agent-reads/)
- [Compaction Forgets. CLAUDE.md Doesn't.](/guides/claude-md-survives-compaction/)
- [Observability for an AI Software Factory: Measure Tasks, Not Tokens](/guides/observability-for-ai-software-factories/)
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/)
- [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/)
