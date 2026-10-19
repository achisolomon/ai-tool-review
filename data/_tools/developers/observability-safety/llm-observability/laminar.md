---
name: "Laminar"
slug: "laminar"
website: "https://laminar.sh/"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "Open-source observability for AI agents: automatic tracing, browser session replay and clustering of failure patterns"
github_url: "https://github.com/lmnr-ai/lmnr"
github_stars: 3404
pricing_model: "freemium"
founded_year: 2024
tags:
  - observability
  - tracing
  - agents
  - self-hosted
  - yc
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">3.4k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
  <div class="key-stat">
    <span class="number">YC S24</span>
    <span class="label">Backed</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Laminar is an open-source observability platform built specifically for AI agents rather than single LLM calls. It captures full agent traces automatically from popular SDKs, records browser sessions for browser agents so you can replay exactly what the agent saw, and groups failures into recurring patterns ("signals") so you can find what breaks most often. Traces are searchable, can be turned into evaluation datasets, and PII can be redacted before storage.</p>
<p>Laminar came out of Y Combinator's Summer 2024 batch and raised a $3M seed round in March 2026 led by Atlantic.vc. The platform is Apache 2.0 licensed and can be self-hosted, or used as a managed cloud with a free tier.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Laminar?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams running agents in production</li>
        <li>Browser agents (Browser Use, Stagehand, Playwright)</li>
        <li>Debugging why long agent runs fail</li>
        <li>Teams that want an open-source, self-hostable tool</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple chatbots with single LLM calls</li>
        <li>Enterprises that need a long vendor track record</li>
        <li>Teams already standardized on Datadog for everything</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Built around agents, with automatic failure-pattern detection</li>
      <li>Browser session recording synced with traces</li>
      <li>Drop-in instrumentation for Claude Agent SDK, OpenAI Agents SDK, Vercel AI SDK and LangChain</li>
      <li>Open source and self-hostable</li>
      <li>CLI and MCP tools to query traces from coding agents</li>
    </ul>
    <div class="source"><a href="https://laminar.sh/" target="_blank">Official site</a> - <a href="https://github.com/lmnr-ai/lmnr" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Young company with a small team</li>
      <li>Few independent reviews so far</li>
      <li>Less suited to classic LLM app monitoring than Langfuse or LangSmith</li>
      <li>No public compliance certifications listed</li>
    </ul>
    <div class="source"><a href="https://www.finsmes.com/2026/03/laminar-raises-3m-in-seed-funding.html" target="_blank">FinSMEs</a> - <a href="https://www.ycombinator.com/companies/laminar" target="_blank">YC profile</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/lmnr-ai/lmnr" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Self-hosted</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0, run on your own infrastructure</div>
  </a>
  <a href="https://laminar.sh/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Laminar Cloud</div>
    <div class="price">Free tier</div>
    <div class="desc">Managed cloud; paid plans scale with data volume</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Automatic agent tracing</li>
      <li>Browser session recording and replay</li>
      <li>Signals: clustering of failure patterns</li>
      <li>Full-text search across traces</li>
      <li>Evaluation datasets from production traces</li>
      <li>PII redaction</li>
      <li>CLI and MCP access, Slack alerts</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>Claude Agent SDK, OpenAI Agents SDK</li>
      <li>Vercel AI SDK, LangChain, Pydantic AI, Mastra</li>
      <li>Browser Use, Stagehand, Playwright</li>
      <li>OpenHands</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Laminar | Langfuse | AgentOps | LangSmith |
|---------|---------|----------|----------|-----------|
| Open source | <span class="highlight">Yes (Apache 2.0)</span> | Yes (MIT) | Yes (MIT SDK) | No |
| Self-hosting | <span class="highlight">Yes</span> | Yes | Limited | Enterprise only |
| Agent focus | <span class="highlight">Core</span> | General LLM apps | Core | General LLM apps |
| Browser session replay | <span class="highlight">Yes</span> | No | No | No |
| Free tier | Yes | Yes | Yes | Yes |

</div>
