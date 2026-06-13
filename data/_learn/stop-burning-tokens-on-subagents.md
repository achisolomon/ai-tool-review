---
title: "Stop Burning Tokens on Subagents: A Model Routing Fix"
slug: stop-burning-tokens-on-subagents
description: "If you're hitting your Claude usage limit daily, subagents are probably the culprit. Here's how to audit your setup and route cheap tasks to cheaper models — without losing any capability."
author: AI Tool Review
date: 2026-06-13
category: Claude Code
reading_time: 5
hero_image: /assets/images/learn/stop-burning-tokens-receipt.png
hero_image_alt: "A mock Claude Code receipt itemizing trivial subagent tasks like 'read the file' and 'list the dir' all charged at OPUS rates, with a total of 'ALL OF THEM' tokens."
hero_image_caption: "Every subagent inherits your session model — even the one that just read a file."
tags:
  - Claude Code
  - Token Usage
  - Subagents
  - Cost Optimization
  - Developer Productivity
sources:
  - title: "Anthropic - Claude Code Hooks Documentation"
    url: "https://docs.anthropic.com/en/docs/claude-code/hooks"
  - title: "Anthropic - Model Overview"
    url: "https://docs.anthropic.com/en/docs/about-claude/models/overview"
---

You open Claude Code in the morning. By noon, you're rate-limited. Sound familiar?

If you're using workflows, skills, or the Agent tool heavily, the culprit is almost always **model inheritance**: every subagent you spawn defaults to whatever model your session is running — even when it's doing something as simple as reading a file or checking a spec.

## Step 0: Find Your Usage Breakdown

Before you fix anything, run `/usage` inside Claude Code. You'll see a panel like this:

```text
60% of your usage came from subagent-heavy sessions
    Each subagent runs its own requests. Be deliberate about
    spawning them — and consider configuring a cheaper model for
    simpler subagents.

49% of your usage was at >150k context
    Longer sessions are more expensive even when cached.
    /compact mid-task, /clear when switching to new tasks.

30% of your usage was while 4+ sessions ran in parallel
    All sessions share one limit. Queue them more evenly.

21% of your usage came from plugin "superpowers"
    Review what this plugin contributes — its agents, skills, and MCP
    tools all count toward your limit.

Skills              % of usage
/superpowers:systematic-debugging    8%
/impeccable                          5%
/superpowers:writing-plans           4%
/superpowers:subagent-driven-development  4%
...

Subagents           % of usage
workflow-subagent                    9%
judge-panel                          2%

Plugins             % of usage
superpowers                         21%
```

The **Subagents** and **Skills** sections tell you exactly which workflows are burning tokens. If `workflow-subagent` is near the top, that's model inheritance at work — a file-reading task running on your full session model.

## The Real Breakdown

A Claude Code usage report from a heavy workflow user matched exactly the pattern above:

- **60%** of usage came from subagent-heavy sessions
- **9%** from `workflow-subagent` alone — tasks like "explore the codebase" and "list markdown files"
- **21%** from a skills plugin that dispatched its own agents

The model those subagents were running on? `opus[1m]` — the most expensive tier with a 1M-context window. Set as the session default, every subagent inherited it automatically.

The fix wasn't removing agents. It was **routing them to the right model**.

## The Three-Tier Model

Not all tasks need the same intelligence. Claude offers three tiers with very different costs:

| Model | Best for | Avoid for |
|---|---|---|
| **Haiku** | Search, read, list, format, spec-check, file counts | Any reasoning or synthesis |
| **Sonnet** | Code review, analysis, moderate reasoning, summaries | Deep architecture work |
| **Opus** | Complex debugging, multi-file refactoring, hard reasoning | Anything routine |

The mistake most users make: they pick a model for their *session* and forget that every subagent inherits it.

## Fix 1: Set Your Default Model Lower

Your session default should be the model for your *most common* task, not your hardest one.

**Option A — change it for the current session only:**

Type `/model` in Claude Code to open the model picker, then select `claude-sonnet-4-6`. This takes effect immediately and resets when you start a new session.

**Option B — change the persistent default** (recommended):

Open `~/.claude/settings.json` and set:

```json
{
  "model": "sonnet",
  "effortLevel": "high"
}
```

Save the file. Every new session will now start on Sonnet. When a task genuinely needs Opus, type `/model opus[1m]` mid-session to switch up — then `/model sonnet` to switch back when you're done.

The key insight: `effortLevel` controls how hard Claude thinks per turn. Keeping it `high` on Sonnet gives you thorough responses at a fraction of the Opus cost. You only need Opus when the *reasoning ceiling* of Sonnet isn't enough — not for most daily tasks.

## Fix 2: Pass `model` Explicitly When Spawning Agents

If you dispatch subagents via the `Agent` tool, the Workflow tool's `agent()`, or `Task(...)`, always pass a model explicitly:

```
Agent({
  subagent_type: "Explore",
  model: "haiku",   // ← reading files, doesn't need sonnet
  prompt: "Find all markdown files under data/_tools and list their slugs."
})
```

Without `model`, the subagent inherits the session model. A fleet of 10 Explore agents on opus[1m] is the fastest way to hit your limit.

The rule of thumb:
- **Haiku** for any task that's essentially file I/O or pattern matching
- **Sonnet** for any task that requires reading and synthesizing across files
- **Opus** only for tasks you'd need a senior engineer's judgment on

## Fix 3: Use a TaskCreated Hook to Enforce This Automatically

Relying on memory doesn't scale. A `TaskCreated` hook fires every time a subagent task is spawned — by you, by a skill, or by a plugin — and can inject a model directive before the subagent starts.

Add to `~/.claude/settings.json`:

```json
"hooks": {
  "TaskCreated": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "python3 '/Users/you/.claude/hooks/task-model-guard.py'"
        }
      ]
    }
  ]
}
```

The hook script reads the task description and prompt, classifies the task (trivial vs. fleet vs. reasoning), and injects the appropriate model directive as `additionalContext`. Transparent for everything it doesn't recognize — no tasks get blocked.

## Fix 4: /clear Between Tasks

Context size is the other multiplier. When your session grows past ~150k tokens, every response is more expensive — even cached context still costs output tokens to process.

The habit: **`/clear` when you switch to an unrelated task**, `/compact` if you want to keep the context but trim it mid-session. This is particularly effective combined with dropping to a standard-window model (not `opus[1m]`), since the 1M window actively encourages you to let context grow.

## What to Expect

One user's results after applying these fixes:

- Default model changed from `opus[1m]` to `sonnet`
- `TaskCreated` hook enforcing haiku for trivial subagents
- `/clear` between tasks instead of letting sessions accumulate

The 60% subagent cost dropped sharply — not because they ran fewer agents, but because file-reading and spec-checking tasks stopped running on a model 5× more expensive than needed.

You don't need to do less. You need to do it at the right tier.
