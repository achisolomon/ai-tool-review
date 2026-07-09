---
name: Claude Dashboard
slug: claude-dashboard
website: https://github.com/iftahs/claude-dashboard
type: open-source
track: developers
category: ai-coding
subcategory: cost-reduction
status: active
description: Beautiful local analytics dashboard for Claude Code usage — reads ~/.claude logs with no API key required. Six interactive tabs covering live burn rate, agent activity, trends, model breakdown, insights, and session history.
github_url: https://github.com/iftahs/claude-dashboard
github_stars: 11
pricing_model: free
founded_year: 2026
headquarters: Open Source
tags:
  - observability
  - cost-reduction
last_verified: '2026-06-18'
confidence_score: 0.95
source_urls:
- https://github.com/iftahs/claude-dashboard
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">9</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">6</span>
    <span class="label">Dashboard Tabs</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">Offline</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Claude Dashboard is a locally-hosted analytics dashboard that visualizes your Claude Code usage by reading JSON logs from <code>~/.claude</code>. No API key or internet connection required — it works entirely with your local activity logs. Six interactive tabs cover everything from real-time token burn rate and active subagent sessions to 18-week activity grids, model cost comparisons, error analysis, and searchable session transcripts with CSV/JSON export.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Claude Dashboard?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Claude Code power users tracking burn rate against 5-hour session limits</li>
        <li>Developers comparing cost-efficiency across Opus, Sonnet, and Haiku</li>
        <li>Anyone wanting session transcripts and tool error analysis locally</li>
        <li>Teams wanting a self-hosted, always-on usage monitor via Docker</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Non-Claude Code users (claude.ai web usage is not captured)</li>
        <li>Those without Node.js 18+ or Docker</li>
        <li>Users needing exact rate-limit reset times (not available in local logs)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Fully offline — reads local logs only, no API key needed</li>
      <li>Six tabs covering live burn rate, agents, trends, models, insights, and sessions</li>
      <li>Real-time subagent monitoring with token counts and git branch details</li>
      <li>Interactive pricing calculator with cache efficiency modeling</li>
      <li>18-week GitHub-style activity heatmap</li>
      <li>Searchable session history with full transcript drill-downs</li>
      <li>CSV/JSON export; Docker support for always-on deployment</li>
    </ul>
    <div class="source"><a href="https://github.com/iftahs/claude-dashboard" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>New project (May 2026), still maturing</li>
      <li>Requires Node.js 18+ or Docker</li>
      <li>Only works with Claude Code logs — claude.ai web usage not included</li>
      <li>Cannot display exact rate-limit reset times (not in local logs)</li>
    </ul>
    <div class="source"><a href="https://github.com/iftahs/claude-dashboard" target="_blank">GitHub README — Limitations</a></div>
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
      <li><strong>Live Usage</strong> — Real-time token burn rate, 5-hour session limits, weekly quotas, spending caps</li>
      <li><strong>Agents & Live Activity</strong> — Active sessions and subagents with token counts and git branch details</li>
      <li><strong>Trends</strong> — Daily token/cost charts, cache efficiency tracking, 24×7 heatmap, 18-week activity grid</li>
      <li><strong>Models</strong> — Token distribution across Opus/Sonnet/Haiku, cost-per-token comparison, tool usage breakdown</li>
      <li><strong>Insights</strong> — Error rates, tool failure analysis, language distribution, delegation metrics, edit accuracy</li>
      <li><strong>Sessions</strong> — Config overview, workspace cost ranking, searchable session history with full transcripts</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Installation Options</h4>
    <ul>
      <li>Direct: <code>npm install &amp;&amp; npm run dev</code> (port 5180)</li>
      <li>Docker: <code>docker compose up -d --build</code> (port 8787)</li>
      <li>Requires Node.js 18+</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Export &amp; Visualization</h4>
    <ul>
      <li>CSV export for spreadsheets</li>
      <li>JSON export for programmatic access</li>
      <li>Toggle between token counts and USD cost views</li>
      <li>Interactive pricing calculator with cache efficiency modeling</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Technical Details</h4>
    <ul>
      <li>TypeScript (98.6%)</li>
      <li>Express backend + React/Vite frontend</li>
      <li>Reads <code>~/.claude</code> logs (read-only mount in Docker)</li>
      <li>MIT License · 62 commits</li>
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
| **Agent Monitoring** | <span class="highlight">Live subagent view</span> | No | Yes |
| **Session Transcripts** | <span class="highlight">Full local transcripts</span> | No | Partial |
| **Setup** | npm/Docker | MCP server | Cloud service |
| **Price** | Free | Free | Free tier + paid |

</div>
