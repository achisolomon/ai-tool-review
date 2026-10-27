---
name: "Cognee"
slug: "cognee"
website: "https://www.cognee.ai/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "rag-kg"
status: "active"
description: "Open-source AI memory engine that turns documents and app data into a knowledge graph plus vectors for agents"
github_url: "https://github.com/topoteretes/cognee"
github_stars: 32799
pricing_model: "freemium"
headquarters: "Berlin, Germany"
tags:
  - memory
  - rag
  - agents
  - mcp-server
  - self-hosted
  - python
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">32k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">€7.5M</span>
    <span class="label">Round (2026)</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Cognee is an open-source memory layer for AI agents. You feed it documents, conversations, code or data from tools like Slack, Notion, Linear and GitHub, and it extracts entities and relationships into a knowledge graph while also storing embeddings. Agents then query that memory with graph-aware retrieval, which handles multi-hop questions ("which customers mentioned the bug that this PR fixed?") better than plain vector search, and answers can cite their sources.</p>
<p>Cognee is pluggable: it can use Neo4j, Kuzu or FalkorDB for the graph and pgvector, Qdrant, LanceDB and others for vectors, and it ships an MCP server so tools like Claude Code and Cursor can use it as memory. The Berlin company raised a €7.5M round in February 2026 led by Pebblebed and lists Bayer among its production users.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Cognee?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Agents that need persistent memory across sessions</li>
        <li>Multi-hop questions over connected data</li>
        <li>Teams that want graph RAG without building the pipeline</li>
        <li>Regulated teams that need self-hosting</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple FAQ or single-document retrieval</li>
        <li>Teams without time for data modeling or ontologies</li>
        <li>Anyone wanting a finished end-user chat product</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Graph plus vector retrieval beats vector-only RAG on connected questions</li>
      <li>Open-source core you can audit and self-host</li>
      <li>Official MCP server for coding agents</li>
      <li>Model- and storage-agnostic</li>
      <li>Very fast-growing community</li>
    </ul>
    <div class="source"><a href="https://github.com/topoteretes/cognee" target="_blank">GitHub</a> - <a href="https://www.cognee.ai/customers" target="_blank">Customer stories</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Custom ontologies take data modeling effort</li>
      <li>Graph extraction adds LLM cost and processing time</li>
      <li>No polished end-user interface</li>
      <li>Overkill for simple retrieval</li>
    </ul>
    <div class="source"><a href="https://aitoolsatlas.ai/tools/cognee/review" target="_blank">AI Tools Atlas review</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.cognee.ai/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">1M tokens, 1 workspace, unlimited users and API calls</div>
  </a>
  <a href="https://www.cognee.ai/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Standard</div>
    <div class="price">$1<small>/1M tokens</small></div>
    <div class="desc">Plus $5 per extra workspace; data source connectors</div>
  </a>
  <a href="https://www.cognee.ai/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Bi-temporal memory, provenance, BYOC, SLAs</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Knowledge graph extraction from unstructured data</li>
      <li>Hybrid graph and vector retrieval</li>
      <li>Custom ontologies</li>
      <li>Connectors for Slack, Notion, Linear, Google Drive, GitHub</li>
      <li>MCP server</li>
      <li>Permissions and provenance</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>Neo4j, Kuzu, FalkorDB graphs</li>
      <li>pgvector, Qdrant, LanceDB vectors</li>
      <li>LangGraph, LangChain, LlamaIndex, CrewAI</li>
      <li>Claude Code, Cursor via MCP</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Cognee | Graphiti / Zep | Mem0 | Microsoft GraphRAG |
|---------|--------|----------------|------|--------------------|
| Open source | <span class="highlight">Yes</span> | Yes (Graphiti) | Yes | Yes |
| Knowledge graph | <span class="highlight">Yes</span> | Temporal graph | Optional | Yes |
| Managed cloud | Yes | Zep Cloud | Yes | No |
| MCP server | <span class="highlight">Yes</span> | Yes | Yes | No |
| Main focus | Agent memory and graph RAG | Changing facts over time | Personal memory | Global summaries |

</div>
