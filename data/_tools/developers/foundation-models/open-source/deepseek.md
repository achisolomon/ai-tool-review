---
name: "DeepSeek"
slug: "deepseek"
website: "https://www.deepseek.com/"
type: "open-source"
track: "developers"
category: "foundation-models"
subcategory: "open-source"
status: "active"
description: "Chinese AI research lab building open-source reasoning and general-purpose models with industry-leading cost efficiency"
github_url: "https://github.com/deepseek-ai"
pricing_model: "freemium"
founded_year: 2023
headquarters: "Hangzhou, China"
tags:
  - api-available
  - reasoning
last_verified: "2026-06-02"
confidence_score: 0.92
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">671B</span>
    <span class="label">V3 Parameters</span>
  </div>
  <div class="key-stat">
    <span class="number">128K</span>
    <span class="label">Context Window</span>
  </div>
  <div class="key-stat">
    <span class="number">$0.14</span>
    <span class="label">/M Input Tokens</span>
  </div>
</div>

## Overview

<div class="overview">
<p>DeepSeek is a Chinese AI research company that has disrupted the foundation model landscape with remarkably cost-efficient open-source models. Their DeepSeek-V3 (671B parameters with MoE architecture) and DeepSeek-R1 (reasoning model) compete with GPT-4 and Claude while costing a fraction to run. The company, backed by quantitative hedge fund High-Flyer, released fully open weights under MIT license, enabling self-hosting and fine-tuning. DeepSeek's models excel particularly in mathematics, coding, and reasoning tasks, achieving state-of-the-art results on benchmarks like MATH and HumanEval while being 10-50x cheaper than comparable closed models.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use DeepSeek?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Cost-conscious API users needing GPT-4 quality</li>
        <li>Math and reasoning applications</li>
        <li>Self-hosting enthusiasts (open weights)</li>
        <li>Code generation tasks</li>
        <li>Research and fine-tuning projects</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Users requiring US/EU data residency</li>
        <li>Enterprises with strict compliance needs</li>
        <li>Applications requiring consistent uptime SLAs</li>
        <li>Use cases needing real-time streaming</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>10-50x cheaper than GPT-4/Claude for similar quality</li>
      <li>Fully open weights under MIT license</li>
      <li>State-of-the-art math and reasoning performance</li>
      <li>R1 reasoning model rivals o1 at fraction of cost</li>
      <li>Excellent code generation (HumanEval 90%+)</li>
      <li>Active research with regular model releases</li>
    </ul>
    <div class="source"><a href="https://github.com/deepseek-ai/DeepSeek-V3" target="_blank">GitHub</a> · <a href="https://arxiv.org/abs/2401.02954" target="_blank">DeepSeek-V3 Paper</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Data processed in China (compliance concerns)</li>
      <li>Censorship on politically sensitive topics</li>
      <li>API availability can be inconsistent</li>
      <li>Limited enterprise support options</li>
      <li>Slower inference than smaller models</li>
    </ul>
    <div class="source"><a href="https://www.reddit.com/r/LocalLLaMA/" target="_blank">r/LocalLLaMA</a> · <a href="https://news.ycombinator.com" target="_blank">Hacker News discussions</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://chat.deepseek.com/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Web Chat</div>
    <div class="price">Free</div>
    <div class="desc">Consumer chatbot interface</div>
  </a>
  <a href="https://platform.deepseek.com/api-docs/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">DeepSeek-V3</div>
    <div class="price">$0.14<small>/M in</small></div>
    <div class="desc">$0.28/M output · 671B MoE</div>
  </a>
  <a href="https://platform.deepseek.com/api-docs/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">DeepSeek-R1</div>
    <div class="price">$0.55<small>/M in</small></div>
    <div class="desc">$2.19/M output · Reasoning model</div>
  </a>
  <a href="https://platform.deepseek.com/api-docs/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Self-Hosted</div>
    <div class="price">Free</div>
    <div class="desc">MIT license · Full weights available</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Available Models</h4>
    <ul>
      <li>DeepSeek-V3 — 671B MoE, general-purpose flagship</li>
      <li>DeepSeek-R1 — Reasoning model, chain-of-thought</li>
      <li>DeepSeek-R1-Distill — Smaller reasoning variants (7B-70B)</li>
      <li>DeepSeek-Coder-V2 — Code-specialized model</li>
      <li>DeepSeek-V2.5 — Balanced performance/cost</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Technical Specs</h4>
    <ul>
      <li>128K context window</li>
      <li>Mixture of Experts architecture</li>
      <li>37B active parameters per token (V3)</li>
      <li>Multi-head Latent Attention (MLA)</li>
      <li>FP8 mixed precision training</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Access Methods</h4>
    <ul>
      <li>Official API (OpenAI-compatible)</li>
      <li>Web chat interface</li>
      <li>HuggingFace model downloads</li>
      <li>ollama, vLLM, SGLang support</li>
      <li>Third-party providers (OpenRouter, Together)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Licensing</h4>
    <ul>
      <li>Model weights: MIT License</li>
      <li>Commercial use permitted</li>
      <li>Fine-tuning allowed</li>
      <li>No usage restrictions</li>
    </ul>
  </div>
