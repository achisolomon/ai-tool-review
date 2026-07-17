---
name: "Invariant Guardrails"
slug: "invariant-guardrails"
website: "https://invariantlabs.ai/guardrails"
type: "oss"
track: "developers"
category: "security"
subcategory: "preventing-prompt-injection"
status: "active"
description: "Rule-based security layer for LLM and MCP agents that intercepts traffic to catch prompt injection, PII, secrets, and tool poisoning"
pricing_model: "freemium"
founded_year: 2024
headquarters: "Zurich, Switzerland"
github_url: "https://github.com/invariantlabs-ai/invariant"
github_stars: 434
tags:
  - prompt-injection
  - mcp-security
  - agent-security
  - self-hosted
last_verified: "2026-07-14"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">432+</span>
    <span class="label">GitHub Stars (core repo)</span>
  </div>
  <div class="key-stat">
    <span class="number">MCP</span>
    <span class="label">Native Support</span>
  </div>
  <div class="key-stat">
    <span class="number">2024</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Invariant Guardrails is a rule-based security layer for LLM- and MCP-powered agents, built by Invariant Labs, an ETH Zurich spin-off founded in 2024 by professors Martin Vechev and Florian Tramèr along with three of their graduate students. Guardrails is deployed transparently between an application and its MCP servers or LLM provider, intercepting tool calls and model traffic before or after execution to detect prompt injection, PII, secrets, copyrighted material, tool-poisoning attacks, and other harmful or unwanted content, all expressed through a Python-inspired policy language. It ships alongside two companion open-source projects: Invariant Gateway, a lightweight LLM/MCP proxy used to enforce Guardrails rules at runtime and trace agent behavior, and MCP-Scan, a dedicated scanner that audits installed MCP servers for prompt injection in tool descriptions, tool-poisoning attacks, and cross-origin (tool-shadowing) escalations. In June 2025, less than a year after founding, Invariant Labs was acquired by Snyk and now operates as part of Snyk Labs, feeding into Snyk's broader AI Trust Platform; the core Guardrails and Gateway repositories remain open source under Apache 2.0, while MCP-Scan has since been rebranded and continued under Snyk as "agent-scan."</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Invariant Guardrails?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building MCP-connected agents that need to intercept and vet tool calls, not just chat messages</li>
        <li>Developers who want a transparent proxy layer (Gateway) rather than rewriting application code to add guardrails</li>
        <li>Organizations wanting a self-hosted, rule-based policy engine with a Python-like DSL for custom detection logic</li>
        <li>Security teams that also want to periodically scan installed MCP servers for tool poisoning via MCP-Scan / agent-scan</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting a fully independent vendor unaffected by post-acquisition roadmap or pricing changes under Snyk</li>
        <li>Non-MCP, single-turn chatbot use cases where a lighter input classifier would suffice</li>
        <li>Projects that need a very large, battle-tested community project—Guardrails and Gateway are still relatively small compared to some alternatives</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Purpose-built for MCP: detects prompt injection in tool descriptions, tool-poisoning attacks, and cross-origin/tool-shadowing escalations, gaps most general-purpose guardrail tools miss</li>
      <li>Transparent proxy deployment (Gateway) means no invasive code changes to the agent or LLM client</li>
      <li>Rule/policy language covers PII, secrets, copyrighted content, prompt injection, and harmful content in one framework</li>
      <li>Backed by security researchers with a strong publication track record on MCP vulnerabilities (e.g., the GitHub MCP exploit, tool-poisoning disclosures)</li>
      <li>Core Guardrails and Gateway code is open source under Apache 2.0 and self-hostable</li>
    </ul>
    <div class="source"><a href="https://github.com/invariantlabs-ai/invariant" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Now owned by Snyk following the June 2025 acquisition; long-term product direction, pricing, and open-source commitment could shift as it's folded into Snyk's AI Trust Platform</li>
      <li>MCP-Scan has already been renamed/relocated to "agent-scan" under the Snyk GitHub org, signaling active restructuring of the project family</li>
      <li>Smaller community than some competing guardrail frameworks—both Guardrails and Gateway are modest in size relative to adjacent security tooling</li>
      <li>Hosted/managed features (Explorer, dashboards) sit alongside the OSS core, so getting full value may require the commercial platform</li>
    </ul>
    <div class="source"><a href="https://invariantlabs.ai/guardrails" target="_blank">Product Site</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/invariantlabs-ai/invariant" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted Guardrails + Gateway, Apache 2.0 licensed</div>
  </a>
  <a href="https://invariantlabs.ai/guardrails" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Managed / Enterprise (Snyk)</div>
    <div class="price">Custom</div>
    <div class="desc">Hosted platform, Explorer dashboards, support, and MCP-Scan/agent-scan integration via Snyk's AI Trust Platform</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Transparent MCP/LLM proxy (Invariant Gateway) that intercepts traffic before/after execution without code changes</li>
      <li>Python-inspired rule/policy language for custom guardrail logic and if-this-then-that style controls</li>
      <li>PII and secrets detection across agent conversations and tool outputs</li>
      <li>Prompt injection detection, including indirect injection hidden in tool descriptions or retrieved content</li>
      <li>Tool-poisoning and cross-origin/tool-shadowing escalation detection via companion MCP-Scan (now agent-scan)</li>
      <li>Static code analysis, image OCR, and HTML parsing to catch hidden threats in agent interactions</li>
      <li>Copyright and harmful/unwanted content detection</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Adding a security/observability layer between an agent and its MCP servers without modifying the agent's code</li>
      <li>Blocking tool-poisoning and prompt-injection attacks embedded in MCP tool descriptions or server responses</li>
      <li>Auditing installed MCP servers (Claude Desktop, Cursor, Claude Code, Gemini CLI, etc.) for known vulnerability classes</li>
      <li>Enforcing data-flow rules, e.g., preventing PII or secrets from crossing between tools or leaving the agent boundary</li>
      <li>Debugging and tracing agent/tool call behavior via the Gateway's logging and Explorer integration</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Invariant Guardrails | LlamaFirewall | Bifrost |
|---------|------------------------|----------------|---------|
| Deployment | <span class="highlight">Transparent MCP/LLM proxy (Gateway)</span> | Self-hosted Python SDK | Self-hosted proxy |
| MCP-Specific Threat Detection | <span class="highlight">Tool poisoning, cross-origin escalation, injected tool descriptions (via MCP-Scan/agent-scan)</span> | Not MCP-specific | Not MCP-specific |
| Policy Language | <span class="highlight">Custom Python-inspired rule DSL</span> | Configurable scanners + regex | Config-based routing rules |
| PII / Secrets Detection | Yes | Limited (regex/custom scanners) | Varies by plugin |
| Code / Reasoning Auditing | Static code analysis, OCR, HTML parsing | AlignmentCheck (chain-of-thought auditing) | No |
| License | Apache 2.0 (core repos) | MIT (framework); Llama Community License (models) | Apache 2.0 |
| Backing | Snyk (acquired Invariant Labs, June 2025) | Meta (Purple Llama) | Independent / VC-backed |

</div>
