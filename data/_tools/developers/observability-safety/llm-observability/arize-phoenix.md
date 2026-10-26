---
name: "Arize Phoenix"
slug: "arize-phoenix"
website: "https://phoenix.arize.com/"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "Open-source LLM tracing and evaluation built on OpenTelemetry, with Arize AX as the managed enterprise option"
github_url: "https://github.com/Arize-ai/phoenix"
github_stars: 12006
pricing_model: "freemium"
founded_year: 2020
headquarters: "Berkeley, CA"
tags:
  - observability
  - tracing
  - self-hosted
  - python
  - rag
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">11k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">OpenTelemetry</span>
    <span class="label">Based (OpenInference)</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">Self-hosted</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Phoenix is Arize AI's open-source platform for tracing, evaluating and experimenting with LLM applications. It runs locally in a notebook, in a container or as a hosted instance, and collects traces through OpenInference, Arize's set of OpenTelemetry instrumentations for LangChain, LlamaIndex, the OpenAI and Anthropic SDKs, DSPy and many more. On top of traces, Phoenix offers LLM-as-judge evaluations, datasets, experiments for comparing prompts and models, and a prompt playground.</p>
<p>Phoenix is free to self-host with no feature gates. Teams that want a managed service, larger scale or enterprise controls can move to Arize AX, which shares the same instrumentation and adds monitoring, dashboards, SSO and SOC 2 compliance.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Phoenix?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams that want free, self-hosted tracing and evals</li>
        <li>RAG debugging and retrieval evaluation</li>
        <li>OpenTelemetry-based stacks</li>
        <li>Data scientists who like notebook-first workflows</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams that want a fully managed tool without any setup (use Arize AX)</li>
        <li>Organizations needing an OSI-approved license (Phoenix uses Elastic License 2.0)</li>
        <li>Non-technical reviewers who need a simple annotation UI</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Fully featured and free to self-host</li>
      <li>OpenTelemetry-native through OpenInference</li>
      <li>Strong built-in evaluators for RAG and agents</li>
      <li>Experiments and datasets for regression testing</li>
      <li>Smooth upgrade path to Arize AX</li>
    </ul>
    <div class="source"><a href="https://github.com/Arize-ai/phoenix" target="_blank">GitHub</a> - <a href="https://arize.com/pricing/" target="_blank">Arize pricing</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Self-hosting at scale means running your own database and storage</li>
      <li>Elastic License 2.0 restricts offering it as a hosted service</li>
      <li>Production monitoring and alerting are stronger in paid Arize AX</li>
      <li>UI can feel dense for newcomers</li>
    </ul>
    <div class="source"><a href="https://github.com/Arize-ai/phoenix/blob/main/LICENSE" target="_blank">Phoenix license</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/Arize-ai/phoenix" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Phoenix (open source)</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted tracing, evals and experiments</div>
  </a>
  <a href="https://arize.com/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">AX Free</div>
    <div class="price">$0</div>
    <div class="desc">25K spans/month, 15-day retention</div>
  </a>
  <a href="https://arize.com/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">AX Pro</div>
    <div class="price">$50<small>/mo</small></div>
    <div class="desc">50K spans/month, 30-day retention, dashboards</div>
  </a>
  <a href="https://arize.com/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">AX Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Self-hosted or SaaS, SSO, SOC 2 Type II</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>OpenTelemetry tracing via OpenInference</li>
      <li>LLM-as-judge and code evaluators</li>
      <li>Datasets and experiments</li>
      <li>Prompt playground and prompt management</li>
      <li>Retrieval and embedding analysis</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>LangChain, LlamaIndex, DSPy, Haystack</li>
      <li>OpenAI, Anthropic, Bedrock, Vertex AI</li>
      <li>CrewAI, OpenAI Agents SDK, smolagents</li>
      <li>Python and TypeScript</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Phoenix | Langfuse | LangSmith | Braintrust |
|---------|---------|----------|-----------|------------|
| Self-host free | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> | No | No |
| License | Elastic 2.0 | MIT | Proprietary | Proprietary |
| OpenTelemetry native | <span class="highlight">Yes</span> | Accepts OTel | Partial | Partial |
| Evals and experiments | Yes | Yes | Yes | <span class="highlight">Core focus</span> |
| Managed option | Arize AX | Langfuse Cloud | Yes | Yes |

</div>
