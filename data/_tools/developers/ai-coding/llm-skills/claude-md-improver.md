---
name: "CLAUDE.md Improver"
slug: "claude-md-improver"
website: "https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-md-management"
type: "oss"
track: "developers"
category: "ai-coding"
subcategory: "llm-skills"
status: "active"
description: "Official Anthropic skill that audits, grades, and updates CLAUDE.md files so Claude Code keeps accurate project context"
github_url: "https://github.com/anthropics/claude-plugins-official"
github_stars: 37500
pricing_model: "free"
founded_year: 2026
headquarters: "San Francisco, CA"
tags:
  - skill
  - coding
  - memory
  - free
last_verified: "2026-10-07"
confidence_score: 0.9
source_urls:
  - "https://github.com/anthropics/claude-plugins-official/blob/main/plugins/claude-md-management/skills/claude-md-improver/SKILL.md"
  - "https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-md-management"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">37.5K</span>
    <span class="label">Repo Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">A–F</span>
    <span class="label">Quality Grades</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">Apache 2.0</span>
  </div>
</div>

## Overview

<div class="overview">
<p>CLAUDE.md Improver is an official Anthropic skill, shipped in the <code>claude-md-management</code> plugin of the Claude Code plugin directory, that keeps your project memory files honest. It finds every CLAUDE.md (root, nested, package-level, and <code>.claude.local.md</code>), scores each one out of 100 against a six-part rubric (commands, architecture, gotchas, conciseness, currency, actionability), and prints a graded quality report. Only after you approve does it apply small, targeted edits shown as diffs. The same plugin adds a <code>/revise-claude-md</code> command that captures learnings at the end of a session.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use CLAUDE.md Improver?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams whose CLAUDE.md has drifted out of date with the codebase</li>
        <li>Monorepos with several package-level CLAUDE.md files</li>
        <li>Periodic "project memory" maintenance passes</li>
        <li>Developers new to writing CLAUDE.md who want a rubric and templates</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Users of other agents (AGENTS.md, .cursorrules) — it only targets CLAUDE.md</li>
        <li>Hands-off automation — it stops for approval before every edit</li>
        <li>Projects with no CLAUDE.md yet (Claude Code's <code>/init</code> is the better start)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Report-first workflow: always shows a graded report before changing anything</li>
      <li>Transparent 100-point rubric with documented scoring criteria</li>
      <li>Edits are minimal, shown as diffs, and explain why each helps future sessions</li>
      <li>Discovers nested, package-level, and local override files</li>
      <li>Ships with CLAUDE.md templates by project type</li>
      <li>Official Anthropic plugin, Apache 2.0 licensed</li>
    </ul>
    <div class="source"><a href="https://github.com/anthropics/claude-plugins-official/blob/main/plugins/claude-md-management/skills/claude-md-improver/SKILL.md" target="_blank">SKILL.md</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Claude Code only; scores are model judgments, not deterministic checks</li>
      <li>"Currency" checks depend on how much of the codebase Claude reads</li>
      <li>Discovery uses a <code>find</code> command capped at 50 files</li>
      <li>Can write to CLAUDE.md files, so review the diffs it proposes</li>
    </ul>
    <div class="source"><a href="https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-md-management" target="_blank">Plugin README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-md-management" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Open source (Apache 2.0); needs Claude Code</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Workflow</h4>
    <ul>
      <li>Phase 1: Discover all CLAUDE.md files</li>
      <li>Phase 2: Score each against the rubric</li>
      <li>Phase 3: Output the quality report</li>
      <li>Phase 4: Propose targeted diffs</li>
      <li>Phase 5: Apply edits after approval</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Scoring Rubric</h4>
    <ul>
      <li>Commands/workflows (20)</li>
      <li>Architecture clarity (20)</li>
      <li>Non-obvious patterns (15)</li>
      <li>Conciseness (15)</li>
      <li>Currency (15)</li>
      <li>Actionability (15)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Issues It Flags</h4>
    <ul>
      <li>Stale build or test commands</li>
      <li>Missing dependencies or env setup</li>
      <li>Outdated architecture notes</li>
      <li>Undocumented gotchas</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Install</h4>
    <ul>
      <li><code>/plugin install claude-md-management@claude-plugins-official</code></li>
      <li>Trigger with "audit my CLAUDE.md files"</li>
      <li>Companion command: <code>/revise-claude-md</code></li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | CLAUDE.md Improver | Claude Code `/init` | `/revise-claude-md` |
|---------|--------------------|---------------------|---------------------|
| Type | <span class="highlight">Skill</span> | Built-in command | Plugin command |
| Purpose | Audit and update existing files | Generate a first CLAUDE.md | Capture session learnings |
| Quality report | <span class="highlight">Graded, per file</span> | No | No |
| Multiple files | Yes | Root only | Yes |
| Approval before edits | Yes | — | Yes |
| Best run | Periodically, after code changes | Once, at project start | End of a session |

</div>
