---
name: MiMo-Code
slug: mimo-code
website: https://mimo.xiaomi.com
type: open-source
track: developers
category: ai-coding
subcategory: coding-agents
status: active
description: Terminal-native AI coding assistant from Xiaomi with persistent memory
  system for long-horizon tasks
github_url: https://github.com/XiaomiMiMo/MiMo-Code
github_stars: 12793
pricing_model: free
founded_year: 2026
headquarters: Beijing, China
tags:
- agents
- reasoning
last_verified: '2026-06-12'
confidence_score: 0.9
---
<div class="key-stats">
  <div class="key-stat">
    <span class="number">62%</span>
    <span class="label">SWE-bench Pro</span>
  </div>
  <div class="key-stat">
    <span class="number">1M</span>
    <span class="label">Token Context</span>
  </div>
  <div class="key-stat">
    <span class="number">5.2K</span>
    <span class="label">GitHub Stars</span>
  </div>
</div>

## Overview

<div class="overview">
<p>MiMo-Code is Xiaomi's open-source terminal AI coding assistant designed for long-horizon, multi-step development tasks. Built as a fork of OpenCode, it introduces a persistent memory system that automatically summarizes and stores context as you work, solving the common problem of AI assistants "forgetting" earlier decisions when context windows fill up. The standout feature is a background subagent that manages memory compression while you code, plus a /dream command that runs weekly maintenance on your memory files.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use MiMo-Code?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers working on 200+ step tasks</li>
        <li>Long coding sessions spanning multiple days</li>
        <li>Teams wanting to self-host with MIT license</li>
        <li>Users who want to bring their own LLM</li>
        <li>Budget-conscious devs (free model access)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Enterprise with strict data residency (routes through Xiaomi)</li>
        <li>Production reliance (v0.1 maturity)</li>
        <li>Teams needing proven stability</li>
        <li>Quick single-file edits</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Persistent memory survives context limits</li>
      <li>MIT licensed, fully inspectable code</li>
      <li>Free access to MiMo-V2.5 (1M context)</li>
      <li>Bring-your-own-model support</li>
      <li>Automatic memory maintenance (/dream)</li>
      <li>Multiple agent modes (build, plan, compose)</li>
    </ul>
    <div class="source"><a href="https://github.com/XiaomiMiMo/MiMo-Code" target="_blank">GitHub</a> · <a href="https://www.gizmochina.com/2026/06/11/xiaomi-mimo-code-open-source-terminal-ai-coding-agent/" target="_blank">GizmoChina</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>v0.1 release — early maturity</li>
      <li>Free model access is "limited time"</li>
      <li>Benchmarks are self-reported</li>
      <li>Code context routes through Xiaomi servers</li>
      <li>Smaller community than established tools</li>
    </ul>
    <div class="source"><a href="https://venturebeat.com/technology/xiaomis-new-open-source-agentic-ai-coding-harness-mimo-code-beats-claude-code-at-ultra-long-200-step-tasks" target="_blank">VentureBeat</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://mimo.xiaomi.com" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Full access + MiMo-V2.5 model (limited time)</div>
  </a>
  <a href="https://platform.xiaomimimo.com/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">BYOM</div>
    <div class="price">API Costs</div>
    <div class="desc">Connect DeepSeek, Kimi, GLM, or custom endpoints</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Memory System</h4>
    <ul>
      <li>SQLite FTS5 full-text search</li>
      <li>Project memory (MEMORY.md)</li>
      <li>Session checkpoints (checkpoint.md)</li>
      <li>Scratch notes (notes.md)</li>
      <li>Per-task progress logs</li>
      <li>/dream weekly maintenance</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Agent Modes</h4>
    <ul>
      <li>Build — full dev permissions</li>
      <li>Plan — read-only analysis</li>
      <li>Compose — specs-driven orchestration</li>
      <li>Tab to switch modes</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Task System</h4>
    <ul>
      <li>Tree-structured tracking (T1, T1.1, T1.2)</li>
      <li>Subagent creation</li>
      <li>Parallel execution</li>
      <li>Goal/stop validation via judge model</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>macOS, Linux (one-line install)</li>
      <li>Windows (via npm)</li>
      <li>OpenCode TUI compatibility</li>
      <li>LSP & MCP server support</li>
    </ul>
  </div>
</div>

</details>

## Benchmarks

<div class="benchmarks">
  <div class="benchmark-card">
    <div class="score">62%</div>
    <div class="benchmark-name">SWE-Bench Pro</div>
    <div class="benchmark-desc">Complex GitHub issue resolution tasks</div>
    <div class="source"><a href="https://github.com/XiaomiMiMo/MiMo-Code" target="_blank">Xiaomi (self-reported)</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">73%</div>
    <div class="benchmark-name">Terminal Bench 2</div>
    <div class="benchmark-desc">Multi-step terminal operations</div>
    <div class="source"><a href="https://github.com/XiaomiMiMo/MiMo-Code" target="_blank">Xiaomi (self-reported)</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">200+</div>
    <div class="benchmark-name">Step Tasks</div>
    <div class="benchmark-desc">Designed for ultra-long horizon tasks</div>
    <div class="source"><a href="https://www.gizmochina.com/2026/06/11/xiaomi-mimo-code-open-source-terminal-ai-coding-agent/" target="_blank">GizmoChina</a></div>
  </div>
</div>

## Real-World Usage

<div class="info-grid">
  <div class="info-card">
    <h4>Community Stats</h4>
    <ul>
      <li>412 forks</li>
      <li>MIT licensed source code</li>
      <li>Released June 10, 2026</li>
    </ul>
    <div class="source">GitHub API, June 2026</div>
  </div>
  <div class="info-card">
    <h4>Technical Foundation</h4>
    <ul>
      <li>95.4% TypeScript codebase</li>
      <li>Fork of OpenCode</li>
      <li>Multi-provider LLM support</li>
      <li>MCP protocol compatible</li>
    </ul>
    <div class="source">GitHub Repository</div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | MiMo-Code | Claude Code | Cline | OpenHands |
|---------|-----------|-------------|-------|-----------|
| Context Window | <span class="highlight">1M tokens</span> | 1M tokens | 200K | 128K |
| Persistent Memory | <span class="highlight">Built-in</span> | Manual | No | No |
| Price | <span class="highlight">Free</span> | $20/mo+ | Free + API | Free + API |
| License | <span class="highlight">MIT</span> | Proprietary | Apache 2.0 | MIT |
| BYOM Support | Yes | No | Yes | Yes |
| Maturity | v0.1 (new) | Established | Established | Established |
| Best For | Long sessions | Large codebases | Budget devs | Research |

</div>
