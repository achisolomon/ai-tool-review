---
category: ai-infrastructure
confidence_score: 0.9
description: Universal AI Gateway providing caching, rate limiting, analytics, and cost control for any AI API with one line of code.
last_verified: '2026-06-03'
name: Cloudflare AI Gateway
pricing_model: freemium
slug: cloudflare-ai-gateway
status: active
subcategory: model-routers
track: developers
type: commercial
website: https://developers.cloudflare.com/ai-gateway/
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">Unlimited</span>
    <span class="label">Requests</span>
  </div>
  <div class="key-stat">
    <span class="number">4.6/5</span>
    <span class="label">Rating</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Cloudflare AI Gateway is a unified API gateway that sits between your application and AI providers, offering caching, rate limiting, analytics, and cost controls for any LLM or AI API. With just a single line of code change, developers gain visibility into usage patterns, implement request retries and model fallbacks, and leverage Cloudflare's global edge network for reduced latency. The service is free with unlimited requests on all plans.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Cloudflare AI Gateway?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams needing observability across multiple AI providers</li>
        <li>Applications requiring intelligent caching to reduce costs</li>
        <li>Organizations implementing rate limiting and cost controls</li>
        <li>Developers wanting model fallbacks and automatic retries</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Use cases requiring on-premise deployment</li>
        <li>Teams needing advanced prompt engineering features</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Free unlimited requests on all plans</li>
      <li>One-line code change to integrate</li>
      <li>Intelligent caching reduces API costs by 50-90%</li>
      <li>Real-time analytics and logging dashboard</li>
      <li>Model fallbacks and automatic retry logic</li>
    </ul>
    <div class="source"><a href="https://developers.cloudflare.com/ai-gateway/" target="_blank">Official Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Limited to providers supported by Cloudflare</li>
      <li>Advanced features require enterprise plan</li>
      <li>May add minimal latency overhead</li>
    </ul>
    <div class="source"><a href="https://developers.cloudflare.com/ai-gateway/get-started/" target="_blank">Documentation</a></div>
  </div>
</div>

## Team Budget & Governance

<div class="overview">
<p>In June 2026 Cloudflare added <strong>spend limits</strong> to AI Gateway — making it a genuine budget-enforcement layer, not just an observability proxy. It's the lowest-friction option here: no self-hosting, and spend limits are available on any paid Cloudflare account.</p>
<ul>
  <li><strong>Daily, weekly, or monthly windows</strong> — fixed (calendar reset) or rolling (trailing N days); daily is a first-class option, not an afterthought</li>
  <li><strong>Metadata-scoped limits</strong> — cap spend by user ID, team, or application, up to 20 rules per gateway</li>
  <li><strong>Block or downgrade</strong> — return HTTP 429 at the cap, or route to a cheaper fallback model instead of failing</li>
  <li><strong>Caveat:</strong> lacks deep per-team RBAC and virtual-key hierarchies that LiteLLM and Portkey offer</li>
</ul>
<div class="source"><a href="https://developers.cloudflare.com/ai-gateway/features/spend-limits/" target="_blank" rel="noopener">Spend Limits docs</a></div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://dash.cloudflare.com/sign-up" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Unlimited requests, caching, analytics, rate limiting</div>
  </a>
  <a href="https://www.cloudflare.com/plans/enterprise/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Advanced features, SLA, dedicated support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Universal gateway for OpenAI, Anthropic, Azure, and more</li>
      <li>Intelligent caching with configurable TTL</li>
      <li>Rate limiting and request quotas</li>
      <li>Real-time analytics and logging</li>
      <li>Model fallbacks and retry logic</li>
      <li>Cost tracking and budget alerts</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>REST API</li>
      <li>Cloudflare Workers</li>
      <li>Global edge network</li>
      <li>Any HTTP client</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Cloudflare AI Gateway | Portkey | LiteLLM Proxy |
|---------|----------------------|---------|---------------|
| Pricing | Free unlimited | Usage-based | Free OSS |
| Caching | Built-in | Built-in | Basic |
| Analytics | Full dashboard | Advanced | Basic |
| Best For | Simplicity & scale | Enterprise | Self-hosted |

</div>
