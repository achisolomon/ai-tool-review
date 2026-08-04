---
name: "Token Optimizer"
slug: "token-optimizer"
website: "https://github.com/alexgreensh/token-optimizer"
type: "open-source"
track: "developers"
category: "ai-coding"
subcategory: "cost-reduction"
status: "active"
description: "Context optimization plugin that identifies and eliminates wasted tokens across Claude Code, OpenCode, OpenClaw, and Codex environments while preserving work through compactions"
github_url: "https://github.com/alexgreensh/token-optimizer"
github_stars: 1803
pricing_model: "free"
last_verified: "2026-06-03"
confidence_score: 0.95
tags:
  - skill
  - cost-reduction
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">1.2K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">257</span>
    <span class="label">Passing Tests</span>
  </div>
  <div class="key-stat">
    <span class="number">$300-600</span>
    <span class="label">Monthly Savings</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Token Optimizer is a context optimization plugin that identifies and eliminates wasted tokens across Claude Code, OpenCode, OpenClaw, and Codex environments while preserving work through compactions. It analyzes three categories of token waste: structural waste (bloated configuration files, unused skills, duplicate system prompts), runtime waste (verbose command output that floods context mid-session), and behavioral waste (habits like premature cache expiration and inefficient model selection). Zero runtime dependencies—pure Python stdlib or TypeScript depending on platform.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Token Optimizer?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Heavy API users processing high token volumes</li>
        <li>Teams tracking AI coding costs</li>
        <li>Developers experiencing context overflow</li>
        <li>Multi-session workflows needing continuity</li>
        <li>Those wanting visibility into token usage</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Casual users with minimal API spend</li>
        <li>Small projects under context limits</li>
        <li>Commercial use (PolyForm Noncommercial)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Zero runtime dependencies—pure stdlib</li>
      <li>Live dashboard with per-turn breakdowns</li>
      <li>Quality scoring with degradation detection</li>
      <li>Survives compaction with checkpoint/restore</li>
      <li>Subagent cost attribution</li>
      <li>No telemetry—all local SQLite</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/token-optimizer" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>PolyForm Noncommercial license</li>
      <li>Requires plugin marketplace install</li>
      <li>Learning curve for optimization strategies</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/token-optimizer" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/alexgreensh/token-optimizer" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">PolyForm Noncommercial License</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Visibility & Measurement</h4>
    <ul>
      <li>Live dashboard tracking tokens & costs</li>
      <li>Four pricing tier breakdowns</li>
      <li>Per-turn cost analysis</li>
      <li>Quality scoring (v6 dual-score)</li>
      <li>Cache hit rate analysis</li>
      <li>TTL distribution tracking</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Session Continuity</h4>
    <ul>
      <li>Checkpoints before compaction</li>
      <li>Critical decision restoration</li>
      <li>Multi-session workflow support</li>
      <li>Zero baseline context overhead</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Optimization</h4>
    <ul>
      <li>Structural waste detection</li>
      <li>Runtime waste reduction</li>
      <li>Behavioral waste coaching</li>
      <li>Quality nudges & loop detection</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Claude Code</li>
      <li>OpenCode</li>
      <li>OpenClaw</li>
      <li>Codex</li>
      <li>macOS, Linux, Windows</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Category | Token Optimizer | Headroom | RTK |
|----------|-----------------|----------|-----|
| **Tool output compression** | <span class="highlight">99%+ per-output, progressive disclosure</span> | 60-95% (cherry-picked benchmarks) | 60-90% (CLI only) |
| **First-read file skeletons** | <span class="highlight">Shadow-validated, fail-open</span> | — | — |
| **Bash/CLI output compression** | <span class="highlight">Generic + git/ls/pytest patterns</span> | Partial | <span class="highlight">Yes (main feature)</span> |
| **Tabular/JSON compression** | <span class="highlight">Value-preserving columnar</span> | <span class="highlight">Yes (main feature)</span> | — |
| **Delta reads (re-read = diff only)** | <span class="highlight">Yes</span> | — | — |
| **Model routing (wrong model for task)** | <span class="highlight">9 waste detectors</span> | — | — |
| **Loop/spin detection** | <span class="highlight">Yes</span> | — | — |
| **Context quality scoring** | <span class="highlight">Per-session, cross-session average</span> | — | — |
| **Cache instability detection** | <span class="highlight">Yes</span> | — | — |
| **Retry churn detection** | <span class="highlight">Yes</span> | — | — |
| **Tool cascade waste** | <span class="highlight">Yes</span> | — | — |
| **Code structure maps** | <span class="highlight">Outlines on repeated reads</span> | — | — |
| **Conversation history** (60-75% of cost) | <span class="highlight">Checkpoint + compaction awareness</span> | Doesn't touch it | Doesn't touch it |
| **Quality gates** | <span class="highlight">3-tier system, edit-rate proxies</span> | "Same answers" (untested) | — |
| **Measured dollar savings** | <span class="highlight">Real bill reduction per category</span> | Per-output ratios only | `rtk gain` analytics |
| **Multi-platform** | <span class="highlight">Claude Code, Codex, OpenClaw, OpenCode</span> | Python library + proxy | <span class="highlight">macOS, Linux, WSL</span> |

**Summary:** Token Optimizer covers all 16 optimization categories. Headroom and RTK each specialize in one area (tool output compression) but miss conversation history (60-75% of cost), loop detection, model routing, and other major waste sources.

</div>
