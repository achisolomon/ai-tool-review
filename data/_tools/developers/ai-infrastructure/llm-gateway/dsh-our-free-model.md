---
name: "dsh-our-free-model"
slug: "dsh-our-free-model"
website: "https://github.com/Ebony-Vinyl/dsh-our-free-model"
type: "oss"
track: "developers"
category: "ai-infrastructure"
subcategory: "llm-gateway"
status: "beta"
description: "Free model-provider plugin for DeepSeek Harness (dsh) that exposes keyless frontier models like DeepSeek and Kimi with no login or API key"
github_url: "https://github.com/Ebony-Vinyl/dsh-our-free-model"
github_stars: 20300
pricing_model: "free"
founded_year: 2026
headquarters: "Open Source"
tags:
  - free
  - multi-model
  - cost-reduction
  - cli
last_verified: "2026-10-17"
confidence_score: 0.75
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">20k</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">$0</span>
    <span class="label">No API Key</span>
  </div>
  <div class="key-stat">
    <span class="number">0</span>
    <span class="label">Dependencies</span>
  </div>
</div>

## Overview

<div class="overview">
<p>dsh-our-free-model is an MIT-licensed plugin for DeepSeek Harness (dsh), the open-source plugin-based coding agent harness. Install it and dsh gets a roster of free frontier models, such as DeepSeek V4.1 Flash and Kimi K3, with no account, sign-up or API key. It is a client, not a model provider: requests go directly to public keyless upstreams, chiefly OpenCode's free gateway and Kilo AI's public gateway. The plugin keeps the model list in sync with upstream, probes availability from your own network, enforces real thinking budgets, and also opens a local OpenAI-compatible port so other tools can use the same free lane. It hit #1 on Trendshift's daily and JavaScript weekly rankings in October 2026.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use dsh-our-free-model?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>DeepSeek Harness users who want to try frontier models at zero cost</li>
        <li>Hobby projects, learning and experiments with non-sensitive code</li>
        <li>Developers who want a quick free OpenAI-compatible endpoint for local tools</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Proprietary code, secrets or personal data (free pools may log prompts)</li>
        <li>Production workloads that need guaranteed uptime or rate limits</li>
        <li>Anyone not using DeepSeek Harness (it is a dsh plugin, not a standalone gateway)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Nothing to configure: no login, key or quota dashboard</li>
      <li>Names its upstreams openly and dials them directly, with no extra relay in between</li>
      <li>Hides models the gateway refuses and groups region-gated ones separately</li>
      <li>Thinking effort maps to real output-token budgets, not a prompt hint</li>
      <li>Pure plugin with zero dependencies and no build step; in-app upgrades with SHA-256 check and rollback</li>
      <li>Local-only usage dashboard (tokens, speed, time-to-first-token)</li>
    </ul>
    <div class="source"><a href="https://github.com/Ebony-Vinyl/dsh-our-free-model" target="_blank">Source</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Free access is the upstreams' offer and can be throttled, priced or withdrawn at any time</li>
      <li>Not private: Kilo's free pool states prompts may be logged and used to improve its services</li>
      <li>Fragile by nature: upstream paths change (the OpenCode endpoint moved in October 2026)</li>
      <li>Beta, tied to specific dsh kernel versions, and the docs and community are mostly Chinese-language</li>
      <li>Ships an owner-controlled announcement push and self-updater, which some teams will not allow</li>
    </ul>
    <div class="source"><a href="https://github.com/Ebony-Vinyl/dsh-our-free-model/blob/main/README_EN.md#disclaimer" target="_blank">Source</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/Ebony-Vinyl/dsh-our-free-model" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT plugin; model access rides on upstream free tiers with no key required</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Keyless model roster refreshed from upstream</li>
      <li>Per-egress availability and region-limited grouping</li>
      <li>Light / Balanced / Deep thinking budgets</li>
      <li>Local OpenAI-compatible forward port</li>
      <li>Works headless (dsh-tui) or with the web settings page</li>
      <li>Hot reload and one-click in-app upgrades</li>
      <li>Announcement center with optional OS notifications</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Running a coding agent with no model spend</li>
      <li>Comparing free frontier models side by side</li>
      <li>Pointing other OpenAI-compatible tools at a free local port</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | dsh-our-free-model | OpenRouter (free models) | LiteLLM Proxy |
|---------|--------------------|--------------------------|---------------|
| API key needed | No | Yes | Your own provider keys |
| Cost | Free | Free tier + paid | Free (self-hosted) |
| Scope | DeepSeek Harness plugin | Hosted multi-provider API | Self-hosted gateway |
| Privacy | Upstream free pools may log | Varies by provider | Depends on your providers |
| Production-ready | No (beta) | Yes | Yes |

</div>
