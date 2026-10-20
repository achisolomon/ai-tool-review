---
name: "pgvector"
slug: "pgvector"
website: "https://github.com/pgvector/pgvector"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "extensions"
status: "active"
description: "Open-source Postgres extension for vector similarity search with HNSW and IVFFlat indexes, joins and ACID guarantees"
github_url: "https://github.com/pgvector/pgvector"
github_stars: 23419
pricing_model: "free"
founded_year: 2021
tags:
  - rag
  - self-hosted
last_verified: "2026-10-17"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">23k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">Open Source</span>
  </div>
  <div class="key-stat">
    <span class="number">Postgres 13+</span>
    <span class="label">Compatibility</span>
  </div>
</div>

## Overview

<div class="overview">
<p>pgvector is a Postgres extension that adds a vector column type and similarity search to the database many teams already run. You store embeddings next to your relational data, query nearest neighbors with plain SQL, and join, filter and transact on them like any other column. It supports exact search and two approximate indexes (HNSW and IVFFlat), several vector types (full precision, half precision, binary and sparse) and distance functions including L2, cosine, inner product, L1, Hamming and Jaccard.</p>
<p>Created by Andrew Kane, pgvector is the default way to do vector search in Postgres and ships on nearly every managed Postgres service, including Supabase, Neon, AWS RDS and Aurora, Google Cloud SQL and Azure. It inherits everything Postgres offers: ACID transactions, point-in-time recovery, replication and mature tooling.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use pgvector?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams already running Postgres</li>
        <li>RAG over data that lives in relational tables</li>
        <li>Queries that join vectors with business data and permissions</li>
        <li>Up to tens of millions of vectors on one well-sized instance</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Billions of vectors (needs sharding or a dedicated system)</li>
        <li>Teams with no Postgres tuning experience</li>
        <li>Very high-dimensional embeddings in HNSW without reduction</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>No new infrastructure if you already use Postgres</li>
      <li>Full SQL: joins, filters, transactions and row-level security</li>
      <li>Available on almost every managed Postgres provider</li>
      <li>HNSW indexes give good recall and speed</li>
      <li>Free and open source</li>
    </ul>
    <div class="source"><a href="https://github.com/pgvector/pgvector" target="_blank">GitHub README</a> - <a href="https://www.instaclustr.com/education/vector-database/pgvector-key-features-tutorial-and-pros-and-cons-2026-guide/" target="_blank">Instaclustr guide</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Performance needs care beyond roughly 10M vectors</li>
      <li>HNSW index builds are memory-hungry and slow on big tables</li>
      <li>Filtered queries can lose recall without tuning</li>
      <li>Index dimension limits (2,000 for full-precision HNSW)</li>
    </ul>
    <div class="source"><a href="https://www.instaclustr.com/education/vector-database/pgvector-key-features-tutorial-and-pros-and-cons-2026-guide/" target="_blank">Instaclustr guide</a> - <a href="https://github.com/pgvector/pgvector#hnsw" target="_blank">pgvector docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/pgvector/pgvector" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">PostgreSQL License; you pay only for your Postgres hosting</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>vector, halfvec, bit and sparsevec types</li>
      <li>HNSW and IVFFlat indexes</li>
      <li>Exact and approximate nearest neighbor search</li>
      <li>L2, cosine, inner product, L1, Hamming and Jaccard distances</li>
      <li>Iterative index scans for filtered queries</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Where It Runs</h4>
    <ul>
      <li>Self-hosted Postgres 13+</li>
      <li>Supabase, Neon, AWS RDS and Aurora</li>
      <li>Google Cloud SQL and AlloyDB, Azure</li>
      <li>LangChain and LlamaIndex vector stores</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | pgvector | Supabase Vector | Pinecone | Milvus |
|---------|----------|-----------------|----------|--------|
| Open source | <span class="highlight">Yes</span> | Yes (pgvector) | No | <span class="highlight">Yes</span> |
| SQL joins with app data | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> | No | No |
| Managed option | Any Postgres host | Yes | <span class="highlight">Fully managed</span> | Zilliz Cloud |
| Practical scale | Tens of millions | Tens of millions | Billions | <span class="highlight">Billions</span> |
| Extra cost | <span class="highlight">None</span> | Plan-based | Usage-based | Free or usage-based |

</div>
