---
name: "Qdrant"
slug: "qdrant"
website: "https://qdrant.tech/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "dedicated"
status: "active"
description: "High-performance, massive-scale vector database and vector search engine for the next generation of AI applications"
github_url: "https://github.com/qdrant/qdrant"
github_stars: 34252
pricing_model: "freemium"
founded_year: 2021
headquarters: "Berlin, Germany"
tags:
  - rag
last_verified: "2026-06-02"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">31.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">250M+</span>
    <span class="label">Downloads</span>
  </div>
  <div class="key-stat">
    <span class="number">Rust</span>
    <span class="label">Built In</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Qdrant (pronounced "quadrant") is a high-performance vector similarity search engine and vector database built in Rust. It provides a production-ready service with a convenient API to store, search, and manage vectors with rich metadata filtering capabilities. Designed for extended filtering support, Qdrant excels at neural network and semantic-based matching, faceted search, RAG applications, and recommendation systems. The Rust foundation ensures exceptional speed and reliability even under high load, consistently outperforming competitors in benchmark tests.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Qdrant?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building RAG and AI agent systems</li>
        <li>Performance-critical production deployments</li>
        <li>Complex filtering with vector search</li>
        <li>Self-hosted open-source requirements</li>
        <li>Hybrid search (dense + sparse vectors)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Serverless-first architectures (try Pinecone)</li>
        <li>Teams wanting no-ops managed service</li>
        <li>Simple prototypes (Chroma is easier)</li>
        <li>Non-technical users</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Best-in-class query performance (Rust-powered)</li>
      <li>Rich filtering with payload metadata</li>
      <li>Hybrid search combining dense and sparse vectors</li>
      <li>Up to 97% RAM reduction with quantization</li>
      <li>True open-source with Apache 2.0 license</li>
      <li>Horizontal scaling with sharding and replication</li>
      <li>Qdrant Edge for on-device deployments</li>
    </ul>
    <div class="source"><a href="https://qdrant.tech/benchmarks/">Qdrant Benchmarks</a> · <a href="https://github.com/qdrant/qdrant">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Steeper learning curve than simpler alternatives</li>
      <li>Cloud pricing less transparent than competitors</li>
      <li>Smaller ecosystem than Pinecone or Weaviate</li>
      <li>Self-hosting requires DevOps expertise</li>
      <li>Documentation can be sparse for edge cases</li>
    </ul>
    <div class="source"><a href="https://www.g2.com/products/qdrant/reviews">G2 Reviews</a> · <a href="https://discord.gg/qdrant">Discord Community</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://qdrant.tech/documentation/quickstart/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, full features, Apache 2.0</div>
  </a>
  <a href="https://cloud.qdrant.io/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Cloud Free</div>
    <div class="price">$0</div>
    <div class="desc">1GB storage, 1 node, community support</div>
  </a>
  <a href="https://qdrant.tech/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Cloud Dedicated</div>
    <div class="price">From $25<small>/mo</small></div>
    <div class="desc">Managed clusters, auto-scaling, backups</div>
  </a>
  <a href="https://qdrant.tech/contact-us/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Hybrid cloud, SSO, SLA, dedicated support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Search Capabilities</h4>
    <ul>
      <li>Dense vector similarity search</li>
      <li>Sparse vector search (BM25-style)</li>
      <li>Multi-vector search (ColBERT)</li>
      <li>Hybrid search with fusion strategies</li>
      <li>Filtering on JSON payloads</li>
      <li>Geo-location filtering</li>
      <li>Full-text keyword matching</li>
      <li>Recommendation API</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Performance Features</h4>
    <ul>
      <li>HNSW index algorithm</li>
      <li>Scalar, binary, product quantization</li>
      <li>On-disk storage with mmap</li>
      <li>gRPC for high-throughput</li>
      <li>Batch operations</li>
      <li>Zero-downtime updates</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Client Libraries</h4>
    <ul>
      <li>Python (official)</li>
      <li>JavaScript/TypeScript (official)</li>
      <li>Rust (official)</li>
      <li>Go (official)</li>
      <li>.NET/C# (official)</li>
      <li>Java (official)</li>
      <li>PHP (community)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>Docker (single node)</li>
      <li>Kubernetes (distributed)</li>
      <li>Qdrant Cloud (managed)</li>
      <li>Hybrid Cloud (BYOC)</li>
      <li>Qdrant Edge (embedded)</li>
      <li>AWS, GCP, Azure marketplace</li>
    </ul>
  </div>
</div>

</details>

## Real-World Usage

<div class="info-grid">
  <div class="info-card">
    <h4>Community Stats</h4>
    <ul>
      <li>250M+ Docker downloads</li>
      <li>9,000+ Discord members</li>
      <li>100+ employees globally</li>
    </ul>
    <div class="source"><a href="https://qdrant.tech/about-us/">Qdrant About Us</a>, June 2026</div>
  </div>
  <div class="info-card">
    <h4>Notable Users</h4>
    <ul>
      <li>Slack</li>
      <li>Adobe</li>
      <li>HubSpot</li>
      <li>Google DeepMind</li>
      <li>Qualcomm</li>
    </ul>
    <div class="source"><a href="https://qdrant.tech/customers/">Qdrant Customers</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Qdrant | Pinecone | Weaviate | Chroma |
|---------|--------|----------|----------|--------|
| Open Source | <span class="highlight">Yes (Apache 2.0)</span> | No | Yes (BSD) | Yes (Apache 2.0) |
| Language | <span class="highlight">Rust</span> | Unknown | Go | Python |
| Hybrid Search | <span class="highlight">Native</span> | Limited | Yes | Limited |
| Filtering | <span class="highlight">Rich JSON payload</span> | Metadata | GraphQL | Basic |
| Quantization | <span class="highlight">Scalar, Binary, PQ</span> | Yes | Yes | Limited |
| Self-Hosted | <span class="highlight">Full-featured</span> | No | Yes | Yes |
| Edge/Embedded | <span class="highlight">Qdrant Edge</span> | No | No | Yes |
| Free Cloud Tier | 1GB | Starter | Sandbox | - |
| Best For | Performance-critical RAG | Serverless simplicity | Knowledge graphs | Prototyping |

</div>
