---
name: "Inspect AI"
slug: "inspect-ai"
website: "https://inspect.ai-safety-institute.org.uk/"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "evaluation"
status: "active"
description: "Open-source framework for large language model evaluation developed by the UK AI Safety Institute"
github_url: "https://github.com/UKGovernmentBEIS/inspect_ai"
github_stars: 2605
pricing_model: "free"
founded_year: 2024
headquarters: "London, UK"
last_verified: "2026-06-03"
confidence_score: 0.92
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">2.5K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">50+</span>
    <span class="label">Built-in Benchmarks</span>
  </div>
  <div class="key-stat">
    <span class="number">UK AISI</span>
    <span class="label">Government-Backed</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Inspect AI is an open-source framework for evaluating large language models, developed and maintained by the UK AI Safety Institute (AISI). It provides a comprehensive Python-based toolkit for creating, running, and analyzing evaluations with built-in support for popular benchmarks like MMLU, GSM8K, HellaSwag, and ARC. The framework emphasizes reproducibility, extensibility, and safety-focused evaluation with features like sandboxed code execution, multi-turn agent tasks, and detailed scoring mechanisms. Inspect supports all major model providers including OpenAI, Anthropic, Google, Mistral, and local models via Ollama or HuggingFace.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Inspect AI?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>AI safety researchers and red teamers</li>
        <li>Teams needing reproducible evaluations</li>
        <li>Organizations building custom benchmarks</li>
        <li>Multi-model comparison studies</li>
        <li>Government and compliance-focused teams</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple prompt testing (use Promptfoo)</li>
        <li>RAG-specific evals (try RAGAS)</li>
        <li>Non-Python teams (Python-only)</li>
        <li>CI/CD-first workflows (less integrated)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Government-backed with strong safety focus</li>
      <li>50+ built-in benchmark implementations</li>
      <li>Sandboxed code execution for agent evals</li>
      <li>Multi-turn conversation support</li>
      <li>Extensible solver and scorer architecture</li>
      <li>Provider-agnostic model support</li>
      <li>Detailed logging and analysis tools</li>
    </ul>
    <div class="source"><a href="https://inspect.ai-safety-institute.org.uk/" target="_blank">Official Docs</a> - <a href="https://github.com/UKGovernmentBEIS/inspect_ai" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Python-only (no JavaScript/TypeScript SDK)</li>
      <li>Steeper learning curve than simpler tools</li>
      <li>Less CI/CD integration out of the box</li>
      <li>Smaller community than commercial tools</li>
      <li>Documentation still maturing</li>
    </ul>
    <div class="source"><a href="https://github.com/UKGovernmentBEIS/inspect_ai/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/UKGovernmentBEIS/inspect_ai" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">MIT License, full features, unlimited use</div>
  </a>
  <a href="https://inspect.ai-safety-institute.org.uk/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Community</div>
    <div class="price">Free</div>
    <div class="desc">GitHub support, documentation</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Declarative task definitions</li>
      <li>Built-in benchmark suite (MMLU, GSM8K, etc.)</li>
      <li>Multi-turn agent evaluations</li>
      <li>Sandboxed code execution</li>
      <li>Custom solver chains</li>
      <li>Model-graded scoring</li>
      <li>Detailed logging and replay</li>
      <li>Parallel evaluation runs</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Model Providers</h4>
    <ul>
      <li>OpenAI (GPT-4, GPT-4o)</li>
      <li>Anthropic (Claude 3.5, Claude 4)</li>
      <li>Google (Gemini Pro, Ultra)</li>
      <li>Mistral AI</li>
      <li>Azure OpenAI</li>
      <li>AWS Bedrock</li>
      <li>Ollama (local models)</li>
      <li>HuggingFace Transformers</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Built-in Benchmarks</h4>
    <ul>
      <li>MMLU (Massive Multitask)</li>
      <li>GSM8K (Math reasoning)</li>
      <li>HellaSwag (Commonsense)</li>
      <li>ARC (Reasoning)</li>
      <li>TruthfulQA</li>
      <li>HumanEval (Code)</li>
      <li>GPQA (Graduate-level QA)</li>
      <li>SWE-bench (Software engineering)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Python 3.10+</li>
      <li>pip / conda install</li>
      <li>Docker support</li>
      <li>VS Code extension</li>
      <li>CLI interface</li>
      <li>Jupyter notebooks</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Inspect AI | Promptfoo | DeepEval | OpenAI Evals |
|---------|-----------|-----------|----------|--------------|
| Open Source | <span class="highlight">Yes (MIT)</span> | Yes (MIT) | Yes | Yes |
| Language | Python | JS/TS | Python | Python |
| Built-in Benchmarks | <span class="highlight">50+</span> | 10+ | 15+ | 20+ |
| Agent Evals | <span class="highlight">Multi-turn + sandbox</span> | Basic | Basic | Limited |
| Safety Focus | <span class="highlight">UK AISI backed</span> | General | General | OpenAI focus |
| CI/CD Integration | Manual | <span class="highlight">Native</span> | Pytest | Basic |
| Model Providers | All major | All major | All major | OpenAI-first |
| Best For | Safety research | CI/CD testing | Unit tests | OpenAI apps |

</div>
