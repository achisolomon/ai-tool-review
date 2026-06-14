---
name: "OpenRouter"
slug: "openrouter"
website: "https://openrouter.ai/"
type: "commercial"
track: "developers"
category: "ai-infrastructure"
subcategory: "model-routers"
status: "active"
description: "Unified API gateway providing access to 300+ AI models from 50+ providers with automatic fallbacks, smart routing, and pay-per-use pricing"
pricing_model: "pay-per-use"
founded_year: 2023
headquarters: "San Francisco, CA"

# AI-Managed Metadata
last_verified: "2026-06-02"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">300+</span>
    <span class="label">AI Models</span>
  </div>
  <div class="key-stat">
    <span class="number">50+</span>
    <span class="label">Providers</span>
  </div>
  <div class="key-stat">
    <span class="number">10M+</span>
    <span class="label">Daily Requests</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OpenRouter is a unified API gateway that provides access to hundreds of AI models from dozens of providers through a single OpenAI-compatible endpoint. Instead of managing separate API keys and integrations for OpenAI, Anthropic, Google, Meta, Mistral, and others, developers use one API to access all of them. The platform handles automatic provider fallbacks, load balancing, and smart routing to optimize for cost, latency, or availability. Pay only for what you use with transparent per-token pricing and no monthly commitments.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OpenRouter?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers building apps that need multiple models</li>
        <li>Startups avoiding vendor lock-in</li>
        <li>Projects requiring fallback reliability</li>
        <li>Cost-conscious teams comparing providers</li>
        <li>Indie hackers with variable usage</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Enterprise compliance (use direct APIs)</li>
        <li>Lowest possible latency (adds hop)</li>
        <li>High-volume production (negotiate direct)</li>
        <li>Teams needing SLAs</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Single API for 300+ models across providers</li>
      <li>OpenAI-compatible endpoint (drop-in replacement, no code change to switch models)</li>
      <li>Automatic routing to the fastest provider, with fallbacks when one goes down</li>
      <li>Per-API-key spend limits that hold across every model — the cap follows the key whether the request hits Gemini or Claude Opus</li>
      <li>Zero Data Retention (ZDR) available as a default org-level setting</li>
      <li>Transparent per-token pricing, no monthly minimums</li>
      <li>Built-in usage analytics dashboard</li>
    </ul>
    <div class="source"><a href="https://openrouter.ai/docs/guides/features/guardrails" target="_blank">Guardrails &amp; Limits</a> · <a href="https://openrouter.ai/models" target="_blank">Models Page</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Adds latency (extra network hop)</li>
      <li>Small markup over direct provider pricing</li>
      <li>No enterprise SLAs available</li>
      <li>Less control over provider selection</li>
      <li>Depends on third-party availability</li>
    </ul>
    <div class="source"><a href="https://www.reddit.com/r/LocalLLaMA/comments/openrouter" target="_blank">Reddit Discussions</a></div>
  </div>
</div>

## Team Budget & Governance

<div class="overview">
<p>OpenRouter is a strong fit for team cost control because the spend limit lives on the <strong>API key</strong>, not the model. Issue a key per developer, set a cap, and it's enforced no matter which provider the request routes to — Gemini, Claude Opus, GPT, or anything else. Switching models needs no code change, so governance survives model churn.</p>
<ul>
  <li><strong>Per-key spend limits</strong> with automatic daily, weekly, or monthly resets — the daily window doubles as a runaway-session circuit breaker</li>
  <li><strong>Limit is model-agnostic</strong> — one cap covers all providers behind the key, so you can't dodge it by switching models</li>
  <li><strong>Zero Data Retention (ZDR)</strong> available as an org-level guardrail; when on, the lower of the ZDR and key budgets wins</li>
  <li><strong>Automatic fastest-provider routing + fallbacks</strong> keep teams productive without per-provider key management</li>
  <li><strong>Caveat:</strong> traffic flows through OpenRouter's infrastructure with a small markup — weigh against direct billing for compliance-sensitive or high-volume teams</li>
</ul>
<div class="source"><a href="https://openrouter.ai/docs/guides/features/guardrails" target="_blank" rel="noopener">Guardrails &amp; budget docs</a></div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://openrouter.ai/credits" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Pay-Per-Use</div>
    <div class="price">$0<small> minimum</small></div>
    <div class="desc">Pay only for tokens used</div>
  </a>
  <a href="https://openrouter.ai/models/anthropic/claude-sonnet-4" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Claude Sonnet 4</div>
    <div class="price">$3<small>/M input</small></div>
    <div class="desc">$15/M output tokens</div>
  </a>
  <a href="https://openrouter.ai/models/openai/gpt-4o" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">GPT-4o</div>
    <div class="price">$2.50<small>/M input</small></div>
    <div class="desc">$10/M output tokens</div>
  </a>
  <a href="https://openrouter.ai/models/meta-llama/llama-3.1-405b" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Llama 3.1 405B</div>
    <div class="price">$3<small>/M input</small></div>
    <div class="desc">Open-weight frontier model</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Supported Providers</h4>
    <ul>
      <li>OpenAI (GPT-4o, o1, o3)</li>
      <li>Anthropic (Claude 4 family)</li>
      <li>Google (Gemini 2.5 Pro/Flash)</li>
      <li>Meta (Llama 3.1, 3.2, 4)</li>
      <li>Mistral (Large, Medium, Small)</li>
      <li>Cohere (Command R+)</li>
      <li>DeepSeek (V3, Coder)</li>
      <li>Perplexity (Online models)</li>
      <li>50+ more providers</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>OpenAI-compatible API</li>
      <li>Automatic provider fallbacks</li>
      <li>Smart routing (cost/speed)</li>
      <li>Streaming support</li>
      <li>Function calling</li>
      <li>JSON mode</li>
      <li>Vision models</li>
      <li>Usage analytics dashboard</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Model Categories</h4>
    <ul>
      <li>Chat/Instruction models</li>
      <li>Reasoning models (o1, o3)</li>
      <li>Code generation</li>
      <li>Vision/Multimodal</li>
      <li>Embeddings</li>
      <li>Open-weight models</li>
      <li>Fine-tuned variants</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integration</h4>
    <ul>
      <li>REST API</li>
      <li>Python SDK</li>
      <li>JavaScript/TypeScript</li>
      <li>LangChain compatible</li>
      <li>LlamaIndex compatible</li>
      <li>Vercel AI SDK</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OpenRouter | LiteLLM | Portkey | Direct APIs |
|---------|------------|---------|---------|-------------|
| Models Available | <span class="highlight">300+</span> | 100+ (self-host) | 200+ | Varies |
| Setup Complexity | Low (hosted) | Medium (deploy) | Low (hosted) | High (per-provider) |
| Pricing Model | Pay-per-use + markup | Free + your costs | Freemium + markup | Direct rates |
| Fallback Routing | <span class="highlight">Automatic</span> | Configurable | Automatic | Manual |
| OpenAI Compatible | Yes | Yes | Yes | No (different formats) |
| Self-Hosted Option | No | <span class="highlight">Yes</span> | No | N/A |
| Enterprise SLA | No | Self-managed | Yes | Yes |
| Best For | Quick integration | Self-hosting teams | Enterprise | High volume |

</div>
