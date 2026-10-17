---
name: "Datadog Agent Observability (formerly LLM Observability)"
slug: "datadog-llm-observability"
website: "https://www.datadoghq.com/product/llm-observability/"
type: "commercial"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "Datadog's AI agent and LLM monitoring with tracing, evals, experiments and datasets, linked to your full Datadog stack"
pricing_model: "freemium"
founded_year: 2024
headquarters: "New York, NY"
tags:
  - observability
  - tracing
  - agents
  - python
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">40K</span>
    <span class="label">Free LLM Spans/Month</span>
  </div>
  <div class="key-stat">
    <span class="number">$160/mo</span>
    <span class="label">Pro Plan From</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">Tool and Retrieval Spans</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Datadog's product for monitoring LLM apps and AI agents, now called Agent Observability (previously LLM Observability), traces every step of an agent run: LLM calls, tool calls, retrieval and workflow steps, with latency, token usage, cost and errors. It adds built-in and custom evaluations, human review and annotation, versioned datasets made from production traces, and experiments that compare prompts, models and configurations side by side.</p>
<p>The main reason to choose it is integration: agent traces connect to the rest of Datadog, so you can follow a slow answer from the user's browser session through your backend services and into the model call, in the same tool your SRE team already uses. Datadog moved to a simpler pricing model with a free tier and per-LLM-span billing, where tool, workflow and retrieval spans are free.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Datadog Agent Observability?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Companies already standardized on Datadog</li>
        <li>Correlating agent behavior with backend and frontend performance</li>
        <li>Platform and SRE teams owning AI in production</li>
        <li>Enterprises that want one vendor for all monitoring</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Startups not using Datadog for anything else</li>
        <li>Teams that need self-hosting or open source</li>
        <li>Very high LLM call volumes on a tight budget</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>End-to-end correlation with APM, logs and real user monitoring</li>
      <li>Free tier and billing only on LLM spans</li>
      <li>Evaluations, datasets and experiments in one place</li>
      <li>Supports OpenAI, Anthropic, Gemini, Bedrock and major frameworks</li>
      <li>Enterprise-grade security and compliance</li>
    </ul>
    <div class="source"><a href="https://www.datadoghq.com/product/llm-observability/" target="_blank">Official product page</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Datadog bills add up across products</li>
      <li>Less specialized eval workflows than eval-first tools</li>
      <li>No self-hosting</li>
      <li>Retention beyond 15 days is a paid add-on</li>
    </ul>
    <div class="source"><a href="https://langfuse.com/compare/datadog" target="_blank">Langfuse comparison</a> - <a href="https://www.groundcover.com/guides/datadog-pricing-explained" target="_blank">Datadog pricing explained</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.datadoghq.com/product/llm-observability/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Up to 40K LLM spans/month, 15-day retention</div>
  </a>
  <a href="https://www.datadoghq.com/product/llm-observability/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">From $160<small>/mo</small></div>
    <div class="desc">Up to 100K LLM spans/month, then per 10K spans</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Full-stack agent tracing</li>
      <li>Latency, token, cost and error monitoring</li>
      <li>Built-in and custom evaluations</li>
      <li>Datasets from production traces</li>
      <li>Experiments comparing prompts and models</li>
      <li>Human review and annotation</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI, Anthropic, Gemini, Vertex AI, Bedrock</li>
      <li>LangChain, CrewAI, Pydantic AI, Strands Agents</li>
      <li>Python, Node.js and Java SDKs</li>
      <li>OpenTelemetry and HTTP API</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Datadog | Langfuse | Braintrust | Arize AX |
|---------|---------|----------|------------|----------|
| Full-stack APM correlation | <span class="highlight">Yes</span> | No | No | No |
| Free tier | 40K LLM spans | 50K units | 1 GB data | 25K spans |
| Self-hosting | No | <span class="highlight">Yes</span> | Enterprise | Enterprise |
| Eval depth | Good | Good | <span class="highlight">Best</span> | Good |

</div>
