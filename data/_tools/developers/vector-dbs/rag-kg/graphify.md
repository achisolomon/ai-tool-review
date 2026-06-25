---
name: Graphify
slug: graphify
website: https://github.com/safishamsi/graphify
type: oss
track: developers
category: vector-dbs
subcategory: rag-kg
status: active
description: AI coding assistant skill that transforms code, docs, and media into queryable knowledge graphs with 71x fewer tokens than raw file reading
github_url: https://github.com/safishamsi/graphify
github_stars: 71751
pricing_model: free
founded_year: 2026
headquarters: Y Combinator S26
tags:
  - multimodal
  - rag
last_verified: '2026-06-10'
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">64.6K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">71.5x</span>
    <span class="label">Token Savings</span>
  </div>
  <div class="key-stat">
    <span class="number">YC S26</span>
    <span class="label">Backed</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Graphify is an AI coding assistant skill that transforms unstructured files—code, SQL schemas, R scripts, shell scripts, docs, papers, images, and videos—into interactive, queryable knowledge graphs. It uses Claude vision and tree-sitter AST parsing to extract concepts and relationships, then persists them for querying weeks later without reprocessing. The tool achieves 71.5x fewer tokens per query versus reading raw files, making it ideal for large mixed corpora. Works with Claude Code, Codex, OpenCode, Cursor, and Gemini CLI.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Graphify?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers using AI coding assistants on large codebases</li>
        <li>Teams with mixed code + documentation + diagrams</li>
        <li>Architecture visualization and understanding</li>
        <li>Semantic codebase search across projects</li>
        <li>Context-limited AI tools needing efficient retrieval</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Small projects under 1,000 LOC (overhead not worth it)</li>
        <li>Single-file scripts (no graph structure to exploit)</li>
        <li>Teams not using AI coding assistants</li>
        <li>Real-time streaming analysis needs</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>71.5x token reduction vs raw file reading</li>
      <li>Multimodal: code, PDFs, screenshots, whiteboard photos</li>
      <li>Persistent graphs—query weeks later without reprocessing</li>
      <li>Works with Claude Code, Codex, Cursor, Gemini CLI</li>
      <li>Tree-sitter AST parsing for accurate code understanding</li>
      <li>Wikipedia-style article generation (--wiki flag)</li>
      <li>Edge metadata (EXTRACTED vs INFERRED vs AMBIGUOUS)</li>
      <li>MIT licensed, active development (YC S26)</li>
    </ul>
    <div class="source"><a href="https://github.com/safishamsi/graphify" target="_blank">GitHub README</a> · <a href="https://pypi.org/project/graphifyy/" target="_blank">PyPI</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Initial indexing takes time on large codebases</li>
      <li>Requires Python 3.10+</li>
      <li>Graph quality depends on source file quality</li>
      <li>Many optional dependencies for full feature set</li>
      <li>Relatively new project (April 2026)</li>
    </ul>
    <div class="source"><a href="https://github.com/safishamsi/graphify/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/safishamsi/graphify" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT License, full features</div>
  </a>
  <a href="https://pypi.org/project/graphifyy/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">PyPI Install</div>
    <div class="price">pip install</div>
    <div class="desc">graphifyy (note: double 'y')</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Knowledge graph from any folder</li>
      <li>Interactive HTML visualization</li>
      <li>Persistent JSON graph storage</li>
      <li>Deep mode for aggressive extraction</li>
      <li>Watch mode for auto-sync</li>
      <li>Wiki article generation</li>
      <li>Incremental SHA256 caching</li>
      <li>Edge confidence metadata</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Inputs</h4>
    <ul>
      <li>Python, JavaScript, Go, Rust, Java, C++</li>
      <li>SQL schemas, R scripts, Shell scripts</li>
      <li>Markdown, text documentation</li>
      <li>PDFs, images (via Claude vision)</li>
      <li>Screenshots, whiteboard photos</li>
      <li>Videos (with video extra)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>AI Integrations</h4>
    <ul>
      <li>Claude Code</li>
      <li>Codex (OpenAI)</li>
      <li>OpenCode</li>
      <li>Cursor</li>
      <li>Gemini CLI</li>
      <li>Ollama (local)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Output Formats</h4>
    <ul>
      <li>graph.html — Interactive visualization</li>
      <li>graph.json — Persistent data</li>
      <li>GRAPH_REPORT.md — Highlights & questions</li>
      <li>cache/ — Incremental processing</li>
    </ul>
  </div>
</div>

</details>

## Real-World Usage

<div class="info-grid">
  <div class="info-card">
    <h4>Community Stats</h4>
    <ul>
      <li>6,500+ forks</li>
      <li>329 open issues (active development)</li>
      <li>Released April 2026</li>
    </ul>
    <div class="source"><a href="https://github.com/safishamsi/graphify" target="_blank">GitHub, June 2026</a></div>
  </div>
  <div class="info-card">
    <h4>Technical Details</h4>
    <ul>
      <li>Python 3.10+ required</li>
      <li>MIT License</li>
      <li>v0.8.36 current (June 2026)</li>
      <li>20+ optional dependency extras</li>
    </ul>
    <div class="source"><a href="https://pypi.org/project/graphifyy/" target="_blank">PyPI</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Graphify | Neo4j | Memgraph | Vectara |
|---------|----------|-------|----------|---------|
| Primary Use | <span class="highlight">AI coding skills</span> | General graph DB | Real-time graph | Enterprise RAG |
| Token Efficiency | <span class="highlight">71.5x savings</span> | N/A | N/A | Good |
| Multimodal Input | <span class="highlight">Code + images + video</span> | No | No | Documents |
| AI Assistant Integration | <span class="highlight">Claude, Codex, Cursor</span> | Manual | Manual | API |
| Persistent Storage | JSON | Native | Native | Cloud |
| Self-hosted | <span class="highlight">Yes (local)</span> | Yes | Yes | No |
| Price | <span class="highlight">Free (MIT)</span> | Freemium | Freemium | Paid |

</div>
