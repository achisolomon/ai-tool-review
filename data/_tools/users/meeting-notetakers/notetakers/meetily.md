---
name: "Meetily"
slug: "meetily"
website: "https://meetily.ai/"
type: "open-source"
track: "users"
category: "meeting-notetakers"
subcategory: "notetakers"
status: "active"
description: "Meetily records, transcribes, and summarizes meetings 100% on your device. Audio and data never leave. Private, secure, in your control."
github_url: "https://github.com/Zackriya-Solutions/meetily"
github_stars: 31791
pricing_model: "freemium"
headquarters: "Zackriya Solutions"
tags:
  - self-hosted
  - real-time
  - mcp-server
last_verified: "2026-10-16"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">On-Device</span>
  </div>
  <div class="key-stat">
    <span class="number">31.8K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">4x</span>
    <span class="label">Faster Transcription</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Meetily is a privacy-first AI meeting assistant that records, transcribes, and summarizes meetings entirely on-device, so audio and data never leave the user's machine. It uses local Whisper/Parakeet models (claimed 4x faster than standard Whisper) for real-time transcription with automatic speaker diarization, then generates customizable AI summaries. It works bot-free across Google Meet, Zoom, Teams, Discord, Slack Huddles, and Webex by capturing system audio rather than joining as a visible bot, and can run fully offline after the model download. Developed by Zackriya Solutions, it's open-source (MIT) under a community tier, with a paid Pro tier adding team features.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Meetily?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Privacy-conscious individuals and teams who don't want meeting audio sent to a cloud service</li>
        <li>Organizations with GDPR/HIPAA data-residency requirements</li>
        <li>Users wanting a bot-free recorder that doesn't show up as a visible participant</li>
        <li>Developers wanting MCP, webhook, or CLI integration into their own tooling</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting zero-setup cloud convenience — local models require a download and local compute</li>
        <li>Non-technical users uncomfortable running a self-hosted/local tool (Community tier)</li>
        <li>Large teams needing a mature admin dashboard — Enterprise tier is custom-priced and less established than incumbents</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>100% on-device processing — audio and transcripts never leave the device by default</li>
      <li>Free, open-source Community tier (MIT license) with no per-minute caps, unlike cloud competitors' capped free tiers</li>
      <li>Works across Google Meet, Zoom, Teams, Discord, Slack Huddles, and Webex via system audio capture, no visible bot</li>
      <li>Export to Markdown, PDF, DOCX; integrates via MCP, webhooks, and CLI</li>
      <li>Strong open-source adoption: 31,791 stars, 3,511 forks</li>
    </ul>
    <div class="source"><a href="https://meetily.ai/" target="_blank" rel="noopener">Official site</a> · <a href="https://github.com/Zackriya-Solutions/meetily" target="_blank" rel="noopener">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Local processing means transcription speed depends on the user's own hardware, not a cloud server</li>
      <li>Linux build must be compiled from source; no prebuilt package listed</li>
      <li>Little public third-party review coverage (no significant Reddit or Hacker News discussion found)</li>
      <li>Bringing your own API key (e.g. Claude, OpenAI) for cloud-model summaries sends transcripts, not recordings, outside the device — worth confirming exactly what leaves if using that option</li>
    </ul>
    <div class="source">No major independent review found via web search, 2026-10-16</div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/Zackriya-Solutions/meetily" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Community</div>
    <div class="price">Free</div>
    <div class="desc">Open-source, MIT licensed, self-hosted</div>
  </a>
  <a href="https://meetily.ai/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$10<small>/user/mo</small></div>
    <div class="desc">Billed annually ($120/yr)</div>
  </a>
  <a href="https://meetily.ai/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Admin dashboard, dedicated support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>On-device transcription (Whisper/Parakeet), ~4x faster than standard Whisper</li>
      <li>Real-time transcription with speaker diarization</li>
      <li>Customizable AI summary templates</li>
      <li>10+ audio/video file import formats</li>
      <li>Multi-language support with auto-detection</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>macOS (.dmg), Windows (EXE)</li>
      <li>Linux (build from source)</li>
      <li>Works with any video conferencing app via system audio capture</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>MCP (Model Context Protocol)</li>
      <li>Webhooks</li>
      <li>CLI</li>
      <li>Export to Markdown, PDF, DOCX</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Company</h4>
    <ul>
      <li>Developed by Zackriya Solutions</li>
      <li>GitHub repo created December 2024</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Meetily | Otter.ai | Fireflies |
|---------|---------|----------|-----------|
| Processing Location | <span class="highlight">100% on-device</span> | Cloud | Cloud |
| Free Tier Limit | <span class="highlight">No cap (Community)</span> | 300 min/mo | 800 min/mo |
| Open Source | <span class="highlight">Yes (MIT)</span> | No | No |
| Bot-Free Recording | <span class="highlight">Yes</span> | No (visible bot) | No (visible bot) |
| Self-Hosted | <span class="highlight">Yes</span> | No | No |
| Starting Paid Price | $10/user/mo | Varies | Varies |

</div>
