---
name: "Skyvern"
slug: "skyvern"
website: "https://www.skyvern.com/"
type: oss
track: developers
category: "agent-frameworks"
subcategory: "browser-agents"
status: active
description: "Open-source browser automation framework using computer vision and LLMs to navigate websites like humans, eliminating fragile selectors."
pricing_model: freemium
founded_year: 2023
headquarters: "San Francisco, California"
github_url: "https://github.com/skyvern-ai/skyvern"
github_stars: 22076
tags:
  - browser-automation
  - workflow-automation
last_verified: "2026-06-03"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">6,500+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">30,000+</span>
    <span class="label">Users</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Skyvern automates browser workflows by using computer vision and LLMs to interact with websites the way humans do—no brittle XPath selectors or manual maintenance. Teams use it to automate repetitive portal tasks: downloading invoices, filling forms, copying data, and navigating multi-step workflows. Available as Python/TypeScript SDKs or self-hosted via Docker, Skyvern integrates with agent frameworks through Model Context Protocol (MCP) and provides webhooks for workflow orchestration.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Skyvern?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams automating repetitive web portal tasks across multiple sites</li>
        <li>Organizations eliminating manual data entry and form filling</li>
        <li>Companies frustrated with fragile selector-based automation</li>
        <li>Developers building AI agents that need browser interaction capabilities</li>
        <li>Businesses wanting self-hosted automation infrastructure</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>High-speed scraping requiring sub-second response times</li>
        <li>Simple static page scraping without dynamic interaction</li>
        <li>Teams seeking fully managed cloud-only solutions</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Vision + LLM approach works across websites without site-specific code</li>
      <li>Self-hostable via Docker—full control over data and infrastructure</li>
      <li>Python and TypeScript SDKs integrate with existing codebases</li>
      <li>Model Context Protocol (MCP) ready for Claude, GPT, and Gemini agents</li>
      <li>Webhooks and event streaming for workflow orchestration</li>
      <li>Open-source community with active development and commercial support option</li>
    </ul>
    <div class="source"><a href="https://www.skyvern.com/" target="_blank">Official Site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>LLM-based automation slower than traditional selector-based scripts</li>
      <li>Costs associated with LLM API usage (OpenAI, Anthropic) when self-hosting</li>
      <li>Computer vision may struggle with highly dynamic or poorly designed UIs</li>
      <li>Requires infrastructure management expertise for production deployment</li>
    </ul>
    <div class="source"><a href="https://github.com/skyvern-ai/skyvern" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/skyvern-ai/skyvern" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-host with Docker Compose. Bring your own LLM API keys. Full feature access with no restrictions or usage limits.</div>
  </a>
  <a href="https://www.skyvern.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Cloud (Beta)</div>
    <div class="price">Contact</div>
    <div class="desc">Managed hosting with built-in LLM access, infrastructure management, and support. Currently in beta—contact for pricing.</div>
  </a>
  <a href="https://www.skyvern.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Dedicated infrastructure, custom SLAs, white-glove support, compliance certifications, and professional services.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Computer vision + LLM browser automation</li>
      <li>Python SDK: pip install skyvern</li>
      <li>TypeScript SDK with type safety</li>
      <li>Self-hostable via Docker Compose</li>
      <li>Model Context Protocol (MCP) support</li>
      <li>Webhooks and event streaming</li>
      <li>REST API for programmatic control</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Python 3.10+</li>
      <li>Node.js/TypeScript</li>
      <li>Docker containers</li>
      <li>Self-hosted deployment</li>
      <li>Cloud (managed) - beta</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Skyvern | Playwright MCP | Browserbase |
|---------|--------|--------------|--------------|
| Automation Method | Vision + LLM hybrid | Accessibility tree | Traditional + stealth |
| Selector Brittleness | Low (visual understanding) | Low (semantic structure) | High (requires selectors) |
| Deployment | Self-hosted + cloud | Self-hosted only | Cloud-only |
| Speed | Slower (LLM inference) | Fast (structured data) | Fast (direct control) |
| Best For | Complex multi-site workflows | MCP agent integration | Managed browser infrastructure |

</div>
