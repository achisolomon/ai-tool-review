---
name: "looot"
slug: "looot"
website: "https://looot.ai"
type: "commercial"
track: "developers"
category: "agent-frameworks"
subcategory: "tool-integrations"
status: "active"
description: "Pay-per-call gateway that gives AI agents one token and one prepaid USD balance for 2,500+ paid data API endpoints from 90+ providers, over MCP, CLI or REST"
github_url: "https://github.com/loootai/looot-mcp"
github_stars: 3
pricing_model: "freemium"
tags:
  - agents
  - mcp-server
  - api-available
  - typescript
  - python
last_verified: "2026-10-14"
confidence_score: 0.8
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">2,500+</span>
    <span class="label">Data endpoints</span>
  </div>
  <div class="key-stat">
    <span class="number">90+</span>
    <span class="label">Providers</span>
  </div>
  <div class="key-stat">
    <span class="number">$0</span>
    <span class="label">Failed calls</span>
  </div>
</div>

## Overview

<div class="overview">
<p>looot is a gateway to paid data APIs built for AI agents. Instead of signing up for a separate account, key and invoice with each data vendor, an agent gets one looot token and one prepaid USD balance. That covers web search and SERP data, work email lookup and verification, company and people enrichment, social profiles (LinkedIn, TikTok, Instagram, X), scraping, ads intelligence, maps and local business data.</p>
<p>The agent searches the catalog by the job it wants done, reads an endpoint's input fields and price, runs it, and then gets back the result plus a receipt with the charge for each attempt. Access is through a hosted MCP server, an npm CLI, or a REST API. A "job" can be served by several providers, and looot can fall back to the next provider inside a single cost hold. Calls that fail at the provider cost $0.</p>
<p>looot is very new. Its CLI was first published to npm in September 2026, and its terms of service (operated by AY Automate LLC) were still marked as a draft under legal review when we checked.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use looot?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Agent builders who need several paid data sources (SERP, email finding, enrichment, social) without managing a key and plan per vendor</li>
        <li>GTM and SEO automations where you want to see each call's price before it runs, and see a receipt after</li>
        <li>Low or spiky volume, where a vendor's monthly minimum would cost more than your actual usage</li>
        <li>Teams already using Claude Code, Cursor, Codex or another MCP client</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Connecting agents to your own SaaS accounts (Gmail, Slack, CRM). That is OAuth integration work, the job of Composio or Pipedream Connect</li>
        <li>High-volume, single-vendor workloads, where a direct contract usually beats provider cost plus a fee</li>
        <li>Buyers who need an established vendor, finalized legal terms, or published compliance attestations</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>One token and one prepaid balance cover 2,500+ endpoints from 90+ providers. No subscription, no seats, no auto top-up unless you turn it on</li>
      <li>You see the price before you run. Search, inspect, catalog browsing and balance checks are free</li>
      <li>Calls that fail at the provider cost $0, and a retry with the same idempotency key is charged once</li>
      <li>Fallback across providers for the same job runs inside one hold, and a multi-provider route never charges more than that hold</li>
      <li>Per-attempt receipts show what each provider actually cost</li>
      <li>Bring your own provider key at no markup</li>
      <li>Wide client coverage: hosted MCP, CLI, REST, MIT-licensed SDKs and plugins for LangChain, Vercel AI SDK, n8n, Dify and IDEs</li>
    </ul>
    <div class="source"><a href="https://looot.ai/" target="_blank" rel="noopener">Official Site</a> · <a href="https://looot.ai/pricing" target="_blank" rel="noopener">Pricing</a> · <a href="https://docs.looot.ai/money/free-and-failures" target="_blank" rel="noopener">Docs: What's free</a> · <a href="https://github.com/loootai" target="_blank" rel="noopener">GitHub org</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>On the platform key you pay provider cost plus a fee. The fee is shown before each run, but its rate is not published on the pricing page</li>
      <li>Not every miss is free: some providers bill a flat rate on every call, so a "not found" answer can still be charged</li>
      <li>Single-provider runs can settle at up to 3x the hold when a provider reports a higher charge. Only multi-provider routes are capped at the hold</li>
      <li>The service is very new: CLI first published September 2026, no independent user reviews yet, and the core CLI is not open source</li>
      <li>The terms of service were marked "Draft, under legal review" when we checked</li>
    </ul>
    <div class="source"><a href="https://looot.ai/pricing" target="_blank" rel="noopener">Pricing</a> · <a href="https://docs.looot.ai/money/settlement-ceiling" target="_blank" rel="noopener">Docs: Settlement ceiling</a> · <a href="https://docs.looot.ai/money/cost-cap" target="_blank" rel="noopener">Docs: Cost cap</a> · <a href="https://looot.ai/terms" target="_blank" rel="noopener">Terms</a> · <a href="https://www.npmjs.com/package/looot" target="_blank" rel="noopener">npm</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://looot.ai/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Browse</div>
    <div class="price">$0</div>
    <div class="desc">Search the catalog and inspect endpoint prices without an account</div>
  </a>
  <a href="https://looot.ai/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Platform key</div>
    <div class="price">Pay per call</div>
    <div class="desc">Prepaid USD balance, $5 minimum top-up. Provider cost plus a disclosed fee shown before each run. Examples: web search from $0.0009, email lookup from $0.0036</div>
  </a>
  <a href="https://looot.ai/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Your own key</div>
    <div class="price">No markup</div>
    <div class="desc">Use your own provider account and pay that provider's rates, with no looot charge</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Catalog (as of 2026-10-07)</h4>
    <ul>
      <li>Social data: 995 jobs, 16 providers</li>
      <li>Enrichment: 223 jobs, 45 providers</li>
      <li>Search & SERP: 211 jobs, 15 providers</li>
      <li>Ads intelligence: 197 jobs, 13 providers</li>
      <li>Market data: 118 jobs, 6 providers</li>
      <li>Maps & local, scrapers, e-commerce, reviews, generative AI, developer data</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Run model</h4>
    <ul>
      <li>Quote, then hold, then provider call, then settle or refund</li>
      <li>Jobs with automatic provider fallback</li>
      <li>"Free first": free rows and providers that bill only on a found result are tried first</li>
      <li>Cost cap per route (maxCostUsd)</li>
      <li>Idempotency keys on every run</li>
      <li>Normalized output for email, phone, company and scraping jobs</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Access</h4>
    <ul>
      <li>Hosted MCP server (streamable HTTP)</li>
      <li>npm CLI (Node 20+)</li>
      <li>REST API</li>
      <li>Plugin for Claude Code, Codex and Cursor</li>
      <li>TypeScript and Python SDKs</li>
      <li>LangChain, Vercel AI SDK, n8n, Dify, Activepieces, VS Code, Zed, JetBrains</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Money</h4>
    <ul>
      <li>One prepaid USD balance per workspace</li>
      <li>No subscription or monthly fee</li>
      <li>Unused balance can be refunded on request</li>
      <li>Agent-readable docs (llms.txt) and a docs MCP server</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | looot | Composio | Pipedream Connect |
|---------|-------|----------|-------------------|
| What it connects | <span class="highlight">Paid third-party data APIs</span> | Your own SaaS apps | Your own SaaS apps |
| Coverage | 2,500+ endpoints, 90+ providers | 1,000+ apps | 2,700+ apps |
| Who holds provider accounts | looot (or bring your own key) | You, via OAuth | You, via OAuth |
| Billing | <span class="highlight">Prepaid, per call, $0 on failure</span> | Monthly plans | Monthly plans |
| Maturity | Launched 2026 | Founded 2023 | Founded 2019 |
| Best For | Agent data lookups and enrichment | Multi-tool agents | Serverless workflows |

</div>
