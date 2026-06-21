---
name: "Weaviate"
slug: "weaviate"
website: "https://weaviate.io/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "dedicated"
status: "active"
description: "Open-source vector database with native hybrid search combining BM25 and vector search"
github_url: "https://github.com/weaviate/weaviate"
github_stars: 16384
pricing_model: "freemium"
founded_year: 2019
headquarters: "Amsterdam, Netherlands"
tags:
  - api-available
  - rag
last_verified: "2026-06-02"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">12K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number"><100ms</span>
    <span class="label">P95 Latency</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">Modules</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Weaviate is an open-source vector database that pioneered native hybrid search, combining traditional keyword search (BM25) with vector similarity search in a single query. Built in Go for performance, Weaviate offers a modular architecture with pluggable vectorizers (OpenAI, Cohere, Hugging Face), rerankers, and generative modules. Its GraphQL API provides powerful querying capabilities including filtering, aggregation, and cross-references between objects. Weaviate can be self-hosted or run on Weaviate Cloud Services (WCS), making it popular with teams who need flexibility between managed and self-hosted deployments.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Weaviate?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams needing true hybrid search (BM25 + vectors)</li>
        <li>Organizations requiring self-hosted deployment option</li>
        <li>Complex data models with relationships (GraphQL)</li>
        <li>Multi-modal search (text, images, audio)</li>
        <li>Teams wanting modular, extensible architecture</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple use cases (Chroma is easier)</li>
        <li>Zero-ops requirements (use Pinecone)</li>
        <li>Lowest possible latency needs (try Qdrant)</li>
        <li>Teams without infrastructure experience</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Best-in-class hybrid search (BM25 + vector fusion)</li>
      <li>Fully open-source with active community</li>
      <li>Modular vectorizers (OpenAI, Cohere, HuggingFace)</li>
      <li>GraphQL API with powerful filtering and aggregations</li>
      <li>Multi-tenancy with data isolation</li>
      <li>Self-hosted or managed cloud options</li>
    </ul>
    <div class="source"><a href="https://weaviate.io/" target="_blank">Weaviate.io</a> | <a href="https://github.com/weaviate/weaviate" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Steeper learning curve than simpler alternatives</li>
      <li>Self-hosting requires DevOps expertise</li>
      <li>Cloud pricing can scale up quickly</li>
      <li>GraphQL complexity for simple use cases</li>
      <li>Module configuration adds setup overhead</li>
    </ul>
    <div class="source"><a href="https://www.g2.com/products/weaviate/reviews" target="_blank">G2 Reviews</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://weaviate.io/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Sandbox</div>
    <div class="price">$0</div>
    <div class="desc">14-day trial, perfect for testing</div>
  </a>
  <a href="https://weaviate.io/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Serverless</div>
    <div class="price">Pay-per-use</div>
    <div class="desc">$0.095/1M dimensions stored</div>
  </a>
  <a href="https://weaviate.io/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise Cloud</div>
    <div class="price">Custom</div>
    <div class="desc">Dedicated clusters, SLA, support</div>
  </a>
  <a href="https://weaviate.io/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Self-Hosted</div>
    <div class="price">Free (OSS)</div>
    <div class="desc">Run on your infrastructure</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Hybrid search (BM25 + vector fusion)</li>
      <li>GraphQL & REST APIs</li>
      <li>HNSW vector indexing</li>
      <li>Inverted index for filtering</li>
      <li>Cross-references between objects</li>
      <li>Real-time CRUD operations</li>
      <li>Multi-tenancy support</li>
      <li>Horizontal scaling (sharding)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Vectorizer Modules</h4>
    <ul>
      <li>text2vec-openai (GPT embeddings)</li>
      <li>text2vec-cohere</li>
      <li>text2vec-huggingface</li>
      <li>text2vec-transformers (local)</li>
      <li>multi2vec-clip (images + text)</li>
      <li>img2vec-neural (images)</li>
      <li>ref2vec (cross-references)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Generative Modules</h4>
    <ul>
      <li>generative-openai (GPT-4, etc.)</li>
      <li>generative-cohere (Command)</li>
      <li>generative-palm (Google)</li>
      <li>generative-anthropic (Claude)</li>
      <li>RAG in a single query</li>
      <li>Grouped task execution</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>Weaviate Cloud Services (WCS)</li>
      <li>Docker / Docker Compose</li>
      <li>Kubernetes (Helm charts)</li>
      <li>AWS, GCP, Azure marketplaces</li>
      <li>Embedded Weaviate (in-process)</li>
    </ul>
  </div>
</div>

</details>

## Community & Ecosystem

<div class="info-grid">
  <div class="info-card">
    <h4>Community Stats</h4>
    <ul>
      <li>200+ contributors</li>
      <li>Active Slack community (10k+ members)</li>
      <li>Weekly office hours</li>
      <li>Comprehensive documentation</li>
    </ul>
    <div class="source">GitHub, 2025</div>
  </div>
  <div class="info-card">
    <h4>Integrations</h4>
    <ul>
      <li>LangChain & LlamaIndex native</li>
      <li>Haystack integration</li>
      <li>Python, JavaScript, Go, Java clients</li>
      <li>Vercel AI SDK</li>
      <li>Jupyter notebooks support</li>
    </ul>
    <div class="source">Weaviate.io, 2025</div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Weaviate | Pinecone | Qdrant | Chroma |
|---------|----------|----------|--------|--------|
| Deployment | <span class="highlight">Managed + Self-hosted</span> | Managed only | Managed + Self-hosted | Self-hosted + Cloud |
| Hybrid Search | <span class="highlight">Native BM25 + vector</span> | Basic sparse-dense | Good | Basic |
| API Style | <span class="highlight">GraphQL + REST</span> | REST | REST + gRPC | REST |
| Multi-modal | <span class="highlight">Yes (CLIP, images)</span> | No | Limited | No |
| Latency | 50-100ms | <50ms | <span class="highlight"><50ms</span> | Variable |
| Modules | <span class="highlight">100+ pluggable</span> | Fixed | Limited | Limited |
| Free Tier | 14-day sandbox | 100K vectors | 1GB | Unlimited (self-host) |
| Best For | <span class="highlight">Hybrid search, flexibility</span> | Zero-ops production | Performance + OSS | Prototyping |

</div>
