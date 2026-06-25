---
name: "BotMux"
slug: "botmux"
website: "https://docs.botmux.dev"
github_url: "https://github.com/skrashevich/botmux"
github_stars: 17
type: "open-source"
track: "developers"
category: "observability-safety"
subcategory: "app-observability"
status: "active"
description: "Self-hosted Telegram bot management dashboard with real-time message logging to SQLite, inter-bot routing, and bridges to Slack, Discord, and webhooks"
pricing_model: "open-source"
founded_year: 2026
last_verified: "2026-06-14"
confidence_score: 0.83
tags:
  - self-hosted
  - observability
  - real-time
  - agents
  - api-available
  - messaging-observability
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">Real-time</span>
    <span class="label">Message Logging</span>
  </div>
  <div class="key-stat">
    <span class="number">SQLite</span>
    <span class="label">Storage (WAL mode)</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">Self-hosted</span>
  </div>
</div>

## Overview

<div class="overview">
<p>BotMux is an open-source web dashboard for managing and monitoring Telegram bots, purpose-built for operators who need to observe agent-driven conversations they are not directly part of. It connects to bots via the Telegram Bot API and logs every message, channel post, and chat event in real-time to a local SQLite database with WAL mode — no additional code required in your bot. The dashboard shows a live paginated feed with sender, timestamp, and content, plus full-text search across message history. Beyond passive logging, BotMux adds inter-bot message routing (with optional LLM-based smart routing), admin actions (send, pin, delete, ban/unban), and protocol bridges to Slack, Discord, Meshtastic, and HTTP webhooks. Released in 2026 under Apache 2.0 license.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use BotMux?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers running AI agents on Telegram who need passive, real-time message visibility</li>
        <li>Teams monitoring agent communications they're not directly part of</li>
        <li>Operators managing multiple Telegram bots from one dashboard</li>
        <li>Anyone needing a zero-cost, self-hosted alternative to commercial monitoring tools</li>
        <li>Setups bridging Telegram ↔ Slack or Telegram ↔ Discord</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>WhatsApp monitoring — not supported</li>
        <li>Native Slack or Discord inbox (bridged through Telegram, not standalone)</li>
        <li>Teams needing LLM-layer observability (token usage, prompt traces) — use Langfuse/LangSmith</li>
        <li>Production-critical setups (project is early-stage, v0.2.0 with a small community)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Truly passive monitoring — logs all messages the bot can see with zero bot-side code changes</li>
      <li>SQLite with WAL mode: fast, local, queryable with any SQL tool</li>
      <li>Real-time message feed with full-text search across all history</li>
      <li>LLM-based smart routing between bots (optional)</li>
      <li>Bridges Slack, Discord, Meshtastic, and HTTP webhooks into Telegram-centric storage</li>
      <li>Audit logging for compliance</li>
      <li>Apache 2.0 — fully open-source, no vendor lock-in</li>
    </ul>
    <div class="source"><a href="https://github.com/skrashevich/botmux" target="_blank">GitHub (skrashevich/botmux)</a> · <a href="https://docs.botmux.dev" target="_blank">BotMux Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Early-stage project (v0.2.0, launched March 2026) — expect rough edges</li>
      <li>Very small community — limited ecosystem support and few contributors</li>
      <li>WhatsApp is entirely unsupported</li>
      <li>Slack/Discord support is a bridge routed through Telegram, not a native inbox</li>
      <li>No SaaS option — requires self-hosting infrastructure</li>
    </ul>
    <div class="source"><a href="https://github.com/skrashevich/botmux" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/skrashevich/botmux" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, all features, Apache 2.0 license</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Message Logging</h4>
    <ul>
      <li>Real-time collection of all messages the bot can see</li>
      <li>Stores messages, bots, chats, users, audit logs</li>
      <li>SQLite with WAL mode for fast concurrent reads</li>
      <li>Full-text search across message history</li>
      <li>Paginated message feed (sender, timestamp, content)</li>
      <li>Tags and routing mappings stored alongside messages</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Bot Management</h4>
    <ul>
      <li>Multi-bot dashboard — manage multiple bots from one UI</li>
      <li>Long polling and webhook support</li>
      <li>Reverse proxy for legacy webhook bots</li>
      <li>Admin actions: send, pin/unpin, delete, ban/unban</li>
      <li>Session-based authentication with role controls</li>
      <li>Analytics and activity tracking</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Routing & Bridges</h4>
    <ul>
      <li>Inter-bot message routing with rule-based and LLM-based smart routing</li>
      <li>Slack bridge</li>
      <li>Discord bridge</li>
      <li>Meshtastic bridge</li>
      <li>HTTP webhook bridge</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Channels</h4>
    <ul>
      <li>Telegram (primary, native)</li>
      <li>Slack (via bridge to Telegram)</li>
      <li>Discord (via bridge to Telegram)</li>
      <li>HTTP webhooks</li>
      <li>WhatsApp — not supported</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | BotMux | Chatwoot | ChatBotKit | n8n |
|---------|--------|----------|------------|-----|
| Telegram | <span class="highlight">Native (primary)</span> | Native | Native | Via bot trigger |
| WhatsApp | Not supported | Via gateway | <span class="highlight">Native</span> | <span class="highlight">Via API</span> |
| Passive monitoring | <span class="highlight">Built-in</span> | Requires webhook setup | Audit logs only | Custom setup |
| Real-time logging | <span class="highlight">Yes (SQLite)</span> | Yes (DB) | Yes (platform) | Yes (custom store) |
| Self-hosted | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> | No | <span class="highlight">Yes</span> |
| Open-source | <span class="highlight">Apache 2.0</span> | <span class="highlight">MIT</span> | No | <span class="highlight">Apache 2.0</span> |
| Cost | <span class="highlight">Free</span> | Free tier | Free tier | Free (self-hosted) |
| Maturity | Early (v0.2) | <span class="highlight">Mature (2019)</span> | <span class="highlight">Mature</span> | <span class="highlight">Mature</span> |

</div>
