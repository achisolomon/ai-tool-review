---
name: Supermemory
slug: supermemory
website: https://supermemory.ai
github_url: https://github.com/supermemoryai/supermemory
github_stars: 28310
type: open-source
track: developers
category: agent-frameworks
subcategory: agent-memory
status: active
description: 'Memory and context engine for AI agents — #1 on LongMemEval, LoCoMo,
  and ConvoMem benchmarks with 99.4% context reduction'
pricing_model: free
founded_year: 2024
headquarters: "—"
tags:
- agents
- rag
last_verified: '2026-06-11'
confidence_score: 0.93
---
<div class="key-stats">
  <div class="key-stat">
    <span class="number">22K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">#1</span>
    <span class="label">LongMemEval</span>
  </div>
  <div class="key-stat">
    <span class="number">99.4%</span>
    <span class="label">Context Reduction</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Supermemory is the memory and context layer for AI, ranking #1 on LongMemEval, LoCoMo, and ConvoMem — the three major benchmarks for AI memory. Unlike RAG which retrieves static document chunks, Supermemory extracts and tracks facts about users over time, understanding that "I just moved to SF" supersedes "I live in NYC." It achieves 95% Recall@15 while adding only ~720 tokens — a 99.4% context reduction. The platform can run fully locally with one binary and zero config, supporting any model including offline operation with Ollama.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Supermemory?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>AI agents needing persistent user memory across sessions</li>
        <li>Developers wanting state-of-the-art memory benchmarks</li>
        <li>Teams preferring self-hosted, open-source solutions</li>
        <li>Claude Code, OpenCode, and OpenClaw users</li>
        <li>Privacy-conscious deployments with local-only operation</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple RAG-only use cases</li>
        <li>Teams wanting fully managed cloud service</li>
        <li>Non-conversational document retrieval</li>
        <li>Extremely low-latency requirements</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>#1 on LongMemEval (81.6% recall vs 71.2% next-best)</li>
      <li>99.4% context reduction with high recall</li>
      <li>Fully local operation — one binary, zero config</li>
      <li>Open-source with active community</li>
      <li>Handles knowledge updates and contradictions automatically</li>
      <li>Plugins for Claude Code, OpenCode, OpenClaw, Hermes</li>
      <li>Works with any model including Ollama for offline</li>
    </ul>
    <div class="source"><a href="https://supermemory.ai" target="_blank">Official Site</a> · <a href="https://github.com/supermemoryai/supermemory" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires understanding memory vs RAG distinction</li>
      <li>Self-hosted setup needed for full control</li>
      <li>Newer project — ecosystem still growing</li>
      <li>May require tuning for specialized domains</li>
    </ul>
    <div class="source"><a href="https://supermemory.ai/research/" target="_blank">Research</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/supermemoryai/supermemory" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, full control</div>
  </a>
  <a href="https://supermemory.ai" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Cloud</div>
    <div class="price">Contact</div>
    <div class="desc">Managed hosting available</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Memory Capabilities</h4>
    <ul>
      <li>Automatic fact extraction from conversations</li>
      <li>User profile building over time</li>
      <li>Knowledge update and contradiction handling</li>
      <li>Expired information forgetting</li>
      <li>Context-aware retrieval</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Benchmarks</h4>
    <ul>
      <li>LongMemEval: 81.6% (vs 71.2% Zep)</li>
      <li>LoCoMo: #1 ranking</li>
      <li>ConvoMem: #1 ranking</li>
      <li>95% Recall@15 with ~720 tokens</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>Claude Code plugin</li>
      <li>OpenCode plugin</li>
      <li>OpenClaw plugin</li>
      <li>Hermes plugin</li>
      <li>Ollama support (offline)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment</h4>
    <ul>
      <li>Single binary installation</li>
      <li>Zero configuration required</li>
      <li>Bring any model</li>
      <li>Fully offline capable</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Supermemory | Mem0 | Zep | Letta |
|---------|-------------|------|-----|-------|
| LongMemEval | <span class="highlight">81.6%</span> | — | 71.2% | — |
| Open Source | <span class="highlight">Yes</span> | Yes | Partial | Yes |
| Local Deploy | <span class="highlight">One binary</span> | Docker | Docker | Docker |
| Memory vs RAG | <span class="highlight">Both</span> | Memory | Memory | Memory |
| Context Reduction | <span class="highlight">99.4%</span> | Good | Good | Good |
| IDE Plugins | <span class="highlight">CC, OC, Hermes</span> | Limited | — | — |

</div>
