---
name: "Graphiti"
slug: "graphiti"
website: "https://github.com/getzep/graphiti"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "rag-kg"
status: "active"
description: "Open-source temporal knowledge graph framework from Zep that tracks how facts change over time for agent memory"
github_url: "https://github.com/getzep/graphiti"
github_stars: 31824
pricing_model: "free"
founded_year: 2024
headquarters: "San Francisco, CA"
tags:
  - memory
  - rag
  - agents
  - mcp-server
  - python
  - yc
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">31k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
  <div class="key-stat">
    <span class="number">2024</span>
    <span class="label">Open Sourced</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Graphiti is an open-source framework for building knowledge graphs that change over time. Most graph RAG systems treat facts as static; Graphiti records when each fact became true and when it stopped being true, so when a user says "I moved to Berlin," the old city is marked invalid rather than deleted. Every fact keeps a link to the episode (message, document or event) it came from. The graph updates incrementally as new data arrives, with no full rebuild.</p>
<p>Retrieval combines embeddings, BM25 keyword search and graph traversal. Graphiti runs on Neo4j, FalkorDB, Kuzu or Amazon Neptune and includes an MCP server. It is built by Zep, a Y Combinator company, and is the engine behind Zep's managed context and memory service.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Graphiti?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Agent memory where user facts and preferences change</li>
        <li>Domains that need history and provenance (support, CRM, compliance)</li>
        <li>Incremental updates from streaming conversations</li>
        <li>Teams that want open source with a managed option (Zep)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Static document lookup where a vector DB is enough</li>
        <li>Teams unwilling to run a graph database</li>
        <li>Very cost-sensitive ingestion (LLM extraction on every episode)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Temporal facts: knows what was true when</li>
      <li>Provenance back to the source episode</li>
      <li>Hybrid semantic, keyword and graph retrieval</li>
      <li>Choice of graph backends</li>
      <li>Large, fast-growing open-source community</li>
    </ul>
    <div class="source"><a href="https://github.com/getzep/graphiti" target="_blank">GitHub</a> - <a href="https://www.getzep.com/blog/graphiti-knowledge-graphs-for-agents/" target="_blank">Zep blog</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires running and tuning a graph database</li>
      <li>LLM-based extraction adds cost and latency to ingestion</li>
      <li>Enterprise features (SLAs, support) come via paid Zep Cloud</li>
      <li>More moving parts than a vector-only memory</li>
    </ul>
    <div class="source"><a href="https://vectorize.io/articles/zep-vs-cognee" target="_blank">Zep vs Cognee comparison</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/getzep/graphiti" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Graphiti (open source)</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, Apache 2.0; you pay for your graph DB and LLM calls</div>
  </a>
  <a href="https://www.getzep.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Zep Cloud</div>
    <div class="price">Free tier</div>
    <div class="desc">Managed memory built on Graphiti; paid plans by usage</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Bi-temporal fact validity windows</li>
      <li>Episodes with provenance</li>
      <li>Incremental graph construction</li>
      <li>Hybrid retrieval: embeddings, BM25, graph</li>
      <li>Custom entity types and ontologies</li>
      <li>MCP server and REST service</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Backends and Integrations</h4>
    <ul>
      <li>Neo4j, FalkorDB, Kuzu, Amazon Neptune</li>
      <li>OpenAI, Anthropic, Gemini and other LLMs</li>
      <li>LangGraph and LangChain</li>
      <li>Claude and Cursor via MCP</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Graphiti | Cognee | Mem0 | Microsoft GraphRAG |
|---------|----------|--------|------|--------------------|
| Temporal facts | <span class="highlight">Yes</span> | Enterprise tier | No | No |
| Incremental updates | <span class="highlight">Yes</span> | Yes | Yes | Batch rebuild |
| Open source | Apache 2.0 | Apache 2.0 | Apache 2.0 | MIT |
| Managed option | Zep Cloud | Cognee Cloud | Mem0 Platform | No |
| MCP server | Yes | Yes | Yes | No |

</div>
