---
name: "Letta"
slug: "letta"
website: "https://www.letta.com/"
type: oss
track: developers
category: "agent-frameworks"
subcategory: "agent-memory"
status: active
description: "Open-source framework for building stateful AI agents with long-term memory, self-editing capabilities, and unlimited context windows."
pricing_model: freemium
founded_year: 2023
headquarters: "San Francisco, California"
github_url: "https://github.com/letta-ai/letta"
github_stars: 23316
last_verified: "2026-06-03"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">13,000+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
  <div class="key-stat">
    <span class="number">10K+</span>
    <span class="label">Developers</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Letta (formerly MemGPT) is an open-source framework for building stateful AI agents with unlimited context through intelligent memory management. It enables agents to remember and learn from all past interactions by implementing a virtual context management system inspired by operating system memory hierarchies. Agents can self-edit their memory, reason over conversation history, and maintain persistent state across sessions—unlocking long-running agents that improve over time.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Letta?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers building conversational agents requiring long-term memory</li>
        <li>Applications needing agents that learn and improve from user interactions</li>
        <li>Multi-session chatbots requiring context retention across conversations</li>
        <li>Research teams exploring stateful agent architectures</li>
        <li>Companies wanting self-hosted, open-source memory management</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple stateless chatbot use cases without memory requirements</li>
        <li>Teams seeking fully managed cloud memory services</li>
        <li>Production deployments requiring enterprise SLA and support</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Virtual context management breaks through LLM context window limitations</li>
      <li>Self-editing memory allows agents to summarize and organize their own knowledge</li>
      <li>Open-source with Apache 2.0 license—full control and customization</li>
      <li>Model-agnostic design works with OpenAI, Anthropic, open-source LLMs</li>
      <li>Python SDK with simple API for agent creation and memory management</li>
      <li>Active research-backed development from UC Berkeley team</li>
    </ul>
    <div class="source"><a href="https://www.letta.com/" target="_blank">Official Site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Early-stage project with evolving APIs and breaking changes</li>
      <li>Memory management adds latency compared to stateless agents</li>
      <li>Requires understanding of memory architecture for optimal performance</li>
      <li>Limited production deployment examples and enterprise features</li>
    </ul>
    <div class="source"><a href="https://github.com/letta-ai/letta" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/letta-ai/letta" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0 licensed. Use with your own LLM API keys. Self-hosted with no usage limits or restrictions.</div>
  </a>
  <a href="https://www.letta.com/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Letta Cloud (Beta)</div>
    <div class="price">Contact</div>
    <div class="desc">Managed hosting with built-in LLM access. Currently in private beta—contact for early access and pricing.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Virtual context management system</li>
      <li>Self-editing agent memory</li>
      <li>Hierarchical memory storage (core, archival, recall)</li>
      <li>Multi-model support (OpenAI, Anthropic, local models)</li>
      <li>Python SDK and REST API</li>
      <li>Persistent agent state across sessions</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Python (primary)</li>
      <li>Linux/macOS/Windows</li>
      <li>Docker containers</li>
      <li>Cloud deployment ready</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Letta | Zep | LangChain Memory |
|---------|--------|--------------|--------------|
| Approach | Virtual context OS | Graph-based memory | Simple buffer/vector |
| Self-editing | Yes, agents edit memory | No, managed externally | No |
| Open Source | Fully open (Apache 2.0) | Open-core model | Fully open (MIT) |
| Memory Architecture | Hierarchical (core/archival) | Knowledge graphs | Key-value stores |
| Best For | Unlimited context agents | Production RAG + memory | Quick LangChain integration |

</div>
