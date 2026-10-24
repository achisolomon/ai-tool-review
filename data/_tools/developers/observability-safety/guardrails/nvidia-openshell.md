---
name: "NVIDIA OpenShell"
slug: "nvidia-openshell"
website: "https://github.com/NVIDIA/OpenShell"
type: "open-source"
track: "developers"
category: "observability-safety"
subcategory: "guardrails"
status: "active"
github_url: "https://github.com/NVIDIA/OpenShell"
github_stars: 18999
description: "The safe, private runtime for autonomous AI agents. Kernel-level sandbox isolation with formally-verified, policy-based access controls for filesystem, network, and process access."
pricing_model: "open-source"
founded_year: 2026
headquarters: "NVIDIA"
tags:
  - agents
  - sandboxes

# AI-Managed Metadata
last_verified: "2026-10-16"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">16.4K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">Launch Partners</span>
  </div>
  <div class="key-stat">
    <span class="number">#1</span>
    <span class="label">GitHub Trending</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OpenShell is NVIDIA's open-source runtime for securing autonomous AI agents. It enforces kernel-level sandbox isolation (restricted file access, system calls, and network connections) combined with formally-verified policies that flag risky permission changes before deployment. Written in Rust, it offers SDKs in Python, TypeScript, Go, and Rust, an extensible architecture with middleware and custom compute drivers, and credential injection scoped only to approved endpoints so agents never see raw secrets. It debuted at NVIDIA GTC San Jose 2026 with 100+ launch partners including Anthropic, Scale AI, Cisco, CrowdStrike, Dell, HPE, Red Hat, Salesforce, and SAP, and hit #1 on GitHub Trending within a day of release.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OpenShell?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams deploying autonomous agents that need real file, API, or system access without unrestricted trust</li>
        <li>Organizations needing auditable, policy-based access controls rather than ad-hoc sandboxing</li>
        <li>Multi-language stacks — SDKs cover Python, TypeScript, Go, and Rust</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting a fully managed, zero-setup hosted sandbox — this is a self-run runtime</li>
        <li>Very early adopters wary of a project with 554 open issues and a launch under a year old</li>
        <li>Simple agent use cases with no need for filesystem/network/process isolation</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Kernel-level isolation plus formally verified policies, not just a thin permission layer</li>
      <li>Backed by NVIDIA with 100+ enterprise launch partners at debut, including Anthropic, Cisco, and Red Hat</li>
      <li>Credential injection only for approved endpoints — agents never see raw secrets</li>
      <li>Multi-language SDK support (Python, TypeScript, Go, Rust)</li>
      <li>Apache 2.0 license, free and permissive</li>
      <li>Explosive adoption: #1 on GitHub Trending within a day of launch (see badge for current star count)</li>
    </ul>
    <div class="source"><a href="https://github.com/NVIDIA/OpenShell" target="_blank" rel="noopener">GitHub (official)</a> · <a href="https://www.kucoin.com/news/flash/nvidia-launches-openshell-an-open-source-runtime-for-securing-autonomous-ai-agents" target="_blank" rel="noopener">Launch coverage</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>554 open issues at time of review — a young, fast-moving project</li>
      <li>Self-hosted/self-run; no managed hosted offering from NVIDIA itself found</li>
      <li>Very new (created February 2026) — track record is still being established</li>
    </ul>
    <div class="source"><a href="https://github.com/NVIDIA/OpenShell/issues" target="_blank" rel="noopener">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/NVIDIA/OpenShell" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0 license, self-hosted.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Kernel-level sandbox isolation (files, syscalls, network)</li>
      <li>Formally verified policies flag risky permission changes</li>
      <li>Policy management for filesystem, network, and process rules</li>
      <li>Extensible middleware and custom compute drivers</li>
      <li>Scoped credential injection for approved endpoints only</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>SDKs</h4>
    <ul>
      <li>Python</li>
      <li>TypeScript</li>
      <li>Go</li>
      <li>Rust</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Launch Partners</h4>
    <ul>
      <li>Anthropic, Scale AI, Cisco</li>
      <li>CrowdStrike, Dell, HPE</li>
      <li>Red Hat, Salesforce, SAP</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Project Stats</h4>
    <ul>
      <li>Created February 24, 2026</li>
      <li>Primary language: Rust</li>
      <li>License: Apache 2.0</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OpenShell | E2B | Modal Sandboxes |
|---------|-----------|-----|------------------|
| Isolation Level | <span class="highlight">Kernel-level + formal policy verification</span> | Microsandbox/VM | Container-based |
| Hosting | Self-hosted | Managed cloud | Managed cloud |
| License | <span class="highlight">Apache 2.0 (free)</span> | Commercial | Commercial |
| SDKs | Python, TypeScript, Go, Rust | Python, JS | Python |
| Enterprise Backing | <span class="highlight">NVIDIA + 100 launch partners</span> | Independent | Independent |

</div>
