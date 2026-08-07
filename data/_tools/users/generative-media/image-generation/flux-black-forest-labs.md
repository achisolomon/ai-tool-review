---
name: "FLUX (Black Forest Labs)"
slug: "flux-black-forest-labs"
website: "https://blackforestlabs.ai/"
type: "commercial"
track: "users"
category: "generative-media"
subcategory: "image-generation"
status: "active"
description: "State-of-the-art text-to-image models from the creators of Stable Diffusion, offering the FLUX.1 family with Pro, Dev, and Schnell variants for photorealistic generation"
github_url: "https://github.com/black-forest-labs/flux"
pricing_model: "freemium"
founded_year: 2024
headquarters: "Freiburg, Germany"
tags:
  - api-available

# AI-Managed Metadata
last_verified: "2026-06-02"
confidence_score: 0.92
github_stars: 25876
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">12B</span>
    <span class="label">Parameters</span>
  </div>
  <div class="key-stat">
    <span class="number">#1</span>
    <span class="label">ELO Rating</span>
  </div>
  <div class="key-stat">
    <span class="number">$31M</span>
    <span class="label">Series A</span>
  </div>
</div>

## Overview

<div class="overview">
<p>FLUX is a family of state-of-the-art text-to-image models developed by Black Forest Labs, founded by the original creators of Stable Diffusion (Robin Rombach, Andreas Blattmann, and team). The FLUX.1 models represent a significant leap in image generation quality, excelling at photorealism, prompt adherence, and text rendering within images. The family includes three variants: FLUX.1 Pro (highest quality, API-only), FLUX.1 Dev (open-weights for non-commercial use), and FLUX.1 Schnell (fastest, Apache 2.0 licensed). Built on a hybrid architecture combining multimodal and parallel diffusion transformer blocks with flow matching, FLUX has quickly become the benchmark for image quality, consistently ranking #1 on community leaderboards like Artificial Analysis.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use FLUX?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers needing best-in-class image quality via API</li>
        <li>Creative professionals requiring photorealistic outputs</li>
        <li>Projects needing accurate text rendering in images</li>
        <li>Researchers and hobbyists (Dev/Schnell open weights)</li>
        <li>Applications requiring diverse human representation</li>
        <li>Teams wanting Stable Diffusion alternatives with better quality</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Users wanting a consumer-friendly UI (use Midjourney)</li>
        <li>Those needing video generation (image-only for now)</li>
        <li>Budget-constrained projects (Pro API costs add up)</li>
        <li>Commercial use without API (Dev is non-commercial only)</li>
        <li>Users uncomfortable with technical setup for local models</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Industry-leading photorealism and prompt adherence</li>
      <li>Excellent text rendering within generated images</li>
      <li>Open-weights models available (Dev and Schnell)</li>
      <li>Founded by Stable Diffusion creators—proven expertise</li>
      <li>Fast inference with Schnell (1-4 steps)</li>
      <li>Strong human anatomy and diverse representation</li>
      <li>Multiple API providers (Replicate, fal.ai, Together)</li>
      <li>Active development with frequent improvements</li>
    </ul>
    <div class="source"><a href="https://artificialanalysis.ai/text-to-image" target="_blank">Artificial Analysis</a> · <a href="https://blackforestlabs.ai" target="_blank">Official</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>No official consumer UI—requires API or third-party tools</li>
      <li>Pro model is API-only, not available for local use</li>
      <li>Dev model restricted to non-commercial use</li>
      <li>Higher VRAM requirements than SD 1.5 (12B parameters)</li>
      <li>Relatively new company (founded 2024)</li>
      <li>Pricing through various providers can be confusing</li>
      <li>Less community tooling than Stable Diffusion ecosystem</li>
    </ul>
    <div class="source"><a href="https://github.com/black-forest-labs/flux" target="_blank">GitHub</a> · <a href="https://www.reddit.com/r/StableDiffusion/" target="_blank">Reddit Community</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://replicate.com/black-forest-labs/flux-schnell" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Schnell</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0, local use, 1-4 steps</div>
  </a>
  <a href="https://replicate.com/black-forest-labs/flux-dev" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Dev</div>
    <div class="price">~$0.003</div>
    <div class="desc">Open weights, non-commercial</div>
  </a>
  <a href="https://api.bfl.ml/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro (API)</div>
    <div class="price">$0.05</div>
    <div class="desc">Best quality, commercial use</div>
  </a>
  <a href="https://api.bfl.ml/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Pro 1.1 Ultra</div>
    <div class="price">$0.06</div>
    <div class="desc">4MP output, highest resolution</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Model Variants</h4>
    <ul>
      <li>FLUX.1 Pro — Highest quality, API-only</li>
      <li>FLUX.1 Pro 1.1 — Improved version with better coherence</li>
      <li>FLUX.1 Pro Ultra — 4MP output (2048x2048+)</li>
      <li>FLUX.1 Dev — Open weights, non-commercial</li>
      <li>FLUX.1 Schnell — Fast (1-4 steps), Apache 2.0</li>
      <li>FLUX.1 Fill — Inpainting and outpainting</li>
      <li>FLUX.1 Canny/Depth — ControlNet variants</li>
      <li>FLUX.1 Redux — Image variation model</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Technical Specs</h4>
    <ul>
      <li>12 billion parameters</li>
      <li>Hybrid architecture (MMDiT + parallel DiT)</li>
      <li>Flow matching training</li>
      <li>Rotary positional embeddings</li>
      <li>T5 + CLIP text encoders</li>
      <li>Native 1024x1024 resolution</li>
      <li>Up to 4MP with Ultra variant</li>
      <li>FP8/FP16/BF16 inference support</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>API Providers</h4>
    <ul>
      <li>Black Forest Labs API (api.bfl.ml)</li>
      <li>Replicate</li>
      <li>fal.ai</li>
      <li>Together AI</li>
      <li>Fireworks AI</li>
      <li>ComfyUI (local)</li>
      <li>Automatic1111 (community)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Key Capabilities</h4>
    <ul>
      <li>Photorealistic generation</li>
      <li>Accurate text rendering</li>
      <li>Diverse human representation</li>
      <li>Complex scene composition</li>
      <li>Strong prompt adherence</li>
      <li>Inpainting and outpainting (Fill)</li>
      <li>ControlNet support</li>
      <li>Image variations (Redux)</li>
    </ul>
  </div>
