---
name: "Cloudflare Vectorize"
slug: "cloudflare-vectorize"
website: "https://developers.cloudflare.com/vectorize/"
type: "commercial"
track: "developers"
category: "vector-dbs"
subcategory: "extensions"
status: "active"
description: "Cloudflare's serverless vector database for Workers, billed only on queried and stored vector dimensions"
pricing_model: "freemium"
founded_year: 2023
headquarters: "San Francisco, CA"
tags:
  - serverless
  - rag
last_verified: "2026-10-17"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">20M</span>
    <span class="label">Vectors per Index</span>
  </div>
  <div class="key-stat">
    <span class="number">1,536</span>
    <span class="label">Max Dimensions</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">Tier Included</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Vectorize is Cloudflare's managed vector database, designed to be called from Cloudflare Workers. You store embeddings (often generated with Workers AI), query them for nearest neighbors, and filter on metadata, all without running a server. It is the retrieval layer most Cloudflare-native RAG and semantic search apps use, and it pairs with R2, D1 and KV for the rest of the data.</p>
<p>The pricing model is unusual: you are not billed for CPU, memory, active hours or the number of indexes, only for the vector dimensions you query and store. Each index holds up to 20 million vectors of up to 1,536 dimensions, and returns up to 50 results with metadata per query.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Vectorize?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Apps already built on Cloudflare Workers</li>
        <li>Serverless RAG and semantic search with spiky traffic</li>
        <li>Many small indexes or per-tenant namespaces</li>
        <li>Cost-sensitive projects that don't want idle charges</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Embeddings larger than 1,536 dimensions</li>
        <li>Indexes beyond 20 million vectors</li>
        <li>Advanced hybrid keyword plus vector ranking</li>
        <li>Multi-cloud or self-hosted requirements</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>No charges for idle indexes, CPU or memory</li>
      <li>Generous free tier on the Workers Free plan</li>
      <li>Tight integration with Workers AI, R2, D1 and KV</li>
      <li>Namespaces and metadata filtering for multi-tenant apps</li>
      <li>Fully managed, nothing to operate</li>
    </ul>
    <div class="source"><a href="https://developers.cloudflare.com/vectorize/platform/pricing/" target="_blank">Official pricing</a> - <a href="https://blog.cloudflare.com/vectorize-vector-database-open-beta/" target="_blank">Cloudflare blog</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Hard limits: 1,536 dimensions, 20M vectors per index, topK of 50 with metadata</li>
      <li>Only 10 metadata indexes per Vectorize index</li>
      <li>Tied to the Cloudflare platform</li>
      <li>Fewer search features than dedicated vector databases</li>
    </ul>
    <div class="source"><a href="https://developers.cloudflare.com/vectorize/platform/limits/" target="_blank">Official limits</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://developers.cloudflare.com/vectorize/platform/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Workers Free</div>
    <div class="price">$0</div>
    <div class="desc">30M queried and 5M stored vector dimensions per month</div>
  </a>
  <a href="https://developers.cloudflare.com/vectorize/platform/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Workers Paid</div>
    <div class="price">$0.01<small>/1M queried dims</small></div>
    <div class="desc">First 50M queried and 10M stored included; storage $0.05 per 100M dimensions</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Approximate nearest neighbor search</li>
      <li>Cosine, Euclidean and dot-product metrics</li>
      <li>Metadata filtering (up to 10 metadata indexes)</li>
      <li>Namespaces for multi-tenancy</li>
      <li>Workers binding and HTTP API</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Limits</h4>
    <ul>
      <li>1,536 dimensions max, 32-bit precision</li>
      <li>20,000,000 vectors per index</li>
      <li>10 KiB metadata per vector</li>
      <li>50,000 indexes per account (Paid), 100 (Free)</li>
      <li>topK 50 with values or metadata, 100 without</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Vectorize | Pinecone Serverless | pgvector | turbopuffer |
|---------|-----------|---------------------|----------|-------------|
| Hosting | Cloudflare only | Managed | <span class="highlight">Anywhere Postgres runs</span> | Managed |
| Idle cost | <span class="highlight">None</span> | Storage | Server cost | $64/mo minimum |
| Free tier | <span class="highlight">Yes</span> | Yes | Open source | No |
| Max dimensions | 1,536 | 20,000 | 16,000 (HNSW 2,000) | High |
| Full-text hybrid | No | Sparse vectors | Via Postgres FTS | <span class="highlight">Yes</span> |

</div>
