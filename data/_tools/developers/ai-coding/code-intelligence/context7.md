---
name: "Context7"
slug: "context7"
website: "https://context7.com/"
type: "commercial"
track: "developers"
category: "ai-coding"
subcategory: "code-intelligence"
status: "active"
description: "MCP server and documentation platform that injects up-to-date, version-specific library docs directly into AI coding assistant prompts to eliminate hallucinated APIs and outdated code examples"
github_url: "https://github.com/upstash/context7"
github_stars: 57890
pricing_model: "freemium"
founded_year: 2025
headquarters: "San Francisco, CA"
tags:
  - mcp-server
  - api-available
  - typescript
  - coding
  - rag
last_verified: "2026-06-17"
confidence_score: 0.95
source_urls:
  - "https://context7.com/"
  - "https://context7.com/plans"
  - "https://github.com/upstash/context7"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">57.5K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">1,000</span>
    <span class="label">Free API Calls/mo</span>
  </div>
  <div class="key-stat">
    <span class="number">70+</span>
    <span class="label">Supported Agents</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Context7 is an MCP (Model Context Protocol) server that pulls up-to-date, version-specific documentation and code examples from official library sources and injects them directly into your AI coding assistant's prompt. Built by Upstash, it solves a fundamental LLM limitation: coding agents trained on stale data hallucinate APIs that don't exist and generate patterns that have been deprecated. With Context7, you simply add "use context7" to any prompt — the MCP tool fetches current docs from the source and grounds the model's response in verified, version-accurate information. Works with Claude Code, Cursor, Copilot, Gemini CLI, Cline, and most MCP-compatible editors.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Context7?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers working with fast-moving frameworks (Next.js, React, Tailwind, etc.)</li>
        <li>Teams where hallucinated or outdated API calls are a recurring problem</li>
        <li>AI coding workflows using Claude Code, Cursor, or Copilot via MCP</li>
        <li>Anyone tired of AI generating code for APIs that no longer exist</li>
        <li>Projects targeting specific library versions where accuracy matters</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams not using MCP-compatible AI editors</li>
        <li>Projects using obscure or private internal libraries (not indexed)</li>
        <li>Heavy private repo documentation needs (requires paid plan)</li>
        <li>Non-coding AI workflows</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Eliminates hallucinated APIs by grounding LLMs in current docs</li>
      <li>Version-specific documentation — not just latest, but exactly your version</li>
      <li>Single phrase trigger ("use context7") — zero workflow friction</li>
      <li>MCP-native: integrates with any MCP-compatible AI coding tool</li>
      <li>2-minute setup via GitHub</li>
      <li>Large, active GitHub community — strong adoption signal</li>
      <li>Free tier covers 1,000 API calls/month for individuals</li>
    </ul>
    <div class="source"><a href="https://context7.com/" target="_blank" rel="noopener">Official Site</a> · <a href="https://github.com/upstash/context7" target="_blank" rel="noopener">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Free plan capped at 1,000 API calls/month — daily limit after that</li>
      <li>Private repo documentation requires paid plan ($25/1M tokens)</li>
      <li>Coverage depends on which libraries are indexed in the directory</li>
      <li>MCP dependency — no standalone CLI or non-MCP integration</li>
    </ul>
    <div class="source"><a href="https://context7.com/plans" target="_blank" rel="noopener">Pricing Page</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://context7.com/plans" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">1,000 API calls/month · public repos only · 20 bonus calls/day after limit</div>
  </a>
  <a href="https://context7.com/plans" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$10/seat/mo</div>
    <div class="desc">5,000 API calls/seat · private repos at $25/1M tokens · team collaboration</div>
  </a>
  <a href="https://context7.com/plans" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">5,000 calls/seat · SOC-2 · SSO (SAML/OIDC) · self-hosted option · dedicated SLA</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>How It Works</h4>
    <ul>
      <li>Add "use context7" to any AI coding prompt</li>
      <li>MCP tool fetches current docs from official library sources</li>
      <li>Version-specific content injected directly into prompt context</li>
      <li>Works alongside your existing AI editor — no workflow changes</li>
      <li>Full docs index at context7.com/docs/llms.txt</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Editors</h4>
    <ul>
      <li>Claude Code</li>
      <li>Cursor</li>
      <li>GitHub Copilot</li>
      <li>Gemini CLI</li>
      <li>Cline</li>
      <li>Any MCP-compatible AI editor</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Enterprise Features</h4>
    <ul>
      <li>SOC-2 compliance</li>
      <li>SSO via SAML / OIDC</li>
      <li>Self-hosted deployment option</li>
      <li>Teamspaces up to 50 members (self-serve)</li>
      <li>Dedicated support with SLA</li>
      <li>Usage and billing dashboard</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Key Integrations</h4>
    <ul>
      <li>MCP (Model Context Protocol) native</li>
      <li>GitHub — for private repo access</li>
      <li>OAuth 2.0 access control</li>
      <li>API access for programmatic use</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Context7 | Sourcegraph | Serena MCP |
|---------|-----------|-------------|------------|
| Primary Use | <span class="highlight">Live doc injection</span> | Code search/nav | Code understanding |
| MCP Native | <span class="highlight">Yes</span> | Partial | Yes |
| Trigger | <span class="highlight">"use context7"</span> | Manual search | Automatic |
| Private Repos | Paid ($25/1M tokens) | Yes | Yes |
| Version-specific Docs | <span class="highlight">Yes</span> | No | No |
| GitHub Stars | 57.5K | ~10K | ~3K |
| Pricing | Freemium | Enterprise | Free |
| Built By | Upstash | Sourcegraph | Community |

</div>
