---
name: "Codemogger"
slug: "codemogger"
website: "https://github.com/glommer/codemogger"
type: oss
track: developers
category: "ai-coding"
subcategory: "code-intelligence"
status: active
description: "Code indexing library and MCP server that uses tree-sitter for semantic chunking and local embeddings, storing everything in a single SQLite file"
pricing_model: free
founded_year: 2026
github_url: "https://github.com/glommer/codemogger"
github_stars: 331
tags:
  - mcp-server
  - self-hosted
last_verified: "2026-06-08"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">318</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">13</span>
    <span class="label">Languages</span>
  </div>
  <div class="key-stat">
    <span class="number">1 File</span>
    <span class="label">SQLite DB</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Codemogger is a code indexing library and MCP server designed specifically for AI coding agents. It parses source code using tree-sitter, chunks it into semantic units (functions, classes, impl blocks), embeds them locally using the all-MiniLM-L6-v2 model, and stores everything in a single SQLite file with both vector and full-text search capabilities. The tool requires no Docker, no external server, and no API keys—just one .db file per codebase. Codemogger returns the 5 most relevant definitions instead of thousands of matches, making it ideal for providing precise context to AI agents.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Codemogger?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers building AI coding agents that need codebase context</li>
        <li>Teams wanting a simple, portable code index (single SQLite file)</li>
        <li>Users who need both keyword and semantic search combined</li>
        <li>Projects requiring incremental indexing (only re-embed changed files)</li>
        <li>Anyone integrating code intelligence via MCP protocol</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Enterprise teams needing cross-repository search at scale</li>
        <li>Projects requiring advanced code navigation (go-to-definition)</li>
        <li>Languages not supported by tree-sitter grammars</li>
        <li>Teams needing a managed, hosted solution</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Zero dependencies—no Docker, no server, no API keys needed</li>
      <li>Single SQLite file stores everything (portable and simple)</li>
      <li>Tree-sitter parsing extracts semantic units, not arbitrary chunks</li>
      <li>Combines vector search and full-text search in one database</li>
      <li>Incremental indexing only processes changed files (SHA-256 hash)</li>
      <li>MCP server exposes search, index, and reindex tools</li>
    </ul>
    <div class="source"><a href="https://github.com/glommer/codemogger" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Newer project with smaller community</li>
      <li>Limited to 13 languages with tree-sitter grammars</li>
      <li>Large items (150+ lines) are subdivided, which may affect some searches</li>
      <li>No cloud or team collaboration features</li>
    </ul>
    <div class="source"><a href="https://github.com/glommer/codemogger" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/glommer/codemogger" class="pricing-card featured" target="_blank" rel="noopener">
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
      <li>Tree-sitter semantic parsing</li>
      <li>Local embeddings (all-MiniLM-L6-v2)</li>
      <li>SQLite vector + FTS search</li>
      <li>Incremental indexing</li>
      <li>MCP server integration</li>
      <li>.gitignore-aware scanning</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Languages</h4>
    <ul>
      <li>Rust, C, C++, Go, Zig</li>
      <li>Python, Java, Scala</li>
      <li>JavaScript, TypeScript, TSX</li>
      <li>PHP, Ruby</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>MCP Tools</h4>
    <ul>
      <li>codemogger_search - semantic/keyword search</li>
      <li>codemogger_index - index a directory</li>
      <li>codemogger_reindex - force reindex</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Installation</h4>
    <ul>
      <li>npm install -g codemogger</li>
      <li>npx -y codemogger (no install)</li>
      <li>Library, CLI, or MCP server</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Codemogger | GrepAI | Sourcegraph |
|---------|------------|--------|-------------|
| Parser | <span class="highlight">Tree-sitter (semantic)</span> | Custom + embeddings | SCIP |
| Storage | SQLite (single file) | Custom index | Database |
| Search | Vector + FTS | Semantic | AI + Deterministic |
| MCP Server | Yes | Yes | Yes |
| Best For | Simple, portable indexing | Privacy-first search | Enterprise scale |

</div>
