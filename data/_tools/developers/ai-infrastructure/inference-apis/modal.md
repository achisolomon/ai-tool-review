---
name: "Modal"
slug: "modal"
website: "https://modal.com/"
type: "commercial"
track: "developers"
category: "ai-infrastructure"
subcategory: "inference-apis"
status: "active"
description: "Serverless cloud platform for running Python code on GPUs with instant cold starts and pay-per-second billing"
pricing_model: "pay-as-you-go"
founded_year: 2021
headquarters: "San Francisco, CA"
tags:
  - api-available
  - python
  - serverless
last_verified: "2026-06-02"
confidence_score: 0.90
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">$30/mo</span>
    <span class="label">Free Credits</span>
  </div>
  <div class="key-stat">
    <span class="number">&lt;1s</span>
    <span class="label">Cold Start</span>
  </div>
  <div class="key-stat">
    <span class="number">$2.78/hr</span>
    <span class="label">H100 GPU</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Modal is a serverless cloud platform designed for running Python code on GPUs without managing infrastructure. Unlike traditional cloud providers where you rent VMs and pay for idle time, Modal lets you define functions that automatically scale from zero to thousands of containers in seconds. The platform excels at ML inference, batch processing, and data pipelines—you write Python with decorators, and Modal handles containerization, orchestration, and GPU allocation. Founded by Erik Bernhardsson (creator of Luigi at Spotify), Modal focuses on developer experience with features like instant hot-reloading, built-in cron scheduling, and web endpoint generation. The pay-per-second billing means you only pay when your code runs, making it cost-effective for bursty workloads.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Modal?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>ML engineers deploying inference endpoints</li>
        <li>Data teams running batch GPU jobs</li>
        <li>Startups wanting serverless ML without DevOps</li>
        <li>Bursty workloads (pay only when running)</li>
        <li>Python-first teams (native SDK)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>24/7 persistent workloads (dedicated VMs cheaper)</li>
        <li>Non-Python codebases (Python-only)</li>
        <li>Teams needing on-premise deployment</li>
        <li>Simple API calls (use Together/Fireworks)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Sub-second cold starts (vs minutes elsewhere)</li>
      <li>Pay-per-second billing with no idle costs</li>
      <li>Python-native SDK with decorators</li>
      <li>Generous free tier ($30/month credits)</li>
      <li>Built-in GPU memory caching</li>
      <li>Web endpoints auto-generated from functions</li>
      <li>Hot-reloading during development</li>
      <li>Excellent developer documentation</li>
    </ul>
    <div class="source"><a href="https://modal.com/" target="_blank">Modal</a> · <a href="https://modal.com/docs" target="_blank">Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Python-only (no Node.js, Go, etc.)</li>
      <li>Higher per-hour cost than reserved instances</li>
      <li>Vendor lock-in with proprietary decorators</li>
      <li>Limited GPU memory on smaller tiers</li>
      <li>Learning curve for decorator-based model</li>
    </ul>
    <div class="source"><a href="https://www.reddit.com/r/MachineLearning/" target="_blank">r/MachineLearning</a> · Developer feedback</div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://modal.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free Tier</div>
    <div class="price">$30<small>/mo credits</small></div>
    <div class="desc">Generous free compute monthly</div>
  </a>
  <a href="https://modal.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">A10G GPU</div>
    <div class="price">$1.10<small>/hr</small></div>
    <div class="desc">24GB VRAM, good for inference</div>
  </a>
  <a href="https://modal.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">A100 40GB</div>
    <div class="price">$2.78<small>/hr</small></div>
    <div class="desc">Training & large model inference</div>
  </a>
  <a href="https://modal.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">H100 80GB</div>
    <div class="price">$4.76<small>/hr</small></div>
    <div class="desc">Frontier models, fastest inference</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>GPU Options</h4>
    <ul>
      <li>NVIDIA T4 (16GB) — $0.59/hr</li>
      <li>NVIDIA L4 (24GB) — $0.80/hr</li>
      <li>NVIDIA A10G (24GB) — $1.10/hr</li>
      <li>NVIDIA A100 40GB — $2.78/hr</li>
      <li>NVIDIA A100 80GB — $3.78/hr</li>
      <li>NVIDIA H100 80GB — $4.76/hr</li>
      <li>Multi-GPU configurations available</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Serverless GPU functions</li>
      <li>Sub-second cold starts</li>
      <li>Pay-per-second billing</li>
      <li>Auto-scaling to 1000s of containers</li>
      <li>Built-in cron scheduling</li>
      <li>Web endpoints (REST & WebSocket)</li>
      <li>Persistent volumes for storage</li>
      <li>Secrets management</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Developer Experience</h4>
    <ul>
      <li>Python SDK with decorators</li>
      <li>Hot-reload during development</li>
      <li>Local debugging support</li>
      <li>Built-in logging & monitoring</li>
      <li>CLI and dashboard</li>
      <li>Git-based deployments</li>
      <li>Environment snapshots</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>ML Features</h4>
    <ul>
      <li>GPU memory caching (fast model loads)</li>
      <li>Custom container images</li>
      <li>Hugging Face integration</li>
      <li>PyTorch & TensorFlow support</li>
      <li>vLLM & TGI compatible</li>
      <li>Batch inference optimization</li>
    </ul>
  </div>
</div>

</details>

<div class="info-grid">
  <div class="info-card">
    <h4>Company Background</h4>
    <ul>
      <li>Founded 2021 by Erik Bernhardsson</li>
      <li>Creator of Luigi (Spotify)</li>
      <li>$60M+ total funding raised</li>
      <li>Y Combinator backed (W22)</li>
    </ul>
    <div class="source"><a href="https://modal.com/about" target="_blank">Modal About</a></div>
  </div>
  <div class="info-card">
    <h4>Use Cases</h4>
    <ul>
      <li>LLM inference endpoints</li>
      <li>Image/video processing pipelines</li>
      <li>Batch ML training jobs</li>
      <li>Web scrapers & data pipelines</li>
    </ul>
    <div class="source"><a href="https://modal.com/docs/examples" target="_blank">Modal Examples</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Modal | Replicate | RunPod | Lambda Labs |
|---------|-------|-----------|--------|-------------|
| Model | <span class="highlight">Serverless functions</span> | API endpoints | VM rental | VM rental |
| Cold Start | <span class="highlight">&lt;1 second</span> | 5-30 seconds | N/A (always-on) | N/A |
| Billing | Per-second | Per-prediction | Per-hour | Per-hour |
| Free Tier | <span class="highlight">$30/mo</span> | Pay-as-you-go | $25 credit | None |
| H100 Price | $4.76/hr | ~$0.0023/sec | $4.49/hr | $2.49/hr |
| Python SDK | <span class="highlight">Native</span> | Yes | REST only | N/A |
| Custom Code | <span class="highlight">Full control</span> | Pre-built models | Full control | Full control |
| Best For | Bursty workloads | Quick prototypes | 24/7 training | Budget training |

</div>
