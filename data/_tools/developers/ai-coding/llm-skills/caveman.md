---
name: "Caveman"
slug: "caveman"
website: "https://getcaveman.dev/"
type: "open-source"
track: "developers"
category: "ai-coding"
subcategory: "llm-skills"
status: "active"
description: "Token-efficient stack for agent-native builders that compresses prompts and outputs by ~75%, treating tokens as a precious resource across compression, workflow, and memory layers"
github_url: "https://github.com/JuliusBrussee/caveman"
github_stars: 76319
pricing_model: "free"
founded_year: 2026
tags:
  - skill
  - coding
  - mcp-server
  - multi-model
  - memory
last_verified: "2026-06-15"
confidence_score: 0.95
source_urls:
  - "https://getcaveman.dev/"
  - "https://github.com/JuliusBrussee/caveman"
  - "https://github.com/JuliusBrussee/cavekit"
  - "https://github.com/JuliusBrussee/cavemem"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">72.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">~75%</span>
    <span class="label">Token Reduction</span>
  </div>
  <div class="key-stat">
    <span class="number">~77%</span>
    <span class="label">Savings (full stack)</span>
  </div>
  <div class="key-stat">
    <span class="number">20+</span>
    <span class="label">Model Providers</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Caveman is a three-part open-source ecosystem for agent-native developers who treat tokens as a precious resource. The compression primitive cuts prompt and output tokens by ~75% through a deterministic, user-controlled dictionary. The workflow layer (Cavekit) adds spec-driven task execution with acceptance criteria and verification checkpoints. The memory layer (Cavemem) provides cross-agent persistent memory via local SQLite with FTS5 and vector search. When all components are stacked together via the Caveman Code CLI, the project claims ~77% total token savings (21,340 → 4,812 tokens in baseline testing). The entire stack is MIT-licensed and available on npm.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Caveman?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers running long-context or multi-agent workflows where token costs compound</li>
        <li>Teams building on Claude Code who want a drop-in compression skill</li>
        <li>Agent-native builders who need persistent cross-session memory without a cloud backend</li>
        <li>Anyone hitting usage limits and wanting to do more per dollar</li>
        <li>Projects requiring spec-driven development with structured verification</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing peer-reviewed benchmarks — savings claims are self-reported</li>
        <li>Workflows where output verbosity and natural language are required (compressed output can read awkwardly)</li>
        <li>Non-Claude Code environments (Cavekit/Cavemem have limited multi-agent breadth vs. alternatives)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>~75% token reduction on the compression primitive alone — composable across apps and models</li>
      <li>Deterministic output with user-controlled dictionary: no black-box surprises</li>
      <li>Local-first memory (SQLite + FTS5) keeps sensitive data off the cloud (~1.2 MB for 4,812 observations)</li>
      <li>MCP protocol support in Cavemem exposes search, timeline, and get_observations tools to any MCP-compatible agent</li>
      <li>Works with 20+ model providers — not locked to Anthropic</li>
      <li>Full MIT stack: no licensing costs or vendor lock-in</li>
    </ul>
    <div class="source"><a href="https://getcaveman.dev/" target="_blank">Official Site</a> · <a href="https://github.com/JuliusBrussee/caveman" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Savings figures (77%) are self-reported by the creator — no independent reproduction guide yet</li>
      <li>The companion Cavemem and Cavekit projects are much earlier-stage than the flagship compression primitive</li>
      <li>Individual creator project — community and long-term maintenance are less established than VC-backed alternatives</li>
      <li>Compressed output syntax may reduce readability for humans reviewing agent outputs</li>
    </ul>
    <div class="source"><a href="https://github.com/JuliusBrussee/cavemem" target="_blank">Cavemem GitHub</a> · <a href="https://github.com/JuliusBrussee/cavekit" target="_blank">Cavekit GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/JuliusBrussee/caveman" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">MIT licensed across the full stack</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Caveman (Compression Primitive)</h4>
    <ul>
      <li>~75% token reduction on typical agent workloads</li>
      <li>Model-agnostic — works with any LLM provider</li>
      <li>Deterministic output with user-controlled dictionary</li>
      <li>Composable across multiple applications</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Cavekit (Workflow Layer)</h4>
    <ul>
      <li>Spec-driven development: prose to structured plan</li>
      <li>Task-based execution with acceptance criteria</li>
      <li>Verification checkpoints per task</li>
      <li>Iterative spec evolution as requirements change</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Cavemem (Memory Layer)</h4>
    <ul>
      <li>Persistent cross-agent memory via SQLite + FTS5</li>
      <li>Vector search capabilities</li>
      <li>Local-first, privacy-preserving (~1.2 MB for 4,812 observations)</li>
      <li>MCP exposure: search, timeline, get_observations tools</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Caveman Code (CLI)</h4>
    <ul>
      <li>Four independent compression layers: prompt, commands, outputs, context</li>
      <li>~77% total token savings when fully stacked</li>
      <li>Support for 20+ model providers</li>
      <li>Available via npm, pnpm, yarn, bun, or Docker</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Caveman | Ponytail | Token Optimizer |
|---------|---------|----------|-----------------|
| Approach | <span class="highlight">Prompt compression</span> | Code minimalism (YAGNI) | Context auditing |
| Token Savings | <span class="highlight">~75–77%</span> | 47–77% cost reduction | Varies |
| Memory Layer | <span class="highlight">Yes (Cavemem + MCP)</span> | No | No |
| Workflow Layer | <span class="highlight">Yes (Cavekit)</span> | No | No |
| Benchmarks | Self-reported | Published, reproducible | N/A |
| Model Support | <span class="highlight">20+ providers</span> | 11 agents | Claude Code |
| License | MIT | MIT | MIT |

</div>
