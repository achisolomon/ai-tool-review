---
name: "LangSmith"
slug: "langsmith"
website: "https://www.langchain.com/langsmith"
type: "commercial"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "AI agent and LLM observability platform from LangChain with tracing, evaluation, and monitoring for production applications across any framework"
github_url: "https://github.com/langchain-ai/langsmith-sdk"
github_stars: 1035
pricing_model: "usage-based"
founded_year: 2023
headquarters: "San Francisco, CA"
tags:
  - observability
last_verified: "2026-06-07"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">250K+</span>
    <span class="label">User Signups</span>
  </div>
  <div class="key-stat">
    <span class="number">1B+</span>
    <span class="label">Traces Logged</span>
  </div>
  <div class="key-stat">
    <span class="number">25K+</span>
    <span class="label">Active Teams/Mo</span>
  </div>
</div>

## Overview

<div class="overview">
<p>LangSmith is an AI agent and LLM observability platform built by LangChain, designed to provide complete visibility into agent behavior in production. It offers end-to-end tracing, real-time monitoring, and evaluation capabilities across any framework—not just LangChain. The platform features SDKs for Python, TypeScript, Go, and Java, with native OpenTelemetry support, SmithDB (a purpose-built database delivering 12x faster trace queries), and deployment options including managed cloud, BYOC, and self-hosted. Used by enterprises like Klarna, Nvidia, LinkedIn, Coinbase, and Home Depot, LangSmith helps teams debug, test, and monitor AI applications at scale.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use LangSmith?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams using LangChain or LangGraph frameworks</li>
        <li>Production agent debugging and monitoring</li>
        <li>Organizations needing deep evaluation tooling</li>
        <li>Enterprises requiring self-hosted/BYOC options</li>
        <li>Multi-SDK environments (Python, TS, Go, Java)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting fully open-source solutions</li>
        <li>Non-LangChain projects seeking minimal setup</li>
        <li>Budget-sensitive teams (costs scale with usage)</li>
        <li>Beginners without LLM pipeline experience</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Near-zero setup for LangChain/LangGraph users</li>
      <li>Framework-agnostic with OpenTelemetry support</li>
      <li>SmithDB delivers 12x faster trace queries (71ms vs 860ms)</li>
      <li>Comprehensive evaluation framework with LLM-as-judge</li>
      <li>Real-time P50/P99 latency and cost monitoring</li>
      <li>Self-hosted and BYOC deployment options</li>
      <li>HIPAA, SOC 2 Type 2, GDPR compliance</li>
      <li>4 SDK languages (Python, TypeScript, Go, Java)</li>
    </ul>
    <div class="source"><a href="https://www.langchain.com/langsmith" target="_blank">Official Site</a> · <a href="https://docs.langchain.com/langsmith" target="_blank">Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Vendor lock-in risk with LangChain-native instrumentation</li>
      <li>Costs scale quickly with usage-based pricing ($39/seat + traces)</li>
      <li>UI can feel overwhelming with many concurrent runs</li>
      <li>Steep learning curve for LLM beginners</li>
      <li>Migration to other platforms requires full re-instrumentation</li>
    </ul>
    <div class="source"><a href="https://www.gartner.com/reviews/product/langsmith" target="_blank">Gartner Reviews</a> · <a href="https://techsy.io/en/blog/langfuse-vs-langsmith" target="_blank">Independent Review</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.langchain.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Developer</div>
    <div class="price">$0</div>
    <div class="desc">5K traces/mo, 1 seat, community support</div>
  </a>
  <a href="https://www.langchain.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Plus</div>
    <div class="price">$39<small>/seat/mo</small></div>
    <div class="desc">10K traces, unlimited seats, email support</div>
  </a>
  <a href="https://www.langchain.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Self-hosted, SSO, RBAC, SLA support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Distributed tracing with nested spans</li>
      <li>Real-time monitoring dashboards</li>
      <li>P50/P99 latency tracking</li>
      <li>Cost tracking per trace</li>
      <li>LLM-as-judge evaluations</li>
      <li>Prompt versioning & Hub</li>
      <li>Annotation queues</li>
      <li>Webhook & PagerDuty alerts</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>AI Integrations</h4>
    <ul>
      <li>LangChain / LangGraph</li>
      <li>OpenAI SDK</li>
      <li>Anthropic SDK</li>
      <li>Vercel AI SDK</li>
      <li>LlamaIndex</li>
      <li>Custom implementations</li>
      <li>OpenTelemetry</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>SmithDB Performance</h4>
    <ul>
      <li>12x faster trace queries (71ms)</li>
      <li>9x faster thread queries (131ms)</li>
      <li>15x faster full-text search (400ms)</li>
      <li>6x faster filtering (82ms)</li>
      <li>Sub-second across millions of traces</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>Managed cloud (GCP us-central-1)</li>
      <li>Bring-your-own-cloud (BYOC)</li>
      <li>Self-hosted on Kubernetes</li>
      <li>AWS, GCP, Azure support</li>
      <li>HIPAA / SOC 2 / GDPR compliant</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | LangSmith | Langfuse | Logfire | Arize Phoenix |
|---------|-----------|----------|---------|---------------|
| Open Source | SDK only | <span class="highlight">Fully OSS</span> | SDK only | <span class="highlight">Fully OSS</span> |
| Self-Hosted | Enterprise | <span class="highlight">Yes (free)</span> | Enterprise | <span class="highlight">Yes</span> |
| Free Tier | 5K traces | <span class="highlight">50K obs</span> | 10M records | Unlimited local |
| LangChain Native | <span class="highlight">Best-in-class</span> | Good | Good | Good |
| Multi-SDK | <span class="highlight">4 languages</span> | 2 languages | 3 languages | 2 languages |
| Evaluation Tools | <span class="highlight">Extensive</span> | Basic | Via Evals | <span class="highlight">Strong</span> |
| OTel Native | Yes | No | <span class="highlight">Yes</span> | No |
| Best For | LangChain teams | Self-hosted | Pydantic/OTel | RAG evaluation |

</div>
