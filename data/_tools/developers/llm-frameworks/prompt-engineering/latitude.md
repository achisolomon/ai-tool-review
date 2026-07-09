---
name: "Latitude"
slug: "latitude"
website: "https://latitude.so/"
type: "open-source"
track: "developers"
category: "llm-frameworks"
subcategory: "prompt-engineering"
status: "active"
description: "Open-source agent engineering platform for AI observability, issue detection, and evaluation - described as Sentry for AI agents and LLMs"
github_url: "https://github.com/latitude-dev/latitude-llm"
github_stars: 4397
pricing_model: "freemium"
founded_year: 2024
headquarters: "Remote"
last_verified: "2026-06-03"
confidence_score: 0.92
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">4K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">Trace Search</span>
  </div>
  <div class="key-stat">
    <span class="number">MIT</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Latitude is an open-source agent engineering platform that functions as "Sentry, but for AI agents and LLMs." It helps developers understand what will break next in their AI applications and fix issues before users notice. The platform provides issue-centric observability where failed traces are automatically grouped into tracked issues with status, size, and trend analysis. Latitude features human-aligned evaluations built automatically from team judgments, agent-native traces that capture multi-turn sessions and tool calls, and semantic search across 100% of traces without sampling.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Latitude?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building production AI agents</li>
        <li>Developers needing LLM error tracking</li>
        <li>Organizations wanting self-hosted observability</li>
        <li>Claude Code and Vercel AI SDK users</li>
        <li>Teams with human evaluation workflows</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple single-prompt applications</li>
        <li>Teams without production LLM workloads</li>
        <li>Those needing only prompt versioning (try PromptLayer)</li>
        <li>Pure evaluation focus (try Promptfoo)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>True open-source with MIT license</li>
      <li>Issue-centric approach groups failures automatically</li>
      <li>100% trace searchability without sampling</li>
      <li>Human-aligned evals track drift from human judgment</li>
      <li>Native Claude Code integration</li>
      <li>Provider-agnostic (OpenAI, Anthropic, Bedrock, etc.)</li>
      <li>Self-hosting option available</li>
    </ul>
    <div class="source"><a href="https://github.com/latitude-dev/latitude-llm" target="_blank">GitHub</a> - <a href="https://docs.latitude.so" target="_blank">Official Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Relatively new platform (founded 2024)</li>
      <li>V2 still in development (not stable release)</li>
      <li>Smaller community than established alternatives</li>
      <li>Limited third-party integrations vs. LangSmith</li>
      <li>Self-hosting requires infrastructure management</li>
    </ul>
    <div class="source"><a href="https://github.com/latitude-dev/latitude-llm" target="_blank">GitHub Roadmap</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://latitude.so/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Start free with core observability</div>
  </a>
  <a href="https://latitude.so/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">Usage-based</div>
    <div class="desc">Scale as your agents grow</div>
  </a>
  <a href="https://latitude.so/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Self-Hosted</div>
    <div class="price">Free (OSS)</div>
    <div class="desc">Full control, your infrastructure</div>
  </a>
  <a href="https://latitude.so/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Commercial license, dedicated support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Issue discovery and clustering</li>
      <li>Agent-native trace visualization</li>
      <li>Multi-turn session tracking</li>
      <li>Tool call monitoring</li>
      <li>Semantic search across all traces</li>
      <li>Human-aligned evaluation generation</li>
      <li>Evaluation alignment tracking (MCC, coverage)</li>
      <li>OTel ingest support</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI</li>
      <li>Anthropic / Claude</li>
      <li>AWS Bedrock</li>
      <li>Vercel AI SDK</li>
      <li>LangChain</li>
      <li>Claude Code (dedicated package)</li>
      <li>Any OTLP-compatible backend</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Languages & SDKs</h4>
    <ul>
      <li>TypeScript / JavaScript (npm)</li>
      <li>Python</li>
      <li>Go</li>
      <li>OpenTelemetry passthrough</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>Latitude Cloud (managed)</li>
      <li>Self-hosted (Docker)</li>
      <li>LGPL-3.0 open source</li>
      <li>Commercial license available</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Latitude | LangSmith | Promptfoo | Helicone |
|---------|----------|-----------|-----------|----------|
| Open Source | <span class="highlight">Yes (MIT)</span> | No | Yes | Partial |
| Issue Clustering | <span class="highlight">Automatic</span> | Manual | No | No |
| Human-Aligned Evals | <span class="highlight">Yes</span> | Basic | Yes | No |
| Semantic Search | <span class="highlight">100% traces</span> | Sampled | No | Limited |
| Self-Hosting | <span class="highlight">Full OSS</span> | Enterprise only | Yes | Limited |
| Claude Code Integration | <span class="highlight">Native package</span> | Via LangChain | Manual | Manual |
| Pricing Start | Free | Free tier | Free | Free tier |
| Best For | Agent debugging | LangChain teams | Eval testing | Cost tracking |

</div>

## Resources

<div class="info-grid">
  <div class="info-card">
    <h4>Links</h4>
    <ul>
      <li><a href="https://latitude.so/" target="_blank">Website</a></li>
      <li><a href="https://docs.latitude.so" target="_blank">Documentation</a></li>
      <li><a href="https://github.com/latitude-dev/latitude-llm" target="_blank">GitHub Repository</a></li>
      <li><a href="https://join.slack.com/t/trylatitude/shared_invite/zt-35wu2h9es-N419qlptPMhyOeIpj3vjzw" target="_blank">Slack Community</a></li>
    </ul>
  </div>
  <div class="info-card">
    <h4>Roadmap Highlights</h4>
    <ul>
      <li>OTel ingest, traces, sessions - Done</li>
      <li>Issue discovery + clustering - Done</li>
      <li>Issue-to-eval generation - Done</li>
      <li>Semantic search - Done</li>
      <li>Potential issues tracking - Upcoming</li>
      <li>Stable v2 release - Upcoming</li>
    </ul>
    <div class="source"><a href="https://github.com/latitude-dev/latitude-llm#roadmap" target="_blank">GitHub Roadmap</a></div>
  </div>
</div>
