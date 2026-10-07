---
name: "Claude-Mem"
slug: "claude-mem"
website: "https://claude-mem.ai"
type: "oss"
track: "developers"
category: "agent-frameworks"
subcategory: "agent-memory"
status: "active"
description: "Open-source persistent memory for Claude Code and other coding agents that captures, compresses, and re-injects session context"
github_url: "https://github.com/thedotmack/claude-mem"
github_stars: 97400
pricing_model: "freemium"
founded_year: 2025
headquarters: "—"
tags:
  - memory
  - coding
  - mcp-server
  - agents
  - self-hosted
  - cli
last_verified: "2026-10-07"
confidence_score: 0.85
source_urls:
  - "https://github.com/thedotmack/claude-mem"
  - "https://github.com/thedotmack/claude-mem/blob/main/CHANGELOG.md"
  - "https://docs.claude-mem.ai/"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">97K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">~10x</span>
    <span class="label">Token Savings on Recall</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Claude-Mem is an open-source memory layer for Claude Code (and a growing list of other agent harnesses) that remembers what your agent did after the session ends. Lifecycle hooks capture tool usage as "observations", an observer model compresses them into semantic summaries, and relevant context is injected automatically when the next session starts. Everything lives locally in SQLite with Chroma hybrid search, a web viewer, and MCP search tools that use a three-layer index → timeline → details pattern to keep recall cheap. An optional paid CMEM Pro tier runs the observer off your Claude plan and adds cloud sync.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Claude-Mem?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Claude Code users tired of re-explaining their project every session</li>
        <li>Long-running projects where past decisions and bug fixes matter</li>
        <li>Developers who want local-first memory they can inspect in a viewer</li>
        <li>Teams using several harnesses (Claude Code, Codex, OpenCode, Cursor) on one codebase</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Building memory into your own app (Mem0, Zep, or Letta fit better)</li>
        <li>Users who want zero background processes or extra runtimes</li>
        <li>Strict environments where an observer model reading tool output is a concern</li>
        <li>Those who want a fully static, hand-curated context file (CLAUDE.md is simpler)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Fully automatic: capture and injection happen through hooks, no manual notes</li>
      <li>Progressive-disclosure search keeps memory recall token-efficient</li>
      <li>Local SQLite + FTS5 and Chroma vector search; data stays on your machine by default</li>
      <li><code>&lt;private&gt;</code> tags exclude sensitive content from storage</li>
      <li>One-command installers for Claude Code, OpenCode, T3 Code, Antigravity, OpenClaw and more</li>
      <li>Very active project with frequent releases (v13.34 as of October 2026)</li>
    </ul>
    <div class="source"><a href="https://github.com/thedotmack/claude-mem" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Runs a background worker and auto-installs Bun and uv on first use</li>
      <li>Installer leads with a sign-in and paid CMEM Pro trial (skippable with <code>--provider</code>)</li>
      <li>Observer summaries cost tokens on your own plan or API key unless you pay for Pro</li>
      <li><code>npm install -g claude-mem</code> installs only the SDK, not the plugin, which trips people up</li>
      <li>Fast release cadence means frequent behavior changes</li>
    </ul>
    <div class="source"><a href="https://github.com/thedotmack/claude-mem/blob/main/CHANGELOG.md" target="_blank">Changelog</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/thedotmack/claude-mem" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Apache 2.0, local storage; observer runs on your Anthropic plan or your own OpenRouter/Gemini key</div>
  </a>
  <a href="https://cmem.ai" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">CMEM Pro</div>
    <div class="price">$30/mo</div>
    <div class="desc">Hosted observer model off your plan, cloud sync included; 30-day free trial</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Automatic observation capture via lifecycle hooks</li>
      <li>AI-compressed session summaries</li>
      <li>Context injection at session start</li>
      <li>mem-search skill and MCP tools (search, timeline, get_observations)</li>
      <li>Web viewer with a real-time memory stream</li>
      <li>Citations to past observations by ID</li>
      <li>Workflow and language modes (e.g. <code>code--zh</code>)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Architecture</h4>
    <ul>
      <li>Hooks: SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd</li>
      <li>Local worker service (HTTP API), managed by Bun</li>
      <li>SQLite with FTS5 for sessions and observations</li>
      <li>Chroma vector DB for hybrid search</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Harnesses</h4>
    <ul>
      <li>Claude Code (plugin marketplace)</li>
      <li>OpenCode, T3 Code, Codex</li>
      <li>Antigravity CLI, OMP, Pi, DeepSeek Harness</li>
      <li>Cursor, OpenClaw gateways</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Requirements</h4>
    <ul>
      <li>Node.js 20+</li>
      <li>Bun and uv (auto-installed)</li>
      <li>Install: <code>npx claude-mem install</code></li>
      <li>Or <code>/plugin marketplace add thedotmack/claude-mem</code></li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Claude-Mem | Mem0 | CLAUDE.md |
|---------|------------|------|-----------|
| Type | <span class="highlight">Coding-agent plugin</span> | Memory API/SDK | Static context file |
| Capture | Automatic (hooks) | Via your app code | Manual edits |
| Storage | Local SQLite + Chroma | Cloud or self-hosted | Markdown in repo |
| Search | Hybrid semantic + keyword (MCP) | Vector + graph | None (always loaded) |
| Price | Free / $30/mo Pro | Freemium | Free |
| Best For | Claude Code & coding agents | Apps that need user memory | Stable project conventions |

</div>
