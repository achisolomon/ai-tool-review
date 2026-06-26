---
name: "Chatwoot"
slug: "chatwoot"
website: "https://www.chatwoot.com"
github_url: "https://github.com/chatwoot/chatwoot"
github_stars: 33537
type: "open-source"
track: "users"
category: "vertical-ai"
subcategory: "customer-support"
status: "active"
description: "Open-source omnichannel customer support platform with AI agent (Captain) that unifies Telegram, WhatsApp, email, and 9+ channels in one inbox — self-hosted or cloud"
pricing_model: "freemium"
founded_year: 2019
headquarters: "San Francisco, CA"
tags:
  - agents
  - api-available
  - self-hosted
  - real-time
  - messaging-observability
last_verified: "2026-06-14"
confidence_score: 0.91
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">31K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">9+</span>
    <span class="label">Channels</span>
  </div>
  <div class="key-stat">
    <span class="number">15K+</span>
    <span class="label">Businesses</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Chatwoot is a modern open-source customer support platform that consolidates conversations from Telegram, WhatsApp, Facebook, Instagram, email, and web chat into a single shared inbox. Founded in 2019 and backed by Y Combinator, it has grown to serve 15,000+ businesses. Its built-in AI agent, Captain, automates responses by learning from your help center content and past conversations. Chatwoot delivers messages to AI agent bots via outbound webhooks — bots receive events at a configured URL and post responses back via API, making it well-suited for teams building AI agents that handle customer messaging across multiple channels. Self-hosting gives full data control; the cloud option removes infrastructure overhead.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Chatwoot?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams deploying AI agents across WhatsApp, Telegram, and email simultaneously</li>
        <li>Companies wanting open-source flexibility with self-hosting option</li>
        <li>Developers building webhook-driven agent bots that need a multi-channel inbox</li>
        <li>Support teams needing human-in-the-loop alongside AI agents</li>
        <li>Orgs requiring SOC 2 compliance and audit logs</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Passive agent message monitoring — bots must actively call the API to log messages</li>
        <li>Telegram-only setups (BotMux is simpler for this)</li>
        <li>Teams without engineering resources to wire up webhook receivers</li>
        <li>Pure observability use cases (no native LLM trace or token logging)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>9+ channels unified: Telegram, WhatsApp, Facebook, Instagram, email, web chat, Line</li>
      <li>Open-source (MIT) with a large, active community</li>
      <li>Captain AI learns from your help center and past chats — no prompt engineering needed</li>
      <li>Real-time signed webhook callbacks for external systems</li>
      <li>Integrates with Dialogflow, Rasa, and Amazon Lex for existing NLP stacks</li>
      <li>SOC 2 Type II compliant on cloud plans</li>
      <li>Human handoff built in — agents can take over from bots mid-conversation</li>
    </ul>
    <div class="source"><a href="https://www.chatwoot.com/hc/user-guide/articles/1677497472-how-to-use-agent-bots" target="_blank">Chatwoot Agent Bots Docs</a> · <a href="https://github.com/chatwoot/chatwoot" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Not a passive message logger — bots must call Create Message API to log outbound responses</li>
      <li>WhatsApp requires third-party gateway (e.g., chatwoot-messenger-gateway via Wasender)</li>
      <li>Slack support is limited to notification webhooks, not a native Slack inbox</li>
      <li>Self-hosting requires DevOps resources (Docker/Kubernetes setup)</li>
      <li>Captain AI credits are capped per tier — high-volume agents need Enterprise</li>
    </ul>
    <div class="source"><a href="https://github.com/feel90d/chatwoot-messenger-gateway" target="_blank">Community Gateway</a> · <a href="https://www.chatwoot.com/pricing" target="_blank">Chatwoot Pricing</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://www.chatwoot.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Hacker</div>
    <div class="price">Free</div>
    <div class="desc">2 agents, 500 conversations/mo, live chat only</div>
  </a>
  <a href="https://www.chatwoot.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Startups</div>
    <div class="price">$19<small>/agent/mo</small></div>
    <div class="desc">All channels, 300 Captain AI credits/mo, 1yr data retention</div>
  </a>
  <a href="https://www.chatwoot.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Business</div>
    <div class="price">$39<small>/agent/mo</small></div>
    <div class="desc">500 Captain AI credits, automation rules, teams, 2yr retention</div>
  </a>
  <a href="https://www.chatwoot.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">$99<small>/agent/mo</small></div>
    <div class="desc">800 Captain AI credits, SSO, audit logs, 3yr retention</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Supported Channels</h4>
    <ul>
      <li>Telegram (native)</li>
      <li>WhatsApp (via Business API / gateway)</li>
      <li>Facebook Messenger</li>
      <li>Instagram DMs</li>
      <li>Email</li>
      <li>Web live chat widget</li>
      <li>Line</li>
      <li>SMS (via integrations)</li>
      <li>Custom API channel</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>AI & Bot Integration</h4>
    <ul>
      <li>Captain AI — automates responses from help center content</li>
      <li>Captain Copilot — smart suggestions for human agents</li>
      <li>Agent bot webhooks — deliver events to external bot URLs</li>
      <li>Dialogflow, Rasa, Amazon Lex integration</li>
      <li>Human handoff with seamless context transfer</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Observability & Logging</h4>
    <ul>
      <li>Full conversation history stored per channel</li>
      <li>Audit logs (Enterprise)</li>
      <li>Real-time webhook events for external systems</li>
      <li>Conversation reports and CSAT tracking</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment</h4>
    <ul>
      <li>Cloud (chatwoot.com) — managed SaaS</li>
      <li>Self-hosted — Docker, Kubernetes, Heroku</li>
      <li>Open-source MIT license</li>
      <li>SOC 2 Type II (cloud plans)</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Chatwoot | BotMux | ChatBotKit | Intercom |
|---------|----------|--------|------------|----------|
| Telegram | <span class="highlight">Native</span> | <span class="highlight">Native (primary)</span> | Native | Limited |
| WhatsApp | Via gateway | Not supported | Native | Native |
| Slack | Notifications only | Via bridge | <span class="highlight">Native</span> | Via integration |
| Passive monitoring | Webhook-active | <span class="highlight">Built-in</span> | Audit logs | No |
| Self-hosted | <span class="highlight">Yes (MIT)</span> | <span class="highlight">Yes (Apache 2)</span> | No | No |
| Open-source | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> | No | No |
| Human handoff | <span class="highlight">Yes</span> | No | <span class="highlight">Yes</span> | <span class="highlight">Yes</span> |
| Starting price | Free | Free | Free | $29/seat/mo |

</div>
