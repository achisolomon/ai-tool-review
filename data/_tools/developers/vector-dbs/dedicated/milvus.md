---
name: "Milvus"
slug: "milvus"
website: "https://milvus.io/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "dedicated"
status: "active"
description: "Open-source distributed vector database for billion-scale search, from embedded Milvus Lite to Zilliz Cloud"
github_url: "https://github.com/milvus-io/milvus"
github_stars: 46458
pricing_model: "freemium"
founded_year: 2019
headquarters: "Redwood City, CA"
tags:
  - rag
  - self-hosted
  - multimodal
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">46k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">Billions</span>
    <span class="label">Vectors at Scale</span>
  </div>
  <div class="key-stat">
    <span class="number">2019</span>
    <span class="label">Open Sourced</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Milvus is one of the most widely adopted open-source vector databases, built for very large scale. Its distributed architecture separates storage and compute so each layer scales on its own, and it supports a wide range of index types (HNSW, IVF variants, DiskANN for indexes larger than memory, and GPU indexes) along with metadata filtering, hybrid dense plus sparse search, full-text search and multi-vector queries.</p>
<p>Milvus was created by Zilliz, open-sourced in 2019, and is a graduated project of the LF AI &amp; Data Foundation. It comes in several shapes: Milvus Lite (a Python library), Standalone (single node), Distributed (Kubernetes) and Zilliz Cloud, the fully managed service from its creators. Companies including Salesforce, Walmart, eBay and NVIDIA are listed as users.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Milvus?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Hundreds of millions to billions of vectors</li>
        <li>Teams that want open source with no lock-in</li>
        <li>On-premises or bring-your-own-cloud requirements</li>
        <li>Teams with Kubernetes and platform experience</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Small projects that don't want to operate a cluster</li>
        <li>Teams without infrastructure experience (use Zilliz Cloud)</li>
        <li>Apps that need vectors joined with relational data</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Proven at billion-vector scale</li>
      <li>Widest choice of index types, including GPU and DiskANN</li>
      <li>Runs anywhere, from a laptop to Kubernetes to managed cloud</li>
      <li>Hybrid dense, sparse and full-text search</li>
      <li>Large community and LF AI &amp; Data governance</li>
    </ul>
    <div class="source"><a href="https://milvus.io/" target="_blank">Official site</a> - <a href="https://github.com/milvus-io/milvus" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Distributed Milvus is complex to operate</li>
      <li>Steeper learning curve than fully managed services</li>
      <li>Several moving parts (object storage, message queue, etcd)</li>
      <li>Tuning indexes for recall and cost takes expertise</li>
    </ul>
    <div class="source"><a href="https://markaicode.com/vs/milvus-vs-pinecone/" target="_blank">Milvus vs Pinecone comparison</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://milvus.io/docs" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Milvus (self-hosted)</div>
    <div class="price">Free</div>
    <div class="desc">Lite, Standalone or Distributed, Apache 2.0</div>
  </a>
  <a href="https://zilliz.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Zilliz Cloud</div>
    <div class="price">Free tier</div>
    <div class="desc">Serverless and dedicated clusters, usage-based</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>HNSW, IVF, DiskANN and GPU indexes</li>
      <li>Dense, sparse and hybrid search</li>
      <li>Full-text search (BM25)</li>
      <li>Metadata filtering, JSON and array fields</li>
      <li>Multi-tenancy and RBAC</li>
      <li>Separate storage and compute scaling</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>Milvus Lite (pip install)</li>
      <li>Standalone (Docker)</li>
      <li>Distributed (Kubernetes)</li>
      <li>Zilliz Cloud managed service</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Milvus | Qdrant | Weaviate | Pinecone |
|---------|--------|--------|----------|----------|
| Open source | <span class="highlight">Apache 2.0</span> | Apache 2.0 | BSD-3 | No |
| Billion-scale | <span class="highlight">Yes</span> | Yes | Yes | <span class="highlight">Yes</span> |
| GPU indexes | <span class="highlight">Yes</span> | Partial | No | No |
| Managed option | Zilliz Cloud | Qdrant Cloud | Weaviate Cloud | <span class="highlight">Native</span> |
| Operational effort | High (distributed) | Moderate | Moderate | <span class="highlight">Low</span> |

</div>
