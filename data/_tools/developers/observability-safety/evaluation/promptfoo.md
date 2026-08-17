---
name: "Promptfoo"
slug: "promptfoo"
website: "https://www.promptfoo.dev/"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "evaluation"
status: "active"
description: "Open-source CLI and library for LLM evaluation and red teaming. Enables systematic prompt testing, model comparison, vulnerability scanning, and automated security assessments with CI/CD integration."
github_url: "https://github.com/promptfoo/promptfoo"
github_stars: 24287
pricing_model: "free"
founded_year: 2023
headquarters: "San Francisco, CA"

# AI-Managed Metadata
last_verified: "2026-06-07"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">22K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">300K+</span>
    <span class="label">Open Source Users</span>
  </div>
  <div class="key-stat">
    <span class="number">156</span>
    <span class="label">Fortune 500 Users</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Promptfoo is an open-source CLI and library for evaluating, testing, and red teaming LLM applications. It enables developers to systematically test prompts against datasets, compare model outputs side-by-side, and run automated security assessments including vulnerability scanning and adversarial attack simulations. Built with a developer-first approach, it supports declarative YAML configs, concurrent evaluation execution, and integrates directly into CI/CD pipelines. Now part of OpenAI while maintaining its MIT license and open-source status, Promptfoo is used by engineering teams at major tech companies including OpenAI and Anthropic themselves.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Promptfoo?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams needing systematic prompt evaluation workflows</li>
        <li>Security-conscious organizations requiring red teaming</li>
        <li>CI/CD-driven development with automated LLM testing</li>
        <li>Multi-model comparison and selection</li>
        <li>Enterprise security teams and CISOs</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple single-prompt applications</li>
        <li>Teams without Node.js in their stack</li>
        <li>Those needing production observability (use dedicated tools)</li>
        <li>Non-technical users wanting GUI-only workflows</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Comprehensive security testing - 50+ vulnerability types covered</li>
      <li>Works with any LLM provider - OpenAI, Anthropic, Azure, local models</li>
      <li>Declarative YAML configs for reproducible evaluations</li>
      <li>CI/CD native - GitHub Actions, CLI integration</li>
      <li>Local execution - data never leaves your machine</li>
      <li>Side-by-side model comparison with matrix views</li>
      <li>MIT licensed, fully open source</li>
      <li>Backed by OpenAI with active development</li>
    </ul>
    <div class="source"><a href="https://www.promptfoo.dev/" target="_blank">Official Site</a> · <a href="https://github.com/promptfoo/promptfoo" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires Node.js 20.20+ or 22.22+ environment</li>
      <li>CLI-focused - web UI is secondary</li>
      <li>Learning curve for YAML config syntax</li>
      <li>Enterprise features require sales contact</li>
    </ul>
    <div class="source"><a href="https://github.com/promptfoo/promptfoo/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.promptfoo.dev/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Community</div>
    <div class="price">Free</div>
    <div class="desc">All eval features, all providers, 10K red team probes/mo, self-hosted</div>
  </a>
  <a href="https://www.promptfoo.dev/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Advanced detection, SSO, managed cloud, priority SLA</div>
  </a>
  <a href="https://www.promptfoo.dev/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">On-Premise</div>
    <div class="price">Custom</div>
    <div class="desc">Full infrastructure control, complete data isolation</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Evaluation Features</h4>
    <ul>
      <li>Declarative YAML test configs</li>
      <li>Matrix view comparisons</li>
      <li>Custom scoring metrics</li>
      <li>Concurrent execution</li>
      <li>Live reload and caching</li>
      <li>Web viewer for results</li>
      <li>Team sharing capabilities</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Security & Red Teaming</h4>
    <ul>
      <li>Prompt injection detection</li>
      <li>Jailbreak testing</li>
      <li>Data leak scanning</li>
      <li>Business rule violations</li>
      <li>Compliance risk assessment</li>
      <li>Real-time guardrails</li>
      <li>Code scanning in IDEs/CI</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Providers</h4>
    <ul>
      <li>OpenAI / Azure OpenAI</li>
      <li>Anthropic Claude</li>
      <li>Google (Gemini)</li>
      <li>Amazon Bedrock</li>
      <li>HuggingFace</li>
      <li>Ollama (local models)</li>
      <li>Custom API endpoints</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platform & Installation</h4>
    <ul>
      <li>npm / npx (primary)</li>
      <li>Homebrew (brew install)</li>
      <li>pip install</li>
      <li>TypeScript core (97%)</li>
      <li>Node.js 20.20+ or 22.22+</li>
      <li>MIT License</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Promptfoo | Langfuse Evals | Braintrust | Weights & Biases |
|---------|-----------|----------------|------------|------------------|
| Open Source | <span class="highlight">MIT License</span> | Apache 2.0 | No | No |
| Red Teaming | <span class="highlight">50+ vuln types</span> | Basic | Limited | No |
| CI/CD Native | <span class="highlight">Yes</span> | Via API | Via API | Via API |
| Local Execution | <span class="highlight">Yes</span> | Self-host | No | No |
| Free Tier | <span class="highlight">Full features</span> | 50K obs | Limited | Limited |
| Multi-Provider | <span class="highlight">All major + custom</span> | All major | All major | All major |
| Primary Focus | Eval + Security | Observability | Evals | ML Ops |
| Best For | Security-first teams | Full observability | Data teams | ML workflows |

</div>
