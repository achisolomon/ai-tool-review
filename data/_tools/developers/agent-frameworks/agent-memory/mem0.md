---
name: "Mem0"
slug: "mem0"
website: "https://mem0.ai/"
type: "oss"
track: "developers"
category: "agent-frameworks"
subcategory: "agent-memory"
status: "active"
description: "Universal memory layer for AI Agents that enables personalized, context-aware interactions"
github_url: "https://github.com/mem0ai/mem0"
github_stars: 60692
pricing_model: "freemium"
founded_year: 2023
headquarters: "San Francisco, CA"
tags:
  - agents
  - api-available
  - python
  - rag
last_verified: "2026-06-02"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">57K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">91.6</span>
    <span class="label">LoCoMo Score</span>
  </div>
  <div class="key-stat">
    <span class="number">Y Combinator</span>
    <span class="label">S24 Batch</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Mem0 ("mem-zero") is an intelligent memory layer that enhances AI assistants and agents with persistent, personalized memory. Rather than treating each conversation as a blank slate, Mem0 remembers user preferences, adapts to individual needs, and continuously learns over time. It supports multi-level memory (User, Session, and Agent state) with features like entity linking, temporal reasoning, and hybrid search combining semantic, keyword, and entity matching. Ideal for customer support chatbots, AI assistants, healthcare applications, and autonomous agent systems that need to maintain context across interactions.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Mem0?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building personalized AI assistants</li>
        <li>Customer support chatbots needing history</li>
        <li>Autonomous agent systems</li>
        <li>Healthcare AI requiring patient context</li>
        <li>Developers wanting plug-and-play memory</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple stateless chatbots</li>
        <li>One-off query applications</li>
        <li>Teams needing deep graph relationships (try Letta)</li>
        <li>Projects requiring only session memory</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Best-in-class benchmark scores (91.6 LoCoMo, 94.8 LongMemEval)</li>
      <li>Token-efficient single-pass memory extraction</li>
      <li>Multi-level memory (User, Session, Agent)</li>
      <li>Flexible deployment: library, self-hosted, or cloud</li>
      <li>Strong OSS community</li>
      <li>Y Combinator backed (S24)</li>
      <li>Simple API with Python and Node.js SDKs</li>
      <li>Entity linking and temporal reasoning built-in</li>
    </ul>
    <div class="source"><a href="https://github.com/mem0ai/mem0" target="_blank">GitHub</a> · <a href="https://mem0.ai/research" target="_blank">Mem0 Research</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires LLM for memory operations (adds cost)</li>
      <li>Cloud pricing can scale with usage</li>
      <li>Self-hosted requires infrastructure management</li>
      <li>Less mature than RAG-focused alternatives for pure retrieval</li>
      <li>Learning curve for optimal memory schema design</li>
    </ul>
    <div class="source"><a href="https://github.com/mem0ai/mem0/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://mem0.ai/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Library</div>
    <div class="price">Free</div>
    <div class="desc">Open source, bring your own LLM and vector store</div>
  </a>
  <a href="https://mem0.ai/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Self-Hosted</div>
    <div class="price">Free</div>
    <div class="desc">Docker Compose, full dashboard, team features</div>
  </a>
  <a href="https://app.mem0.ai" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Cloud Platform</div>
    <div class="price">Usage-based</div>
    <div class="desc">Zero-ops, managed infrastructure, all features</div>
  </a>
  <a href="https://mem0.ai/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Dedicated support, SLAs, custom integrations</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Multi-level memory (User, Session, Agent)</li>
      <li>Entity linking across memories</li>
      <li>Temporal reasoning for time-aware retrieval</li>
      <li>Hybrid search (semantic + BM25 + entity)</li>
      <li>Single-pass ADD-only extraction</li>
      <li>Agent-generated facts as first-class</li>
      <li>Cross-platform SDKs (Python, Node.js)</li>
      <li>CLI for terminal management</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>pip install mem0ai (library)</li>
      <li>Docker Compose (self-hosted)</li>
      <li>Cloud Platform (managed)</li>
      <li>CLI: npm install -g @mem0/cli</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI (default: gpt-5-mini)</li>
      <li>Anthropic Claude</li>
      <li>Multiple LLM providers</li>
      <li>Vector stores (Qdrant, etc.)</li>
      <li>Vercel AI SDK</li>
      <li>Claude Code, Cursor, Windsurf skills</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>AI Assistants with context</li>
      <li>Customer Support bots</li>
      <li>Healthcare patient history</li>
      <li>Productivity tools</li>
      <li>Gaming environments</li>
      <li>Autonomous agent systems</li>
    </ul>
  </div>
</div>

</details>

## Benchmarks

<div class="benchmarks">
  <div class="benchmark-card">
    <div class="score">91.6</div>
    <div class="benchmark-name">LoCoMo</div>
    <div class="benchmark-desc">Long-context memory benchmark (+20 pts over previous algorithm)</div>
    <div class="source"><a href="https://mem0.ai/research" target="_blank">Mem0 Research, April 2026</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">94.8</div>
    <div class="benchmark-name">LongMemEval</div>
    <div class="benchmark-desc">Long-term memory evaluation (+27 pts improvement)</div>
    <div class="source"><a href="https://mem0.ai/research" target="_blank">Mem0 Research, April 2026</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">64.1</div>
    <div class="benchmark-name">BEAM (1M)</div>
    <div class="benchmark-desc">Production-scale memory at 1M tokens</div>
    <div class="source"><a href="https://mem0.ai/research" target="_blank">Mem0 Research, April 2026</a></div>
  </div>
  <div class="benchmark-card">
    <div class="score">~7K</div>
    <div class="benchmark-name">Token Efficiency</div>
    <div class="benchmark-desc">Avg tokens per retrieval with sub-1s latency</div>
    <div class="source"><a href="https://github.com/mem0ai/mem0" target="_blank">GitHub README</a></div>
  </div>
</div>

## Real-World Usage

<div class="info-grid">
  <div class="info-card">
    <h4>Community Stats</h4>
    <ul>
      <li>6,500+ forks</li>
      <li>Y Combinator S24 company</li>
      <li>Active Discord community</li>
    </ul>
    <div class="source"><a href="https://github.com/mem0ai/mem0" target="_blank">GitHub, June 2026</a></div>
  </div>
  <div class="info-card">
    <h4>Agent Skills Support</h4>
    <ul>
      <li>Claude Code integration</li>
      <li>Cursor, Windsurf support</li>
      <li>Vercel AI SDK compatible</li>
      <li>Agent signup in 5 seconds</li>
    </ul>
    <div class="source"><a href="https://docs.mem0.ai/platform/agent-signup" target="_blank">Mem0 Docs</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Mem0 | GBrain | MemClaw |
|---------|------|--------|---------|
| GitHub Stars | <span class="highlight">57K+</span> | 20.8K | N/A (Commercial) |
| Memory Type | Multi-level (User/Session/Agent) | Self-wiring graph + synthesis | Enterprise shared memory |
| Entity Linking | <span class="highlight">Yes, built-in</span> | Yes, typed edges | Yes, auto-extracted |
| Synthesis/Gap Analysis | No | <span class="highlight">Yes, cited answers</span> | No |
| Governance (RBAC/Audit) | Basic | None | <span class="highlight">Built-in</span> |
| Multi-Agent/Fleet | No | Multi-brain federation | <span class="highlight">Yes</span> |
| Self-Hosted | Yes (Docker) | Yes (local-first) | No |
| Open Source | <span class="highlight">Apache 2.0</span> | MIT | No |
| Best For | Personalized AI assistants | Knowledge synthesis | Enterprise agent fleets |

</div>
