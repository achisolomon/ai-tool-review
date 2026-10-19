---
name: "Redis Vector Search"
slug: "redis-vector"
website: "https://redis.io/solutions/vector-search/"
type: "oss"
track: "developers"
category: "vector-dbs"
subcategory: "extensions"
status: "active"
description: "In-memory vector search in Redis with HNSW, hybrid filtering, vector sets and semantic caching for low-latency AI apps"
github_url: "https://github.com/redis/redis"
pricing_model: "freemium"
founded_year: 2009
headquarters: "Mountain View, CA"
tags:
  - rag
  - real-time
  - self-hosted
last_verified: "2026-10-17"
confidence_score: 0.85
github_stars: 77016
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">In-memory</span>
    <span class="label">Architecture</span>
  </div>
  <div class="key-stat">
    <span class="number">AGPL</span>
    <span class="label">Option Since Redis 8</span>
  </div>
  <div class="key-stat">
    <span class="number">2009</span>
    <span class="label">Redis First Released</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Redis, the in-memory data store best known as a cache, includes vector search through the Redis Query Engine. You can index vectors stored in hashes or JSON documents with HNSW or flat indexes, filter on tags, numbers, text and geo in the same query, and get results with very low latency because everything is in memory. Redis 8 also added vector sets, a simpler native data type for similarity search, and Redis offers semantic caching for LLM responses (LangCache) and agent memory patterns.</p>
<p>On licensing, Redis moved to source-available licenses in 2024, then added AGPLv3 as an open-source option starting with Redis 8 in May 2025. You can run it yourself or use Redis Cloud, which holds SOC 2 Type II, ISO 27001 and HIPAA certifications.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Redis for Vectors?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Real-time recommendations and search with tight latency budgets</li>
        <li>Semantic caching of LLM responses</li>
        <li>Teams already running Redis</li>
        <li>Agent short-term memory and session state</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Very large vector sets where RAM cost dominates</li>
        <li>Cheap long-term storage of embeddings</li>
        <li>Teams wanting a dedicated vector DB with built-in embeddings</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Very low query latency from in-memory storage</li>
      <li>Hybrid queries mixing vectors with tag, numeric and text filters</li>
      <li>Caching, sessions and vectors in one system</li>
      <li>Large community and client libraries in every language</li>
      <li>Strong compliance on Redis Cloud</li>
    </ul>
    <div class="source"><a href="https://redis.io/solutions/vector-search/" target="_blank">Official page</a> - <a href="https://trust.redis.io/" target="_blank">Redis Trust Center</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>RAM is expensive, which limits economical scale</li>
      <li>Licensing changes in 2024 led many to the Valkey fork</li>
      <li>No built-in embedding models</li>
      <li>Self-hosting at scale needs operational care</li>
    </ul>
    <div class="source"><a href="https://simonwillison.net/2025/May/1/redis-is-open-source-again/" target="_blank">Simon Willison on Redis licensing</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://redis.io/downloads/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Redis Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, AGPL / RSAL / SSPL</div>
  </a>
  <a href="https://redis.io/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Redis Cloud</div>
    <div class="price">Free tier</div>
    <div class="desc">Paid Essentials and Pro plans scale with memory and throughput</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>HNSW and flat vector indexes</li>
      <li>Vectors in hashes or JSON documents</li>
      <li>Hybrid filters: tag, numeric, text, geo</li>
      <li>Vector sets data type (Redis 8)</li>
      <li>Vector quantization options</li>
      <li>Semantic caching for LLMs (LangCache)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>LangChain, LlamaIndex</li>
      <li>LangGraph checkpoints and memory</li>
      <li>RedisVL Python library</li>
      <li>Clients for every major language</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Redis | Valkey | pgvector | Qdrant |
|---------|-------|--------|----------|--------|
| Storage | In-memory | In-memory | <span class="highlight">Disk (Postgres)</span> | Disk and memory |
| License | AGPL / RSAL / SSPL | <span class="highlight">BSD</span> | PostgreSQL License | Apache 2.0 |
| Latency | <span class="highlight">Very low</span> | Very low | Moderate | Low |
| Semantic caching | <span class="highlight">Built in</span> | No | No | No |
| Cost at large scale | High (RAM) | High (RAM) | <span class="highlight">Low</span> | Moderate |

</div>
