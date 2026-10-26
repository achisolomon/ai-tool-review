---
name: "Supabase Vector"
slug: "supabase-vector"
website: "https://supabase.com/modules/vector"
type: "commercial"
track: "developers"
category: "vector-dbs"
subcategory: "extensions"
status: "active"
description: "Managed Postgres with pgvector built in, plus auth, storage, Edge Functions and row-level security for AI apps"
github_url: "https://github.com/supabase/supabase"
github_stars: 113954
pricing_model: "freemium"
founded_year: 2020
headquarters: "San Francisco, CA"
tags:
  - rag
  - serverless
  - self-hosted
last_verified: "2026-10-17"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">111k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">$25/mo</span>
    <span class="label">Pro Plan</span>
  </div>
  <div class="key-stat">
    <span class="number">SOC 2</span>
    <span class="label">Type 2</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Supabase Vector is Supabase's managed Postgres used as a vector database. Every Supabase project includes the pgvector extension, so you store embeddings in ordinary tables next to users, documents and permissions, and query them with SQL or through Supabase's auto-generated APIs. Because it sits inside the full Supabase platform, you also get authentication, row-level security, file storage, real-time subscriptions and Edge Functions (which can generate embeddings) without wiring separate services together.</p>
<p>There is no per-vector charge: vectors count toward your normal database size and compute on your plan. Supabase also maintains vecs, a Python client for managing vector collections in Postgres. The platform is open source and can be self-hosted.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Supabase Vector?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Startups building AI features on a Postgres backend</li>
        <li>Apps that need auth, storage and vectors in one place</li>
        <li>Per-user access control on embeddings with row-level security</li>
        <li>Prototypes that need to grow into production</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Hundreds of millions of vectors or more</li>
        <li>Teams that want a vector-only service</li>
        <li>Workloads needing full control over Postgres tuning</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Vector search included in plan pricing, no per-vector fees</li>
      <li>Auth, storage, real-time and APIs in the same project</li>
      <li>Row-level security applies to vector queries</li>
      <li>Open source and self-hostable</li>
      <li>SOC 2 Type 2</li>
    </ul>
    <div class="source"><a href="https://supabase.com/modules/vector" target="_blank">Official Vector page</a> - <a href="https://supabase.com/pricing" target="_blank">Pricing</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Same scaling limits as pgvector at very large vector counts</li>
      <li>API layer adds latency compared with direct SQL</li>
      <li>Large indexes need bigger, more expensive compute add-ons</li>
      <li>Less low-level control than self-managed Postgres</li>
    </ul>
    <div class="source"><a href="https://markaicode.com/vs/supabase-vs-pgvector/" target="_blank">Supabase vs pgvector benchmark</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://supabase.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">500 MB database, pgvector included</div>
  </a>
  <a href="https://supabase.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$25<small>/mo</small></div>
    <div class="desc">8 GB database, daily backups, usage-based extras</div>
  </a>
  <a href="https://supabase.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Team</div>
    <div class="price">$599<small>/mo</small></div>
    <div class="desc">SOC 2 reports, SSO, longer log retention</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>pgvector on every project</li>
      <li>HNSW and IVFFlat indexes</li>
      <li>Row-level security on vector tables</li>
      <li>Edge Functions for generating embeddings</li>
      <li>vecs Python client</li>
      <li>Auto-generated REST and GraphQL APIs</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI, Hugging Face embeddings</li>
      <li>LangChain, LlamaIndex</li>
      <li>Vercel and Next.js templates</li>
      <li>Supabase Auth and Storage</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Supabase Vector | pgvector (self-hosted) | Neon | Pinecone |
|---------|-----------------|------------------------|------|----------|
| Managed | <span class="highlight">Yes</span> | No | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> |
| Auth and storage included | <span class="highlight">Yes</span> | No | Auth add-on | No |
| Free tier | Yes | Open source | Yes | Yes |
| Per-vector charges | <span class="highlight">None</span> | None | None | Usage-based |
| Best fit | Full-stack AI apps | Existing Postgres | Serverless Postgres | Vector-only scale |

</div>
