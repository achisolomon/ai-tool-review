---
title: "Observability for an AI Software Factory: Measure Tasks, Not Tokens"
slug: observability-for-ai-software-factories
description: "There is no single dashboard yet that shows what an AI-assisted software team is doing. Here is how to assemble one from three layers: agent telemetry, delivery metrics, and a factory-floor view."
author: AI Tool Review
date: 2026-10-16
category: AI Development
reading_time: 5
hero_image: /assets/images/learn/observability-for-ai-software-factories.png
hero_image_alt: "A dark code-editor style card titled 'Observability for an AI Software Factory' listing three layers: agent layer with OpenTelemetry, traces and cost per task; delivery layer with lead time, review wait and rework; factory floor with each station, queue and blocker."
hero_image_caption: "Three layers, one question: what got done, and what is stuck?"
bottom_line: "No single product shows the status of an AI software factory today, so assemble it from **agent telemetry, delivery metrics and a factory-floor view**. Whatever you build, **measure tasks, not tokens**: cost per completed task and first-pass acceptance tell you far more than raw usage."
tags:
  - AI Agents
  - Observability
  - Engineering Metrics
  - OpenTelemetry
sources:
  - title: "Claude Code Docs - Monitoring"
    url: "https://code.claude.com/docs/en/monitoring-usage"
---

Once several agents are planning, building and reviewing work, a natural question comes up: is there an observability framework that shows the status of the whole software company? Which tasks are moving, which are stuck waiting for a person, and what each finished task cost?

The honest answer is no, not as one off-the-shelf product. But the pieces exist, and they fit into three layers.

## The tip

Build the view in three layers, and point all of them at tasks rather than tokens.

**1. Agent layer: what the agents did and what it cost.** Claude Code can export metrics and events through OpenTelemetry. The documented metrics include session count, token usage, cost, lines of code changed, commits and pull requests created. Add trace tools such as [Langfuse](/tools/langfuse/), [LangSmith](/tools/langsmith/) or [Helicone](/tools/helicone/) for prompt-level detail, and a gateway such as [LiteLLM Proxy](/tools/litellm-proxy/) (or a local tool like ccusage) for cost per user and team.

```bash
# Claude Code → your OpenTelemetry collector (see the monitoring docs)
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector.internal:4317
# Tag sessions so you can group by team and station later
export OTEL_RESOURCE_ATTRIBUTES="team=payments,station=build"
```

For a whole organization, administrators can set the same variables in managed settings instead of asking each developer to export them.

**2. Delivery layer: is work reaching production?** Engineering metrics platforms such as [Jellyfish](/tools/jellyfish/), LinearB, Swarmia, DX and Faros track DORA-style measures: lead time, review wait, change failure rate, rework. Several are adding ways to separate agent-authored PRs from human ones. Check what your platform supports before relying on it.

**3. Factory floor: where is each task right now?** This is the part that is mostly custom today. Label PRs and tickets with their station (plan, build, review), risk tier and "blocked on human", then combine those labels with the OpenTelemetry data in a dashboard tool such as Grafana.

## Why it works

**Tokens are an input, not a result.** A session that used a lot of tokens and shipped a merged fix is a good session. One that used few and produced nothing is not. Cost only means something next to the task it bought.

**The layers answer different questions.** The agent layer explains cost and behavior. The delivery layer tells you if work reaches users. The factory floor tells you where to act today.

**Blocked-on-human is the queue that matters.** Agents can produce work faster than people can review or approve it. If you cannot see that queue, you will spend money producing work that waits.

## How to apply it

Start with five metrics. Each one is computable from PR labels, CI results and the telemetry above:

```text
tasks completed per $        = merged tasks / agent spend for those tasks
first-pass acceptance rate   = PRs approved without a rework cycle / PRs opened
review wait time             = time from "ready for review" to first human review
escalations to humans        = tasks that stopped for a human decision, by reason
rework rate                  = PRs reopened, reverted or fixed again within N days
```

1. Turn on OpenTelemetry export for your coding agents and send it to one collector.
2. Tag sessions and PRs with team, station and risk tier.
3. Connect your delivery metrics tool to the same repositories.
4. Build one dashboard with the five metrics above and a "blocked on human" queue per station.
5. Mine your sessions. Once a week, read a few of the most expensive or most reworked tasks and fix the cause: a missing rule, a vague goal, a weak test.

## Related

- [Path Rules Set the Floor](/guides/risk-tiered-review-path-rules/): the risk tiers to label and track
- [Failure Should Improve the Next Run](/guides/failure-should-improve-the-next-run/): turning escalations into guards
- [Build Your Agent Factory, Not Your Vendor's](/guides/vendor-neutral-agent-factory/): comparing models on cost per task
- [One Sensor. One Stop. One Budget.](/guides/one-sensor-one-stop-one-budget/): budgets per loop
- [Work in a 250k Context Window](/guides/keep-context-under-250k/) and [Cut the Noise Before the Agent Reads It](/guides/cut-the-noise-before-the-agent-reads/): what to fix when cost per task is high
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/) and [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/)
