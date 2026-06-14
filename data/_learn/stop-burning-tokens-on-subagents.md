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
bottom_line: "If you keep hitting your Claude usage limit, the cause is usually **model inheritance** — every subagent inherits your session model, so trivial file-reads run on expensive Opus. Route work by task instead: Haiku for search/read/format, Sonnet for analysis, Opus only for hard reasoning. Three changes — a lower default model, a `TaskCreated` hook, and `/clear` between tasks — cut subagent cost sharply without removing a single agent."
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

You can fix this by hand (we cover the manual steps below), but the fastest route is tooling built for exactly this problem. So let's start there.

## The Tools That Fix This

The AI landscape's [**cost-reduction category**](/?subcategory=cost-reduction) collects tools built to cut token spend. Here's how the five main ones compare — what each is best at, and what to watch for:

| Tool | Best at | Token reduction | Watch out for | Stars |
|---|---|---|---|---|
| [**Token Optimizer**](/tools/token-optimizer/) | All-round waste detection inside Claude Code — model routing, loop detection, conversation-history awareness | 99%+ per-output; real bill savings | PolyForm Noncommercial license; plugin install needed | ~1.3K |
| [**Headroom**](/tools/headroom/) | Compressing everything agents read — tool output, logs, RAG, files | 60–95% | Adds processing overhead; can lose nuance | ~27K |
| [**RTK**](/tools/rtk/) | Cutting token use on CLI/dev commands, near-zero overhead | 60–90% | Limited native Windows (use WSL) | ~62K |
| [**Context Mode**](/tools/context-mode/) | Sandboxing tool output across 16 platforms; persistent knowledge base | up to 98% on tool outputs | Adds an indirection layer; MCP required | ~17K |
| [**Claude Dashboard**](/tools/claude-dashboard/) | Seeing where tokens go — local usage dashboard, burn-rate, heatmaps | Tracking only | New project; Claude Code logs only | ~9 |

**Start here:** [**Token Optimizer**](/tools/token-optimizer/) is the one that did this for us — it's the only tool above that covers all the major waste sources (model routing, loop detection, and the conversation history that's 60–75% of your bill), not just one. If your pain is specifically agents reading huge files, pair it with [**Headroom**](/tools/headroom/). And if you just want to *see* where your tokens go before changing anything, start with [**Claude Dashboard**](/tools/claude-dashboard/).

## Prefer to Do It Yourself?

If you'd rather understand exactly what's happening and fix it by hand — or you want to squeeze out the last bit of savings that tooling leaves on the table — the rest of this guide walks through it. You'll learn how to diagnose where your tokens actually go, then apply four manual fixes. These compound with the tools above: tooling does the heavy lifting, the habits keep it from creeping back.

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

![A routing dashboard showing three rows — Haiku for search and read tasks at low cost, Sonnet for analysis at medium cost, Opus for architecture at high cost — with a status of "routing active, within limits".](/assets/images/learn/stop-burning-tokens-routing.png)
*After: each subagent dispatched to the cheapest model that can do the job. Same agents, same output, far fewer tokens.*

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

## Related Resources

- [**Browse all cost-reduction tools →**](/?subcategory=cost-reduction) — the full category, including [Token Optimizer](/tools/token-optimizer/), [Headroom](/tools/headroom/), [RTK](/tools/rtk/), [Context Mode](/tools/context-mode/), and [Claude Dashboard](/tools/claude-dashboard/)
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/) — a broader look at keeping AI-assisted development affordable
- [Loop Engineering](/guides/loop-engineering/) — how to build agent loops that don't run away with your budget
- [Coding agents](/?subcategory=coding-agents) — compare [Cline](/tools/cline/), [Aider](/tools/aider/), [GitHub Copilot](/tools/github-copilot/), and other terminal/CLI agents
