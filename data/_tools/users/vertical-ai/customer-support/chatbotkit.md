---
name: "ChatBotKit"
slug: "chatbotkit"
website: "https://chatbotkit.com"
type: "commercial"
track: "users"
category: "vertical-ai"
subcategory: "customer-support"
status: "active"
description: "AI agent infrastructure platform for deploying bots across Slack, Discord, WhatsApp, Telegram, Messenger, and Teams from a single configuration, with conversation persistence and audit trails"
pricing_model: "freemium"
last_verified: "2026-06-14"
confidence_score: 0.78
tags:
  - agents
  - api-available
  - real-time
  - workflow-automation
  - messaging-observability
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">7+</span>
    <span class="label">Native Channels</span>
  </div>
  <div class="key-stat">
    <span class="number">90 days</span>
    <span class="label">Event Retention</span>
  </div>
  <div class="key-stat">
    <span class="number">Any LLM</span>
    <span class="label">Model Agnostic</span>
  </div>
</div>

## Overview

<div class="overview">
<p>ChatBotKit is a commercial AI agent infrastructure platform that lets developers define one agent configuration and deploy it simultaneously across Slack, Discord, WhatsApp, Telegram, Facebook Messenger, Microsoft Teams, and web widgets. It handles channel-specific quirks — threading in Slack, mentions in Discord, attachments in WhatsApp — so the agent code stays unified. Conversations are persisted cross-session with 90-day event retention and audit trails. ChatBotKit is model-agnostic, supporting any LLM from any vendor, and includes rate limiting, deduplication, multilingual support, and centralized operational management. It is well-suited for teams running AI agents across multiple messaging platforms who need a single pane of glass rather than separate integrations per channel.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use ChatBotKit?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams deploying the same AI agent across 3+ messaging platforms simultaneously</li>
        <li>Operators who want audit trails and event logs without building custom logging</li>
        <li>Companies needing human handoff through the original messaging channel</li>
        <li>Internal team bots (Slack/Teams) and customer-facing bots (WhatsApp/Telegram) from one config</li>
        <li>Model-agnostic shops that switch between LLM providers</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Deep passive message monitoring with raw database access (no SQLite export)</li>
        <li>Self-hosting requirements — cloud-only SaaS</li>
        <li>Teams needing open-source or on-prem deployment</li>
        <li>Telegram-only setups on a budget (BotMux is free)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>7 native channel integrations: Slack, Discord, WhatsApp, Telegram, Messenger, Teams, web</li>
      <li>Single agent definition deploys across all channels simultaneously</li>
      <li>Handles channel-specific features (threading, mentions, attachments) automatically</li>
      <li>90-day event retention with audit trails (Pro plan+)</li>
      <li>Cross-session conversation persistence</li>
      <li>Model-agnostic — works with any LLM vendor</li>
      <li>Rate limiting and deduplication built in</li>
    </ul>
    <div class="source"><a href="https://chatbotkit.com/solutions/messaging" target="_blank">ChatBotKit Messaging</a> · <a href="https://chatbotkit.com/changelog/enhanced-event-logging-system-with-audit-trails" target="_blank">Audit Trails Announcement</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>No self-hosted option — fully cloud-dependent</li>
      <li>Storage mechanisms not publicly documented — no raw DB access</li>
      <li>Audit trails only on Pro plan ($65/mo) and above</li>
      <li>Free plan limited to 3 bots, 100 conversations/mo, 500 messages/mo</li>
      <li>No independent technical corroboration for real-time logging infrastructure claims</li>
    </ul>
    <div class="source"><a href="https://chatbotkit.com/pricing" target="_blank">ChatBotKit Pricing</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://chatbotkit.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0<small>/mo</small></div>
    <div class="desc">3 bots, 100 conversations/mo, 500 messages/mo</div>
  </a>
  <a href="https://chatbotkit.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Basic</div>
    <div class="price">$25<small>/mo</small></div>
    <div class="desc">5 bots, 1K conversations/mo, 5K messages/mo</div>
  </a>
  <a href="https://chatbotkit.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$65<small>/mo</small></div>
    <div class="desc">25 bots, 10K conversations/mo, audit trails, custom domains</div>
  </a>
  <a href="https://chatbotkit.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Unlimited crawling, custom branding, SLAs, all models</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Supported Channels</h4>
    <ul>
      <li>Slack (with threading support)</li>
      <li>Discord (with mentions)</li>
      <li>WhatsApp (with attachments)</li>
      <li>Telegram</li>
      <li>Facebook Messenger</li>
      <li>Microsoft Teams</li>
      <li>Web widget (embeddable)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Agent Capabilities</h4>
    <ul>
      <li>Cross-session conversation persistence</li>
      <li>Multilingual support</li>
      <li>Human handoff through original channel</li>
      <li>Rate limiting and deduplication</li>
      <li>Custom datasets and skillsets</li>
      <li>Web crawling for knowledge base</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Observability</h4>
    <ul>
      <li>90-day event log retention (Pro+)</li>
      <li>Audit trails (Pro+)</li>
      <li>Conversation history (all plans)</li>
      <li>Centralized operational management</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Infrastructure</h4>
    <ul>
      <li>Cloud SaaS only (no self-hosting)</li>
      <li>Model-agnostic (any LLM vendor)</li>
      <li>API access for all plans</li>
      <li>Custom domains (Pro+)</li>
      <li>Privacy features (Pro+)</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | ChatBotKit | Chatwoot | BotMux | n8n |
|---------|------------|----------|--------|-----|
| Telegram | <span class="highlight">Native</span> | Native | <span class="highlight">Native</span> | Via bot trigger |
| WhatsApp | <span class="highlight">Native</span> | Via gateway | Not supported | Via API |
| Slack | <span class="highlight">Native</span> | Notifications only | Via bridge | <span class="highlight">Native</span> |
| Discord | <span class="highlight">Native</span> | Not supported | Via bridge | Via webhook |
| Teams | <span class="highlight">Native</span> | Not supported | Not supported | Via webhook |
| Audit trails | <span class="highlight">Built-in (Pro+)</span> | Enterprise plan | Built-in | Custom |
| Self-hosted | No | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> |
| Open-source | No | <span class="highlight">Yes (MIT)</span> | <span class="highlight">Yes (Apache 2)</span> | <span class="highlight">Yes</span> |
| Starting price | Free | Free | <span class="highlight">Free (OSS)</span> | Free (self-hosted) |

</div>
