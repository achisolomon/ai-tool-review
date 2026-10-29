---
name: "Mifal"
slug: "mifal"
website: "https://romiluz13.github.io/mifal/"
type: "oss"
track: "developers"
category: "ai-coding"
subcategory: "software-factory"
status: "beta"
description: "Open-source engineering workflow for Claude Code, Codex, Droid, Pi and OpenCode that makes agents prove work with briefs, receipts and a validator"
pricing_model: "free"
founded_year: 2026
github_url: "https://github.com/romiluz13/mifal"
github_stars: 40
tags:
  - agents
  - agent-orchestration
  - coding
  - skill
last_verified: "2026-10-26"
confidence_score: 0.8
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">26</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">39</span>
    <span class="label">Skills</span>
  </div>
  <div class="key-stat">
    <span class="number">5</span>
    <span class="label">Agent Families</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Mifal (Hebrew for "factory") is an alpha, macOS-only engineering workflow that installs one shared Guide and 39 skills into Claude Code, Codex, Droid, Pi and OpenCode. Its premise is that an agent saying "done" is not proof. The lead writes each task as a brief listing the claims that must hold and the check behind each one; the worker answers with a receipt marking every claim passed, failed or untested; and a validator refuses any brief, receipt or phase record with missing fields. Multi-session builds run scope, grill, spec, tickets, implement, review and retro, and the lead can run workers in Herdr panes.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Mifal?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers who use several coding agents and want one workflow across them</li>
        <li>Anyone tired of agents claiming work passed checks it never ran</li>
        <li>Early adopters comfortable testing alpha tooling on a Mac</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Linux or Windows users (macOS only)</li>
        <li>Teams that need a proven, end-to-end tested orchestration loop today</li>
        <li>Users who want enforced sandboxing (worktree isolation is a rule, not enforced)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Same Guide and skill set across five agent families, with several "Homes" per agent</li>
      <li>Brief and receipt contracts make every claim traceable to a check and a revision</li>
      <li>Lead cannot approve its own plan or accept claims it cannot check</li>
      <li><code>--dry-run</code> preview and an uninstall that keeps your edits</li>
      <li>MIT license, with third-party skills recorded in a provenance file</li>
    </ul>
    <div class="source"><a href="https://github.com/romiluz13/mifal" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Alpha: the Herdr adapter and lead loop are tested only with fake agents</li>
      <li>README reports no agent passed the entry gate as written in its own live test</li>
      <li>The validator checks records only; it does not run tests</li>
      <li>Agent-level settings can hide the skills while <code>mifal doctor</code> still passes</li>
      <li>macOS only</li>
    </ul>
    <div class="source"><a href="https://github.com/romiluz13/mifal" target="_blank">GitHub README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/romiluz13/mifal" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">MIT licensed; you pay only for the coding agents you run</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Shared Guide that loads the engineering workflow before engineering work</li>
      <li>39 skills, including bundled third-party skills such as Superpowers and Impeccable</li>
      <li>Brief, receipt and phase-record contracts</li>
      <li>Contract validator that gates dispatch, review and acceptance</li>
      <li>Team-lead skill with workers in Herdr panes</li>
      <li><code>mifal doctor</code> and <code>mifal update</code> commands</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Multi-session builds from scope to retro</li>
      <li>Shorter routes for research, planning, debugging and review</li>
      <li>Running a Claude lead with a Codex reviewer</li>
      <li>Standardizing one workflow across several agents</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Mifal | Software Factory | BMAD-METHOD |
|---------|-------|------------------|-------------|
| Approach | Shared workflow with brief/receipt contracts | Agent team with approval gates | Agile persona agents and workflows |
| Agents supported | Claude Code, Codex, Droid, Pi, OpenCode | Claude Code, Codex | Many AI IDEs and agents |
| Proof of work | Validator rejects incomplete receipts | Test Engineer and Architect re-run commands | Checkpoints between phases |
| Platforms | macOS only | Wherever Claude Code or Codex runs | Cross-platform |
| Maturity | Alpha | Early | Established |

</div>

Sources: <a href="https://github.com/romiluz13/mifal" target="_blank">Mifal</a> · <a href="https://github.com/achisolomon/software-factory" target="_blank">Software Factory</a> · <a href="https://github.com/bmad-code-org/BMAD-METHOD" target="_blank">BMAD-METHOD</a>
