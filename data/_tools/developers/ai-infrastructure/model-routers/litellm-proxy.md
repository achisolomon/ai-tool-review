---
category: ai-infrastructure
confidence_score: 0.9
description: OpenAI-compatible proxy server for 100+ LLM providers with unified API, load balancing, fallbacks, and cost tracking for production AI applications.
github_stars: 13500
last_verified: '2026-06-03'
name: LiteLLM Proxy
pricing_model: freemium
slug: litellm-proxy
status: active
subcategory: model-routers
track: developers
type: oss
website: https://docs.litellm.ai/docs/simple_proxy
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">13.5K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">LLM Providers</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>LiteLLM Proxy is an open-source proxy server that provides a unified OpenAI-compatible API for 100+ LLM providers including Azure, Anthropic, Vertex AI, Bedrock, and more. It handles load balancing, automatic fallbacks, request retries, and cost tracking out of the box. With built-in spend tracking, virtual keys, and team management, LiteLLM simplifies multi-provider LLM deployment for production applications while maintaining full compatibility with existing OpenAI SDK code.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use LiteLLM Proxy?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers using multiple LLM providers who want a unified interface</li>
        <li>Teams migrating between providers or testing different models</li>
        <li>Production apps needing automatic fallbacks and load balancing</li>
        <li>Organizations wanting full control with self-hosted deployment</li>
        <li>Projects already using OpenAI SDK that want multi-provider support</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Single-provider applications that don't need routing</li>
        <li>Teams needing extensive prompt engineering and evaluation tools</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Drop-in replacement for OpenAI API with zero code changes</li>
      <li>Extensive provider support (100+ models across major platforms)</li>
      <li>Built-in load balancing and automatic fallback handling</li>
      <li>Comprehensive spend tracking and budget alerts</li>
      <li>Active community with 13K+ GitHub stars</li>
      <li>Free and open-source with optional managed service</li>
    </ul>
    <div class="source"><a href="https://docs.litellm.ai/docs/simple_proxy" target="_blank">Official Site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Configuration can be complex for advanced routing scenarios</li>
      <li>Self-hosted deployment requires infrastructure management</li>
      <li>Limited built-in observability compared to specialized tools</li>
    </ul>
    <div class="source"><a href="https://github.com/BerriAI/litellm" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://docs.litellm.ai/docs/simple_proxy/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Self-hosted, unlimited usage, all core features</div>
  </a>
  <a href="https://docs.litellm.ai/docs/simple_proxy/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Hosted</div>
    <div class="price">Pay-as-you-go</div>
    <div class="desc">Managed service, $0.0001 per request, no setup required</div>
  </a>
  <a href="https://docs.litellm.ai/docs/simple_proxy/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Dedicated support, SLA, custom deployments</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>OpenAI-compatible API for 100+ LLM providers</li>
      <li>Load balancing across multiple deployments</li>
      <li>Automatic fallbacks and retry logic</li>
      <li>Virtual keys and team management</li>
      <li>Real-time spend tracking and budget alerts</li>
      <li>Request logging and caching</li>
      <li>Rate limiting per user/team</li>
      <li>Custom callbacks and webhooks</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Python SDK and REST API</li>
      <li>OpenAI, Azure, Anthropic, Vertex AI, Bedrock</li>
      <li>Docker, Kubernetes deployment</li>
      <li>Self-hosted or managed cloud</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | LiteLLM Proxy | Helicone | Portkey |
|---------|---------------|----------|---------|
| Open Source | Yes | Yes | Partial |
| Providers | 100+ | 100+ | 250+ |
| Load Balancing | Built-in | No | Yes |
| Free Tier | Unlimited (OSS) | 10K req/mo | 10K req/mo |
| Hosted Option | Pay-per-use | $20/mo | $99/mo |
| Best For | Multi-provider routing | Cost tracking | Enterprise features |

</div>
