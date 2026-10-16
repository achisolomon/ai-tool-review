---
title: "Define Done Before You Start: A Goal in Five Lines"
slug: define-done-goal-in-five-lines
description: "Telling an agent to fix the login bug gives it nothing to aim at. A five-line goal (outcome, invariants, evidence, stop, done when) tells it what success looks like and when to come back."
author: AI Tool Review
date: 2026-10-16
category: Claude Code
reading_time: 4
hero_image: /assets/images/learn/define-done-goal-in-five-lines.png
hero_image_alt: "A dark code-editor style card titled 'Define Done Before You Start' listing five lines: Outcome, Invariants, Evidence, Stop, and Done when."
hero_image_caption: "Five lines, written before the first line of code."
bottom_line: "An agent can only stop at the right place if you told it where that place is. Write **outcome, invariants, evidence, stop, and done when** before the agent starts, and you get work you can check instead of work you have to guess about."
tags:
  - Claude Code
  - AI Agents
  - Prompt Engineering
  - Developer Productivity
---

"Fix the login bug" feels like a clear request. To a coding agent it is an open invitation: it will change whatever looks related, decide for itself when it is finished, and hand you back something you now have to review from scratch. The problem is not the agent. Nobody said what success looks like.

## The tip

Before you hand a task to an agent, write the goal in five lines. Each line answers one question the agent would otherwise answer for you:

- **Outcome:** what changes for the user?
- **Invariants:** what must not change?
- **Evidence:** which test or flow proves it?
- **Stop:** when does the agent return to you?
- **Done when:** what has to be true to call it finished?

Here is the login bug, rewritten:

```text
Goal: session expiry on login

Outcome:    An expired session signs in and returns to the original page.
Invariants: Valid sessions behave exactly as before.
Evidence:   A focused test plus a browser flow prove both paths.
Stop:       Return when the evidence passes, or when you need authority
            (schema change, new dependency, touching auth config).
Done when:  The expired-session and valid-session journeys both pass.
```

Paste that at the top of the prompt, or keep it in the ticket the agent works from.

## Why it works

**The outcome narrows the search.** "Fix the bug" could mean anything. "Returns to the original page" points at one redirect.

**Invariants stop collateral damage.** Agents are good at making the failing thing pass. They are less careful about what they break on the way. Naming the behaviour that must stay the same gives the agent something to protect, and gives you something to check.

**Evidence replaces "looks done".** Without a named test or flow, the agent decides it is finished when the code reads well to it. With one, it is finished when something outside the model says so.

**Stop prevents runaway sessions.** An agent with no stop condition keeps going: more refactors, more files, more tokens. "Return when evidence passes, or authority is required" ends the session at the right place and keeps risky decisions with you.

**Done when is the contract.** It is what you check when the agent says it is done. If you could not write this line, you were not ready to delegate the task yet.

The same idea scales up. In a multi-step pipeline (plan, build, review), each step is defined by its contract: a plan produces scope and acceptance criteria, a build produces a PR with green tests, a review produces an approval with a risk tag. Write the contract first and the step second, before any code exists.

## How to apply it

1. **Write the outcome from the user's side.** Describe what someone sees or can do, not which function changes.
2. **List one or two invariants.** Pick the behaviour most likely to break as a side effect.
3. **Name the evidence by name.** A specific test file, a command, or a browser flow you can repeat.
4. **Set a stop rule with an escape hatch.** "Return when the evidence passes" plus a short list of things the agent must ask about first.
5. **Write "Done when" last, and read it back.** If it is vague, the goal is vague. Fix it before you start the agent.
6. **Check the result against the five lines,** not against your impression of the diff.

## Related

- [Don't Just /compact: Tell It What to Keep](/guides/compact-with-instructions/), so the goal survives a long session
- [One Sensor. One Stop. One Budget.](/guides/one-sensor-one-stop-one-budget/), the same idea applied to agent loops
- [The Builder Builds. A Fresh Context Judges.](/guides/fresh-context-verifier/), verifying against the goal instead of the code
- [Path Rules Set the Floor: Risk-Tiered Review for Agent PRs](/guides/risk-tiered-review-path-rules/)
- [Loop Engineering](/guides/loop-engineering/), building agent loops around clear goals
