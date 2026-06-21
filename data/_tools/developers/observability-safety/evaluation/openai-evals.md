---
name: "OpenAI Evals"
slug: "openai-evals"
website: "https://github.com/openai/evals"
type: "open-source"
track: "developers"
category: "observability-safety"
subcategory: "evaluation"
status: "active"
description: "Framework for evaluating LLMs and LLM systems with an open-source registry of benchmarks"
github_url: "https://github.com/openai/evals"
github_stars: 18729
pricing_model: "free"
founded_year: 2023
headquarters: "San Francisco, CA"
tags:
  - python
last_verified: "2026-06-03"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">18.6K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">3K</span>
    <span class="label">Forks</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">Open Source</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OpenAI Evals is a framework for evaluating large language models (LLMs) or systems built using LLMs. It provides an existing registry of evals to test different dimensions of OpenAI models and the ability to write custom evals for specific use cases. You can also use your data to build private evals representing common LLM patterns in your workflow without exposing any data publicly. As OpenAI's President Greg Brockman noted, "evals is surprisingly often the bottleneck on progress" - making high-quality evals one of the most impactful investments for teams building with LLMs.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OpenAI Evals?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams heavily invested in OpenAI models</li>
        <li>Researchers comparing model versions</li>
        <li>Building reproducible evaluation benchmarks</li>
        <li>Contributing evals to OpenAI's public registry</li>
        <li>Academic-style evaluation workflows</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Multi-provider LLM evaluation (try Promptfoo)</li>
        <li>Production observability needs (try LangSmith)</li>
        <li>Teams wanting a UI-first experience</li>
        <li>Real-time monitoring and alerting</li>
        <li>RAG-specific evaluation (try RAGAS)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Official OpenAI framework with active maintenance</li>
      <li>Extensive pre-built eval registry (safety, reasoning, math)</li>
      <li>Model-graded evaluations for open-ended questions</li>
      <li>No coding required for basic evals (YAML + JSON)</li>
      <li>Completion Functions protocol for custom pipelines</li>
      <li>Snowflake integration for logging results</li>
      <li>Dashboard integration via OpenAI Platform</li>
    </ul>
    <div class="source"><a href="https://github.com/openai/evals" target="_blank">GitHub README</a> · <a href="https://platform.openai.com/docs/guides/evals" target="_blank">OpenAI Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Primarily designed for OpenAI models</li>
      <li>Limited UI - mostly CLI-based workflow</li>
      <li>Not accepting custom code contributions currently</li>
      <li>Requires Git-LFS for downloading full eval registry</li>
      <li>API costs apply when running evaluations</li>
      <li>Less active development than some alternatives</li>
    </ul>
    <div class="source"><a href="https://github.com/openai/evals" target="_blank">GitHub Issues</a> · <a href="https://github.com/openai/evals/blob/main/docs/build-eval.md" target="_blank">Build Eval Docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/openai/evals" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Full framework, all features included</div>
  </a>
  <a href="https://platform.openai.com/docs/guides/evals" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">OpenAI Dashboard</div>
    <div class="price">API Costs</div>
    <div class="desc">Run evals directly in OpenAI Platform</div>
  </a>
  <a href="https://wandb.ai/wandb_fc/openai-evals/reports/OpenAI-Evals-Demo-Using-W-B-Prompts-to-Run-Evaluations--Vmlldzo0MTI4ODA3" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Weights & Biases</div>
    <div class="price">W&B Pricing</div>
    <div class="desc">Alternative integration for running evals</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Eval Templates</h4>
    <ul>
      <li>Match - Exact string matching</li>
      <li>Includes - Substring matching</li>
      <li>FuzzyMatch - Flexible matching</li>
      <li>JsonMatch - JSON structure comparison</li>
      <li>ModelBasedClassify - LLM-graded evals</li>
      <li>Fact - Factual consistency checking</li>
      <li>ClosedQA - Question answering rubrics</li>
      <li>Battle - Head-to-head comparisons</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>YAML-based eval configuration</li>
      <li>JSONL dataset format support</li>
      <li>Completion Functions protocol</li>
      <li>Chain-of-thought evaluation modes</li>
      <li>Meta-evals for quality assurance</li>
      <li>Registry system for sharing evals</li>
      <li>Private eval support</li>
      <li>Snowflake database logging</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Eval Categories</h4>
    <ul>
      <li>Over-refusals testing</li>
      <li>Safety evaluations</li>
      <li>System message steerability</li>
      <li>Hallucination detection</li>
      <li>Math & logical reasoning</li>
      <li>Physical reasoning</li>
      <li>Real-world use cases</li>
      <li>Foundational capabilities</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI Platform Dashboard</li>
      <li>Weights & Biases</li>
      <li>LangChain LLMs</li>
      <li>Snowflake Database</li>
      <li>HuggingFace Hub</li>
      <li>Git-LFS for data storage</li>
      <li>Pre-commit hooks</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Requirements</h4>
    <ul>
      <li>Python 3.9+</li>
      <li>OpenAI API key</li>
      <li>Git-LFS (for full registry)</li>
      <li>pip install evals</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>CLI Commands</h4>
    <ul>
      <li>oaieval - Run evaluations</li>
      <li>oaieval gpt-4 [eval_name]</li>
      <li>Custom registry paths</li>
      <li>Completion function selection</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OpenAI Evals | Promptfoo | RAGAS | DeepEval |
|---------|--------------|-----------|-------|----------|
| Primary Focus | <span class="highlight">OpenAI models</span> | Multi-provider | RAG systems | General LLM |
| Interface | CLI + Dashboard | CLI + Web UI | Python API | Python API |
| Eval Registry | <span class="highlight">Large public registry</span> | Custom only | RAG-focused | Built-in metrics |
| Model-Graded | <span class="highlight">Yes, extensive</span> | Yes | Yes | Yes |
| Open Source | Yes | Yes | Yes | Yes |
| No-Code Setup | YAML + JSON | YAML config | Code required | Code required |
| Production Use | Research-focused | Production-ready | Production-ready | Production-ready |
| Learning Curve | Moderate | Low | Low | Low |

</div>

## Getting Started

```bash
# Install via pip
pip install evals

# Or clone for development
git clone https://github.com/openai/evals
cd evals
pip install -e .

# Download eval registry data
git lfs fetch --all
git lfs pull

# Run an eval
export OPENAI_API_KEY=your-key
oaieval gpt-4 test-match
```
