---
name: "LanceDB"
slug: "lancedb"
website: "https://lancedb.com/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "dedicated"
status: "active"
description: "Open-source multimodal database on the Lance columnar format for vector, full-text and SQL search plus AI training data"
github_url: "https://github.com/lancedb/lancedb"
github_stars: 11740
pricing_model: "freemium"
founded_year: 2022
headquarters: "San Francisco, CA"
tags:
  - multimodal
  - rag
  - self-hosted
  - serverless
  - yc
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">11k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">$30M</span>
    <span class="label">Series A (2025)</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>LanceDB is an open-source database built on Lance, a columnar file format designed for AI data such as embeddings, images, video and text. It can run embedded inside your application (like SQLite, with no server) or as a managed service, and it stores data directly on local disk or object storage like S3. A single table supports vector search, full-text search, hybrid search and SQL filtering, and the same data can be used to curate and load training datasets.</p>
<p>That training-data angle is what sets it apart: LanceDB pitches itself as a multimodal lakehouse rather than just a vector database. It raised a $30M Series A in June 2025 led by Theory Ventures, and lists Netflix, Runway, Midjourney and Character.AI among its users.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use LanceDB?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Multimodal data (images, video, audio, text) at scale</li>
        <li>Embedded vector search in local or edge apps</li>
        <li>Teams that want storage on S3 rather than in RAM</li>
        <li>ML teams sharing data between search and training</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams that want a classic client-server database only</li>
        <li>Workloads needing the most mature managed service</li>
        <li>Simple prototypes where pgvector is already available</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Embedded mode: vector search with no server to run</li>
      <li>Object-storage architecture keeps costs low at scale</li>
      <li>Vector, full-text and SQL filtering on one table</li>
      <li>Handles very large multimodal datasets</li>
      <li>Netflix reported large latency gains after migrating</li>
    </ul>
    <div class="source"><a href="https://lancedb.com/" target="_blank">Official site</a> - <a href="https://www.lancedb.com/blog/series-a-funding" target="_blank">Series A announcement</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Smaller ecosystem than Pinecone or Milvus</li>
      <li>Lakehouse model has a learning curve</li>
      <li>Managed and enterprise pricing is not fully public</li>
      <li>Embedded mode needs care with concurrent writers</li>
    </ul>
    <div class="source"><a href="https://github.com/lancedb/lancedb" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/lancedb/lancedb" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Embedded library, Apache 2.0</div>
  </a>
  <a href="https://lancedb.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">LanceDB Cloud</div>
    <div class="price">Usage-based</div>
    <div class="desc">Serverless managed service</div>
  </a>
  <a href="https://lancedb.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Bring your own cloud, dedicated support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Lance columnar format with fast random access</li>
      <li>Vector, full-text and hybrid search</li>
      <li>SQL filtering and versioned tables</li>
      <li>Embedded or server deployment</li>
      <li>Storage on local disk, S3, GCS or Azure</li>
      <li>Training data loading and curation</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>Python, TypeScript and Rust SDKs</li>
      <li>LangChain, LlamaIndex</li>
      <li>Pandas, Polars, Arrow, DuckDB</li>
      <li>Ray and Spark</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | LanceDB | Chroma | Milvus | turbopuffer |
|---------|---------|--------|--------|-------------|
| Embedded mode | <span class="highlight">Yes</span> | Yes | Milvus Lite | No |
| Object storage native | <span class="highlight">Yes</span> | Cloud only | Partial | <span class="highlight">Yes</span> |
| Multimodal and training data | <span class="highlight">Core focus</span> | No | No | No |
| Open source | Yes | Yes | Yes | No |
| Full-text search | Yes | Yes | Yes | Yes |

</div>
