---
name: "NeMo Guardrails"
slug: "nemo-guardrails"
website: "https://github.com/NVIDIA/NeMo-Guardrails"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "guardrails"
status: "active"
description: "NVIDIA's open-source toolkit for implementing guardrails on LLMs. Uses configuration-as-code for defining conversational rules, handling harmful content, and preventing undesired behaviors with rail specifications."
github_url: "https://github.com/NVIDIA-NeMo/Guardrails"
github_stars: 6668
pricing_model: "free"
founded_year: 2023
headquarters: "Santa Clara, CA"

# AI-Managed Metadata
last_verified: "2026-06-08"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">5.6K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
  <div class="key-stat">
    <span class="number">v0.20</span>
    <span class="label">Latest Release</span>
  </div>
  <div class="key-stat">
    <span class="number">NVIDIA</span>
    <span class="label">Maintained By</span>
  </div>
</div>

## Overview

<div class="overview">
<p>NeMo Guardrails is NVIDIA's open-source toolkit for adding programmable guardrails to LLM-based conversational applications. It uses a configuration-as-code approach with "rails" (specific output control mechanisms) for topics like avoiding politics, following dialog paths, using particular language styles, and extracting structured data. The library includes built-in guardrails for input/output moderation, fact-checking, hallucination detection, jailbreak prevention, and integrates with NVIDIA NIM, OpenAI, Azure, Anthropic, and LangChain providers. Version 0.20 (January 2026) added an OpenAI-compatible server, IORails engine, and integrations with Cisco AI Defense.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use NeMo Guardrails?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams needing conversational flow control (dialog paths)</li>
        <li>Python developers wanting config-as-code guardrails</li>
        <li>NVIDIA NIM and GPU infrastructure users</li>
        <li>Applications requiring topic steering and style control</li>
        <li>Self-hosted deployments with custom rail logic</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting managed cloud service (self-hosted only)</li>
        <li>Simple input/output filtering (may be overkill)</li>
        <li>Non-Python environments</li>
        <li>Teams without NVIDIA/GPU expertise</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Free and open-source (Apache 2.0 license)</li>
      <li>Powerful dialog flow control with Colang DSL</li>
      <li>Built-in hallucination detection and fact-checking</li>
      <li>NVIDIA NemoGuard safety models integration</li>
      <li>OpenAI-compatible server for easy deployment</li>
      <li>PII detection via Presidio, Private AI, GLiNER integrations</li>
      <li>Streaming support and OpenTelemetry tracing</li>
      <li>Active NVIDIA maintenance and community</li>
    </ul>
    <div class="source"><a href="https://github.com/NVIDIA-NeMo/Guardrails" target="_blank">GitHub</a> · <a href="https://docs.nvidia.com/nemo/guardrails/latest/about/overview.html" target="_blank">NVIDIA Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Steeper learning curve (Colang DSL)</li>
      <li>Self-hosted only (no managed cloud option)</li>
      <li>Python 3.10+ required (no 3.9 support)</li>
      <li>Best experience requires NVIDIA infrastructure</li>
      <li>More complex than simple guardrail libraries</li>
    </ul>
    <div class="source"><a href="https://appsecsanta.com/nemo-guardrails" target="_blank">AppSecSanta Review</a> · <a href="https://github.com/NVIDIA-NeMo/Guardrails/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/NVIDIA-NeMo/Guardrails" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Full functionality, Apache 2.0 license, self-hosted, unlimited usage</div>
  </a>
  <a href="https://www.nvidia.com/en-us/ai/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">NVIDIA AI Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Enterprise support, NVIDIA NIM integration, professional services</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Rail Types</h4>
    <ul>
      <li>Input rails (prompt filtering)</li>
      <li>Output rails (response filtering)</li>
      <li>Dialog rails (conversation flow)</li>
      <li>Retrieval rails (RAG filtering)</li>
      <li>Execution rails (tool use control)</li>
      <li>Topic rails (subject steering)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Safety Features</h4>
    <ul>
      <li>Jailbreak detection</li>
      <li>Content safety (NemoGuard)</li>
      <li>Topic safety controls</li>
      <li>Hallucination detection</li>
      <li>Fact-checking integration</li>
      <li>PII detection & redaction</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>LLM Providers</h4>
    <ul>
      <li>NVIDIA NIM</li>
      <li>OpenAI</li>
      <li>Azure OpenAI</li>
      <li>Anthropic Claude</li>
      <li>HuggingFace models</li>
      <li>LangChain (optional)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>Cisco AI Defense</li>
      <li>Microsoft Presidio (PII)</li>
      <li>Private AI</li>
      <li>Guardrails AI Hub</li>
      <li>OpenTelemetry</li>
      <li>CrowdStrike AIDR</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | NeMo Guardrails | LLM Guard | Lakera Guard | Guardrails AI |
|---------|-----------------|-----------|--------------|---------------|
| License | <span class="highlight">Apache 2.0</span> | MIT | Proprietary | MIT |
| Dialog Flow Control | <span class="highlight">Yes (Colang)</span> | No | No | No |
| Config-as-Code | <span class="highlight">Yes</span> | Python only | API | Python/YAML |
| NVIDIA Integration | <span class="highlight">Native</span> | No | No | No |
| Self-Hosted | Yes | Yes | Enterprise | Yes |
| Managed Cloud | No | No | <span class="highlight">Yes</span> | No |
| Learning Curve | Higher | Lower | Lower | Medium |
| Best For | <span class="highlight">Conversation control</span> | Security | API security | Output validation |

</div>