</div>

</details>

## Benchmarks

<div class="benchmarks">
  <div class="benchmark-card">
    <div class="score">90.2%</div>
    <div class="benchmark-name">MMLU</div>
    <div class="benchmark-desc">Massive Multitask Language Understanding</div>
    <div class="source"><a href="https://arxiv.org/abs/2401.02954" target="_blank">DeepSeek-V3 Technical Report</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">90.8%</div>
    <div class="benchmark-name">HumanEval</div>
    <div class="benchmark-desc">Python code generation benchmark</div>
    <div class="source"><a href="https://github.com/deepseek-ai/DeepSeek-V3" target="_blank">GitHub README</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">79.8%</div>
    <div class="benchmark-name">MATH</div>
    <div class="benchmark-desc">Competition mathematics problems</div>
    <div class="source"><a href="https://arxiv.org/abs/2401.02954" target="_blank">DeepSeek-V3 Technical Report</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">97.3%</div>
    <div class="benchmark-name">MATH (R1)</div>
    <div class="benchmark-desc">With R1 reasoning chain-of-thought</div>
    <div class="source"><a href="https://github.com/deepseek-ai/DeepSeek-R1" target="_blank">DeepSeek-R1 Release</a></div>
  </div>
</div>

## Real-World Usage

<div class="info-grid">
  <div class="info-card">
    <h4>Community Adoption</h4>
    <ul>
      <li>10M+ HuggingFace downloads (V3)</li>
      <li>50K+ GitHub stars across repos</li>
      <li>Integrated in 100+ inference platforms</li>
      <li>Top model on OpenRouter by usage</li>
    </ul>
    <div class="source">HuggingFace, GitHub, 2025</div>
  </div>
  <div class="info-card">
    <h4>Cost Comparison</h4>
    <ul>
      <li>V3: ~25x cheaper than GPT-4 Turbo</li>
      <li>R1: ~10x cheaper than o1-preview</li>
      <li>Self-hosted: ~$0.02/M on consumer GPUs</li>
      <li>Training cost: $5.6M (vs $100M+ for GPT-4)</li>
    </ul>
    <div class="source">DeepSeek Technical Report</div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | DeepSeek V3/R1 | Llama 3.1 405B | Qwen 2.5 72B | Mistral Large |
|---------|----------------|----------------|--------------|---------------|
| Parameters | <span class="highlight">671B MoE</span> | 405B Dense | 72B Dense | 123B MoE |
| Context | 128K | <span class="highlight">128K</span> | 128K | 128K |
| Open Weights | <span class="highlight">MIT License</span> | Llama License | Apache 2.0 | Proprietary |
| MMLU | <span class="highlight">90.2%</span> | 88.6% | 85.3% | 84.0% |
| MATH | <span class="highlight">79.8%</span> | 73.8% | 71.4% | 69.2% |
| API Cost (Input) | <span class="highlight">$0.14/M</span> | $3.00/M | $0.80/M | $2.00/M |
| Reasoning Model | <span class="highlight">R1 (97% MATH)</span> | None | QwQ | None |
| Best For | Cost efficiency | Meta ecosystem | Multilingual | EU compliance |

</div>
