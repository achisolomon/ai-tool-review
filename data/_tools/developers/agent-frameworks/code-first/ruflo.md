---
name: "Ruflo"
slug: "ruflo"
website: "https://cognitum.one"
type: "open-source"
track: "developers"
category: "agent-frameworks"
subcategory: "code-first"
status: "active"
description: "Agent meta-harness for Claude Code and Codex that deploys intelligent multi-agent swarms with adaptive memory, self-learning intelligence, RAG integration, and federated coordination across machines."
github_url: "https://github.com/ruvnet/ruflo"
github_stars: 66170
pricing_model: "free"
founded_year: 2025
headquarters: "Open Source"
tags:
  - agents
  - typescript
  - mcp-server
  - self-hosted
last_verified: "2026-07-05"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">63K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">Specialized Agents</span>
  </div>
  <div class="key-stat">
    <span class="number">35</span>
    <span class="label">Native Plugins</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Ruflo is an agent meta-harness for Claude Code and Codex — the execution layer that wraps AI coding tools with swarm coordination, persistent vector memory, and cross-machine agent federation. Where Claude Code writes code, Ruflo gives it a nervous system: 100+ specialized agents self-organize into swarms, learn from every task via SONA neural patterns, share memory across sessions via HNSW-indexed AgentDB, and — with federation — securely collaborate with agents on other machines without leaking data. One <code>npx ruflo init</code> installs 27 hooks, a full MCP server, and background workers that automatically route tasks and optimize patterns.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Ruflo?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Claude Code and Codex users who want multi-agent coordination</li>
        <li>Teams building production AI workflows needing persistent memory</li>
        <li>Projects requiring swarm intelligence across many specialized agents</li>
        <li>Enterprises needing cross-machine agent federation with zero-trust security</li>
        <li>TypeScript developers extending Claude Code with custom plugins</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Developers happy with standard Claude Code for simpler coding tasks</li>
        <li>Python-first teams who don't use Claude Code or Codex</li>
        <li>Projects wanting a minimal, low-overhead setup</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Turns Claude Code into a full multi-agent system with one install command</li>
      <li>HNSW vector memory measured 1.9x–4.7x faster than brute-force at scale (recall@10 ~0.99)</li>
      <li>35 native Claude Code plugins covering swarms, RAG, security, observability, and trading</li>
      <li>Zero-trust federation lets agents on different machines collaborate without sharing raw data</li>
      <li>Self-learning SONA architecture improves task routing over time (89% routing accuracy claimed)</li>
      <li>MIT licensed, fully open-source with active development</li>
    </ul>
    <div class="source"><a href="https://github.com/ruvnet/ruflo" target="_blank">GitHub README</a> · <a href="https://cognitum.one" target="_blank">Cognitum.One</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Full CLI install adds significant workspace files (.claude/, CLAUDE.md, helpers)</li>
      <li>Steep learning curve — 60+ commands, 30 skills, and 314 MCP tools</li>
      <li>Plugin-only install doesn't register the MCP server, limiting many features</li>
      <li>Project was previously called Claude Flow — some docs still reference the old name</li>
    </ul>
    <div class="source"><a href="https://github.com/ruvnet/ruflo" target="_blank">GitHub README — Install Path Comparison</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/ruvnet/ruflo" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT license — full CLI install, all plugins, MCP server, and federation included</div>
  </a>
  <a href="https://flo.ruv.io" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Web UI Beta</div>
    <div class="price">Free</div>
    <div class="desc">Hosted multi-model chat at flo.ruv.io — no account or API key required to try</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Swarm & Coordination</h4>
    <ul>
      <li>Hierarchical, mesh, and adaptive swarm topologies</li>
      <li>Queen-led consensus (Raft, Byzantine, Gossip protocols)</li>
      <li>12 auto-triggered background workers</li>
      <li>Intelligent task routing (89% accuracy per benchmarks)</li>
      <li>Goal-Oriented Action Planning (GOAP) at goal.ruv.io</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Memory & Intelligence</h4>
    <ul>
      <li>HNSW-indexed AgentDB vector memory</li>
      <li>SONA self-learning neural patterns</li>
      <li>ReasoningBank trajectory learning</li>
      <li>Hybrid search with graph hops and diversity ranking</li>
      <li>Persistent memory across sessions</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Multi-Provider LLM Support</h4>
    <ul>
      <li>Claude, GPT, Gemini, Cohere, Ollama with smart routing</li>
      <li>Automatic failover between providers</li>
      <li>Local LLM support via ruvLLM and Ollama</li>
      <li>MicroLoRA adapter routing</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Security & Compliance</h4>
    <ul>
      <li>AIDefence prompt injection blocking</li>
      <li>PII detection and redaction (14-type pipeline)</li>
      <li>CVE scanning and remediation</li>
      <li>Zero-trust federation with mTLS + ed25519</li>
      <li>HIPAA, SOC2, GDPR audit trails</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Ruflo | Claude Code Alone | AutoGen | CrewAI |
|---------|-------|-------------------|---------|--------|
| Agent Coordination | <span class="highlight">Swarm + federation</span> | None | Multi-agent | Role-based |
| Persistent Memory | <span class="highlight">HNSW vector DB</span> | Session only | Limited | Limited |
| LLM Providers | <span class="highlight">5 with failover</span> | Anthropic only | Multiple | Multiple |
| Self-Learning | <span class="highlight">SONA patterns</span> | None | None | None |
| Claude Code Plugins | <span class="highlight">35 native</span> | External only | N/A | N/A |
| Cross-Machine | <span class="highlight">Zero-trust federation</span> | None | Limited | None |

</div>
