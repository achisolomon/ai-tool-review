---
title: "Build Your Agent Factory, Not Your Vendor's"
slug: vendor-neutral-agent-factory
description: "Your agent workflow is worth more than any one model. Keep the stations, rules and contracts in your repo, and put the model behind a gateway you can repoint with one config change."
author: AI Tool Review
date: 2026-10-16
category: AI Development
reading_time: 4
hero_image: /assets/images/learn/vendor-neutral-agent-factory.png
hero_image_alt: "A dark code-editor style card titled 'Build Your Agent Factory, Not Your Vendor's' listing four points: a model gateway to swap providers with one config change, MCP for tools and Markdown for skills and rules, AGENTS.md next to CLAUDE.md, and contracts between stations instead of vendor APIs."
hero_image_caption: "Own the factory. Rent the models."
bottom_line: "The valuable part of an agent setup is the **workflow**: the stations, the rules, and the contracts between them. Keep that in plain files you own, put models behind a **gateway**, and switching vendors becomes a config change instead of a rewrite."
tags:
  - AI Agents
  - MCP
  - Software Architecture
  - Vendor Lock-In
---

Most teams' agent setup grows inside one tool. The rules live in one vendor's config format, the tools are wired to one vendor's API, and the workflow only runs in one harness. Then prices change, a better model ships somewhere else, or an outage takes out your provider for an afternoon, and the whole pipeline stops with it.

The workflow is the asset. The model is a part you should be able to replace.

## The tip

Build the factory from parts you own, and keep the vendor-specific parts thin:

| Layer | Keep it portable with |
|---|---|
| Models | A gateway such as [LiteLLM Proxy](/tools/litellm-proxy/), [OpenRouter](/tools/openrouter/) or [Portkey](/tools/portkey/) |
| Tools | MCP servers, not tool code written against one vendor's SDK |
| Skills and rules | Markdown files in the repo |
| Project instructions | `AGENTS.md` as the shared source, `CLAUDE.md` pointing to it |
| Workflow | Contracts between stations: inputs, outputs, evidence |
| Fallback | An open-source harness such as [OpenHands](/tools/openhands/) that can run the same contracts |

A sketch of the gateway layer:

```yaml
# gateway.yaml (illustrative): stations ask for a role, not a vendor
models:
  planner:   { provider: anthropic, model: "<your-planning-model>" }
  builder:   { provider: anthropic, model: "<your-coding-model>" }
  reviewer:  { provider: openai,    model: "<a-different-family>" }
  cheap:     { provider: openrouter, model: "<small-fast-model>" }
fallbacks:
  builder: [cheap]
budgets:
  per_task_usd: 5
```

And the contract that each station works to, whatever model runs it:

```markdown
## Station: BUILD
Input:  PRD with goal, invariants and acceptance tests
Output: PR with green tests
Evidence: CI link, test names that map to the acceptance tests
Escalate when: a test needs changing, or a path rule requires approval
```

## Why it works

**Stations ask for roles, not vendors.** When the builder asks the gateway for `builder`, you can point that role at a new model, compare results, and roll back, without touching the workflow.

**Plain files travel.** MCP servers, Markdown skills and an `AGENTS.md` work across many harnesses. Content locked in one vendor's config format does not.

**Contracts make results comparable.** If every station's output and evidence are defined, you can run the same task on two models and judge them the same way.

**Different teams, same skeleton.** A payments team's checklist (fraud check, compliance, risk analysis, ledger update) is not a frontend team's (components, Storybook, visual tests, accessibility) or an infrastructure team's (Terraform, policies, security scan, cost check). Each team gets its own stations and rules on one shared structure.

## How to apply it

1. Put a gateway in front of every model call and give each station a role name.
2. Move tool integrations to MCP servers where one exists.
3. Move rules and skills into Markdown in the repo. Make `AGENTS.md` the source, and have `CLAUDE.md` reference it.
4. Write a short contract for each station: input, output, evidence, escalation.
5. Once a quarter, run one real task through a second model or an open-source harness to prove the switch still works.
6. Keep it simple. You need a factory, not a factory that builds factories. If a layer of abstraction does not remove a real dependency, delete it.
7. Keep humans and permissions in control. Portability is not a reason to give agents admin rights or remove the human from risky steps.

## Related

- [Path Rules Set the Floor](/guides/risk-tiered-review-path-rules/): a review station that does not depend on the model
- [Define Done Before You Start](/guides/define-done-goal-in-five-lines/): the goal format the contracts start from
- [Compaction Forgets. CLAUDE.md Doesn't.](/guides/claude-md-survives-compaction/): why rules belong in files
- [Don't Switch Models in the Middle of a Session](/guides/dont-switch-models-mid-session/): swap models between tasks, not mid-task
- [Observability for an AI Software Factory](/guides/observability-for-ai-software-factories/): comparing models on cost per task
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/) and [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/): routing work to the right model
