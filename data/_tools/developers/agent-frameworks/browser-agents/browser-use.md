---
name: "Browser Use"
slug: "browser-use"
website: "https://browser-use.com/"
type: "oss"
track: "developers"
category: "agent-frameworks"
subcategory: "browser-agents"
status: "active"
description: "Make websites accessible for AI agents. Automate tasks online with ease."
github_url: "https://github.com/browser-use/browser-use"
github_stars: 105796
pricing_model: "open-source"
founded_year: 2024
headquarters: "Zurich, Switzerland"
tags:
  - agents
  - browser-automation
  - python
last_verified: "2026-06-02"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">96.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">10.8K</span>
    <span class="label">Forks</span>
  </div>
  <div class="key-stat">
    <span class="number">1000+</span>
    <span class="label">Integrations</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Browser Use is an open-source Python library that enables AI agents to automate browser tasks using natural language. Built on Playwright, it allows any LLM (GPT-4, Claude, Gemini, or local models via Ollama) to interact with websites just like a human - clicking, typing, navigating, and extracting data. The project exploded in popularity since its October 2024 launch, a browser automation framework for AI agents. It supports both local self-hosted deployment and a managed cloud service with stealth browsing, proxy rotation, and CAPTCHA solving.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Browser Use?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers building AI-powered web scrapers</li>
        <li>Automating form filling and data entry</li>
        <li>Teams needing LLM-agnostic browser agents</li>
        <li>Projects requiring custom tool integrations</li>
        <li>Rapid prototyping of browser automation</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple scraping (use Playwright directly)</li>
        <li>Non-developers (no low-code UI)</li>
        <li>Production at scale without Cloud</li>
        <li>Sites with aggressive bot detection</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Fully open source with MIT license</li>
      <li>Works with any LLM provider (OpenAI, Anthropic, Google, Ollama)</li>
      <li>Simple async Python API with just a few lines of code</li>
      <li>Built-in CLI for rapid testing and iteration</li>
      <li>Claude Code skill integration available</li>
      <li>Active development with frequent releases</li>
      <li>Active community with frequent contributions and forks</li>
    </ul>
    <div class="source"><a href="https://github.com/browser-use/browser-use" target="_blank">GitHub</a> - <a href="https://docs.browser-use.com" target="_blank">Official Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires LLM API costs (unless using local models)</li>
      <li>CAPTCHA handling needs Cloud subscription</li>
      <li>High memory usage with Chrome instances</li>
      <li>252 open issues on GitHub</li>
      <li>Production scaling requires managed Cloud</li>
    </ul>
    <div class="source"><a href="https://github.com/browser-use/browser-use/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/browser-use/browser-use" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, MIT license, full features</div>
  </a>
  <a href="https://cloud.browser-use.com" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Browser Use Cloud</div>
    <div class="price">Usage-based</div>
    <div class="desc">Stealth browsers, proxies, CAPTCHA solving</div>
  </a>
  <a href="https://docs.browser-use.com/supported-models" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">ChatBrowserUse LLM</div>
    <div class="price">$0.20<small>/1M in</small></div>
    <div class="desc">Optimized model, $2/1M output tokens</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>LLM-driven browser automation</li>
      <li>Natural language task descriptions</li>
      <li>Multi-step task execution</li>
      <li>Element detection and interaction</li>
      <li>Screenshot capture and analysis</li>
      <li>Form filling automation</li>
      <li>Data extraction and scraping</li>
      <li>Custom tool/action support</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported LLMs</h4>
    <ul>
      <li>ChatBrowserUse (optimized)</li>
      <li>OpenAI GPT-4/GPT-4o</li>
      <li>Anthropic Claude 3.5/4</li>
      <li>Google Gemini</li>
      <li>Ollama (local models)</li>
      <li>Any LangChain-compatible LLM</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Developer Tools</h4>
    <ul>
      <li>Async Python API</li>
      <li>CLI for rapid prototyping</li>
      <li>Template quickstart system</li>
      <li>Claude Code skill</li>
      <li>MCP server support</li>
      <li>Real browser profile support</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Cloud Features</h4>
    <ul>
      <li>Stealth browser fingerprinting</li>
      <li>Proxy rotation</li>
      <li>CAPTCHA solving</li>
      <li>1000+ integrations</li>
      <li>Persistent filesystem</li>
      <li>Memory across sessions</li>
    </ul>
  </div>
</div>

</details>

## Use Cases

<div class="info-grid">
  <div class="info-card">
    <h4>Automation Examples</h4>
    <ul>
      <li>Job application form filling</li>
      <li>Grocery shopping automation</li>
      <li>PC parts comparison shopping</li>
      <li>Data extraction from websites</li>
      <li>Account management tasks</li>
    </ul>
    <div class="source"><a href="https://github.com/browser-use/browser-use/tree/main/examples" target="_blank">GitHub Examples</a></div>
  </div>
  <div class="info-card">
    <h4>Community Stats</h4>
    <ul>
      <li>10,800+ forks</li>
      <li>435 watchers</li>
      <li>Active Discord community</li>
      <li>Made in Zurich & San Francisco</li>
    </ul>
    <div class="source"><a href="https://github.com/browser-use/browser-use" target="_blank">GitHub, June 2026</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Browser Use | Playwright MCP | Stagehand (Browserbase) |
|---------|-------------|----------------|-------------------------|
| GitHub Stars | <span class="highlight">96.7K</span> | 33.4K | 22.9K |
| LLM Agnostic | <span class="highlight">Yes, any LLM</span> | MCP-based | Yes |
| Self-Hosted | <span class="highlight">Full OSS</span> | Yes | Yes |
| Cloud Option | Yes | No | Yes |
| CAPTCHA Solving | Cloud only | No | Cloud only |
| Custom Tools | <span class="highlight">Yes</span> | Limited | Yes |
| CLI Tool | <span class="highlight">Yes</span> | No | No |
| Python Native | <span class="highlight">Yes</span> | TypeScript | TypeScript |
| License | MIT | Apache 2.0 | MIT |
| Best For | LLM browser agents | MCP integrations | SDK development |

</div>
