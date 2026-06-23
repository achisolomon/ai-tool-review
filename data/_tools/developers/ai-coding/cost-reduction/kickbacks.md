---
name: "Kickbacks.ai"
slug: "kickbacks"
website: "https://kickbacks.ai/"
type: "commercial"
track: "developers"
category: "ai-coding"
subcategory: "cost-reduction"
status: "active"
description: "Ad marketplace that places subtle, clickable sponsored messages in the Claude Code and Codex thinking spinner, splitting 50% of ad revenue back to the developers whose machines display them"
github_url: "https://github.com/andrewmccalip/kickbacks.ai"
github_stars: 449
pricing_model: "free"
founded_year: 2026
tags:
  - api-available
  - agents
last_verified: "2026-06-13"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">50%</span>
    <span class="label">Revenue Share to Users</span>
  </div>
  <div class="key-stat">
    <span class="number">~9K</span>
    <span class="label">Marketplace Installs</span>
  </div>
  <div class="key-stat">
    <span class="number">217</span>
    <span class="label">GitHub Stars</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Kickbacks.ai turns the loading spinner of AI coding agents into ad inventory. When Claude Code or Codex is "thinking," it normally shows a rotating verb ("Discombobulating…", "Percolating…"). The Kickbacks VS Code extension and CLI integration replaces that idle text with one subtle, clickable sponsored status line and pays the developer 50% of the resulting ad revenue. Advertisers buy impressions through a real-time bidding marketplace, and earnings accumulate automatically in the status bar. The product is operated by ShiftKeys, Inc. (Dover, Delaware) and built by Andrew McCalip; the GitHub repository is a read-only, source-available mirror rather than an open-source project.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Kickbacks.ai?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Heavy Claude Code / Codex users with long wait-states</li>
        <li>Developers wanting to offset AI tooling costs</li>
        <li>Solo devs and hobbyists comfortable with ads</li>
        <li>People curious about novel AI monetization experiments</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Enterprise or corporate machines (policy/ToS risk)</li>
        <li>Anyone uncomfortable with ads in their tooling</li>
        <li>Privacy-sensitive workflows wary of impression telemetry</li>
        <li>Teams needing a vendor-sanctioned, durable integration</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Genuinely novel idea — monetizes otherwise-dead wait time</li>
      <li>Transparent 50/50 revenue split with users</li>
      <li>Works across Claude Code VS Code, Codex, and terminal CLI</li>
      <li>Source-available mirror and server-controlled killswitch</li>
      <li>Low-friction setup: install, sign in, earnings auto-accrue</li>
    </ul>
    <div class="source"><a href="https://github.com/andrewmccalip/kickbacks.ai" target="_blank" rel="noopener">GitHub README</a> · <a href="https://news.ycombinator.com/item?id=48496294" target="_blank" rel="noopener">Hacker News</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Relies on patching agent spinners — vendors could break or block it</li>
      <li>Terms-of-service and trust questions vs. Anthropic / OpenAI</li>
      <li>Proprietary, not open source despite the public repo</li>
      <li>Impression/click telemetry runs a local tracking server</li>
      <li>Early-stage: 2.5★ Marketplace rating, unproven payouts</li>
    </ul>
    <div class="source"><a href="https://marketplace.visualstudio.com/items?itemName=Kickbacksai.kickbacks-ai" target="_blank" rel="noopener">VS Code Marketplace</a> · <a href="https://kickbacks.ai/terms" target="_blank" rel="noopener">Terms of Service</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://kickbacks.ai/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">For Developers</div>
    <div class="price">Free</div>
    <div class="desc">Install free, earn 50% of ad revenue</div>
  </a>
  <a href="https://kickbacks.ai/advertise" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">For Advertisers</div>
    <div class="price">$1+ / block</div>
    <div class="desc">1,000 five-second impressions per block; clicks billed at 50× impression rate</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Ad Surfaces</h4>
    <ul>
      <li>Spinner overlays in Claude Code VS Code panels</li>
      <li>Thinking-shimmers in Codex panels</li>
      <li>Status-bar lines in terminal CLI</li>
      <li>Spinner verbs in Claude Code CLI (v2.1.143+)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>For Developers</h4>
    <ul>
      <li>50% revenue share on impressions and clicks</li>
      <li>Real-time earnings in the status bar</li>
      <li>Sign in with Google / Apple / email</li>
      <li>Configurable payouts at kickbacks.ai</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>For Advertisers</h4>
    <ul>
      <li>Real-time bidding marketplace</li>
      <li>$1 minimum per 1,000-impression block</li>
      <li>Clicks billed at 50× the impression rate</li>
      <li>Public campaign leaderboard</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Technical</h4>
    <ul>
      <li>TypeScript extension with per-tool adapters</li>
      <li>Edits spinnerVerbs in ~/.claude/settings.json</li>
      <li>Local HTTP server for impression tracking</li>
      <li>Auth via OS keychain; server killswitch</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Approach | Kickbacks.ai | Token Optimizer | API credits / discounts |
|----------|--------------|-----------------|--------------------------|
| **Mechanism** | <span class="highlight">Earn ad revenue during wait-states</span> | Reduce wasted tokens | Lower per-token price |
| **Net effect on cost** | Offsets spend via earnings | Cuts spend directly | Cuts spend directly |
| **Requires showing ads** | <span class="highlight">Yes</span> | No | No |
| **Vendor-sanctioned** | No (patches spinners) | No (plugin) | <span class="highlight">Yes</span> |
| **Open source** | Source-available only | <span class="highlight">Yes (Noncommercial)</span> | n/a |
| **Maturity** | Early (2026, beta) | Established | Established |

**Summary:** Kickbacks is the only approach here that tries to *earn* money rather than *save* it, by selling the agent's idle spinner as ad space. That novelty is also its main risk — it depends on coding-agent vendors continuing to allow spinner customization.

</div>
