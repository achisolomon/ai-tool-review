---
name: "LlamaFirewall"
slug: "llamafirewall"
website: "https://meta-llama.github.io/PurpleLlama/LlamaFirewall/"
type: "oss"
track: "developers"
category: "security"
subcategory: "preventing-prompt-injection"
status: "active"
description: "Meta's open-source guardrail framework combining PromptGuard 2, AlignmentCheck, and CodeShield to stop prompt injection in AI agents"
pricing_model: "free"
founded_year: 2025
headquarters: "Menlo Park, CA"
github_url: "https://github.com/meta-llama/PurpleLlama"
github_stars: 4356
tags:
  - prompt-injection
  - agent-security
  - self-hosted
last_verified: "2026-07-14"
confidence_score: 0.88
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">4.3k+</span>
    <span class="label">GitHub Stars (PurpleLlama repo)</span>
  </div>
  <div class="key-stat">
    <span class="number">3+</span>
    <span class="label">Scanner Types</span>
  </div>
  <div class="key-stat">
    <span class="number">90%+</span>
    <span class="label">Attack Reduction on AgentDojo*</span>
  </div>
</div>

## Overview

<div class="overview">
<p>LlamaFirewall is Meta's open-source guardrail framework for securing AI agents, developed by the Purple Llama team and used in production internally at Meta. Rather than a single classifier, it's a policy engine that orchestrates multiple purpose-built security scanners at different stages of an agent's workflow: PromptGuard 2 (a fast BERT-style classifier for direct prompt injection and jailbreak detection), AlignmentCheck (a chain-of-thought auditor that inspects an agent's reasoning trace for goal hijacking and indirect prompt injection from tool outputs or retrieved content), and CodeShield (static analysis of LLM-generated code for insecure patterns). LlamaFirewall builds on Meta's earlier Llama Guard lineage of safety classifiers, packaging them into a configurable, extensible pipeline that developers install via `pip install llamafirewall` and wire into agent input/output/reasoning checkpoints.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use LlamaFirewall?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building autonomous or tool-using LLM agents that need defense against both direct and indirect prompt injection</li>
        <li>Organizations wanting a free, self-hosted, MIT-licensed alternative to commercial guardrail APIs</li>
        <li>Developers who want chain-of-thought auditing (AlignmentCheck) in addition to input-level filtering</li>
        <li>Teams generating LLM code who want a bundled static-analysis layer (CodeShield)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams that need a fully managed SaaS with SLAs and dashboards rather than a self-hosted Python library</li>
        <li>Non-Python stacks—the framework and its examples center on a Python SDK</li>
        <li>Projects wanting a single lightweight classifier rather than a multi-scanner pipeline with added latency and model download requirements</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Layered defense combines fast input classification (PromptGuard 2), reasoning-level auditing (AlignmentCheck), and code-output scanning (CodeShield) instead of relying on one model</li>
      <li>PromptGuard 2 is lightweight (86M and 22M parameter variants) and built for low-latency, high-throughput production use</li>
      <li>AlignmentCheck targets indirect prompt injection and goal hijacking, a gap most input-only filters miss</li>
      <li>Backed by Meta's own published research (arXiv 2505.03574) showing over 90% attack success rate reduction on the AgentDojo benchmark</li>
      <li>Open source and extensible—configurable scanners and custom regex rules</li>
      <li>Reportedly used in production at Meta, signaling real-world battle-testing</li>
    </ul>
    <div class="source"><a href="https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/README.md" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires downloading Meta's Llama-derived models from Hugging Face, which are gated under the Llama Community License rather than a pure permissive license</li>
      <li>Multi-scanner pipeline adds latency and infrastructure/model-hosting overhead compared to a single lightweight filter</li>
      <li>Young project (2025) relative to more established commercial guardrail vendors—expect API and scanner changes as it matures</li>
      <li>Benchmark claims (AgentDojo attack reduction) come from Meta's own paper; independent third-party validation is still limited</li>
    </ul>
    <div class="source"><a href="https://meta-llama.github.io/PurpleLlama/LlamaFirewall/" target="_blank">LlamaFirewall Docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/meta-llama/PurpleLlama" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Framework code is MIT-licensed and self-hosted; underlying Llama-derived models (PromptGuard 2, Llama Guard) are distributed under Meta's Llama Community License</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>PromptGuard 2: BERT-style classifier for direct prompt injection and jailbreak detection (86M param + 22M lightweight variant)</li>
      <li>AlignmentCheck: chain-of-thought auditing to catch goal hijacking and indirect prompt injection from tool/retrieval outputs</li>
      <li>CodeShield: static analysis of LLM-generated code via Semgrep and regex rules across 8 programming languages</li>
      <li>Configurable regex and custom scanners for known attack signatures and secrets detection</li>
      <li>Policy-engine architecture that lets scanners run at different agent workflow checkpoints (input, reasoning, output)</li>
      <li>Python SDK: `pip install llamafirewall`, with a `llamafirewall configure` setup command</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Filtering direct prompt injection attempts in user-facing LLM chat and agent inputs</li>
      <li>Detecting indirect prompt injection hidden in tool outputs, retrieved documents, or web content fed to an agent</li>
      <li>Auditing agent reasoning traces for signs of goal hijacking before executing an action</li>
      <li>Scanning LLM-generated code for known-insecure patterns before merge or execution</li>
      <li>Building layered, defense-in-depth guardrails for production autonomous agents</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | LlamaFirewall | LLM Guard | Lakera Guard |
|---------|---------------|-----------|--------------|
| Deployment | <span class="highlight">Self-hosted, open source</span> | Self-hosted, open source | Managed API / SaaS |
| Direct Prompt Injection Detection | PromptGuard 2 (BERT-style) | Prompt injection scanner (Transformer-based) | <span class="highlight">Proprietary detection models</span> |
| Indirect Injection / Agent Reasoning Auditing | <span class="highlight">AlignmentCheck (chain-of-thought auditing)</span> | Not a core focus | Limited |
| Code Output Scanning | <span class="highlight">CodeShield (Semgrep + regex, 8 languages)</span> | No | No |
| License | MIT (framework); Llama Community License (models) | MIT | Commercial |
| Backing | Meta (Purple Llama / used in production internally) | Community-maintained | Lakera (VC-backed startup) |

</div>

<p><em>*90%+ attack success rate reduction figure is from Meta's LlamaFirewall paper (arXiv 2505.03574) on the AgentDojo agent-security benchmark.</em></p>
