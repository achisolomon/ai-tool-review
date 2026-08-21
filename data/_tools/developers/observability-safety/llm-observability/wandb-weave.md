---
name: W&B Weave
slug: wandb-weave
website: https://wandb.ai/site/weave
type: open-source
track: developers
category: observability-safety
subcategory: llm-observability
status: active
description: Open source LLM observability and evaluation toolkit from Weights & Biases.
  Trace, evaluate, and monitor AI applications from experimentation to production
  with a single line of code.
github_url: https://github.com/wandb/weave
github_stars: 1121
pricing_model: freemium
founded_year: 2017
headquarters: San Francisco, CA
tags:
- observability
- tracing
- agents
last_verified: '2026-06-10'
confidence_score: 0.95
---
<div class="key-stats">
  <div class="key-stat">
    <span class="number">1.1K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">700K+</span>
    <span class="label">W&B Users</span>
  </div>
  <div class="key-stat">
    <span class="number">35+</span>
    <span class="label">Integrations</span>
  </div>
</div>

## Overview

<div class="overview">
<p>W&B Weave is an open source observability and evaluation toolkit that helps developers trace, evaluate, and monitor LLM applications from experimentation to production. With a single line of code using the <code>@weave.op</code> decorator, developers can automatically log all inputs, outputs, and metadata at granular level—organizing data into navigable trace trees for debugging complex agentic workflows. Weave reached General Availability in December 2024 and is now part of CoreWeave following Weights & Biases' acquisition in March 2025 at a $1.7B valuation. It supports both Python (3.10+) and TypeScript/JavaScript environments with native integrations for 15+ LLM providers including OpenAI, Anthropic, and Google, plus 19+ frameworks including LangChain, LlamaIndex, Claude Agent SDK, and CrewAI.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use W&B Weave?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams already using W&B for ML experiment tracking</li>
        <li>Production agent debugging and root cause analysis</li>
        <li>Multi-agent system observability</li>
        <li>Teams wanting open source with enterprise backing</li>
        <li>Evaluation-heavy workflows with LLM-as-judge</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting fully self-hosted (requires W&B account)</li>
        <li>LangChain-only shops (LangSmith more native)</li>
        <li>Simple single-model apps (overkill)</li>
        <li>Teams avoiding vendor ecosystems</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Open source (Apache 2.0) with enterprise support</li>
      <li>Single-line integration via @weave.op decorator</li>
      <li>Native multi-agent trace trees with session/turn organization</li>
      <li>Built-in scorers for safety (toxicity, PII, hallucinations)</li>
      <li>Run evaluations on live production traces</li>
      <li>Automatic code/dataset/scorer versioning</li>
      <li>35+ integrations including Claude Agent SDK</li>
    </ul>
    <div class="source"><a href="https://docs.wandb.ai/weave" target="_blank">Official Docs</a> · <a href="https://github.com/wandb/weave" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires W&B account—can't run fully standalone</li>
      <li>Younger than competitors (GA December 2024)</li>
      <li>Less community content than Langfuse/LangSmith</li>
      <li>Python 3.10+ required (no 3.9 support)</li>
      <li>Advanced features tied to W&B enterprise tiers</li>
    </ul>
    <div class="source"><a href="https://github.com/wandb/weave/issues" target="_blank">GitHub Issues</a> · <a href="https://pypi.org/project/weave/" target="_blank">PyPI</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://wandb.ai/site/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Basic tracing, evaluations, limited history</div>
  </a>
  <a href="https://wandb.ai/site/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Teams</div>
    <div class="price">Usage-based</div>
    <div class="desc">Unlimited history, team collaboration</div>
  </a>
  <a href="https://wandb.ai/site/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">SSO, RBAC, dedicated support, SLAs</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Tracing</h4>
    <ul>
      <li>@weave.op decorator for automatic logging</li>
      <li>Nested trace trees with session organization</li>
      <li>Multi-agent turn tracking</li>
      <li>Input/output/metadata capture</li>
      <li>Cost and latency tracking</li>
      <li>Code versioning per trace</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Evaluation</h4>
    <ul>
      <li>LLM-as-judge scorers</li>
      <li>Safety scorers (toxicity, bias, PII, hallucinations)</li>
      <li>Quality scorers (coherence, fluency, relevance)</li>
      <li>Custom scorer support</li>
      <li>Human/expert feedback collection</li>
      <li>Production trace evaluation</li>
      <li>Side-by-side comparison</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>LLM Providers</h4>
    <ul>
      <li>OpenAI</li>
      <li>Anthropic</li>
      <li>Google AI</li>
      <li>Amazon Bedrock</li>
      <li>Azure OpenAI</li>
      <li>Cohere, Groq, Mistral</li>
      <li>LiteLLM (unified interface)</li>
      <li>Local models</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Framework Integrations</h4>
    <ul>
      <li>LangChain / LangGraph</li>
      <li>LlamaIndex</li>
      <li>Claude Agent SDK</li>
      <li>OpenAI Agents SDK</li>
      <li>CrewAI / AutoGen</li>
      <li>DSPy</li>
      <li>Haystack</li>
      <li>PydanticAI / Instructor</li>
      <li>Vercel AI SDK</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | W&B Weave | Langfuse | LangSmith | Arize Phoenix |
|---------|-----------|----------|-----------|---------------|
| Open Source | <span class="highlight">Apache 2.0</span> | MIT | No | Apache 2.0 |
| Self-Hosted | No (needs W&B) | <span class="highlight">Yes</span> | No | <span class="highlight">Yes</span> |
| Agent Tracing | <span class="highlight">Native multi-agent</span> | Via SDK | Native | Via SDK |
| Built-in Scorers | <span class="highlight">Safety + Quality</span> | LLM-as-judge | Online evals | LLM-as-judge |
| Prod Evaluation | <span class="highlight">Live traces</span> | Manual | Manual | Manual |
| ML Integration | <span class="highlight">Full W&B platform</span> | None | None | Limited |
| Free Tier | Limited | 50K obs/mo | 5K traces/mo | Unlimited local |
| Best For | W&B users, agents | Full control | LangChain users | Local dev |

</div>
