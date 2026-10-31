---
name: "PostHog"
slug: "posthog"
website: "https://posthog.com/"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "Open-source product platform with LLM analytics (traces, cost, latency, evals), session replay, feature flags and a built-in AI analyst."
github_url: "https://github.com/PostHog/posthog"
github_stars: 40543
pricing_model: "freemium"
founded_year: 2020
headquarters: "Fully remote"
tags:
  - observability
  - mcp-server
  - api-available
  - self-hosted
last_verified: "2026-10-26"
confidence_score: 0.88
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">40.5k</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">100K</span>
    <span class="label">Free LLM Events / Month</span>
  </div>
  <div class="key-stat">
    <span class="number">2020</span>
    <span class="label">Founded (YC W20)</span>
  </div>
</div>

## Overview

<div class="overview">
<p>PostHog is an open-source product platform that bundles product analytics, session replay, feature flags, experiments, error tracking, surveys and a data warehouse. For AI teams, its LLM analytics product records every model call (prompt, response, tokens, cost, latency, tools used), groups calls into traces, and links each trace to the user, their session replay and any exceptions. PostHog AI, the built-in analyst, answers questions in plain English, writes SQL and builds dashboards, and an MCP server brings the same data into Claude Code, Cursor and other agents.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use PostHog?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams shipping LLM features who want AI traces next to product analytics</li>
        <li>Startups that want one tool instead of separate analytics, replay and flags vendors</li>
        <li>Engineers who want to query product data from Claude Code or Cursor via MCP</li>
        <li>Cost-conscious teams that fit inside the generous monthly free tiers</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams that only need deep LLM evals and prompt management (a dedicated tool goes further)</li>
        <li>Non-technical users who need reports without setup work</li>
        <li>Large companies wanting a supported self-hosted deployment (open-source self-hosting is hobby-scale, without support)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>LLM traces link to the user, session replay and errors, which pure LLM tools can't do</li>
      <li>Integrations with about 50 SDKs and frameworks, from OpenAI and Anthropic to LangChain, Vercel AI SDK and Claude Code</li>
      <li>Imports traces from Helicone, Langfuse and Traceloop</li>
      <li>Free tier on every product, kept even on paid plans</li>
      <li>Reviewers praise easy setup and useful session replays</li>
    </ul>
    <div class="source"><a href="https://posthog.com/docs/llm-analytics" target="_blank" rel="noopener">PostHog LLM analytics docs</a> · <a href="https://posthog.com/pricing" target="_blank" rel="noopener">Pricing</a> · <a href="https://www.g2.com/products/posthog/reviews_and_filters" target="_blank" rel="noopener">G2 reviews</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Learning curve is the most common review complaint</li>
      <li>So many products that new users report feature overload</li>
      <li>Event and dashboard setup needs planning; some reports are hard for non-technical users</li>
      <li>Usage-based pricing across many products makes bills harder to predict</li>
      <li>Self-hosting is a Docker "hobby" deploy, recommended only up to about 100k events a month</li>
    </ul>
    <div class="source"><a href="https://www.g2.com/products/posthog/reviews_and_filters" target="_blank" rel="noopener">G2 reviews</a> · <a href="https://github.com/PostHog/posthog" target="_blank" rel="noopener">GitHub README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://posthog.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free tiers</div>
    <div class="price">$0</div>
    <div class="desc">Every month: 1M analytics events, 5K replays, 1M flag requests, 100K LLM events, 500 PostHog AI credits</div>
  </a>
  <a href="https://posthog.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Pay as you go</div>
    <div class="price">Usage-based</div>
    <div class="desc">LLM analytics from $0.00035/event, PostHog AI $0.01/credit, volume discounts</div>
  </a>
  <a href="https://posthog.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Platform add-ons</div>
    <div class="price">$250-$2,000<span>/mo</span></div>
    <div class="desc">Boost $250, Scale $750, Enterprise $2,000, on top of usage</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>LLM Analytics</h4>
    <ul>
      <li>Captures prompt, response, tokens, cost, latency and tool calls</li>
      <li>Traces linked to users, replays and exceptions</li>
      <li>Cost and latency dashboards</li>
      <li>Failure clustering and a prompt playground</li>
      <li>Evaluations and user feedback on traces</li>
      <li>Access via web app, MCP server or API</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>PostHog AI</h4>
    <ul>
      <li>Plain-English questions over your product data</li>
      <li>Writes SQL and builds insights and dashboards</li>
      <li>Creates surveys, alerts and feature flags</li>
      <li>Can start coding tasks on a connected repo that end in a PR</li>
      <li>Project memory across conversations; Slack access in beta</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Other Products</h4>
    <ul>
      <li>Product analytics and web analytics</li>
      <li>Session replay (web and mobile)</li>
      <li>Feature flags and experiments</li>
      <li>Error tracking, logs and surveys</li>
      <li>Data warehouse</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Open Source</h4>
    <ul>
      <li>MIT license, except the <code>ee</code> folder</li>
      <li>posthog-foss variant with proprietary code removed</li>
      <li>Hosted MCP server for Claude Code, Cursor, Codex, VS Code and Zed</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | PostHog | Langfuse | LangSmith |
|---------|---------|----------|-----------|
| Focus | <span class="highlight">Product platform + LLM analytics</span> | LLM engineering | LLM apps, LangChain |
| Open source | Yes (MIT core) | Yes (MIT) | No |
| Free LLM tier | <span class="highlight">100K events/mo</span> | 50K obs/mo | 5K traces/mo |
| Links traces to replays and users | <span class="highlight">Yes</span> | No | No |
| Prompt management | Playground | <span class="highlight">Built-in</span> | Built-in |
| Self-hosting | Hobby deploy only | <span class="highlight">Free, supported</span> | Enterprise |

</div>
