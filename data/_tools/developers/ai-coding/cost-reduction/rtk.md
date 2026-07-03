---
name: "RTK (Rust Token Killer)"
slug: "rtk"
website: "https://github.com/rtk-ai/rtk"
type: "oss"
track: "developers"
category: "ai-coding"
subcategory: "cost-reduction"
status: "active"
description: "CLI proxy that reduces LLM token consumption by 60-90% on common dev commands with zero dependencies"
github_url: "https://github.com/rtk-ai/rtk"
github_stars: 68078
pricing_model: "free"
founded_year: 2026
last_verified: "2026-06-08"
confidence_score: 0.95
tags:
  - skill
source_urls:
  - "https://github.com/rtk-ai/rtk"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">60K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">60-90%</span>
    <span class="label">Token Savings</span>
  </div>
  <div class="key-stat">
    <span class="number"><10ms</span>
    <span class="label">Overhead</span>
  </div>
</div>

## Overview

<div class="overview">
<p>RTK (Rust Token Killer) is a CLI proxy that reduces LLM token consumption by 60-90% on common development commands. It filters and compresses command outputs before they reach an AI's context window using smart filtering, grouping, truncation, and deduplication. Single Rust binary with zero dependencies and sub-10ms overhead. Works with Claude Code, GitHub Copilot, Cursor, Windsurf, Cline, and 9+ other AI coding assistants.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use RTK?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers using AI coding assistants daily</li>
        <li>Teams with high API token costs</li>
        <li>Projects needing extended context windows</li>
        <li>CLI-heavy development workflows</li>
        <li>Anyone running lots of git, test, build commands</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Non-CLI workflows</li>
        <li>Native Windows (limited support)</li>
        <li>Projects requiring exact command output</li>
        <li>Workflows with custom command formats</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Widely adopted with strong community support</li>
      <li>Zero dependencies, single Rust binary</li>
      <li>Sub-10ms overhead—virtually invisible</li>
      <li>Auto-rewrite hook for 100% adoption</li>
      <li>Built-in analytics (rtk gain command)</li>
      <li>Supports 40+ common dev commands</li>
      <li>Works with 10+ AI coding assistants</li>
    </ul>
    <div class="source"><a href="https://github.com/rtk-ai/rtk" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Limited native Windows support (use WSL)</li>
      <li>No auto-rewrite hook on Windows</li>
      <li>May filter out occasionally needed details</li>
      <li>Requires learning command mappings</li>
    </ul>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/rtk-ai/rtk" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Open source, Apache 2.0</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Supported Commands</h4>
    <ul>
      <li>File: ls, read, find, grep, diff</li>
      <li>Git: status, log, diff, commit, push, pull</li>
      <li>Testing: Jest, Vitest, pytest, cargo test, go test</li>
      <li>Build: ESLint, TypeScript, cargo build, ruff</li>
      <li>Package: pnpm, pip, bundle, prisma</li>
      <li>Cloud: AWS CLI, Docker, kubectl</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Optimization Strategies</h4>
    <ul>
      <li>Smart filtering (removing noise)</li>
      <li>Grouping (aggregating similar items)</li>
      <li>Truncation (preserving relevant context)</li>
      <li>Deduplication (collapsing repeated lines)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Sample Session Savings</h4>
    <ul>
      <li>10× ls/tree calls: 80% reduction</li>
      <li>5× cargo test: 90% reduction</li>
      <li>30-min session: 118K → 24K tokens (-80%)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Installation</h4>
    <ul>
      <li>Homebrew (macOS/Linux)</li>
      <li>Pre-built binaries</li>
      <li>Cargo install</li>
      <li>Works on macOS, Linux, Windows (WSL)</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Category | Token Optimizer | RTK | Headroom |
|----------|-----------------|-----|----------|
| **Tool output compression** | <span class="highlight">99%+ per-output, progressive disclosure</span> | 60-90% (CLI only) | 60-95% (cherry-picked benchmarks) |
| **First-read file skeletons** | <span class="highlight">Shadow-validated, fail-open</span> | — | — |
| **Bash/CLI output compression** | <span class="highlight">Generic + git/ls/pytest patterns</span> | <span class="highlight">Yes (main feature)</span> | Partial |
| **Tabular/JSON compression** | <span class="highlight">Value-preserving columnar</span> | — | <span class="highlight">Yes (main feature)</span> |
| **Delta reads (re-read = diff only)** | <span class="highlight">Yes</span> | — | — |
| **Model routing (wrong model for task)** | <span class="highlight">9 waste detectors</span> | — | — |
| **Loop/spin detection** | <span class="highlight">Yes</span> | — | — |
| **Context quality scoring** | <span class="highlight">Per-session, cross-session average</span> | — | — |
| **Cache instability detection** | <span class="highlight">Yes</span> | — | — |
| **Retry churn detection** | <span class="highlight">Yes</span> | — | — |
| **Tool cascade waste** | <span class="highlight">Yes</span> | — | — |
| **Code structure maps** | <span class="highlight">Outlines on repeated reads</span> | — | — |
| **Conversation history** (60-75% of cost) | <span class="highlight">Checkpoint + compaction awareness</span> | Doesn't touch it | Doesn't touch it |
| **Quality gates** | <span class="highlight">3-tier system, edit-rate proxies</span> | — | "Same answers" (untested) |
| **Measured dollar savings** | <span class="highlight">Real bill reduction per category</span> | `rtk gain` analytics | Per-output ratios only |
| **Multi-platform** | <span class="highlight">Claude Code, Codex, OpenClaw, OpenCode</span> | <span class="highlight">macOS, Linux, WSL</span> | Python library + proxy |

**Summary:** Token Optimizer covers 16/16 categories. RTK excels at CLI output compression but misses 85-90% of actual token waste (conversation history, loops, model routing, etc.).

</div>
