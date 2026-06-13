---
name: "Repo Forensics"
slug: "repo-forensics"
website: "https://github.com/alexgreensh/repo-forensics"
type: "open-source"
track: "developers"
category: "security"
subcategory: "security-scanning"
status: "active"
description: "Offline security scanner for auditing untrusted repositories, AI agent skills, plugins, and MCP servers before installation"
github_url: "https://github.com/alexgreensh/repo-forensics"
github_stars: 105
pricing_model: "free"
last_verified: "2026-06-03"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">20</span>
    <span class="label">Scanners</span>
  </div>
  <div class="key-stat">
    <span class="number">41</span>
    <span class="label">Correlation Rules</span>
  </div>
  <div class="key-stat">
    <span class="number">1,306</span>
    <span class="label">Tests</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Repo Forensics is an offline security scanner designed to audit untrusted repositories, AI agent skills, plugins, and MCP servers before installation. It performs comprehensive security scanning with 20 specialized scanners covering prompt injection, unicode smuggling, MCP server security, dependency vulnerabilities, installation hook exploitation, git history forensics, and more. The correlation engine uses 41 rules to connect findings across scanners and identify compound attack chains. Fully offline with zero dependencies—your code never leaves your machine.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Repo Forensics?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Security-conscious developers vetting plugins</li>
        <li>Teams adopting AI coding agents</li>
        <li>MCP server evaluation workflows</li>
        <li>Post-incident forensic analysis</li>
        <li>Supply chain security audits</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Runtime security monitoring</li>
        <li>Network-based threat detection</li>
        <li>General-purpose SAST tools</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Zero dependencies—no pip, Docker, or APIs</li>
      <li>Fully offline, no telemetry</li>
      <li>AI agent ecosystem focus (skills, MCP, plugins)</li>
      <li>CVE + CISA KEV integration</li>
      <li>Runtime behavior prediction</li>
      <li>Battle-tested against real supply chain attacks</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/repo-forensics" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Newer project (94 stars)</li>
      <li>Manual setup for some platforms</li>
      <li>Focused scope—not a full SAST replacement</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/repo-forensics" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/alexgreensh/repo-forensics" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Full scanner suite included</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>20 Specialized Scanners</h4>
    <ul>
      <li>Prompt injection detection</li>
      <li>Unicode smuggling detection</li>
      <li>MCP server security analysis</li>
      <li>Dependency vulnerability scanning</li>
      <li>Known-malicious package detection</li>
      <li>Installation hook exploitation</li>
      <li>Git history forensics</li>
      <li>Binary & steganographic payloads</li>
      <li>Dataflow taint tracking</li>
      <li>Secrets detection</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Runtime Prediction</h4>
    <ul>
      <li>Time bomb detection</li>
      <li>Deferred payload analysis</li>
      <li>Phantom dependency detection</li>
      <li>Self-modifying code detection</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Correlation Engine</h4>
    <ul>
      <li>41 cross-scanner rules</li>
      <li>Compound attack chain identification</li>
      <li>CVE + CISA KEV matching</li>
      <li>Active exploit prioritization</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platform Support</h4>
    <ul>
      <li>Claude Code (auto-wired)</li>
      <li>Codex CLI (auto-wired)</li>
      <li>OpenClaw (manual setup)</li>
      <li>Cursor (CLI only)</li>
      <li>NanoClaw (CLI only)</li>
    </ul>
  </div>
</div>

</details>

## Real-World Testing

<div class="info-grid">
  <div class="info-card">
    <h4>Battle-Tested Against</h4>
    <ul>
      <li>Shai-Hulud campaign</li>
      <li>Chalk phishing attacks</li>
      <li>DuckDB compromise patterns</li>
      <li>Known supply chain attacks</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/repo-forensics" target="_blank">GitHub README</a></div>
  </div>
  <div class="info-card">
    <h4>Language Support</h4>
    <ul>
      <li>Static analysis across 8 languages</li>
      <li>Infrastructure misconfiguration</li>
      <li>Multi-language dataflow tracking</li>
    </ul>
    <div class="source"><a href="https://github.com/alexgreensh/repo-forensics" target="_blank">GitHub</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Repo Forensics | Snyk | Dependabot |
|---------|----------------|------|------------|
| Offline Operation | <span class="highlight">Yes, fully</span> | No | No |
| AI Agent Focus | <span class="highlight">MCP, skills, plugins</span> | General | Dependencies only |
| Prompt Injection | <span class="highlight">Yes</span> | No | No |
| Supply Chain Attacks | <span class="highlight">1,306 test cases</span> | Partial | Limited |
| Dependencies | <span class="highlight">Zero</span> | npm/pip | GitHub |
| Telemetry | <span class="highlight">None</span> | Yes | Yes |

</div>
