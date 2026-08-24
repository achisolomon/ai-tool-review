---
name: "Neo4j"
slug: "neo4j"
website: "https://neo4j.com/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "rag-kg"
status: "active"
description: "Enterprise graph database with native vector search, hybrid querying, and GraphRAG integration for knowledge graph applications, built on OpenTelemetry-native architecture"
github_url: "https://github.com/neo4j/neo4j"
github_stars: 17119
pricing_model: "freemium"
founded_year: 2007
headquarters: "San Mateo, CA"
tags:
  - rag
last_verified: "2026-06-07"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">16.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">300K+</span>
    <span class="label">Developers</span>
  </div>
  <div class="key-stat">
    <span class="number">80+</span>
    <span class="label">Fortune 100 Customers</span>
  </div>
  <div class="key-stat">
    <span class="number">$581M</span>
    <span class="label">Total Funding</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Neo4j is the world's leading graph intelligence platform, combining a native graph database with vector search capabilities for building knowledge graph and GraphRAG applications. Founded in 2007, Neo4j enables developers to model, store, and query highly connected data up to 1000x faster than relational databases through its optimized property graph model and Cypher query language. The platform provides native vector indexes supporting 1-4096 dimensions with cosine and Euclidean similarity functions, enabling hybrid queries that combine graph traversal with semantic search. Neo4j serves as the knowledge layer for AI systems, with integrations for LangChain, LlamaIndex, and major LLM providers, powering use cases from fraud detection to real-time recommendations for enterprises including Uber, Cisco, Walmart, and BMW.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Neo4j?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>GraphRAG applications requiring relationship-aware retrieval</li>
        <li>Knowledge graph construction from unstructured documents</li>
        <li>Fraud detection and anomaly detection systems</li>
        <li>Multi-hop query use cases (recommendations, identity resolution)</li>
        <li>Teams already invested in graph modeling paradigms</li>
        <li>Hybrid vector + relationship querying requirements</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Pure semantic similarity search at massive scale (use Pinecone/Weaviate)</li>
        <li>Simple embedding storage without relationship modeling</li>
        <li>Teams unfamiliar with graph concepts or Cypher</li>
        <li>RDF-heavy semantic web applications</li>
        <li>Budget-constrained projects (enterprise features are costly)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Index-free adjacency enables constant-time traversals regardless of graph size</li>
      <li>Cypher query language is intuitive and readable for complex relationships</li>
      <li>Native vector search with hybrid graph+vector querying</li>
      <li>Excellent visualization with Neo4j Bloom</li>
      <li>Rich GenAI ecosystem (LangChain, LlamaIndex, Haystack, Spring AI)</li>
      <li>GraphRAG Python package for entity extraction and enrichment</li>
      <li>Scales to 100TB+ with Infinigraph distributed architecture</li>
      <li>Strong enterprise security with role-based access control</li>
    </ul>
    <div class="source"><a href="https://neo4j.com/" target="_blank">Official Site</a> · <a href="https://neo4j.com/product/neo4j-graph-database/" target="_blank">Product Page</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Steep learning curve for Cypher and graph modeling concepts</li>
      <li>Memory management can be tricky at scale</li>
      <li>Not optimized for pure ANN search compared to dedicated vector DBs</li>
      <li>RDF processing is limited (neosemantics plugin not available on Aura)</li>
      <li>Smaller community than traditional SQL databases</li>
      <li>Enterprise features require paid tiers</li>
    </ul>
    <div class="source"><a href="https://www.g2.com/products/neo4j-graph-database/reviews" target="_blank">G2 Reviews</a> · <a href="https://www.trustradius.com/products/neo4j/reviews" target="_blank">TrustRadius</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://neo4j.com/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">AuraDB Free</div>
    <div class="price">$0</div>
    <div class="desc">Learning and exploration, no credit card required</div>
  </a>
  <a href="https://neo4j.com/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">AuraDB Professional</div>
    <div class="price">$65<small>/GB/mo</small></div>
    <div class="desc">Production apps, 128GB max, daily backups, AWS/Azure/GCP</div>
  </a>
  <a href="https://neo4j.com/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Business Critical</div>
    <div class="price">$146<small>/GB/mo</small></div>
    <div class="desc">99.95% SLA, multi-zone, 24x7 support, 512GB+ capacity</div>
  </a>
  <a href="https://neo4j.com/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise Self-Managed</div>
    <div class="price">Custom</div>
    <div class="desc">Unlimited scaling, HA, CDC, fine-grained access control</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Vector Search Features</h4>
    <ul>
      <li>Native vector indexes (1-4096 dimensions)</li>
      <li>Cosine and Euclidean similarity functions</li>
      <li>HNSW algorithm with configurable parameters</li>
      <li>Quantization for reduced storage</li>
      <li>Hybrid vector + graph queries</li>
      <li>Multi-label/multi-type indexes (v3.0)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>GenAI Integrations</h4>
    <ul>
      <li>LangChain (Python & JS)</li>
      <li>LlamaIndex</li>
      <li>Haystack</li>
      <li>Spring AI</li>
      <li>Semantic Kernel</li>
      <li>LangGraph / OpenAI Agents</li>
      <li>Pydantic AI / Claude Agent SDK</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Core Capabilities</h4>
    <ul>
      <li>Cypher query language</li>
      <li>Multi-hop relationship traversal</li>
      <li>ACID transactions</li>
      <li>Cypher Parallel Runtime</li>
      <li>Graph Data Science algorithms</li>
      <li>Change data capture (CDC)</li>
      <li>Kafka connectors</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>AuraDB (fully managed cloud)</li>
      <li>Self-hosted on-premises</li>
      <li>AWS, Azure, GCP native</li>
      <li>Community Edition (GPL3)</li>
      <li>Infinigraph for 100TB+ scale</li>
      <li>Neo4j Ops Manager</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Neo4j | Pinecone | Weaviate | Milvus |
|---------|-------|----------|----------|--------|
| Primary Focus | <span class="highlight">Graph + Vector</span> | Pure Vector | Hybrid Search | Pure Vector |
| Open Source | <span class="highlight">Yes (GPL3)</span> | No | Yes | Yes |
| Self-Hosted | <span class="highlight">Yes</span> | No | Yes | Yes |
| Graph Traversal | <span class="highlight">Native</span> | No | No | No |
| Vector Dimensions | 1-4096 | 20K+ | 65K+ | 32K+ |
| GraphRAG Native | <span class="highlight">Yes</span> | No | No | No |
| Hybrid Query | <span class="highlight">Graph + Vector</span> | Metadata only | Vector + Keyword | Metadata only |
| Best For | Knowledge graphs | Scale similarity | RAG apps | High-dim vectors |

</div>
