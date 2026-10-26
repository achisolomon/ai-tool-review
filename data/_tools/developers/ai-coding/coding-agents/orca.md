---
name: "Orca"
slug: "orca"
website: "https://www.onorca.dev"
type: "oss"
track: "developers"
category: "ai-coding"
subcategory: "coding-agents"
status: "active"
description: "Free, open-source agent IDE by Stably AI that runs Claude Code, Codex and other CLI agents in parallel, each in its own git worktree."
github_url: "https://github.com/stablyai/orca"
github_stars: 106717
pricing_model: "free"
founded_year: 2022
headquarters: "San Francisco, CA"
tags:
  - agents
  - agent-orchestration
  - agent-management
  - self-hosted
last_verified: "2026-10-26"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">106.7k</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">MIT</span>
    <span class="label">License</span>
  </div>
  <div class="key-stat">
    <span class="number">Mac · Win · Linux</span>
    <span class="label">Desktop + Mobile</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Orca is an "agent development environment" from Stably AI, a Y Combinator company in San Francisco. It is a free, MIT-licensed desktop app for running coding agents such as Claude Code, Codex, OpenCode, Cursor and Copilot side by side, each in its own isolated git worktree. Terminals, AI diff review, an embedded browser, GitHub and Linear, and SSH remotes sit in one window, and a companion mobile app lets you watch agents and send follow-ups from your phone. Unlike most rivals it ships on macOS, Windows and Linux, and all of it is open source.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Orca?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers running several Claude Code or Codex sessions at once</li>
        <li>Windows and Linux users who can't use Mac-only tools like Conductor</li>
        <li>Teams that want a free, auditable, self-hostable orchestrator</li>
        <li>Front-end work: Design Mode sends a clicked UI element straight to an agent</li>
        <li>Anyone who wants to check on agents from a phone</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Developers who use one agent at a time (run the agent directly)</li>
        <li>Projects not in git (worktrees are the core model)</li>
        <li>Teams without budget for parallel model usage</li>
        <li>Low-RAM machines hosting many agents, terminals and browsers</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Free and MIT-licensed, with no paid tier for individuals</li>
      <li>Works with any CLI agent; the README lists about 30, from Claude Code to Goose</li>
      <li>One prompt can fan out to several agents in isolated worktrees, then you merge the best result</li>
      <li>Line-level comments on AI diffs go straight back to the agent</li>
      <li>SSH worktrees run agents on a remote machine with port forwarding</li>
      <li>Shows Claude and Codex usage and rate-limit reset times</li>
    </ul>
    <div class="source"><a href="https://www.onorca.dev" target="_blank" rel="noopener">onorca.dev</a> · <a href="https://github.com/stablyai/orca" target="_blank" rel="noopener">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Parallel agents mean parallel model bills; Orca adds no cost controls of its own</li>
      <li>Ships almost daily, so features and hotkeys change often</li>
      <li>Heavy on RAM once several agents, terminals and browsers run together</li>
      <li>MCP support depends on whichever CLI agent it launches</li>
      <li>Few independent long-form reviews so far</li>
    </ul>
    <div class="source"><a href="https://aitoolsatlas.ai/tools/orca-stably/pros-cons" target="_blank" rel="noopener">AI Tools Atlas</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.onorca.dev/download" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Full desktop app and mobile companion, MIT license; you pay your own model providers</div>
  </a>
  <a href="https://www.onorca.dev/enterprise" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Rollout help, approved agents and integrations, self-hosted server; contact sales</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Parallel worktrees, one per task or agent</li>
      <li>Terminal splits with scrollback that survives restarts</li>
      <li>Design Mode: embedded Chromium sends HTML, CSS and a screenshot to an agent</li>
      <li>Annotate AI diffs and send comments back</li>
      <li>GitHub PRs and issues, Linear boards in-app</li>
      <li>SSH worktrees with auto-reconnect and port forwarding</li>
      <li>Orca CLI so agents can drive Orca</li>
      <li>Account switching with usage tracking</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>macOS (Apple Silicon and Intel)</li>
      <li>Windows</li>
      <li>Linux (AppImage, AUR)</li>
      <li>iOS app and Android APK (pair with a desktop host)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Enterprise</h4>
    <ul>
      <li>Agent changes land as worktrees and pull requests for review</li>
      <li>Audit trail through git history and PRs</li>
      <li>Prompts and code go straight to your approved providers; Orca does not store them</li>
      <li>Run as a desktop app, an always-on server, or both</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Fan one prompt out to several agents and keep the best diff</li>
      <li>Work a backlog of GitHub or Linear issues in parallel</li>
      <li>Run agents on a beefy remote box over SSH</li>
      <li>Fix UI bugs by pointing at the element in the browser</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Orca | Conductor | Superset |
|---------|------|-----------|----------|
| License | <span class="highlight">MIT open source</span> | Proprietary | Source on GitHub |
| Platforms | <span class="highlight">Mac, Windows, Linux</span> | Mac only | Desktop app |
| Supported agents | Any CLI agent | Claude Code, Codex, Cursor | Any CLI agent |
| Worktree isolation | Built-in | Built-in | Built-in |
| Remote agents | SSH worktrees (free) | Cloud tier | Pro plan |
| Mobile app | <span class="highlight">iOS and Android</span> | Cloud tier | Not yet |
| Price | Free | Freemium | Freemium |

</div>
