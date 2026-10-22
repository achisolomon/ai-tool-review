---
name: "Braintrust"
slug: "braintrust"
website: "https://www.braintrust.dev/"
type: "commercial"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "Evaluation-first AI observability platform used by Notion, Stripe and Vercel to trace, test and improve LLM apps and agents"
pricing_model: "freemium"
founded_year: 2023
headquarters: "San Francisco, CA"
tags:
  - observability
  - tracing
  - python
  - typescript
last_verified: "2026-10-17"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">$80M</span>
    <span class="label">Series B (2026)</span>
  </div>
  <div class="key-stat">
    <span class="number">$800M</span>
    <span class="label">Reported Valuation</span>
  </div>
  <div class="key-stat">
    <span class="number">Unlimited</span>
    <span class="label">Users on Every Plan</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Braintrust is an evaluation and observability platform for AI products. Its starting point is evals: you build datasets, write scorers (code or LLM-as-judge), and run experiments that show exactly which examples got better or worse when you change a prompt, model or agent. The same platform logs production traces, so real user interactions can be scored online and turned into new test cases. A playground lets engineers and product managers iterate on prompts side by side, and Loop, an AI agent, helps write scorers and analyze results.</p>
<p>Under the hood Braintrust built its own database for large, deeply nested agent traces. It raised an $80M Series B in February 2026 led by ICONIQ, with Andreessen Horowitz and Greylock, at a reported $800M valuation. Customers include Notion, Stripe, Vercel, Zapier, Replit, Ramp, Dropbox and Cloudflare.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Braintrust?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Product teams that ship AI features weekly and need regression tests</li>
        <li>Eval-driven development with engineers and PMs together</li>
        <li>Large agent traces in production</li>
        <li>Teams that want hosted or on-premises deployment</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams that require open-source, self-hosted tooling for free</li>
        <li>Very small projects that only need basic logging</li>
        <li>Budget-limited teams once usage exceeds the free tier</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Best-in-class experiment comparison and diffing</li>
      <li>Production traces flow straight into eval datasets</li>
      <li>Unlimited users on every plan, including free</li>
      <li>Proven at well-known AI product companies</li>
      <li>SOC 2 Type II, SSO and on-prem on Enterprise</li>
    </ul>
    <div class="source"><a href="https://siliconangle.com/2026/02/17/braintrust-lands-80m-series-b-funding-round-become-observability-layer-ai/" target="_blank">SiliconANGLE</a> - <a href="https://www.braintrust.dev/pricing" target="_blank">Official pricing</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Pro plan jumps to $249/month</li>
      <li>Free tier keeps data for only 14 days</li>
      <li>Not open source</li>
      <li>Eval setup takes upfront investment to pay off</li>
    </ul>
    <div class="source"><a href="https://www.voiceflow.com/blog/what-is-braintrust" target="_blank">Voiceflow overview</a> - <a href="https://aitoolsbakery.com/blog/braintrust-review/" target="_blank">AI Tools Bakery review</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.braintrust.dev/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Starter</div>
    <div class="price">$0</div>
    <div class="desc">1 GB data, 10K scores/month, 14-day retention</div>
  </a>
  <a href="https://www.braintrust.dev/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$249<small>/mo</small></div>
    <div class="desc">5 GB data, 50K scores, 30-day retention, RBAC, Loop</div>
  </a>
  <a href="https://www.braintrust.dev/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">On-prem or hosted, SAML SSO, SOC 2 Type II</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Experiments with example-level diffs</li>
      <li>Datasets and custom scorers</li>
      <li>Production logging and online scoring</li>
      <li>Prompt playground</li>
      <li>Loop agent for scorers and analysis</li>
      <li>Human review and annotation</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>Python and TypeScript SDKs</li>
      <li>OpenAI, Anthropic and other providers</li>
      <li>Vercel AI SDK, LangChain, OpenAI Agents SDK</li>
      <li>OpenTelemetry ingestion</li>
      <li>CI integration for eval gates</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Braintrust | LangSmith | Langfuse | Arize Phoenix |
|---------|------------|-----------|----------|---------------|
| Eval-first workflow | <span class="highlight">Core</span> | Yes | Yes | Yes |
| Open source | No | No | <span class="highlight">MIT</span> | Elastic 2.0 |
| Users on free tier | <span class="highlight">Unlimited</span> | 1 seat | 2 users | Unlimited (self-host) |
| On-prem | Enterprise | Enterprise | <span class="highlight">Free self-host</span> | <span class="highlight">Free self-host</span> |
| Paid entry | $249/mo | $39/seat | $29/mo | $50/mo (AX) |

</div>
