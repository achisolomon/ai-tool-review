---
category: ai-infrastructure
confidence_score: 0.95
description: NVIDIA's SDK for high-performance deep learning inference on NVIDIA GPUs, delivering up to 36x speedup over CPU-only platforms via mixed-precision optimization and model compilation.
github_stars: 13294
github_url: "https://github.com/NVIDIA/TensorRT"
last_verified: '2026-07-01'
name: TensorRT
pricing_model: free
slug: tensorrt
status: active
subcategory: inference-apis
track: developers
type: open-source
website: https://developer.nvidia.com/tensorrt
founded_year: 2017
headquarters: Santa Clara, CA
tags:
  - api-available
  - python
  - real-time
  - multimodal
  - self-hosted
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">36x</span>
    <span class="label">Faster Than CPU</span>
  </div>
  <div class="key-stat">
    <span class="number">13K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">2017</span>
    <span class="label">Released</span>
  </div>
</div>

## Overview

<div class="overview">
<p>TensorRT is NVIDIA's SDK for high-performance deep learning inference, providing an ecosystem of tools including inference compilers, runtimes, and model optimizations that deliver low latency and high throughput for production applications. It accepts trained models from PyTorch, TensorFlow, and ONNX, then compiles and optimizes them specifically for NVIDIA GPU architectures using mixed-precision computation (FP4, FP8, INT4, INT8, FP16, BF16, FP32). TensorRT-LLM extends this to large language models with specialized optimizations for transformers, while TensorRT Model Optimizer adds pruning, distillation, and quantization for further compression.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use TensorRT?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams deploying deep learning models on NVIDIA GPU infrastructure</li>
        <li>Production inference requiring lowest possible latency</li>
        <li>LLM serving at scale using TensorRT-LLM</li>
        <li>Edge and embedded AI on Jetson and DriveOS platforms</li>
        <li>Computer vision, video analytics, and speech AI pipelines</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams running on AMD, Intel, or cloud TPU infrastructure</li>
        <li>Rapid prototyping — compilation adds significant setup overhead</li>
        <li>Highly dynamic model architectures that can't be optimized statically</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Up to 36x faster inference vs. CPU-only platforms</li>
      <li>8x performance increase for GPT-J 6B; 4x for Llama 2 70B</li>
      <li>Broad quantization support: FP4, FP8, INT4, INT8, FP16, BF16</li>
      <li>TensorRT-LLM for transformer-specific optimizations (free, open-source)</li>
      <li>Deploys across edge (Jetson), desktop, and data center</li>
      <li>Native PyTorch and HuggingFace integration</li>
      <li>5.3x better total cost of ownership for LLM workloads</li>
    </ul>
    <div class="source"><a href="https://developer.nvidia.com/tensorrt" target="_blank">NVIDIA Official</a> · <a href="https://github.com/NVIDIA/TensorRT" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>NVIDIA GPUs only — no AMD, Intel, or TPU support</li>
      <li>Engine compilation is hardware-specific; engines don't transfer between GPU generations</li>
      <li>Significant complexity for custom or dynamic architectures</li>
      <li>TensorRT Cloud (hyper-optimized engine generation) limited to select partners</li>
      <li>CUDA version dependencies can complicate deployment environments</li>
    </ul>
    <div class="source"><a href="https://github.com/NVIDIA/TensorRT/issues" target="_blank">GitHub Issues</a> · <a href="https://docs.nvidia.com/deeplearning/tensorrt/latest/index.html" target="_blank">Official Docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/NVIDIA/TensorRT" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Apache 2.0 license — core SDK, TensorRT-LLM, and Model Optimizer are free</div>
  </a>
  <a href="https://developer.nvidia.com/tensorrt" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">TensorRT Cloud</div>
    <div class="price">Select Partners</div>
    <div class="desc">Hyper-optimized engine generation service; limited access program</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Mixed-precision inference (FP4, FP8, INT4, INT8, FP16, BF16, FP32)</li>
      <li>TensorRT-LLM for LLM-specific transformer optimizations</li>
      <li>TensorRT Model Optimizer (pruning, distillation, quantization)</li>
      <li>Dynamic shapes and strongly-typed networks</li>
      <li>Custom layer extensions via IPluginV3</li>
      <li>Multi-device inference with collective operations (GA)</li>
      <li>ONNX, PyTorch, and TensorFlow model import</li>
      <li>Python bindings (3.10–3.14) and C++ API</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Platforms</h4>
    <ul>
      <li>Linux x86-64 (Ubuntu 22.04, 24.04, 26.04)</li>
      <li>Linux aarch64 (SBSA)</li>
      <li>Windows x64</li>
      <li>NVIDIA Jetson / JetPack</li>
      <li>DriveOS (automotive)</li>
      <li>QNX (embedded)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Large language model inference</li>
      <li>Computer vision (CNNs, object detection)</li>
      <li>Video analytics and speech AI</li>
      <li>Automotive embedded AI (DRIVE platform)</li>
      <li>Robotics and edge AI</li>
      <li>Diffusion models and multimodal inference</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Current Version</h4>
    <ul>
      <li>TensorRT 11.1.0 (June 2026)</li>
      <li>Requires CUDA 13.3 or 12.9</li>
      <li>CMake 3.31+ for building from source</li>
      <li>Python 3.10–3.14 supported</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | TensorRT | vLLM | llama.cpp |
|---------|----------|------|-----------|
| Hardware | NVIDIA only | NVIDIA, AMD, Intel, TPU | CPU + GPU (multi-vendor) |
| Primary Use | GPU inference optimization | LLM serving throughput | Local/edge CPU inference |
| LLM Support | <span class="highlight">TensorRT-LLM</span> | Native, production-ready | Native, lightweight |
| Quantization | FP4–FP32 (widest range) | AWQ, GPTQ, FP8 | GGUF (CPU-optimized) |
| Latency | <span class="highlight">Best on NVIDIA</span> | Excellent throughput | Best on CPU |
| Open Source | Apache 2.0 | Apache 2.0 | MIT |
| Best For | NVIDIA GPU production | High-volume LLM serving | Portable edge inference |

</div>
