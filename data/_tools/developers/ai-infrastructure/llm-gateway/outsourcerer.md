---
name: "Outsourcerer"
slug: "outsourcerer"
website: "https://alexgreenshpun.com"
type: "oss"
track: "developers"
category: "ai-infrastructure"
subcategory: "llm-gateway"
status: "active"
description: "Bash-based orchestrator that routes coding tasks across Claude, Codex, Cursor, Devin and local models while tracking spend in one ledger"
github_url: "https://github.com/alexgreensh/outsourcerer"
github_stars: 189
pricing_model: "free"
founded_year: 2026
headquarters: "Open Source"
tags:
  - agents
  - self-hosted
  - workflow-automation
last_verified: "2026-10-16"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">177+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">6+</span>
    <span class="label">Engines Orchestrated</span>
  </div>
  <div class="key-stat">
    <span class="number">2026</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Outsourcerer is an open-source bash script that coordinates multiple AI coding assistants, Claude Code, Codex, Cursor, Devin, and local Ollama/LM Studio models, so they work as one team instead of as separate disconnected tools. It evaluates each incoming task against live benchmark scores and routes "boring" work (grep, refactors, test runs) to cheaper or local models while reserving premium models for judgment calls. A built-in ledger ("the Tab") tracks real per-generation API spend alongside subscription quota usage, and the tool can carry an entire setup (skills, docs, scripts) across engines when delegating a task.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Outsourcerer?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers juggling multiple AI coding subscriptions who want one cost view</li>
        <li>Teams running parallel agent fleets across different backends</li>
        <li>Anyone who wants cheap/local models to absorb mechanical work automatically</li>
        <li>Users who want bounded retry loops validated by their own test suite</li>
        <li>Command-line-comfortable developers willing to run a bash tool</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Commercial users (license requires separate commercial agreement)</li>
        <li>Teams wanting a polished GUI instead of a CLI/plugin workflow</li>
        <li>Anyone needing full visibility into non-Claude Code agent sessions (fleet heartbeat is limited)</li>
        <li>Developers who only use a single AI coding tool</li>
        <li>Windows-native workflows without a bash/WSL environment</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Routes tasks to the cheapest capable model instead of always using the priciest one</li>
      <li>Single ledger tracks both pay-per-use API cash and subscription plan-limit burn</li>
      <li>Carries skills, docs, and context across engines on delegation</li>
      <li>Advisory panels require multi-model consensus before work proceeds</li>
      <li>Local model support (Ollama, LM Studio) for fully private, $0 lanes</li>
      <li>Hard credential blocks prevent .env/id_rsa files from leaving the machine</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/outsourcerer" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>PolyForm Noncommercial license, commercial use needs a separate license from the author</li>
      <li>Fleet visibility currently covers only Claude Code and Outsourcerer-run jobs</li>
      <li>Bounded loops need measurable pass/fail criteria; no good for subjective quality checks</li>
      <li>Shell-script distribution rather than a packaged binary or app</li>
      <li>Free (":free") model lanes may train on your prompts unless scoped out</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/outsourcerer" target="_blank">GitHub README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/alexgreensh/outsourcerer" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Free for noncommercial use under PolyForm Noncommercial 1.0.0</div>
  </a>
  <a href="mailto:me@alexgreenshpun.com" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Commercial License</div>
    <div class="price">Contact</div>
    <div class="desc">Required for commercial use, contact the author directly</div>
  </a>
  <a href="https://openrouter.ai/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Pass-Through API Costs</div>
    <div class="price">Variable</div>
    <div class="desc">You pay OpenRouter/provider rates for actual model usage it routes to</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Benchmark-driven task-to-model routing</li>
      <li>Context portability across engines (skills, docs, scripts)</li>
      <li>Multi-model advisory panels requiring consensus</li>
      <li>Bounded iteration loops (build-test-retry) with test-verified stopping</li>
      <li>Auto-pilot, you-drive, and hybrid approval modes</li>
      <li>Consolidated fleet view of active AI sessions</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Engines</h4>
    <ul>
      <li>Claude Code (native plugin)</li>
      <li>Codex (parity bridge)</li>
      <li>Cursor, Droid, Hermes (reverse-bridge)</li>
      <li>Devin (skill mirroring)</li>
      <li>Ollama, LM Studio (local, private)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Offloading mechanical work like repo mapping and large refactors</li>
      <li>Convening expert review panels before building</li>
      <li>Running parallel agent teams across backends</li>
      <li>Bounded retry loops verified by real test suites</li>
      <li>Keeping premium models reserved for high-judgment decisions</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Security</h4>
    <ul>
      <li>Hard blocks on credential files leaving the machine during delegation</li>
      <li>Per-repo trust scoping for narrow exceptions</li>
      <li>Least-privilege defaults for free/training-flagged model lanes</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Outsourcerer | LiteLLM Proxy | OpenRouter | Portkey |
|---------|-------------|---------------|------------|---------|
| Price Model | <span class="highlight">Free (noncommercial)</span> | Free (OSS) | Pay-per-use | Freemium |
| Routes | <span class="highlight">Whole coding agents/engines</span> | Raw LLM API calls | Raw LLM API calls | Raw LLM API calls |
| Cost Tracking | <span class="highlight">Unified ledger (cash + plan limits)</span> | Spend tracking | Pay-per-use billing | Spend tracking |
| Local Models | <span class="highlight">Yes (Ollama, LM Studio)</span> | Via config | No | Via config |
| Multi-Agent Panels | <span class="highlight">Yes, consensus-gated</span> | No | No | No |
| Context Portability | <span class="highlight">Yes, across engines</span> | No | No | No |
| Commercial Use | Requires license | Yes (MIT) | Yes | Yes |
| Distribution | Bash script/plugin | Self-hosted proxy | Hosted API | Self-hosted or managed |

</div>