</div>

</details>

## Company & Funding

<div class="info-grid">
  <div class="info-card">
    <h4>Company Background</h4>
    <ul>
      <li>Founded: August 2024</li>
      <li>Founders: Robin Rombach, Andreas Blattmann, et al.</li>
      <li>Previously created Stable Diffusion at Stability AI</li>
      <li>Headquarters: Freiburg, Germany</li>
    </ul>
    <div class="source"><a href="https://blackforestlabs.ai" target="_blank">Black Forest Labs</a></div>
  </div>
  <div class="info-card">
    <h4>Funding & Growth</h4>
    <ul>
      <li>$31M Series A (August 2024)</li>
      <li>Led by Andreessen Horowitz</li>
      <li>General Catalyst, Dell Technologies participated</li>
      <li>Valued at over $100M</li>
    </ul>
    <div class="source"><a href="https://techcrunch.com/2024/08/01/black-forest-labs-flux-ai/" target="_blank">TechCrunch</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | FLUX.1 Pro | Midjourney V6 | DALL-E 3 | Stable Diffusion XL |
|---------|------------|---------------|----------|---------------------|
| Image Quality | <span class="highlight">Best photorealism</span> | Best aesthetics | Very good | Good |
| Text Rendering | <span class="highlight">Excellent</span> | Good | Excellent | Limited |
| Prompt Adherence | <span class="highlight">Excellent</span> | Good | Very good | Good |
| API Access | <span class="highlight">Yes</span> | No | Yes | Yes |
| Open Weights | Dev/Schnell only | No | No | <span class="highlight">Yes</span> |
| Local Hosting | Dev/Schnell | No | No | <span class="highlight">Yes</span> |
| Speed | Fast (Schnell: 1-4 steps) | 30-60s | 10-20s | Variable |
| Price per Image | ~$0.05 | $0.05-0.20 | $0.04 | Free (local) |
| Best For | Quality + API | Artistic style | Ease of use | Customization |

</div>
