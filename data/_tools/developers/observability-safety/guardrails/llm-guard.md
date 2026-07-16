---
name: "LLM Guard"
slug: "llm-guard"
website: "https://github.com/protectai/llm-guard"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "guardrails"
status: "active"
description: "Open-source framework for securing LLM inputs and outputs. Detects prompt injections, jailbreaks, banned topics, and harmful content with customizable scanners for comprehensive protection."
github_url: "https://github.com/protectai/llm-guard"
github_stars: 3185
pricing_model: "free"
founded_year: 2023
headquarters: "Seattle, WA"
tags:
  - self-hosted

# AI-Managed Metadata
last_verified: "2026-06-08"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">3K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">15</span>
    <span class="label">Input Scanners</span>
  </div>
  <div class="key-stat">
    <span class="number">20</span>
    <span class="label">Output Scanners</span>
  </div>
  <div class="key-stat">
    <span class="number">MIT</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>LLM Guard is an open-source security toolkit by Protect AI that scans LLM inputs and outputs for security and compliance risks. The library provides 15 input scanners (prompt injection, PII, banned topics) and 20 output scanners (toxicity, sensitive leakage, refusal detection) that work with any LLM provider. Self-hosted with no per-call costs, LLM Guard runs locally as a Python library or API server. It supports Python 3.10+ and integrates with monitoring systems like DataDog and Prometheus for comprehensive observability.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use LLM Guard?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams wanting self-hosted guardrails with no API costs</li>
        <li>Python developers building LLM applications</li>
        <li>Organizations requiring full data control</li>
        <li>Projects needing customizable security scanners</li>
        <li>GDPR-compliant deployments (data never leaves your infra)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting managed cloud service (see Lakera Guard)</li>
        <li>Non-Python environments (Python 3.10+ required)</li>
        <li>Organizations without ML infrastructure expertise</li>
        <li>Real-time applications needing <10ms latency</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Completely free and open-source (MIT license)</li>
      <li>Self-hosted with zero per-call costs</li>
      <li>35 total scanners covering comprehensive threat vectors</li>
      <li>Works with any LLM provider (OpenAI, Anthropic, local models)</li>
      <li>PII anonymization with GDPR compliance</li>
      <li>Integrates with DataDog, Prometheus for monitoring</li>
      <li>Active development by Protect AI team</li>
      <li>Can run as standalone API server or Python library</li>
    </ul>
    <div class="source"><a href="https://github.com/protectai/llm-guard" target="_blank">GitHub</a> · <a href="https://protectai.github.io/llm-guard/" target="_blank">Documentation</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires self-hosting and infrastructure management</li>
      <li>Python 3.10+ only (no JavaScript/TypeScript SDK)</li>
      <li>Detection accuracy depends on model updates</li>
      <li>No managed cloud option (DIY deployment)</li>
      <li>Latency depends on your infrastructure</li>
    </ul>
    <div class="source"><a href="https://github.com/protectai/llm-guard/issues" target="_blank">GitHub Issues</a> · <a href="https://appsecsanta.com/llm-guard" target="_blank">AppSecSanta Review</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/protectai/llm-guard" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Full functionality, MIT license, unlimited usage, self-hosted</div>
  </a>
  <a href="https://protectai.com/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Protect AI Platform</div>
    <div class="price">Custom</div>
    <div class="desc">Enterprise features, managed service, Guardian, Recon, Layer integration</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Input Scanners (15)</h4>
    <ul>
      <li>Prompt injection detection</li>
      <li>Jailbreak detection</li>
      <li>Invisible text detection</li>
      <li>PII anonymization</li>
      <li>Secrets detection</li>
      <li>Banned topics filtering</li>
      <li>Toxicity detection</li>
      <li>Language detection</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Output Scanners (20)</h4>
    <ul>
      <li>Sensitive data leakage</li>
      <li>Toxicity filtering</li>
      <li>Bias detection</li>
      <li>Factual consistency</li>
      <li>Refusal detection</li>
      <li>Malicious URL blocking</li>
      <li>Code detection</li>
      <li>Regex pattern matching</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment</h4>
    <ul>
      <li>pip install llm-guard</li>
      <li>Python library integration</li>
      <li>Standalone API server</li>
      <li>Docker support</li>
      <li>Kubernetes ready</li>
      <li>Python 3.10+ required</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI SDK</li>
      <li>Anthropic SDK</li>
      <li>LangChain</li>
      <li>DataDog monitoring</li>
      <li>Prometheus metrics</li>
      <li>Any LLM provider</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | LLM Guard | Lakera Guard | NeMo Guardrails | Guardrails AI |
|---------|-----------|--------------|-----------------|---------------|
| License | <span class="highlight">MIT (Free)</span> | Proprietary | Apache 2.0 | MIT |
| Deployment | <span class="highlight">Self-hosted</span> | Cloud/Self | Self-hosted | Self-hosted |
| Input Scanners | <span class="highlight">15</span> | API-based | Custom | Schema-based |
| Output Scanners | <span class="highlight">20</span> | API-based | Custom | Schema-based |
| Per-Call Cost | <span class="highlight">$0</span> | Usage-based | $0 | $0 |
| Language | Python only | Multi | Python | Python |
| Focus | <span class="highlight">Security</span> | Security | Conversation | Output validation |
| Best For | <span class="highlight">Self-hosted security</span> | Managed API | Dialog flows | Output formatting |

</div>
