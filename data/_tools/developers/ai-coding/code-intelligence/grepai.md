---
name: "GrepAI"
slug: "grepai"
website: "https://yoanbernabeu.github.io/grepai/"
type: oss
track: developers
category: "ai-coding"
subcategory: "code-intelligence"
status: active
description: "Privacy-first semantic code search CLI that runs 100% locally with Ollama, providing meaning-aware queries and call graphs for AI coding agents"
pricing_model: free
founded_year: 2026
github_url: "https://github.com/yoanbernabeu/grepai"
github_stars: 1816
tags:
  - mcp-server
  - self-hosted
last_verified: "2026-06-08"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">1.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">27%</span>
    <span class="label">Token Savings</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">Local Processing</span>
  </div>
</div>

## Overview

<div class="overview">
<p>GrepAI is a privacy-first semantic code search CLI designed to replace traditional keyword-based search with meaning-aware queries. Unlike ripgrep or grep, GrepAI indexes the semantic meaning of your code, letting developers and AI agents find relevant code by what it does rather than just text matches. The tool runs 100% locally using Ollama for embeddings—no cloud, no API keys, no data leaving your machine. With MCP server integration, GrepAI works directly with Claude Code, Cursor, and Windsurf, reducing token costs by up to 27% by providing more precise context retrieval.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use GrepAI?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers using AI coding assistants who want to reduce token costs</li>
        <li>Privacy-conscious teams who can't send code to cloud services</li>
        <li>Users of Claude Code, Cursor, or Windsurf seeking better context</li>
        <li>Developers navigating large, unfamiliar codebases</li>
        <li>Anyone frustrated with keyword-only code search</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing enterprise features like cross-repo search</li>
        <li>Developers without local GPU/CPU for Ollama embeddings</li>
        <li>Simple projects where ripgrep is sufficient</li>
        <li>Those requiring cloud-hosted or managed solutions</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>100% local processing—no data leaves your machine</li>
      <li>MCP server works natively with Claude Code, Cursor, Windsurf</li>
      <li>Semantic search finds code by meaning, not just keywords</li>
      <li>Call graph tracing for function relationship analysis</li>
      <li>File watcher auto-updates index as you code</li>
      <li>Single binary, no dependencies, indexes 10K files in seconds</li>
    </ul>
    <div class="source"><a href="https://github.com/yoanbernabeu/grepai" target="_blank">GitHub</a> · <a href="https://richardporter.dev/blog/grepai-semantic-code-search-claude-code" target="_blank">User Blog</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires Ollama, LM Studio, or OpenAI for embeddings</li>
      <li>Initial indexing requires CPU/GPU resources</li>
      <li>Limited to supported languages (Go, TS, Python, etc.)</li>
      <li>No cross-repository or team-wide search</li>
    </ul>
    <div class="source"><a href="https://github.com/yoanbernabeu/grepai" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/yoanbernabeu/grepai" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">MIT License - free forever, self-hosted</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Semantic code search by meaning</li>
      <li>Call graph tracing</li>
      <li>MCP server integration</li>
      <li>Auto-updating file watcher</li>
      <li>Millisecond search latency</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Languages</h4>
    <ul>
      <li>Go</li>
      <li>TypeScript / JavaScript</li>
      <li>Python</li>
      <li>PHP, Java, C#, C++</li>
      <li>Rust, Zig</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Embedding Providers</h4>
    <ul>
      <li>Ollama (default, local)</li>
      <li>LM Studio (local)</li>
      <li>OpenAI (cloud, optional)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>Claude Code</li>
      <li>Cursor</li>
      <li>Windsurf</li>
      <li>Any MCP-compatible tool</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | GrepAI | Codemogger | Sourcegraph |
|---------|--------|------------|-------------|
| Search Type | <span class="highlight">Semantic + Call Graphs</span> | Semantic + Keyword | AI + Deterministic |
| Privacy | <span class="highlight">100% Local</span> | 100% Local | Cloud / Self-hosted |
| MCP Server | Yes | Yes | Yes |
| Language | Go (C bindings) | TypeScript | Multi-language |
| Best For | Privacy-first semantic search | Simple local indexing | Enterprise teams |

</div>
