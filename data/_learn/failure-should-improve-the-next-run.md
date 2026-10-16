---
title: "Failure Should Improve the Next Run"
slug: failure-should-improve-the-next-run
description: "An agent that restarts a service has taken an action, not fixed a problem. Here is how to make every handoff advance on evidence and turn each failure into a guard for the next run."
author: AI Tool Review
date: 2026-10-16
category: AI Development
reading_time: 4
hero_image: /assets/images/learn/failure-should-improve-the-next-run.png
hero_image_alt: "A dark code-editor style card titled 'Failure Should Improve the Next Run' listing four steps: contain the blast radius, capture direct evidence, extract the failure class, ship the lesson as a reusable guard."
hero_image_caption: "A restart is an action. Recovery is an outcome."
bottom_line: "Let each step of an agent workflow advance only on **evidence**, not on the claim that an action was taken. Then close the loop: every verified failure should leave behind a **reusable guard** that makes the next run safer."
tags:
  - AI Agents
  - SRE
  - DevOps
  - Incident Response
---

An alert fires. The agent restarts the service, the alert clears, and the run is marked done. A week later the same thing happens, and the agent restarts it again. Nothing was learned, because "I restarted it" was accepted as proof of recovery.

A restart is an action. Recovery is an outcome. Agent workflows need to tell the two apart, and then use each failure to improve the next run.

## The tip

Two rules.

**1. Each handoff advances on evidence.** Define what the next owner needs to see before accepting the work:

| Step | Advances when |
|---|---|
| ALERT → INVESTIGATE | Topology established; recovery action justified |
| RECOVER | Action completed; resulting state available |
| VERIFY | Errors and p99 latency back at baseline |
| IMPROVE | A reviewed guard exists, with thresholds, scope, owner and expiry |

If the evidence fails, go back to investigate. If the next step needs authority the agent does not have, stop and ask a human.

**2. Every failure ships a guard.** Contain the blast radius, capture direct evidence, extract the failure class, and ship the lesson as something that runs automatically next time.

```markdown
## Postmortem → guard checklist
- [ ] Contained: what was isolated, and when
- [ ] Evidence: logs, metrics or traces that show the cause (links, not summaries)
- [ ] Failure class: one line, general enough to recur
      e.g. "connection pool exhausted after a deploy with a new retry policy"
- [ ] Guard: the reusable check that catches this class next time
      type: test | CI check | alert | runbook step | CLAUDE.md rule
      threshold: ...
      scope: which services or paths
      owner: a named person
      expiry: review date
- [ ] Verified: the guard fails on the old state and passes on the fixed one
```

## Why it works

**Evidence stops false "done".** Agents are good at reporting that they did something. Asking for the resulting state (error rate, latency, a passing check) separates the action from the outcome, and a failed check sends the work back instead of closing it.

**The failure class is what transfers.** "Service X fell over on Tuesday" helps nobody next month. "Retries without a cap exhaust the pool" applies to every service, and it can be written as a test or a lint rule.

**Guards need an owner and an expiry.** A recovery gate nobody owns turns into noise that everyone ignores. An expiry date forces someone to decide whether it still earns its place.

**Robust is not enough.** A robust system survives the shock. An antifragile one learns from it, and the guard is how the learning gets stored.

## How to apply it

Automate the handoffs in one workflow, and answer five questions for it:

1. **Trigger:** what starts the work, and what goal does it define?
2. **Owners:** who owns each step, and who owns the overall outcome?
3. **Acceptance evidence:** what proof lets the next owner accept the work?
4. **Escalation:** when does the team need a human decision?
5. **Shared learning:** which verified lesson improves the next run, and where is it stored?

Start with one recurring alert. Write its acceptance evidence down, make the agent check it, and require a guard before the incident is closed.

## Related

- [One Sensor. One Stop. One Budget.](/guides/one-sensor-one-stop-one-budget/): the loop shape behind each step
- [The Builder Builds. A Fresh Context Judges.](/guides/fresh-context-verifier/): an independent check at VERIFY
- [Compaction Forgets. CLAUDE.md Doesn't.](/guides/claude-md-survives-compaction/): where some guards should live
- [Path Rules Set the Floor](/guides/risk-tiered-review-path-rules/): when a change needs human approval
- [Observability for an AI Software Factory](/guides/observability-for-ai-software-factories/): tracking escalations and rework
- [Loop Engineering](/guides/loop-engineering/): how to design loops that verify before they stop
