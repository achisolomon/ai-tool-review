---
name: "Herdr"
slug: "herdr"
website: "https://herdr.dev/"
type: "open-source"
track: "developers"
category: "ai-coding"
subcategory: "dev-environment"
status: "active"
description: "Persistent terminal runtime for AI coding agents that keeps sessions alive across disconnects, unifies local and remote machines into one workspace, and shows at-a-glance status for every running agent."
github_url: "https://github.com/herdrdev/herdr"
github_stars: 44564
pricing_model: "open-source"
founded_year: 2026
headquarters: "Herdr, Inc."
tags:
  - agents
  - agent-orchestration
  - agent-management
  - self-hosted
  - real-time
last_verified: "2026-10-16"
confidence_score: 0.88
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">22+</span>
    <span class="label">Compatible Agents</span>
  </div>
  <div class="key-stat">
    <span class="number">Rust</span>
    <span class="label">Built With</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">Apache 2.0</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Herdr is a persistent background terminal server built for AI coding agents. Rather than orchestrating parallel agent runs, it manages the terminal environment agents live in: sessions keep running when your machine disconnects or restarts, and a unified workspace can pull together local machines and remote servers (via SSH) into one view. It automatically detects and labels each agent pane as working, blocked, or idle, and lets agents split panes or signal each other through socket and CLI APIs. It works with Claude Code, Codex, Cursor, and 22+ other agents without wrapping or modifying them.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Herdr?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers running long agent sessions who need them to survive a disconnect or reboot</li>
        <li>Teams managing agents across multiple local and remote machines from one workspace</li>
        <li>Anyone who wants at-a-glance status (working/blocked/idle) across many concurrent agent panes</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams specifically wanting parallel isolated git-worktree execution across many agent instances (see Superset for that model)</li>
        <li>Users who want a GUI-first experience — Herdr is terminal-multiplexer-style (tmux-like keyboard/mouse interaction)</li>
        <li>Very new deployments without an SSH-accessible remote setup, until the announced "Herdr Cloud" managed option ships</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Sessions persist through disconnects and restarts instead of dying with your terminal</li>
      <li>Works with 22+ agents (Claude Code, Codex, Cursor, and others) without wrapping or modifying them</li>
      <li>Unifies local and remote (SSH) machines into a single multi-machine workspace</li>
      <li>Automatic status detection labels each agent pane as working, blocked, or idle</li>
      <li>Free and open-source (Apache 2.0), fast-growing adoption since its March 2026 launch</li>
    </ul>
    <div class="source"><a href="https://herdr.dev/" target="_blank" rel="noopener">Official site</a> · <a href="https://github.com/herdrdev/herdr" target="_blank" rel="noopener">GitHub (official)</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Very new (launched March 2026) with a small core team (2 public repos under the org)</li>
      <li>"Herdr Cloud" managed connectivity (no manual SSH setup) is announced but not yet shipped</li>
      <li>No established third-party review coverage found on Hacker News, Product Hunt, or Reddit as of this review</li>
    </ul>
    <div class="source"><a href="https://github.com/herdrdev/herdr" target="_blank" rel="noopener">GitHub (API-verified stats)</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/herdrdev/herdr" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0 license, self-hosted.</div>
  </a>
  <a href="https://herdr.dev/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Herdr Cloud</div>
    <div class="price">Coming soon</div>
    <div class="desc">Managed connectivity without manual SSH setup (announced, not yet shipped).</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Persistent background server for agent terminals</li>
      <li>Automatic working/blocked/idle status detection</li>
      <li>Multi-machine unification over SSH</li>
      <li>Agent-native socket/CLI signaling and pane splitting</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Compatibility</h4>
    <ul>
      <li>Claude Code, Codex, Cursor</li>
      <li>22+ other AI coding agents, unmodified</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Project Stats</h4>
    <ul>
      <li>Created March 27, 2026</li>
      <li>Primary language: Rust</li>
      <li>License: Apache 2.0</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Herdr | Superset | tmux |
|---------|-------|----------|------|
| Built For | <span class="highlight">AI coding agents specifically</span> | AI coding agents (parallel runs) | General terminal multiplexing |
| Session Persistence | <span class="highlight">Yes, across disconnects</span> | N/A | Yes |
| Agent Status Detection | <span class="highlight">Automatic (working/blocked/idle)</span> | N/A | No |
| Multi-Machine | <span class="highlight">Yes, via SSH</span> | No | Manual |
| License | Apache 2.0 (free) | Freemium | BSD (free) |

</div>
