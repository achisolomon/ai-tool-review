---
title: "Don't Switch Models in the Middle of a Session"
slug: dont-switch-models-mid-session
description: "Switching models halfway through a long session throws away the prompt cache and hands your history to a model that reads it differently. Start a new session with a handoff summary instead."
author: AI Tool Review
date: 2026-10-16
category: Claude Code
reading_time: 3
hero_image: /assets/images/learn/dont-switch-models-mid-session.png
hero_image_alt: "A dark code-editor style card titled 'Don't Switch Models in the Middle of a Session' listing three points: the prompt cache belongs to one model, switching re-bills the whole context, and the new model reads your history differently."
hero_image_caption: "New model? New session, with a short handoff."
bottom_line: "The prompt cache belongs to one model, so a mid-session switch re-processes your whole conversation at full input price. If you need a different model, **start a new session with a short handoff summary** and let it build its own cache."
tags:
  - Claude Code
  - LLM
  - Cost Optimization
  - Context Engineering
---

Halfway through a long session it is tempting to switch to a cheaper model for the easy part, or a stronger one for the hard part. It looks free: same conversation, different model. It is not. The switch costs you the cache you have been building all session, and it hands your instructions to a model that may read them differently.

## The tip

Pick a model at the start of a session and keep it. If you need a different model, end the session with a handoff summary and start a new one:

```text
Write a handoff for a fresh session. Include:
- Goal and "done when"
- Decisions made and why
- Current state: files changed, tests passing / failing (exact names)
- Next step
Keep it under 30 lines.
```

Then `/clear` (or open a new session), switch the model, and paste the handoff as the first message.

## Why it works

**The prompt cache is keyed per model.** On every turn, the agent re-sends the conversation so far. Prompt caching means the unchanged prefix is read from cache, which is cheaper and faster than processing it fresh. That cache belongs to the model that built it. Switch models and there is no cache for the new one, so the entire accumulated context is processed again at the full input price. The longer the session, the bigger that bill.

**A different model reads your history differently.** Over a long session you build up instructions, corrections and conventions that were tuned, often without noticing, to how one model responds. A different model interprets the same history in its own way. It may weigh an old instruction more heavily, or miss a correction the first model had absorbed. You end up with neither the original model's behaviour nor a clean start.

**A handoff is smaller than a history.** A 30-line summary carries the goal, the decisions and the state. It does not carry the dead ends, the long tool output, or the five versions of a function you threw away. The new model starts with less noise and builds its own cache from a short, clean prefix.

## How to apply it

1. **Choose the model before you start.** Match it to the hardest part of the task you expect, not the first message.
2. **Notice the urge to switch.** It usually means the task changed shape. That is a signal for a new session anyway.
3. **Ask for a handoff.** Use the prompt above, and check that the goal and next step are correct.
4. **Start fresh.** `/clear` or a new session, set the model, paste the handoff.
5. **Keep durable rules in files.** Project conventions belong in `CLAUDE.md` so every new session loads them, whatever the model.
6. **Watch the cost.** `/cost` in Claude Code, or a tool like ccusage, shows what each session actually spent. Compare a session where you switched with one where you did not.

## Related

- [Work in a 250k Context Window, Not a 1M One](/guides/keep-context-under-250k/), on why long contexts get expensive
- [Don't Just /compact: Tell It What to Keep](/guides/compact-with-instructions/), the same handoff idea inside one session
- [Compaction Forgets. CLAUDE.md Doesn't.](/guides/claude-md-survives-compaction/)
- [Build Your Agent Factory, Not Your Vendor's](/guides/vendor-neutral-agent-factory/), on switching models at the workflow level
- [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/), choosing the right model per task
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/)
