---
name: "Groq"
slug: "groq"
url: "https://groq.com/"
type: "commercial"
track: "developers"
category: "ai-infrastructure"
subcategory: "inference-apis"
status: "active"
description: "Ultra-fast LLM inference powered by custom LPU silicon, delivering 500+ tokens/sec for open-source models"
pricing_model: "pay-per-use"
founded_year: 2016
headquarters: "Mountain View, CA"
tags:
  - inference-api
  - custom-silicon
  - llama
  - mixtral
  - low-latency
last_verified: "2026-06-02"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">500+</span>
    <span class="label">Tokens/sec</span>
  </div>
  <div class="key-stat">
    <span class="number">&lt;50ms</span>
    <span class="label">Time to First Token</span>
  </div>
  <div class="key-stat">
    <span class="number">10+</span>
    <span class="label">Models Available</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Groq provides the fastest LLM inference API in the market, powered by their custom-designed Language Processing Unit (LPU) silicon. Unlike GPUs that were designed for graphics and adapted for AI, the LPU was purpose-built from the ground up for sequential inference workloads like language models. This results in dramatically lower latency and higher throughput - often 10x faster than GPU-based alternatives. Groq hosts popular open-source models including Llama 3, Mixtral, and Gemma, making it ideal for applications where response speed is critical.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Groq?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Real-time chat applications needing instant responses</li>
        <li>Voice AI and conversational agents</li>
        <li>High-throughput batch processing</li>
        <li>Cost-sensitive open-source model deployment</li>
        <li>Latency-critical production workloads</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Proprietary frontier models (GPT-4, Claude)</li>
        <li>Fine-tuned custom models</li>
        <li>Very long context requirements (&gt;128K)</li>
        <li>Image/multimodal generation</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Fastest inference speeds in the industry (500+ tok/s)</li>
      <li>Sub-50ms time-to-first-token latency</li>
      <li>Competitive pricing on open-source models</li>
      <li>OpenAI-compatible API for easy migration</li>
      <li>Generous free tier for experimentation</li>
      <li>Simple, transparent pay-per-token pricing</li>
    </ul>
    <div class="source"><a href="https://groq.com" target="_blank">Groq Official</a> · <a href="https://artificialanalysis.ai" target="_blank">Artificial Analysis</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Limited to open-source models only</li>
      <li>No fine-tuning or custom model hosting</li>
      <li>Smaller context windows than some competitors</li>
      <li>Rate limits can be restrictive on free tier</li>
      <li>Fewer model options than Together AI or Fireworks</li>
    </ul>
    <div class="source"><a href="https://console.groq.com/docs" target="_blank">Groq Docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://console.groq.com/docs/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free Tier</div>
    <div class="price">$0</div>
    <div class="desc">Rate-limited, great for testing</div>
  </a>
  <a href="https://console.groq.com/docs/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Llama 3.1 70B</div>
    <div class="price">$0.59<small>/M tokens</small></div>
    <div class="desc">Input tokens, output $0.79/M</div>
  </a>
  <a href="https://console.groq.com/docs/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Llama 3.1 8B</div>
    <div class="price">$0.05<small>/M tokens</small></div>
    <div class="desc">Input tokens, output $0.08/M</div>
  </a>
  <a href="https://console.groq.com/docs/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Mixtral 8x7B</div>
    <div class="price">$0.24<small>/M tokens</small></div>
    <div class="desc">Input tokens, output $0.24/M</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>LPU Technology</h4>
    <ul>
      <li>Purpose-built for sequential inference</li>
      <li>Deterministic performance (no batching variance)</li>
      <li>Single-chip architecture (no network overhead)</li>
      <li>Optimized for autoregressive decoding</li>
      <li>Lower power consumption than GPUs</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Models</h4>
    <ul>
      <li>Llama 3.1 (8B, 70B, 405B)</li>
      <li>Llama 3.2 (1B, 3B, 11B Vision)</li>
      <li>Mixtral 8x7B</li>
      <li>Gemma 2 (9B, 27B)</li>
      <li>Whisper Large v3 (speech-to-text)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>API Features</h4>
    <ul>
      <li>OpenAI-compatible endpoints</li>
      <li>Streaming responses</li>
      <li>JSON mode</li>
      <li>Tool/function calling</li>
      <li>Vision models support</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Enterprise</h4>
    <ul>
      <li>Dedicated capacity available</li>
      <li>Higher rate limits</li>
      <li>SLA guarantees</li>
      <li>Priority support</li>
    </ul>
  </div>
</div>

</details>

## Benchmarks

<div class="benchmarks">
  <div class="benchmark-card">
    <div class="score">500+</div>
    <div class="benchmark-name">Tokens/Second (Llama 3 70B)</div>
    <div class="benchmark-desc">Output generation speed for large models</div>
    <div class="source"><a href="https://artificialanalysis.ai/models/llama-3-instruct-70b/providers" target="_blank">Artificial Analysis</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">&lt;50ms</div>
    <div class="benchmark-name">Time to First Token</div>
    <div class="benchmark-desc">Industry-leading latency for real-time apps</div>
    <div class="source"><a href="https://groq.com" target="_blank">Groq Official</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">10x</div>
    <div class="benchmark-name">Faster Than GPUs</div>
    <div class="benchmark-desc">Typical speedup vs GPU-based inference</div>
    <div class="source"><a href="https://groq.com/lpu-inference-engine" target="_blank">Groq LPU</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">800+</div>
    <div class="benchmark-name">Tokens/Sec (Llama 3.1 8B)</div>
    <div class="benchmark-desc">Smaller models achieve even higher throughput</div>
    <div class="source"><a href="https://artificialanalysis.ai" target="_blank">Artificial Analysis</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Groq | Together AI | Fireworks AI | Cerebras |
|---------|------|-------------|--------------|----------|
| Speed (tok/s) | <span class="highlight">500+ (LPU)</span> | 100-200 | 150-250 | 400+ |
| Time to First Token | <span class="highlight">&lt;50ms</span> | 100-300ms | 80-150ms | &lt;100ms |
| Model Selection | 10+ models | <span class="highlight">100+ models</span> | 50+ models | 10+ models |
| Fine-tuning | No | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> | No |
| Custom Silicon | <span class="highlight">LPU</span> | GPU | GPU | Wafer-Scale |
| Free Tier | Yes | Yes | Yes | Yes |
| Best For | Speed-critical apps | Model variety | Balanced | Speed + scale |

</div>
