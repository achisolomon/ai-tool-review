---
name: "Superset"
slug: "superset"
website: "https://superset.sh/"
type: "commercial"
track: "developers"
category: "ai-coding"
subcategory: "coding-agents"
status: "active"
description: "Desktop app that orchestrates 100+ AI coding agents in parallel using isolated Git worktrees"
github_url: "https://github.com/superset-sh/superset"
github_stars: 12381
pricing_model: "freemium"
founded_year: 2024
headquarters: "San Francisco, CA"
tags:
  - agents
  - workflow-automation
  - api-available
last_verified: "2026-06-15"
confidence_score: 0.92
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">11.8k</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">Parallel Agents</span>
  </div>
  <div class="key-stat">
    <span class="number">3</span>
    <span class="label">YC-backed Founders</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Superset is a desktop application that lets you run an army of AI coding agents — Claude Code, Codex, OpenCode, Cursor, Gemini, Copilot — simultaneously on your machine. Each agent gets its own isolated Git worktree, preventing merge conflicts while 10 to 100+ tasks run in parallel. Built by former Y Combinator CTOs, it integrates with VS Code, Cursor, Xcode, and JetBrains, and includes built-in change visualization and review tools so you can inspect every agent's output before merging.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Superset?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams running Claude Code or Codex at scale</li>
        <li>Engineers parallelizing feature branches and bug fixes</li>
        <li>Orgs that want to multiply developer throughput without adding headcount</li>
        <li>Shops already invested in agentic AI workflows</li>
        <li>Teams using Linear who want agent-task integration</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Developers new to AI coding tools — Superset multiplies agents, not beginners</li>
        <li>Projects without Git (worktree isolation is the core value)</li>
        <li>Teams without existing Claude/Codex API spend budgeted</li>
        <li>Single-task, single-dev workflows (use the agent directly)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Runs any CLI-based AI coding agent — not locked to one provider</li>
      <li>Isolated Git worktrees eliminate merge conflicts between parallel tasks</li>
      <li>Built-in diff and review UI before committing agent changes</li>
      <li>Port forwarding lets parallel agents serve on different local ports</li>
      <li>Endorsed by engineers at Microsoft, OpenAI, Google, Vercel, and Cloudflare</li>
    </ul>
    <div class="source"><a href="https://superset.sh/" target="_blank" rel="noopener">superset.sh</a> · <a href="https://github.com/superset-sh/superset" target="_blank" rel="noopener">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Desktop app only — no browser-based or cloud access</li>
      <li>Remote workspaces require Pro plan ($15/mo)</li>
      <li>Mobile app and CLI are still "coming soon" as of 2026</li>
      <li>Underlying agent API costs (Claude, Codex, etc.) are separate and can add up fast at scale</li>
    </ul>
    <div class="source"><a href="https://superset.sh/pricing" target="_blank" rel="noopener">Superset Pricing Page</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://superset.sh/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">1 user, local workspaces, desktop app, GitHub integration</div>
  </a>
  <a href="https://superset.sh/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$15<span>/user/mo</span></div>
    <div class="desc">Unlimited users, remote workspaces, Linear integration — billed yearly ($20/mo monthly)</div>
  </a>
  <a href="https://superset.sh/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">SSO, audit logs, IP restrictions, SCIM, SLA & dedicated support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>
<div class="detail-grid">
  <div class="detail-section">
    <h4>Agent Compatibility</h4>
    <ul>
      <li>Claude Code (Anthropic)</li>
      <li>Codex CLI (OpenAI)</li>
      <li>OpenCode</li>
      <li>Cursor Agent</li>
      <li>Gemini CLI</li>
      <li>GitHub Copilot</li>
      <li>Any CLI-based coding agent</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>IDE Integrations</h4>
    <ul>
      <li>VS Code</li>
      <li>Cursor</li>
      <li>Xcode</li>
      <li>JetBrains IDEs</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Core Capabilities</h4>
    <ul>
      <li>Parallel agent orchestration (10–100+ agents)</li>
      <li>Isolated Git worktrees per task</li>
      <li>Built-in diff/change visualization</li>
      <li>Port forwarding for parallel services</li>
      <li>GitHub integration (Free)</li>
      <li>Linear integration (Pro+)</li>
      <li>Remote workspaces (Pro+)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Enterprise Features</h4>
    <ul>
      <li>Single sign-on (SSO)</li>
      <li>Audit logs</li>
      <li>IP restrictions</li>
      <li>SCIM provisioning</li>
      <li>Custom integrations</li>
      <li>SLA & dedicated support</li>
    </ul>
  </div>
</div>
</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Superset | Claude Code (solo) | Tmux + Scripts |
|---------|----------|--------------------|----------------|
| Parallel agents | <span class="highlight">100+ out of the box</span> | Manual only | Manual setup |
| Worktree isolation | <span class="highlight">Built-in</span> | Manual | Manual |
| Diff / review UI | <span class="highlight">Built-in</span> | Terminal only | None |
| Agent compatibility | <span class="highlight">Any CLI agent</span> | Claude only | Any |
| Setup time | Minutes | Immediate | Hours |
| Cost | Free tier available | Pay per use | Free |

</div>
