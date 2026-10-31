---
name: "Traceloop OpenLLMetry"
slug: "traceloop-openllmetry"
website: "https://www.traceloop.com/"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "Open-source OpenTelemetry instrumentation for LLM apps (OpenLLMetry) plus Traceloop's evaluation platform, now part of ServiceNow"
github_url: "https://github.com/traceloop/openllmetry"
github_stars: 7513
pricing_model: "freemium"
headquarters: "Tel Aviv, Israel"
tags:
  - observability
  - tracing
  - python
  - typescript
  - yc
last_verified: "2026-10-17"
confidence_score: 0.8
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">7.5k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">OpenTelemetry</span>
    <span class="label">Standard</span>
  </div>
  <div class="key-stat">
    <span class="number">ServiceNow</span>
    <span class="label">Acquired By</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OpenLLMetry is an open-source set of OpenTelemetry instrumentations for LLM applications. With a line of setup it traces calls to more than 20 model providers, vector databases and frameworks, and because the output is standard OpenTelemetry, you can send it to whatever backend you already use: Datadog, Grafana, Honeycomb, New Relic or Traceloop's own platform. SDKs exist for Python, TypeScript, Go and Ruby.</p>
<p>Traceloop, the Israeli Y Combinator company behind it, adds a commercial platform on top with monitoring, built-in quality evaluators (faithfulness, relevance, safety), custom evaluators and quality gates for CI. Traceloop raised a $6.1M seed in 2025 and has since been acquired by ServiceNow. OpenLLMetry remains Apache 2.0 licensed on GitHub.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OpenLLMetry?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams that already run OpenTelemetry</li>
        <li>Stacks with several model providers and frameworks</li>
        <li>Avoiding lock-in to one observability vendor</li>
        <li>ServiceNow customers building AI agents</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting one all-in-one LLM platform with prompt management</li>
        <li>Buyers wary of roadmap changes after an acquisition</li>
        <li>Teams with no observability backend at all</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Built on the OpenTelemetry standard, so data goes anywhere</li>
      <li>Broad coverage of providers, vector DBs and frameworks</li>
      <li>Simple setup in Python, TypeScript, Go and Ruby</li>
      <li>Built-in evaluators and CI quality gates in the platform</li>
      <li>SOC 2 and HIPAA support on the commercial platform</li>
    </ul>
    <div class="source"><a href="https://github.com/traceloop/openllmetry" target="_blank">GitHub</a> - <a href="https://www.traceloop.com/" target="_blank">Official site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>ServiceNow acquisition may shift the commercial roadmap</li>
      <li>Instrumentation only; you need a backend to view data</li>
      <li>Fewer prompt-management features than LangSmith or Langfuse</li>
      <li>Limited public reviews</li>
    </ul>
    <div class="source"><a href="https://www.sorensoncapital.com/from-traceloop-to-servicenow-how-ai-observability-became-the-missing-layer-in-enterprise-agent-systems/" target="_blank">Sorenson Capital</a> - <a href="https://tracxn.com/d/companies/traceloop/__8bsJrJFBRg7Ji1Qw0vprNSNgf78l7BtMfAYjWfZ-S_I" target="_blank">Tracxn</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/traceloop/openllmetry" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">OpenLLMetry</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0 SDKs, send data to any OTel backend</div>
  </a>
  <a href="https://www.traceloop.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Traceloop Platform</div>
    <div class="price">Free tier</div>
    <div class="desc">Monitoring and evals; enterprise plans by quote</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>OpenTelemetry instrumentation for LLM calls</li>
      <li>Prompts, completions, tokens and latency in traces</li>
      <li>Built-in quality evaluators</li>
      <li>Custom evaluators and CI quality gates</li>
      <li>Drift and regression monitoring</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI, Anthropic, Gemini, Bedrock, Ollama and more</li>
      <li>Pinecone, Chroma and other vector DBs</li>
      <li>LangChain, LlamaIndex, CrewAI</li>
      <li>Datadog, Grafana, Honeycomb, New Relic backends</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OpenLLMetry | OpenInference (Arize) | Langfuse | LangSmith |
|---------|-------------|-----------------------|----------|-----------|
| OpenTelemetry native | <span class="highlight">Yes</span> | Yes | Accepts OTel | Partial |
| Open source | <span class="highlight">Yes (Apache 2.0)</span> | Yes | Yes (MIT) | No |
| Backend choice | <span class="highlight">Any OTel backend</span> | Phoenix or any | Langfuse | LangSmith |
| Languages | Python, TS, Go, Ruby | Python, TS, Java | Python, TS | Python, TS |

</div>
