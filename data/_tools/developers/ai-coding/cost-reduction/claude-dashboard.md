---
---
name: Claude Dashboard
slug: claude-dashboard
website: https://github.com/iftahs/claude-dashboard
type: oss
track: developers
category: ai-coding
subcategory: cost-reduction
status: active
description: Beautiful local dashboard for Claude Code usage — 5h blocks, weekly trends,
  model & tool breakdown, activity heatmap
github_url: https://github.com/iftahs/claude-dashboard
github_stars: 7
pricing_model: free
founded_year: 2026
last_verified: '2026-06-10'
confidence_score: 0.95
source_urls:
- https://github.com/iftahs/claude-dashboard
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">7</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">4</span>
    <span class="label">Dashboard Tabs</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">Offline</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Claude Dashboard is a local, offline dashboard that visualizes your Claude Code usage by reading JSON logs from ~/.claude. No API key or account login required—it works entirely with your local activity logs. The dashboard provides comprehensive visualizations across four specialized tabs: Live (burn rate, plan usage), Trends (daily charts, cache efficiency, activity heatmaps), Models (cost-efficiency comparisons, tool usage), and Sessions (workspace analytics, drill-downs).</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Claude Dashboard?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Claude Code power users tracking usage patterns</li>
        <li>Developers monitoring spending limits</li>
        <li>Teams analyzing model cost-efficiency</li>
        <li>Anyone wanting visibility into token consumption</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Non-Claude Code users</li>
        <li>Those without Node.js/Docker setup</li>
        <li>Light/occasional Claude Code users</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Completely offline—reads local logs only</li>
      <li>No API key or login required</li>
      <li>Real-time burn rate indicators</li>
      <li>Activity heatmaps show coding patterns</li>
      <li>CSV/JSON export for further analysis</li>
      <li>Docker support for always-on deployment</li>
      <li>Cross-platform (macOS, Linux, Windows)</li>
    </ul>
    <div class="source"><a href="https://github.com/iftahs/claude-dashboard" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>New project (May 2026), still maturing</li>
      <li>Requires Node.js 18+ or Docker</li>
      <li>Only works with Claude Code logs</li>
      <li>Limited community adoption so far</li>
    </ul>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/iftahs/claude-dashboard" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Open source, MIT License</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Dashboard Tabs</h4>
    <ul>
      <li>Live: Burn rate, plan usage tracking, spending limits</li>
      <li>Trends: Daily token/cost charts, cache efficiency, heatmaps</li>
      <li>Models: Cost-efficiency comparisons, tool usage breakdown</li>
      <li>Sessions: Workspace analytics, session drill-downs</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Installation Options</h4>
    <ul>
      <li>Direct: npm install && npm run dev</li>
      <li>Docker: docker compose up -d --build</li>
      <li>Requires Node.js 18+</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Export Options</h4>
    <ul>
      <li>CSV export for spreadsheets</li>
      <li>JSON export for programmatic access</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Technical Details</h4>
    <ul>
      <li>TypeScript (97.2%)</li>
      <li>Reads ~/.claude logs</li>
      <li>MIT License</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Claude Dashboard | Token Optimizer | Helicone |
|---------|------------------|-----------------|----------|
| **Focus** | Usage visualization | Token reduction | API observability |
| **Data Source** | Local ~/.claude logs | Proxy/intercept | API gateway |
| **Requires API Key** | No | No | Yes |
| **Offline Capable** | <span class="highlight">Yes, fully offline</span> | Yes | No |
| **Cost Reduction** | Awareness only | <span class="highlight">Active optimization</span> | Awareness only |
| **Setup** | npm/Docker | MCP server | Cloud service |
| **Price** | Free | Free | Free tier + paid |

</div>
