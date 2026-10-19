---
name: "MongoDB Atlas Vector Search"
slug: "mongodb-atlas-vector"
website: "https://www.mongodb.com/products/platform/atlas-vector-search"
type: "commercial"
track: "developers"
category: "vector-dbs"
subcategory: "extensions"
status: "active"
description: "Vector search built into MongoDB Atlas, storing embeddings next to your documents with hybrid search and Voyage AI reranking"
pricing_model: "freemium"
founded_year: 2023
headquarters: "New York, NY"
tags:
  - rag
  - api-available
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">M0 Cluster</span>
  </div>
  <div class="key-stat">
    <span class="number">Voyage AI</span>
    <span class="label">Embeddings and Reranking</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Generally Available</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Atlas Vector Search adds vector similarity search to MongoDB Atlas, so embeddings live in the same documents as the rest of your application data. A $vectorSearch stage in the aggregation pipeline runs approximate (HNSW) or exact nearest-neighbor queries with pre-filters on any field, and results can flow straight into the rest of the pipeline. Hybrid search combines vector results with Atlas Search full-text relevance.</p>
<p>MongoDB acquired the embedding company Voyage AI in 2025 and has been building its models into Atlas for embedding generation and reranking. Vector Search became generally available in December 2023 and is available on every Atlas tier, including the free M0 cluster, with dedicated Search Nodes for isolating heavy vector workloads.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Atlas Vector Search?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Applications already on MongoDB</li>
        <li>RAG over operational data that changes often</li>
        <li>Queries that combine vectors with document filters</li>
        <li>Teams that want one database instead of two</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams not using MongoDB</li>
        <li>Pure vector workloads at very large scale on a budget</li>
        <li>Self-hosted deployments without Atlas (feature parity varies)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>No separate vector database to sync or operate</li>
      <li>Rich pre-filtering on any document field</li>
      <li>Hybrid search with full-text built in</li>
      <li>Voyage AI embeddings and reranking from the same vendor</li>
      <li>Works with LangChain, LlamaIndex, Semantic Kernel and Haystack</li>
    </ul>
    <div class="source"><a href="https://www.mongodb.com/products/platform/atlas-vector-search" target="_blank">Official product page</a> - <a href="https://www.mongodb.com/solutions/customer-case-studies" target="_blank">Case studies</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Costs grow quickly for vector-heavy workloads on dedicated tiers</li>
      <li>Data must live in MongoDB to be searched</li>
      <li>Search Nodes add a separate line item</li>
      <li>Lock-in to the Atlas platform</li>
    </ul>
    <div class="source"><a href="https://www.mongodb.com/pricing" target="_blank">Official pricing</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.mongodb.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free (M0)</div>
    <div class="price">$0</div>
    <div class="desc">512 MB storage, Vector Search included</div>
  </a>
  <a href="https://www.mongodb.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Flex</div>
    <div class="price">$8-$30<small>/mo</small></div>
    <div class="desc">Usage-capped clusters for development and small apps</div>
  </a>
  <a href="https://www.mongodb.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Dedicated</div>
    <div class="price">From ~$57<small>/mo</small></div>
    <div class="desc">M10 and up, optional dedicated Search Nodes</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>$vectorSearch aggregation stage</li>
      <li>HNSW approximate and exact nearest neighbor</li>
      <li>Pre-filtering on document fields</li>
      <li>Scalar and binary quantization</li>
      <li>Hybrid search with Atlas Search</li>
      <li>Dedicated Search Nodes</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>LangChain, LlamaIndex, Haystack</li>
      <li>Microsoft Semantic Kernel, Spring AI</li>
      <li>Voyage AI, OpenAI and other embedding models</li>
      <li>AWS, Azure and Google Cloud</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Atlas Vector Search | pgvector | Elasticsearch | Pinecone |
|---------|---------------------|----------|---------------|----------|
| Data model | <span class="highlight">Documents plus vectors</span> | Relational plus vectors | Search index | Vectors only |
| Free tier | Yes (M0) | <span class="highlight">Open source</span> | Self-managed | Yes |
| Hybrid full-text | Yes | Via Postgres FTS | <span class="highlight">Best-in-class</span> | Sparse vectors |
| Built-in embeddings | <span class="highlight">Voyage AI</span> | No | ELSER and inference API | Integrated inference |
| Self-hosted | Limited | <span class="highlight">Yes</span> | Yes | No |

</div>
