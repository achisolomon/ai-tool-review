---
name: "GBrain"
slug: "gbrain"
website: "https://github.com/garrytan/gbrain"
type: "open-source"
track: "developers"
category: "agent-frameworks"
subcategory: "agent-memory"
status: "active"
description: "The brain layer your AI agent has been missing - synthesis, graph traversal, and gap analysis for intelligent agents"
github_url: "https://github.com/garrytan/gbrain"
github_stars: 28026
pricing_model: "free"
tags:
  - agents
  - typescript
last_verified: "2026-06-03"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">20.8K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">43</span>
    <span class="label">Curated Skills</span>
  </div>
  <div class="key-stat">
    <span class="number">MIT</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>GBrain is an opinionated agent brain layer that goes beyond simple RAG to provide synthesis, self-wiring knowledge graphs, and gap analysis. Unlike traditional search that returns raw pages, GBrain generates well-cited prose answers while explicitly identifying what the brain doesn't yet know. It operates as a daemon that ingests meetings, emails, tweets, voice calls, and ideas, automatically linking entities and enriching data. Built with TypeScript/Bun and supporting both local (PGLite) and Postgres deployments, it's designed for developers who want their agents to truly understand and reason over accumulated knowledge.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use GBrain?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers building personal knowledge agents</li>
        <li>Teams wanting synthesis, not just retrieval</li>
        <li>Local-first, privacy-conscious deployments</li>
        <li>MCP-compatible agent architectures</li>
        <li>Projects needing automatic entity linking</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple chatbot memory needs</li>
        <li>Teams wanting managed cloud service</li>
        <li>Non-TypeScript/Bun environments</li>
        <li>Projects needing minimal setup</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Synthesis layer generates cited answers, not just chunks</li>
      <li>Self-wiring knowledge graph with typed edges</li>
      <li>Gap analysis identifies what the brain doesn't know</li>
      <li>Hybrid search: vector + BM25 + graph signals</li>
      <li>43 curated skills for signal capture and enrichment</li>
      <li>Local-first with PGLite (WASM-based Postgres)</li>
      <li>MCP support with stdio and HTTP modes</li>
      <li>16 embedding provider options including local</li>
    </ul>
    <div class="source"><a href="https://github.com/garrytan/gbrain" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Opinionated architecture may not fit all use cases</li>
      <li>Requires TypeScript/Bun ecosystem familiarity</li>
      <li>No managed cloud option (self-hosted only)</li>
      <li>Steeper learning curve than simpler memory solutions</li>
      <li>Third-party API costs for embedding/LLM providers</li>
    </ul>
    <div class="source"><a href="https://github.com/garrytan/gbrain" target="_blank">GitHub README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/garrytan/gbrain" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT License, self-hosted, bring your own API keys</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Hybrid search (vector + BM25 + graph)</li>
      <li>Self-wiring knowledge graph</li>
      <li>Typed edges (attended, works_at, invested_in, founded, advises)</li>
      <li>Synthesis with citations</li>
      <li>Gap analysis</li>
      <li>43 curated skills</li>
      <li>Schema packs (15-type taxonomy)</li>
      <li>Job queue with Postgres-native architecture</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Tech Stack</h4>
    <ul>
      <li>TypeScript/Bun runtime</li>
      <li>PGLite (local WASM) or Postgres</li>
      <li>pgvector for embeddings</li>
      <li>MCP (stdio + HTTP + OAuth 2.1)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Embedding Providers</h4>
    <ul>
      <li>OpenAI</li>
      <li>Voyage</li>
      <li>ZeroEntropy</li>
      <li>Ollama (local)</li>
      <li>llama-server (local)</li>
      <li>16 options total</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Personal knowledge assistant</li>
      <li>Meeting/email synthesis</li>
      <li>Research agent brain</li>
      <li>Entity relationship tracking</li>
      <li>Multi-brain federation</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | GBrain | Mem0 | MemClaw |
|---------|--------|------|---------|
| GitHub Stars | 20.8K | <span class="highlight">57K+</span> | N/A (Commercial) |
| Architecture | Self-wiring graph + synthesis | Multi-level memory | Enterprise shared memory |
| Gap Analysis | <span class="highlight">Yes, built-in</span> | No | No |
| Synthesis | <span class="highlight">Cited prose answers</span> | Memory retrieval | Memory retrieval |
| Managed Cloud | No | Yes | Yes |
| Open Source | <span class="highlight">MIT</span> | Apache 2.0 | No |
| Best For | Personal/team knowledge synthesis | Personalized AI assistants | Enterprise multi-agent fleets |

</div>
