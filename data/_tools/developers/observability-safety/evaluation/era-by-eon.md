---
name: "Era by Eon"
slug: "era-by-eon"
website: "https://era.eon.io/"
type: "saas"
track: "developers"
category: "observability-safety"
subcategory: "evaluation"
status: "beta"
description: "Free simulated companies for testing AI agents: emulated Salesforce, Slack, Jira, Zendesk and more with synthetic data, served over MCP and REST."
pricing_model: "free"
founded_year: 2026
headquarters: "New York, NY and Tel Aviv, Israel"
tags:
  - agents
  - mcp-server
  - sandboxes
  - cli
  - free
last_verified: "2026-10-28"
confidence_score: 0.8
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">For Builders</span>
  </div>
  <div class="key-stat">
    <span class="number">14+</span>
    <span class="label">Emulated SaaS Systems</span>
  </div>
  <div class="key-stat">
    <span class="number">2026</span>
    <span class="label">Launched (Oct)</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Era is a test environment for AI agents from Eon, the cloud backup company. It generates a complete simulated company on demand: emulated business systems such as Salesforce, Slack, Jira, Zendesk, Gong and Google Drive, filled with synthetic employees, customers, deals and years of history that stay consistent across every system. Your agent connects over per-system MCP endpoints or vendor-compatible REST APIs, so you can test it against a whole software stack instead of mocks or real customer data.</p>
<p>Era launched on October 5, 2026 and is free for builders. Access is granted per account, and the data plane is read-only for now, so it suits evaluating how agents find and reason over enterprise knowledge more than testing agents that write back to systems. Eon also published arXiv research on benchmarking enterprise agents with the same generated companies.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Era by Eon?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building enterprise agents that search across CRM, ticketing, chat and docs</li>
        <li>Evaluating multi-hop retrieval over realistic, cross-linked company data</li>
        <li>Demos and CI tests that must never touch real customer records</li>
        <li>Agent builders on Claude Code, Cursor, Codex or Devin (plugins available)</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Testing agents that create or update records (writes return an error today)</li>
        <li>Replacing staging or production testing on your real systems</li>
        <li>Teams that need every vendor feature replicated exactly</li>
        <li>Anyone who needs instant self-serve access without an account grant</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Free, with nothing to install: generate a company in the browser console</li>
      <li>The same people, customers and deals appear across every emulated system</li>
      <li>Fully synthetic data, so no customer data is exposed during testing</li>
      <li>Sits between artificial public benchmarks and private evals nobody can verify</li>
      <li>MCP, REST, CLI, Docker images for offline CI, and coding-agent plugins</li>
    </ul>
    <div class="source"><a href="https://console.era.eon.io/llms.txt" target="_blank">Era docs</a> - <a href="https://runtimewire.com/article/eon-era-simulated-enterprise-agent-testing" target="_blank">RuntimeWire</a> - <a href="https://em360tech.com/tech-articles/synthetic-enterprises-for-ai-benchmarks" target="_blank">EM360Tech</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Read-only data plane: write calls are rejected</li>
      <li>Emulated APIs do not replace testing on production systems</li>
      <li>Realism is scored against targets, not checked against a real company</li>
      <li>Access is granted per account; some connectors are still "coming soon"</li>
      <li>Very new, with no independent user reviews yet</li>
    </ul>
    <div class="source"><a href="https://console.era.eon.io/llms.txt" target="_blank">Era docs</a> - <a href="https://www.eon.io/blog/era-build-and-test-ai-agents" target="_blank">Eon blog</a> - <a href="https://arxiv.org/abs/2609.30055" target="_blank">arXiv paper</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://era.eon.io/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Builders</div>
    <div class="price">Free</div>
    <div class="desc">Generate simulated companies; API requests and MCP tool calls are metered per account</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Emulated Systems</h4>
    <ul>
      <li>Salesforce and HubSpot</li>
      <li>Slack, Gmail and Google Calendar</li>
      <li>Jira, Confluence, GitHub and ServiceNow</li>
      <li>Zendesk and Gong</li>
      <li>Google Drive, SharePoint and Notion</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Ways to Connect</h4>
    <ul>
      <li>Browser console wizard</li>
      <li>CLI (<code>era init</code>, <code>era new</code>)</li>
      <li>Per-system MCP endpoints plus a console MCP server</li>
      <li>Vendor-compatible REST APIs</li>
      <li>Docker images for offline CI</li>
      <li>Plugins for Claude Code, Cursor, Codex and Devin</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Benchmarking agents on hidden enterprise knowledge</li>
      <li>Regression tests for agent workflows in CI</li>
      <li>Safe product demos with realistic data</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>About Eon</h4>
    <ul>
      <li>Cloud backup company founded in 2024 by ex-CloudEndure founders</li>
      <li>Emerged from stealth with $127M in funding (<a href="https://techcrunch.com/2024/10/01/eon-emerges-from-stealth-with-127m-to-bring-a-fresh-approach-to-back-up-cloud-infrastructure" target="_blank">TechCrunch</a>)</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Era by Eon | Klavis Sandbox | WireMock Cloud |
|---------|------------|----------------|----------------|
| What it simulates | A whole company across many SaaS systems | Individual SaaS tools as MCP sandboxes | Any HTTP API you define |
| Data | Generated, cross-linked company history | Resettable tool state | Your own stubs and recordings |
| Agent access | MCP + vendor-compatible REST | MCP | MCP integration + HTTP |
| Writes | Read-only today | Yes | Yes |
| Price | Free for builders | See vendor site | See vendor site |

</div>
