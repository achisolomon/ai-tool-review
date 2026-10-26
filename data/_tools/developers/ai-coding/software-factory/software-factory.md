---
name: "Software Factory"
slug: "software-factory"
website: "https://github.com/achisolomon/software-factory"
type: "oss"
track: "developers"
category: "ai-coding"
subcategory: "software-factory"
status: "active"
description: "Claude Code and Codex plugin with a team of ten AI agents that take a product from idea to release behind three human approval gates"
pricing_model: "free"
founded_year: 2026
github_url: "https://github.com/achisolomon/software-factory"
github_stars: 2
tags:
  - agents
  - agent-orchestration
  - coding
  - multi-model
last_verified: "2026-10-26"
confidence_score: 0.8
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">2</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">10</span>
    <span class="label">AI Agents</span>
  </div>
  <div class="key-stat">
    <span class="number">3</span>
    <span class="label">Approval Gates</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Software Factory is a plugin for Claude Code and Codex that gives you a team of ten AI agents: a Team Lead, a Triage Classifier, a Product Manager, a Software Architect, a Developer, a Test Automation Engineer, plus DevOps, FinOps, Security and UX/UI reviewers. The Team Lead triages each request, so a small fix takes a fast path while a new product runs the full lifecycle: discovery and PRD, architecture with design reviews, a per-task build loop, and release readiness. It stops for your approval at three gates (PRD, design and cost, release) and before anything irreversible, such as a push, merge, deploy, infrastructure apply or paid resource. It also works on existing repos, where it maps the codebase and reviews or extends it.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Software Factory?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Solo builders who want a PM, architect, tester and security reviewer around their coding agent</li>
        <li>Teams that want human sign-off before pushes, merges, deploys and paid cloud resources</li>
        <li>Claude Code or Codex users who track work as GitHub issues on a project board</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Quick one-off scripts where reviews and gates add overhead</li>
        <li>Users of other coding agents (only Claude Code and Codex are supported)</li>
        <li>Organizations that need a licensed, widely adopted project with a support channel</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Triage first, so small requests skip the full lifecycle</li>
      <li>"Done" needs command output re-run by the Test Engineer and Architect, not just the Developer's claim</li>
      <li>Bounded build loops: at most three fix rounds per task and three attempts per failing check</li>
      <li>Security (STRIDE, ASVS), FinOps cost review and WCAG 2.2 AA UX review built into design and build</li>
      <li>Routes work to Haiku, Sonnet or Opus by task type to control cost</li>
    </ul>
    <div class="source"><a href="https://github.com/achisolomon/software-factory" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Very new, with little public adoption so far</li>
      <li>No license file in the repository</li>
      <li>Subagents cannot ask you questions directly; everything routes through the Team Lead</li>
      <li>Plugins load only at session start, so open chats will not see a fresh install</li>
      <li>GitHub Project tracking needs the <code>gh</code> CLI with the project scope</li>
    </ul>
    <div class="source"><a href="https://github.com/achisolomon/software-factory" target="_blank">GitHub README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/achisolomon/software-factory" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Public GitHub plugin; you pay only for your Claude Code or Codex usage</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Ten agents with a shared handoff contract</li>
      <li>Lifecycle: discovery, PRD gate, architecture, design reviews, design and cost gate, build loop, release gate</li>
      <li>Separate infrastructure gate: DevOps plans, Architect and FinOps review, apply only after approval</li>
      <li>Per-repo "factory brain" of verified facts that agents read</li>
      <li>GitHub issues and project board tracking, with a tasks.md fallback</li>
      <li>Model policy setting: default, conserve or quality</li>
      <li>Project-level agent overrides and per-project agent memory</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Taking a product idea to a reviewed, tested release</li>
      <li>Mapping and reviewing an existing codebase</li>
      <li>Adding a feature with architecture, security and cost review</li>
      <li>Running infrastructure changes behind human approval</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Software Factory | Mifal | BMAD-METHOD |
|---------|------------------|-------|-------------|
| Approach | Agent team with approval gates | Shared workflow with brief/receipt contracts | Agile persona agents and workflows |
| Agents supported | Claude Code, Codex | Claude Code, Codex, Droid, Pi, OpenCode | Many AI IDEs and agents |
| Human gates | PRD, design and cost, release, plus irreversible actions | Lead plus reviewer must accept receipts | Checkpoints between phases |
| Security, cost and UX reviewers | Built in | Not built in | Not built in |
| License | Not stated | MIT | MIT |

</div>

Sources: <a href="https://github.com/achisolomon/software-factory" target="_blank">Software Factory</a> · <a href="https://github.com/romiluz13/mifal" target="_blank">Mifal</a> · <a href="https://github.com/bmad-code-org/BMAD-METHOD" target="_blank">BMAD-METHOD</a>
