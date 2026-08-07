---
name: "skills.sh"
slug: "skills-sh"
website: "https://www.skills.sh/"
type: "open-source"
track: "developers"
category: "ai-coding"
subcategory: "llm-skills"
status: "active"
description: "Open registry and CLI for discovering and installing reusable AI agent skills across Claude Code, Cursor, Copilot, Codex, and 67+ other coding agents"
github_url: "https://github.com/vercel-labs/skills"
github_stars: 28223
pricing_model: "free"
founded_year: 2026
headquarters: "San Francisco, CA"
tags:
  - skill
  - api-available
  - typescript
  - agents
  - cli
last_verified: "2026-06-17"
confidence_score: 0.95
source_urls:
  - "https://www.skills.sh/"
  - "https://www.skills.sh/about"
  - "https://github.com/vercel-labs/skills"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">748K</span>
    <span class="label">Total Installs</span>
  </div>
  <div class="key-stat">
    <span class="number">22.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">70+</span>
    <span class="label">Supported Agents</span>
  </div>
</div>

## Overview

<div class="overview">
<p>skills.sh is an open directory and CLI for reusable AI agent skills — modular procedural knowledge packages that enhance coding agents with capabilities like design systems, debugging workflows, security reviews, and more. Built by Vercel Labs, it lets developers install skills from any GitHub repo with a single <code>npx skills add</code> command. The directory indexes publicly available skills, ranks them by install activity, and runs routine security audits to surface trustworthy options. Skills work across OpenCode, Claude Code, Codex, Cursor, GitHub Copilot, Gemini CLI, and 67+ other agents.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use skills.sh?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams distributing reusable workflows across AI coding tools</li>
        <li>Developers using multiple coding agents who want shared capabilities</li>
        <li>Open-source maintainers publishing agent skills for the community</li>
        <li>Platform engineers wanting CI/CD-friendly skill installation</li>
        <li>Anyone extending Claude Code, Cursor, or Copilot with procedural knowledge</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Developers using a single AI tool with no interest in skill sharing</li>
        <li>Teams needing private, internal-only skill registries (not yet supported)</li>
        <li>Non-coding AI workflows (this is developer-facing only)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Single command installs skills from any GitHub/GitLab/git URL</li>
      <li>Supports 70+ AI coding agents out of the box</li>
      <li>Project-scoped installs can be committed to repos for team sharing</li>
      <li>Security audits run on indexed skills via partner providers</li>
      <li>Skills usable without installing — pipe output directly to an agent</li>
      <li>Leaderboard tracks trending skills by 8-week install activity</li>
      <li>Fully open-source CLI and ingestion pipeline</li>
    </ul>
    <div class="source"><a href="https://www.skills.sh/" target="_blank" rel="noopener">Official Site</a> · <a href="https://github.com/vercel-labs/skills" target="_blank" rel="noopener">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>No private registry support — all indexed skills are public</li>
      <li>Skill quality varies since anyone can publish</li>
      <li>Requires Node.js/npx — no standalone binary</li>
      <li>Telemetry is opt-in, so install counts may undercount real usage</li>
    </ul>
    <div class="source"><a href="https://www.skills.sh/about" target="_blank" rel="noopener">About Page</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/vercel-labs/skills" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Fully open source — CLI, registry, and directory</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Installation Options</h4>
    <ul>
      <li>GitHub shorthand (owner/repo)</li>
      <li>Full GitHub or GitLab URLs</li>
      <li>Direct path to a specific skill in a repo</li>
      <li>Any git URL or local path</li>
      <li>Project-scoped (committed to repo) or global</li>
      <li>Symlink or copy installation modes</li>
      <li>CI/CD friendly with <code>--yes</code> flag</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Agents</h4>
    <ul>
      <li>Claude Code</li>
      <li>OpenCode</li>
      <li>Codex CLI</li>
      <li>Cursor</li>
      <li>GitHub Copilot</li>
      <li>Gemini CLI</li>
      <li>Cline</li>
      <li>67+ more agents</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Directory Features</h4>
    <ul>
      <li>Leaderboard ranked by 8-week activity</li>
      <li>748K+ total all-time installs tracked</li>
      <li>Anonymous, deduplicated install telemetry</li>
      <li>Routine security audits via partner providers</li>
      <li>Skills failing all audits are excluded</li>
      <li>Source repo, org, and compatible agent metadata</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>CLI Commands</h4>
    <ul>
      <li><code>npx skills add</code> — install a skill</li>
      <li><code>npx skills use</code> — use without installing</li>
      <li><code>--list</code> — list available skills in a repo</li>
      <li><code>--skill</code> — install specific skills by name</li>
      <li><code>--agent</code> — target specific agent(s)</li>
      <li><code>--global</code> — install to user directory</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | skills.sh | Claude Code Skills | Cursor Rules |
|---------|-----------|-------------------|--------------|
| Multi-agent | <span class="highlight">70+ agents</span> | Claude Code only | Cursor only |
| Open Registry | <span class="highlight">Yes (public directory)</span> | No | No |
| Security Audits | <span class="highlight">Partner audits</span> | None | None |
| Install Method | <span class="highlight">npx skills add</span> | Manual copy | Manual copy |
| Team Sharing | <span class="highlight">Git-committed installs</span> | Manual | Manual |
| Price | Free | Free | Free |
| Built By | Vercel Labs | Anthropic | Cursor |

</div>
