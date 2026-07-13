---
name: "Microsoft GraphRAG"
slug: "microsoft-graphrag"
website: "https://microsoft.github.io/graphrag/"
type: "open-source"
track: "developers"
category: "vector-dbs"
subcategory: "rag-kg"
status: "active"
description: "A modular graph-based Retrieval-Augmented Generation (RAG) system by Microsoft Research that builds knowledge graphs from private datasets for superior synthesis and holistic reasoning"
github_url: "https://github.com/microsoft/graphrag"
github_stars: 34394
pricing_model: "open-source"
founded_year: 2024
headquarters: "Redmond, WA"
tags:
  - rag
  - python
  - api-available
  - self-hosted
last_verified: "2026-06-15"
confidence_score: 0.95
source_urls:
  - "https://microsoft.github.io/graphrag/"
  - "https://github.com/microsoft/graphrag"
  - "https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">33.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">3.6K</span>
    <span class="label">Forks</span>
  </div>
  <div class="key-stat">
    <span class="number">v3.1</span>
    <span class="label">Latest Release</span>
  </div>
  <div class="key-stat">
    <span class="number">MIT</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Microsoft GraphRAG is a structured, hierarchical approach to Retrieval Augmented Generation (RAG), as opposed to naive semantic-search approaches using plain text snippets. Developed by Microsoft Research, it is a data pipeline and transformation suite designed to extract meaningful, structured data from unstructured text using LLMs — building knowledge graphs with hierarchical community clustering to enable holistic understanding of large private datasets. Unlike baseline RAG, which retrieves isolated text chunks, GraphRAG connects disparate information through shared entities and relationship context, dramatically improving answers to complex synthesis questions. The project is open-source (MIT) but is not an officially supported Microsoft product — users supply their own LLM API (OpenAI, Azure OpenAI) and bear those costs directly.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Microsoft GraphRAG?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams reasoning over large private document corpora (research, legal, business)</li>
        <li>Use cases requiring synthesis across multiple disconnected sources</li>
        <li>Organizations needing holistic summaries, not just point-in-time retrieval</li>
        <li>ML engineers who can manage indexing infrastructure and LLM API costs</li>
        <li>Projects where answer quality justifies higher upfront indexing spend</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Budget-constrained projects — indexing can be very expensive</li>
        <li>Simple keyword or semantic similarity search (overkill)</li>
        <li>Real-time, low-latency retrieval (requires offline preprocessing)</li>
        <li>Teams wanting a fully managed SaaS solution</li>
        <li>Beginners: requires Python expertise and infrastructure setup</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Consistently outperforms baseline RAG on complex synthesis questions</li>
      <li>Three search modes (Global, Local, DRIFT) cover different query types</li>
      <li>Community-based summarization enables holistic reasoning over large corpora</li>
      <li>Modular pipeline — swap LLM backends (OpenAI, Azure, local models)</li>
      <li>Active Microsoft Research backing with a research paper and blog</li>
      <li>MIT licensed — fully open for commercial use</li>
      <li>Strong GitHub community with an active issue tracker</li>
    </ul>
    <div class="source"><a href="https://microsoft.github.io/graphrag/" target="_blank">Official Docs</a> · <a href="https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/" target="_blank">MS Research Blog</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Indexing is expensive — Microsoft explicitly warns to "start small" and review costs</li>
      <li>Not an officially supported Microsoft product (research project)</li>
      <li>Requires LLM API access (OpenAI/Azure) for indexing — adds per-token cost</li>
      <li>Offline-only indexing step means no real-time document ingestion</li>
      <li>Complex setup compared to turnkey RAG solutions</li>
      <li>Config format can change between minor versions</li>
    </ul>
    <div class="source"><a href="https://github.com/microsoft/graphrag" target="_blank">GitHub README</a> · <a href="https://microsoft.github.io/graphrag/" target="_blank">Official Docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/microsoft/graphrag" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT licensed. Self-host on your infrastructure. LLM API costs (OpenAI/Azure) are separate and can be significant.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Search Modes</h4>
    <ul>
      <li><strong>Global Search</strong> — Holistic reasoning over entire corpus via community summaries; best for synthesis questions</li>
      <li><strong>Local Search</strong> — Entity-focused retrieval fanning out to neighbors and related concepts</li>
      <li><strong>DRIFT Search</strong> — Local search enriched with community context for deeper entity reasoning</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Indexing Pipeline</h4>
    <ul>
      <li>LLM-powered entity and relationship extraction</li>
      <li>Knowledge graph construction from raw text</li>
      <li>Hierarchical community detection (Leiden algorithm)</li>
      <li>Community summary generation at multiple granularities</li>
      <li>Configurable chunking and data preparation</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI and Azure OpenAI (primary LLM backends)</li>
      <li>LangChain and LlamaIndex compatible</li>
      <li>CLI and Python API access</li>
      <li>Prompt tuning (auto and manual)</li>
      <li>Configurable embedding models</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment</h4>
    <ul>
      <li>Self-hosted on any infrastructure</li>
      <li>Python package (pip install graphrag)</li>
      <li>CLI for indexing and querying</li>
      <li>Compatible with local LLMs via Ollama (community)</li>
      <li>Azure-native deployment supported</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Microsoft GraphRAG | Baseline RAG | Graphiti | Neo4j GraphRAG |
|---------|-------------------|--------------|----------|----------------|
| Knowledge Graph | <span class="highlight">Auto-built from text</span> | None | Auto-built | Manual modeling |
| Synthesis Questions | <span class="highlight">Excellent</span> | Poor | Good | Good |
| Search Modes | <span class="highlight">Global / Local / DRIFT</span> | Semantic only | Graph traversal | Cypher + Vector |
| Indexing Cost | High (LLM calls) | Low | Medium | Low |
| Real-time Ingestion | No | Yes | Yes | Yes |
| Open Source | <span class="highlight">MIT</span> | N/A | Apache 2.0 | GPL3 |
| Managed Option | No | Varies | No | Yes (AuraDB) |
| Best For | Private corpus synthesis | Simple lookup | Agents/memory | Relationship apps |

</div>
