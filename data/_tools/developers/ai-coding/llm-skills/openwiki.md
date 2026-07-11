---
name: "OpenWiki"
slug: "openwiki"
website: "https://github.com/langchain-ai/openwiki"
type: "open-source"
track: "developers"
category: "ai-coding"
subcategory: "llm-skills"
status: "active"
description: "CLI that writes and maintains agent documentation for your codebase"
github_url: "https://github.com/langchain-ai/openwiki"
github_stars: 10392
pricing_model: "free"
founded_year: 2026
tags:
  - agents
  - typescript
  - api-available
last_verified: "2026-07-02"
confidence_score: 0.90
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">600</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">MIT</span>
    <span class="label">License</span>
  </div>
  <div class="key-stat">
    <span class="number">5+</span>
    <span class="label">LLM Providers</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OpenWiki is a CLI built by LangChain that writes and maintains documentation for your codebase, built specifically for agents. It generates a <code>openwiki/</code> wiki directory and automatically appends context prompts to your <code>AGENTS.md</code> and <code>CLAUDE.md</code> files so coding agents always have accurate codebase knowledge. A GitHub Actions workflow keeps docs fresh with daily automated PR updates.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OpenWiki?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams using Claude Code, Codex, or similar coding agents</li>
        <li>Repos with poor or outdated documentation</li>
        <li>Projects that want auto-maintained AGENTS.md / CLAUDE.md</li>
        <li>Developers who want LLM-context-optimized docs</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing hosted or GUI-based doc tools</li>
        <li>Projects already with thorough human-written docs</li>
        <li>Orgs that can't expose code to third-party LLM APIs</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Built specifically for agent consumption, not human readers</li>
      <li>Auto-patches AGENTS.md and CLAUDE.md with repo context</li>
      <li>GitHub Action for daily documentation drift PRs</li>
      <li>Multi-provider: OpenRouter, Fireworks, Baseten, OpenAI, Anthropic</li>
      <li>Interactive and one-shot CLI modes</li>
      <li>Free and open-source (MIT)</li>
    </ul>
    <div class="source"><a href="https://github.com/langchain-ai/openwiki">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Very new project (launched June 2026) — early stage</li>
      <li>Requires own LLM API key and incurs inference costs</li>
      <li>No hosted version — CLI only</li>
      <li>Config stored locally in <code>~/.openwiki/.env</code></li>
    </ul>
    <div class="source"><a href="https://github.com/langchain-ai/openwiki">GitHub README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/langchain-ai/openwiki" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT license — bring your own LLM API key</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Interactive CLI with follow-up message support</li>
      <li>One-shot mode with <code>-p</code> / <code>--print</code> flag</li>
      <li>Auto-creates <code>openwiki/</code> wiki on first run</li>
      <li>Incremental updates on re-runs (<code>--update</code>)</li>
      <li>AGENTS.md / CLAUDE.md auto-patching</li>
      <li>GitHub Action for daily automated doc PRs</li>
      <li>Optional LangSmith tracing integration</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported LLM Providers</h4>
    <ul>
      <li>Anthropic (Claude models)</li>
      <li>OpenAI</li>
      <li>OpenRouter</li>
      <li>Fireworks</li>
      <li>Baseten</li>
      <li>Custom model ID support per provider</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>macOS, Linux, Windows (npm global install)</li>
      <li>GitHub Actions (CI workflow included)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Tech Stack</h4>
    <ul>
      <li>TypeScript / JavaScript</li>
      <li>npm package (<code>npm install -g openwiki</code>)</li>
      <li>MIT License</li>
      <li>Built by LangChain</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OpenWiki | Mintlify | Swimm | Manual AGENTS.md |
|---------|----------|----------|-------|-----------------|
| Agent-optimized output | <span class="highlight">Yes, built for it</span> | No | No | Depends |
| Auto-updates | <span class="highlight">GitHub Action</span> | Yes | Yes | Manual |
| AGENTS.md / CLAUDE.md | <span class="highlight">Auto-patches</span> | No | No | Manual |
| Hosted product | No | Yes | Yes | N/A |
| Price | <span class="highlight">Free (MIT)</span> | Freemium | Freemium | Free |
| LLM provider choice | <span class="highlight">5+ providers</span> | Fixed | Fixed | N/A |

</div>
