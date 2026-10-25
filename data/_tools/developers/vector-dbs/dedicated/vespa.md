---
name: "Vespa"
slug: "vespa"
website: "https://vespa.ai/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "dedicated"
status: "active"
description: "Open-source AI search engine from Yahoo combining vector, text and structured search with machine-learned ranking at scale"
github_url: "https://github.com/vespa-engine/vespa"
github_stars: 7145
pricing_model: "freemium"
founded_year: 2023
headquarters: "Trondheim, Norway"
tags:
  - rag
  - self-hosted
  - real-time
  - multimodal
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">7k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">$31M</span>
    <span class="label">Funding (2023)</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Vespa is a search and serving engine that combines vector search, full-text search and structured filtering with machine-learned ranking, all evaluated close to the data. Rather than only returning nearest neighbors, Vespa lets you write ranking functions and run ML models (including ONNX models and multi-vector approaches like ColBERT) on every candidate, which is why it powers large search, recommendation and RAG systems. It handles real-time updates and scales to billions of documents.</p>
<p>Vespa was built at Yahoo, where it serves many applications, and was spun out as an independent company, Vespa.ai, in 2023 with $31M from Blossom Capital. Users include Spotify, Perplexity, Farfetch, Vinted and Elicit. It is Apache 2.0 open source, with a managed Vespa Cloud.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Vespa?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Search and recommendation systems with custom ranking</li>
        <li>Large-scale RAG that mixes keywords, vectors and filters</li>
        <li>Real-time updates on billions of documents</li>
        <li>Teams with search and ML engineering expertise</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple vector lookup for a prototype</li>
        <li>Small teams that want minimal configuration</li>
        <li>Projects needing a quick MVP</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Most flexible ranking of any vector search engine</li>
      <li>Hybrid vector, text and structured search in one query</li>
      <li>Proven at Yahoo and Spotify scale</li>
      <li>Real-time writes with low query latency</li>
      <li>Open source with a managed cloud option</li>
    </ul>
    <div class="source"><a href="https://vespa.ai/" target="_blank">Official site</a> - <a href="https://infrabase.ai/vector-databases/vespa" target="_blank">Infrabase</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Steep learning curve: schemas, ranking profiles and deployment packages</li>
      <li>More operational overhead than focused vector databases</li>
      <li>Smaller community than Elasticsearch or Milvus</li>
      <li>Enterprise pricing requires a sales conversation</li>
    </ul>
    <div class="source"><a href="https://infrabase.ai/vector-databases/vespa" target="_blank">Infrabase</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/vespa-engine/vespa" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, Apache 2.0</div>
  </a>
  <a href="https://vespa.ai/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Vespa Cloud</div>
    <div class="price">Usage-based</div>
    <div class="desc">Free trial credits, pay for resources used</div>
  </a>
  <a href="https://vespa.ai/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Support and enterprise deployment</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>HNSW vector search with filtering</li>
      <li>BM25 and linguistic text search</li>
      <li>Custom multi-phase ranking with ML models</li>
      <li>Multi-vector and ColBERT-style retrieval</li>
      <li>Real-time updates</li>
      <li>Grouping and aggregation</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Large-scale RAG</li>
      <li>Ecommerce search and recommendations</li>
      <li>Personalized content feeds</li>
      <li>Question answering over large corpora</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Vespa | Elasticsearch | Milvus | Weaviate |
|---------|-------|---------------|--------|----------|
| Open source | <span class="highlight">Apache 2.0</span> | AGPL option | Apache 2.0 | BSD-3 |
| Custom ML ranking | <span class="highlight">Built in</span> | Learning to Rank | Limited | Limited |
| Hybrid search | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> | Yes | Yes |
| Real-time updates | <span class="highlight">Yes</span> | Near real-time | Yes | Yes |
| Ease of setup | Hard | Moderate | Moderate | <span class="highlight">Easier</span> |

</div>
