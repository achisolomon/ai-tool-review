---
title: "Path Rules Set the Floor: Risk-Tiered Review for Agent PRs"
slug: risk-tiered-review-path-rules
description: "Agents open more pull requests than humans can review the same way. Route each PR by risk, let path rules set the minimum, and only ever let an AI router raise the bar."
author: AI Tool Review
date: 2026-10-16
category: AI Development
reading_time: 4
hero_image: /assets/images/learn/risk-tiered-review-path-rules.png
hero_image_alt: "A dark code-editor style card titled 'Path Rules Set the Floor' listing three review tiers: low risk to automated checks, medium risk to code owner, high risk to senior approval, with the note that path rules set the floor and the router can only raise it."
hero_image_caption: "Three review tiers. The floor comes from the paths, not from the model."
bottom_line: "Give every agent PR a risk tier, and let **path rules set the minimum** that no model can talk its way below. An AI router is useful for spotting extra risk, but it may only **escalate**, never downgrade."
tags:
  - AI Agents
  - Code Review
  - Software Engineering
  - Governance
---

Once agents start opening pull requests, review becomes the bottleneck. If every PR goes to a senior engineer, the queue grows faster than anyone can clear it. If none do, sooner or later an agent quietly edits a payment path or a migration and nobody with context looks at it.

The answer is not "review everything" or "trust the agent". It is to route each PR to the right level of review.

## The tip

Put a risk-assessment step between BUILD and MERGE, with three outcomes:

- **Low risk** → automated checks only (tests, lint, type checks, specialist review agents)
- **Medium risk** → a code owner approves
- **High risk** → senior approval

Two inputs decide the tier. **Path rules** are deterministic and written by people: they set the floor. An **AI router** reads the diff and may raise the tier if it sees something the rules missed. It can never lower it.

```yaml
# .github/review-tiers.yml (illustrative; enforce it in CI or a merge bot)
tiers: [low, medium, high]
default: medium

path_rules:            # the floor: deterministic, owned by humans
  - paths: ["docs/**", "*.md", "**/*.test.ts"]
    min_tier: low
  - paths: ["src/ui/**"]
    min_tier: medium
  - paths: ["src/payments/**", "src/auth/**", "migrations/**", "infra/**"]
    min_tier: high

router:                # the AI step: may escalate only
  allowed: escalate_only
  raise_if:
    - "changes permissions, secrets or data retention"
    - "removes or weakens a test or assertion"
    - "touches error handling on a money or auth path"

final_tier: max(path_floor, router_tier)
```

The last line is the whole idea. `max()` means a confident model can add scrutiny but cannot remove it.

## Why it works

**The floor is predictable.** Everyone can read the path rules and know that a change under `migrations/` will always reach a senior reviewer. That guarantee does not depend on how a model reads a diff on a given day.

**The router catches what paths miss.** A one-line change in a "safe" folder can still delete a check or swallow an exception. A model reading the diff is good at noticing that, and escalating costs only some reviewer time.

**Reviewers match your real risks.** Generic review agents (a code reviewer, a simplifier, a comment checker, a test analyzer, a silent-failure hunter) are a fine start, but they mostly catch nitpicks. The bigger win is building specialists for your own risk dimensions: conventions, correctness, security, reliability, performance, maintainability and observability, test quality. Those run in the low tier and feed the router.

**Each station has a contract.** PLAN produces a PRD. BUILD produces a PR with green tests. REVIEW produces an approval with a risk tag. When the output of each station is defined, the tier is just one more field in the handoff.

## How to apply it

1. List the paths where a mistake is expensive: money, auth, data, migrations, infrastructure. Mark them `high`.
2. Mark the clearly safe paths (docs, tests, copy) `low`. Leave everything else at a `medium` default.
3. Enforce the floor in CI or with code owners so it applies whether a human or an agent opened the PR.
4. Add an AI router that reads the diff and outputs a tier plus a one-line reason. Take the higher of the router's tier and the path floor.
5. Write two or three specialist reviewers for your own risk dimensions and run them on every PR.
6. Once a month, look at PRs that were escalated by the router. If the same reason keeps appearing, turn it into a path rule.

## Related

- [The Builder Builds. A Fresh Context Judges.](/guides/fresh-context-verifier/): why the reviewer should not be the agent that wrote the code
- [Define Done Before You Start: A Goal in Five Lines](/guides/define-done-goal-in-five-lines/): the contract each station works against
- [Failure Should Improve the Next Run](/guides/failure-should-improve-the-next-run/): turning review misses into new rules
- [Build Your Agent Factory, Not Your Vendor's](/guides/vendor-neutral-agent-factory/): stations and contracts that outlive any one model
- [Observability for an AI Software Factory](/guides/observability-for-ai-software-factories/): measuring review wait and escalations
- [Loop Engineering](/guides/loop-engineering/): designing the loops behind each station
