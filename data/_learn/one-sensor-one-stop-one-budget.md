---
title: "One Sensor. One Stop. One Budget."
slug: one-sensor-one-stop-one-budget
description: "An agent loop without a meter just spends money. Give every loop a goal, one sensor that measures it, one stop condition and one iteration budget before it escalates."
author: AI Tool Review
date: 2026-10-16
category: AI Development
reading_time: 4
hero_image: /assets/images/learn/one-sensor-one-stop-one-budget.png
hero_image_alt: "A dark code-editor style card titled 'One Sensor. One Stop. One Budget.' listing four lines: goal, the outcome outside the loop; sensor, a test or URL that measures it; stop, the condition that ends the loop; budget, 3 iterations then escalate."
hero_image_caption: "Observe, act, verify, update. With a meter."
bottom_line: "\"Keep trying until it works\" has no end condition, so it ends when the money or your patience runs out. **Name one sensor, one stop condition and one budget before the loop starts**, and escalate to a human when the budget is spent."
tags:
  - AI Agents
  - Loop Engineering
  - Claude Code
  - Cost Optimization
---

"Keep trying until it works" sounds like a loop. It isn't one. It has no way to tell whether the last attempt got closer, no point at which it stops, and no limit on what it spends. The agent retries, rewrites, retries again, and you find out an hour later.

[Loop Engineering](/guides/loop-engineering/) covers why loops beat manual prompting. This tip is about the part that keeps a loop from becoming a bill.

## The tip

Before a loop starts, write down four things:

- **Goal:** the outcome you want. It sits outside the loop and does not change while the loop runs.
- **Sensor:** one direct measurement of that goal. A test, a URL, an exit code. Not the agent's opinion.
- **Stop:** the exact condition that ends the loop with success.
- **Budget:** how many iterations it gets before it stops and asks for help.

Here is a spec for a real bug, where users lose their place after logging in:

```text
GOAL:    After login, the user returns to the URL they started from.
SENSOR:  Browser URL after the redirect + tests/auth/redirect.spec.ts
STOP:    Both journeys pass: deep link -> login -> same page,
         and direct login -> dashboard.
BUDGET:  3 iterations. Then stop and report what you tried,
         what the sensor showed each time, and your best hypothesis.

Each iteration: observe -> act -> verify -> update.
Do not start a new iteration without reading the sensor.
```

You can pass the same idea to `/goal` in Claude Code by making the condition something the agent can check, for example "`tests/auth/redirect.spec.ts` passes, max 3 attempts, then report".

## Why it works

The agent is the feedback loop: it observes, decides, acts, verifies, updates and repeats. That cycle only converges if each turn is anchored to something real. The goal stays fixed outside the loop, so the agent cannot quietly redefine success. The sensor gives direct evidence inside the loop, so "I think it's fixed" is replaced by "the test passed" or "the URL is still /dashboard".

One sensor matters. With five vague signals, the agent can always find one that looks good. With one, progress is unambiguous.

The budget is what turns a stuck loop into useful information. Three failed attempts with the sensor readings attached tell you far more than thirty attempts that drift. When the budget runs out, the right move is to escalate, not to try harder.

## How to apply it

1. **Write the goal first,** in user terms, before any code. (See [Define Done Before You Start](/guides/define-done-goal-in-five-lines/).)
2. **Pick one sensor** the agent can run itself: a focused test, a curl against a URL, a script that exits 0 or 1.
3. **Make the stop condition testable.** "Both journeys pass", not "it works".
4. **Set a small budget.** Three iterations is a reasonable default for a focused bug.
5. **Require a report on escalation:** attempts, sensor output for each, current hypothesis.
6. **Put the template in `CLAUDE.md` or a skill** so every loop starts from it.

## Related

- [Loop Engineering](/guides/loop-engineering/): the bigger picture on agent loops
- [Define Done Before You Start: A Goal in Five Lines](/guides/define-done-goal-in-five-lines/)
- [The Builder Builds. A Fresh Context Judges.](/guides/fresh-context-verifier/)
- [Failure Should Improve the Next Run](/guides/failure-should-improve-the-next-run/)
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/)
