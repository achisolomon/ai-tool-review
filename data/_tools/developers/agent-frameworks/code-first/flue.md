---
name: Flue
slug: flue
website: https://flueframework.com
github_url: https://github.com/withastro/flue
github_stars: 8052
type: open-source
track: developers
category: agent-frameworks
subcategory: code-first
status: active
description: The agent harness framework — build autonomous agents with TypeScript,
  deploy anywhere from Node.js to Cloudflare Workers
pricing_model: free
founded_year: 2026
headquarters: "—"
tags:
- agents
- typescript
last_verified: '2026-06-11'
confidence_score: 0.94
---
<div class="key-stats">
  <div class="key-stat">
    <span class="number">4.9K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">6+</span>
    <span class="label">Deploy Targets</span>
  </div>
  <div class="key-stat">
    <span class="number">Astro</span>
    <span class="label">Team</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Flue is the agent harness framework from Fred K. Schott (Astro co-founder), introduced in May 2026 as a TypeScript framework for building truly autonomous agents. Unlike simple chatbots, Flue agents maintain context across conversations and work toward goals autonomously. It's runtime-agnostic — think Astro or Next.js, but for agents — letting you write once and deploy to Node.js, Cloudflare Workers, GitHub Actions, GitLab CI/CD, and more. Flue is 100% headless and programmable with no TUI, no GUI, and no assumption of a human operator. Most agent logic lives in Markdown (skills, context, AGENTS.md), keeping TypeScript code minimal.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Flue?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building headless, programmable agents for CI/CD</li>
        <li>Developers wanting Astro-like DX for agent development</li>
        <li>Projects needing multi-runtime deployment (Node, Cloudflare, etc.)</li>
        <li>Organizations requiring sandboxed, secure agent execution</li>
        <li>Teams preferring Markdown-first agent configuration</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Users wanting interactive TUI/GUI experiences</li>
        <li>Simple chatbot use cases</li>
        <li>Python-only teams (though PyFlue exists)</li>
        <li>Quick prototyping without deployment needs</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>From Astro team — proven DX expertise</li>
      <li>Runtime-agnostic: Node.js, Cloudflare, GitHub Actions, GitLab CI</li>
      <li>Built-in sandboxes for secure agent execution</li>
      <li>Durable execution — progress survives failures and restarts</li>
      <li>MCP server integration out of the box</li>
      <li>OpenTelemetry, Braintrust, Sentry observability</li>
      <li>Slack, Teams, Discord, GitHub chat integrations</li>
      <li>PyFlue port available for Python teams</li>
    </ul>
    <div class="source"><a href="https://flueframework.com" target="_blank">Official Site</a> · <a href="https://github.com/withastro/flue" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>No TUI/GUI — fully headless by design</li>
      <li>Requires Node.js 22.18.0+</li>
      <li>Newer framework (launched May 2026)</li>
      <li>TypeScript-focused (Python port separate)</li>
    </ul>
    <div class="source"><a href="https://flueframework.com/docs/" target="_blank">Documentation</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/withastro/flue" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0 licensed</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Concepts</h4>
    <ul>
      <li>Agents — autonomous goal-driven workers</li>
      <li>Workflows — structured automations</li>
      <li>Sandboxes — secure execution environments</li>
      <li>Subagents — specialized delegation</li>
      <li>Tools — typed API actions</li>
      <li>Skills — reusable expertise packages</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>CLI Commands</h4>
    <ul>
      <li>flue dev — watch-mode dev server</li>
      <li>flue run — one-shot CI invocations</li>
      <li>flue build — deployable artifacts</li>
      <li>flue connect — connect to agent</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deploy Targets</h4>
    <ul>
      <li>Node.js</li>
      <li>Cloudflare Workers</li>
      <li>GitHub Actions</li>
      <li>GitLab CI/CD</li>
      <li>Daytona</li>
      <li>Render</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>LLM Providers</h4>
    <ul>
      <li>Anthropic Claude</li>
      <li>OpenAI</li>
      <li>Google Gemini</li>
      <li>Moonshot Kimi</li>
      <li>OpenRouter (any model)</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Flue | Pi | Claude Code | LangChain |
|---------|------|----|-----------| ---------|
| Philosophy | <span class="highlight">Headless framework</span> | Minimal harness | Interactive CLI | SDK |
| Deploy Targets | <span class="highlight">6+ runtimes</span> | Local only | Local only | Varies |
| Sandboxes | <span class="highlight">Built-in</span> | No | No | No |
| MCP Support | <span class="highlight">Native</span> | Extension | Native | Plugin |
| Durable Execution | <span class="highlight">Yes</span> | No | No | No |
| GitHub Stars | 4.9K | 62K | 30K+ | 100K+ |

</div>
