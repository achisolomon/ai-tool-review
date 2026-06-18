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
bottom_line: "If you keep hitting your Claude usage limit, the cause is usually **model inheritance** — every subagent inherits your session model, so trivial file-reads run on expensive Opus. The fastest fix is tooling built for exactly this problem: Token Optimizer covers model routing, loop detection, and conversation history (60–75% of your bill) in one install. Pair it with Headroom if agents are reading huge files, and Claude Dashboard if you want to see where tokens go before changing anything."
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

The fastest fix is tooling built for exactly this problem.

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

## Why Subagents Are the Culprit

A Claude Code usage report from a heavy workflow user:

- **60%** of usage came from subagent-heavy sessions
- **9%** from `workflow-subagent` alone — tasks like "explore the codebase" and "list markdown files"
- **21%** from a skills plugin that dispatched its own agents

The model those subagents were running on? `opus[1m]` — the most expensive tier with a 1M-context window. Set as the session default, every subagent inherited it automatically.

The fix wasn't removing agents. It was routing them to the right model — which is exactly what Token Optimizer automates.

![A routing dashboard showing three rows — Haiku for search and read tasks at low cost, Sonnet for analysis at medium cost, Opus for architecture at high cost — with a status of "routing active, within limits".](/assets/images/learn/stop-burning-tokens-routing.png)
*After: each subagent dispatched to the cheapest model that can do the job. Same agents, same output, far fewer tokens.*

## Related Resources

- [**Browse all cost-reduction tools →**](/?subcategory=cost-reduction) — the full category, including [Token Optimizer](/tools/token-optimizer/), [Headroom](/tools/headroom/), [RTK](/tools/rtk/), [Context Mode](/tools/context-mode/), and [Claude Dashboard](/tools/claude-dashboard/)
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/) — a broader look at keeping AI-assisted development affordable
- [Loop Engineering](/guides/loop-engineering/) — how to build agent loops that don't run away with your budget
- [Coding agents](/?subcategory=coding-agents) — compare [Cline](/tools/cline/), [Aider](/tools/aider/), [GitHub Copilot](/tools/github-copilot/), and other terminal/CLI agents
