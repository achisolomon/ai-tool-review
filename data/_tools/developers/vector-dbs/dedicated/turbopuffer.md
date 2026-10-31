---
name: "turbopuffer"
slug: "turbopuffer"
website: "https://turbopuffer.com/"
type: "commercial"
track: "developers"
category: "vector-dbs"
subcategory: "dedicated"
status: "active"
description: "Serverless vector and full-text search database built on object storage, used by Anthropic, Cursor, Notion and Linear"
pricing_model: "paid"
founded_year: 2023
tags:
  - rag
  - serverless
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">1T+</span>
    <span class="label">Documents in Production</span>
  </div>
  <div class="key-stat">
    <span class="number">$64/mo</span>
    <span class="label">Minimum Spend</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>turbopuffer is a search database for vectors and full text that stores everything on object storage (like S3) and caches hot data on SSD and in memory. That design makes storage far cheaper than databases that keep every index in RAM, which matters when you have huge numbers of documents or many separate namespaces, for example one per customer. Queries against warm namespaces are fast; namespaces that haven't been touched recently are slower on first access while they load into cache.</p>
<p>Founded in 2023 by Simon Eskildsen and Justin Li, both formerly at Shopify, turbopuffer reports more than a trillion documents in production and counts Anthropic, Cursor, Notion, Linear, Atlassian and Ramp among its customers. It supports vector search, BM25 full-text search, hybrid queries and metadata filtering.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use turbopuffer?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Very large corpora where RAM-based storage is too expensive</li>
        <li>Multi-tenant apps with many namespaces</li>
        <li>Code search and document search at scale</li>
        <li>Hybrid vector plus keyword search</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Prototypes and hobby projects (no free tier)</li>
        <li>Workloads needing consistently low latency on cold data</li>
        <li>Teams that need self-hosting outside enterprise plans</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Much cheaper storage thanks to object-storage architecture</li>
      <li>Scales to enormous document counts and many namespaces</li>
      <li>Vector and full-text search in one query</li>
      <li>Trusted by demanding AI companies like Anthropic and Cursor</li>
      <li>HIPAA BAA available on the Scale tier</li>
    </ul>
    <div class="source"><a href="https://turbopuffer.com/" target="_blank">Official site</a> - <a href="https://www.modern-datatools.com/tools/turbopuffer" target="_blank">Modern Data Tools</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Cold queries on uncached namespaces can take hundreds of milliseconds to seconds</li>
      <li>No free tier; $64/month minimum</li>
      <li>Writes are indexed asynchronously</li>
      <li>No built-in embedding or reranking models</li>
    </ul>
    <div class="source"><a href="https://particula.tech/blog/turbopuffer-vs-pinecone-vector-database-migration/" target="_blank">turbopuffer vs Pinecone analysis</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://turbopuffer.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Launch</div>
    <div class="price">$64<small>/mo min</small></div>
    <div class="desc">Usage-based storage, writes and queries</div>
  </a>
  <a href="https://turbopuffer.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Scale</div>
    <div class="price">$256<small>/mo min</small></div>
    <div class="desc">Adds HIPAA BAA, SSO and audit logs</div>
  </a>
  <a href="https://turbopuffer.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">$4,096<small>/mo min</small></div>
    <div class="desc">Single tenancy, BYOC, CMEK, private networking</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Vector search (ANN) with high recall</li>
      <li>BM25 full-text search</li>
      <li>Hybrid queries and metadata filtering</li>
      <li>Namespaces for multi-tenancy</li>
      <li>Object storage with SSD and memory caching</li>
      <li>Automatic scaling</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Code search for AI coding tools</li>
      <li>Per-customer document search in SaaS</li>
      <li>RAG over very large corpora</li>
      <li>Search over long-tail archives</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | turbopuffer | Pinecone | LanceDB | Milvus |
|---------|-------------|----------|---------|--------|
| Storage | <span class="highlight">Object storage</span> | Managed | <span class="highlight">Object storage</span> | Mixed |
| Free tier | No | Yes | Open source | Open source |
| Full-text hybrid | <span class="highlight">Yes</span> | Sparse vectors | Yes | Yes |
| Self-hosting | Enterprise BYOC | No | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> |
| Cold query latency | Higher | Low | Varies | Low |

</div>
