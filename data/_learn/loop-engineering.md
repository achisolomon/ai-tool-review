---
title: "Loop Engineering: The New Way to Work with AI Coding Agents"
slug: loop-engineering
description: "Learn how loop engineering is transforming AI-assisted development. Instead of prompting AI manually, engineers are building automated systems that prompt AI agents in iterative loops."
author: AI Tool Review
date: 2026-06-12
category: AI Development
reading_time: 8
tags:
  - Claude Code
  - AI Agents
  - Automation
  - Developer Productivity
sources:
  - title: "The New Stack - Loop Engineering"
    url: "https://thenewstack.io/loop-engineering/"
  - title: "Addy Osmani - Loop Engineering"
    url: "https://addyosmani.com/blog/loop-engineering/"
  - title: "Anthropic - Long-running Claude for Scientific Computing"
    url: "https://www.anthropic.com/research/long-running-Claude"
  - title: "Claude Code Autonomous Loops Guide"
    url: "https://claudefa.st/blog/guide/mechanics/autonomous-agent-loops"
---

In 2026, the way engineers work with AI coding assistants has fundamentally shifted. Instead of manually prompting Claude or other AI agents for each task, leading developers are now writing **loops**—automated systems that prompt AI agents iteratively until work is complete.

## What Is Loop Engineering?

Loop engineering is the practice of designing automated agent workflows instead of prompting manually. Boris Cherny, head of Claude Code at Anthropic, captured this shift succinctly:

> "I don't prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops."

This statement, shared in June 2026, has over 2.3 million views and represents a fundamental change in how developers interact with AI assistants.

## Why Loops Instead of Prompts?

The traditional workflow—human thinks of task, prompts AI, reviews output, repeats—doesn't scale. Loop engineering addresses this by:

1. **Automating repetitive interactions** - Instead of re-prompting manually, the system handles iteration
2. **Running while you sleep** - Loops can work autonomously on long-running tasks
3. **Maintaining context** - Loops preserve state and learnings across iterations
4. **Self-verification** - Well-designed loops include checks before claiming completion

## Key Patterns in Loop Engineering

Anthropic's engineering team has deployed several patterns under their "Dynamic Workflows" feature:

| Pattern | Description |
|---------|-------------|
| **Fan-out** | Distribute work across multiple parallel agents |
| **Classify-and-act** | Route tasks based on type or category |
| **Adversarial verification** | One agent checks another's work |
| **Loop-until-done** | Keep iterating until completion criteria met |

### The Ralph Loop

A particularly useful pattern is the "Ralph loop"—named after the orchestration pattern that kicks the agent back when it claims completion:

> "The Ralph loop essentially asks 'are you really done?' when the agent claims completion. This is useful for long-running tasks since the agent will admit the task is not up to spec and continue working until it is."

## How to Use Loops in Claude Code

Claude Code provides built-in commands for loop engineering:

### `/loop` - Recurring Scheduled Prompts

```
/loop babysit all my PRs. Auto-fix build issues, and when comments come in, use a worktree agent to fix them.
```

This creates a recurring task that monitors your pull requests, automatically fixes CI failures, and addresses code review comments.

### `/goal` - Run Until Condition Met

```
/goal all tests pass and coverage is above 80%
```

This runs the agent continuously until the specified condition is verifiably true.

## The Self-Improving Loop Pattern

Popularized by Andrej Karpathy, this pattern creates agents that improve their own context over time:

1. **context.md** - An evolving file that serves as the agent's memory
2. **Folder instructions** - Tell Claude to read context.md at the start of every run
3. **Self-improvement directive** - Instructions for Claude to update context.md when done

Example folder instruction:
```
Before starting any task, read context.md. After completing the task,
update context.md with any learnings, decisions made, or context
that would be useful for future runs.
```

## Building Blocks You Need

A robust loop system requires five components:

1. **Automations** - Scheduled discovery and triage that run independently
2. **Worktrees** - Git worktrees so parallel agents don't conflict with each other
3. **Skills** - Documented project knowledge so Claude doesn't have to guess
4. **Hooks** - Shell commands that fire at specific lifecycle points
5. **Connectors** - Integration with your existing tools (GitHub, Slack, CI/CD)

## Critical Guardrails

An unattended loop is also a loop that makes mistakes unattended. The main risks are:

- **Weak verification** - Agent says it's done when it isn't
- **Comprehension debt** - Code merged without human understanding
- **Cognitive surrender** - Engineers stop thinking critically
- **Cost overruns** - Unbounded loops can generate massive API bills

### The Golden Rule

**Never let the generator grade its own work.** Anthropic's engineering team found that "when a single agent evaluates its own output, it confidently praises mediocre work."

Always use a separate verifier—whether that's a different agent, automated tests, or human review.

## Practical Example: PR Babysitter

Here's a complete loop that monitors and maintains your pull requests:

```
/loop every 10 minutes:
  1. Check for new PR comments
  2. For each comment requiring code changes:
     - Create a new worktree
     - Make the fix
     - Push and respond to the comment
  3. If CI is failing:
     - Analyze the error
     - Apply a fix
     - Push and re-run CI
```

## Architecture Insight

The engineering behind Claude Code reveals something surprising: only 1.6% of the codebase is AI decision logic. The other 98.4% is deterministic infrastructure:

- Permission gates
- Context management
- Tool routing
- Recovery logic

The agent loop itself is a simple while-loop. The real engineering complexity lives in the guardrails, verification systems, and recovery mechanisms around it.

## Results in Production

The impact of loop engineering at Anthropic has been significant:

- **80%+ of merged code** is now authored by Claude (as of May 2026)
- Engineers are merging **8x as much code per day** compared to 2024
- Teams report higher code quality due to systematic verification

<div class="key-takeaways">
<h3>Key Takeaways</h3>
<ul>
<li>Loop engineering means designing systems that prompt AI, not prompting AI yourself</li>
<li>Use <code>/loop</code> for recurring tasks and <code>/goal</code> for condition-based completion</li>
<li>Always separate generation from verification—never let an agent grade its own work</li>
<li>Build in guardrails: spending limits, human review checkpoints, and worktree isolation</li>
<li>Start simple: a basic PR babysitter loop can save hours of manual work</li>
</ul>
</div>

## Getting Started

1. **Start with a simple loop** - Monitor a single repository for CI failures
2. **Add verification** - Require tests to pass before claiming success
3. **Iterate on the loop itself** - Use learnings to improve your automation
4. **Scale gradually** - Add more sophisticated patterns as you gain confidence

Loop engineering represents a fundamental shift in how we work with AI. Instead of AI as a tool we use, it becomes infrastructure we configure. The engineers who master this pattern will have a significant productivity advantage in the years ahead.
