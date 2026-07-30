---
name: "Impeccable"
slug: "impeccable"
website: "https://impeccable.style/"
type: "oss"
track: "developers"
category: "ai-coding"
subcategory: "llm-skills"
status: "active"
tags:
  - skill
description: "Design vocabulary and skill system for AI agents that addresses visual uniformity in AI-generated interfaces"
github_url: "https://github.com/pbakaus/impeccable"
github_stars: 52718
pricing_model: "free"
founded_year: 2025
last_verified: "2026-06-08"
confidence_score: 0.95
tags: []
source_urls:
  - "https://impeccable.style/"
  - "https://github.com/pbakaus/impeccable"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">36K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">23</span>
    <span class="label">Commands</span>
  </div>
  <div class="key-stat">
    <span class="number">41</span>
    <span class="label">Anti-Pattern Rules</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Impeccable is a design vocabulary and skill system for AI agents that addresses the visual uniformity problem in AI-generated interfaces. Created by Paul Bakaus (former Google engineer and creator of Khroma), it provides 23 design commands organized by discipline—typography, color, motion, layout—plus a "slop detector" with 41 deterministic rules that block AI anti-patterns before deployment. Works with Cursor, Claude Code, GitHub Copilot, Gemini CLI, and Codex CLI.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Impeccable?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams using multiple AI coding tools</li>
        <li>Projects needing design consistency with AI</li>
        <li>CI/CD pipelines requiring design quality gates</li>
        <li>Developers wanting shared design vocabulary with AI</li>
        <li>Products with existing brand guidelines</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Quick prototypes where consistency doesn't matter</li>
        <li>Teams without design tokens or systems</li>
        <li>Backend-only development</li>
        <li>Projects with no existing brand identity</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Works across multiple AI agents (Cursor, Claude Code, Copilot, Gemini)</li>
      <li>41 deterministic anti-pattern rules—no LLM required for detection</li>
      <li>CI/CD compatible slop detector</li>
      <li>Design system inheritance (tokens, components, conventions)</li>
      <li>DESIGN.md format for portable design documentation</li>
      <li>Live mode iteration with HMR support</li>
      <li>Respects existing brand guidelines</li>
    </ul>
    <div class="source"><a href="https://impeccable.style/" target="_blank">Official Site</a> · <a href="https://github.com/pbakaus/impeccable" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires understanding of design vocabulary</li>
      <li>Setup needed for design token integration</li>
      <li>Opinionated about what constitutes "slop"</li>
      <li>May reject valid but unconventional designs</li>
    </ul>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://impeccable.style/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Open source under Apache 2.0</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>23 Design Commands</h4>
    <ul>
      <li>polish - Refine overall design</li>
      <li>audit - Check design quality</li>
      <li>critique - Get feedback</li>
      <li>distill - Simplify design</li>
      <li>animate - Add motion</li>
      <li>bolder - Increase visual weight</li>
      <li>quieter - Reduce visual noise</li>
      <li>And 16 more...</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>7 Domain References</h4>
    <ul>
      <li>Typography</li>
      <li>Color</li>
      <li>Motion</li>
      <li>Spatial</li>
      <li>Interaction</li>
      <li>Responsive</li>
      <li>UX Writing</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Slop Detector</h4>
    <ul>
      <li>27 deterministic anti-pattern rules</li>
      <li>12-rule LLM critique pass</li>
      <li>CLI and browser extension</li>
      <li>No API key required for deterministic rules</li>
      <li>CI/CD integration</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Tools</h4>
    <ul>
      <li>Cursor</li>
      <li>Claude Code</li>
      <li>GitHub Copilot</li>
      <li>Gemini CLI</li>
      <li>Codex CLI</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Impeccable | Frontend Design | v0 |
|---------|------------|-----------------|-----|
| Type | <span class="highlight">Multi-Agent Skill</span> | Claude Code Only | Web App |
| Price | Free | Free | Freemium |
| GitHub Stars | 36K | 148K | N/A |
| Slop Detection | <span class="highlight">41 rules, CI/CD</span> | No | No |
| Multi-IDE Support | <span class="highlight">Yes (5+ tools)</span> | Claude Code only | N/A |
| Design System Integration | <span class="highlight">Full (tokens, DESIGN.md)</span> | Limited | Shadcn |
| Best For | Teams, CI/CD | Individual devs | Quick prototypes |

</div>
