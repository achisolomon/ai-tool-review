---
category: ai-infrastructure
confidence_score: 0.9
description: Pure C/C++ LLM inference engine enabling local model execution on CPU and GPU with minimal dependencies and maximum portability.
github_stars: 125200
last_verified: '2026-06-03'
name: llama.cpp
pricing_model: free
slug: llama-cpp
status: active
subcategory: inference-apis
track: developers
type: oss
website: https://github.com/ggml-org/llama.cpp
github_url: "https://github.com/ggml-org/llama.cpp"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">114K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">5/5</span>
    <span class="label">Rating</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>llama.cpp is a pure C/C++ implementation of LLM inference with minimal dependencies, designed for efficient local execution on consumer hardware. It supports CPU and GPU acceleration (Metal, CUDA, Vulkan) and pioneered the GGUF quantization format enabling models to run in 4-8GB RAM. The project powers countless local AI applications and has become the de facto standard for on-device LLM inference.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use llama.cpp?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Running LLMs locally on personal computers without cloud costs</li>
        <li>Privacy-focused applications requiring offline inference</li>
        <li>Embedded and edge devices with limited resources</li>
        <li>Developers building local-first AI applications</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Non-technical users seeking plug-and-play solutions</li>
        <li>Production applications needing managed infrastructure</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>C/C++ LLM inference engine with broad platform support</li>
      <li>Runs entirely locally with no cloud dependencies</li>
      <li>Minimal RAM usage via advanced quantization (4-bit, 8-bit)</li>
      <li>Cross-platform support (Windows, macOS, Linux, mobile)</li>
      <li>Active community with frequent updates and model support</li>
    </ul>
    <div class="source"><a href="https://github.com/ggml-org/llama.cpp" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires command-line knowledge and manual setup</li>
      <li>Performance varies significantly based on hardware</li>
      <li>No managed hosting or enterprise support</li>
    </ul>
    <div class="source"><a href="https://github.com/ggml-org/llama.cpp/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/ggml-org/llama.cpp" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Completely free under MIT license</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Pure C/C++ with zero dependencies</li>
      <li>GGUF quantization format (2-8 bit)</li>
      <li>CPU, Metal, CUDA, Vulkan acceleration</li>
      <li>Support for Llama, Mistral, Qwen, and 100+ models</li>
      <li>Built-in HTTP server for API access</li>
      <li>Flash Attention and other optimizations</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Windows, macOS, Linux</li>
      <li>iOS, Android (via bindings)</li>
      <li>Raspberry Pi and embedded</li>
      <li>Docker containers</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | llama.cpp | Ollama | LocalAI |
|---------|-----------|--------|---------|
| Ease of Use | CLI-based | Very easy | Moderate |
| Performance | Excellent | Good | Good |
| Deployment | Self-hosted | Self-hosted | Self-hosted |
| Best For | Maximum control | Simplicity | OpenAI compat |

</div>
