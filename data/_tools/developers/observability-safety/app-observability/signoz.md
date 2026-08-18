---
name: "SigNoz"
slug: "signoz"
website: "https://signoz.io/"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "app-observability"
status: "active"
description: "Open source APM and observability platform with unified traces, metrics, and logs built on OpenTelemetry and ClickHouse"
github_url: "https://github.com/SigNoz/signoz"
github_stars: 31861
pricing_model: "freemium"
founded_year: 2021
headquarters: "San Francisco, CA"
tags:
  - observability
  - self-hosted
last_verified: "2026-06-03"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">27.2K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">$6.5M</span>
    <span class="label">Series A</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">OpenTelemetry</span>
  </div>
</div>

## Overview

<div class="overview">
<p>SigNoz is an open source Application Performance Monitoring (APM) and observability platform that provides a unified view of traces, metrics, and logs in a single pane of glass. Built natively on OpenTelemetry, it uses ClickHouse as its columnar datastore for high-performance querying at scale. SigNoz was founded in 2021 as an open source alternative to commercial APM tools like Datadog and New Relic, offering comparable features without vendor lock-in or unpredictable pricing. It supports distributed tracing, infrastructure monitoring, log management, and custom dashboards, making it a comprehensive solution for modern cloud-native applications.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use SigNoz?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams wanting Datadog-like features without the cost</li>
        <li>Organizations already using or planning OpenTelemetry</li>
        <li>Companies needing data sovereignty (self-hosted)</li>
        <li>Kubernetes and microservices environments</li>
        <li>Teams with unpredictable data volumes</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing zero-setup (use Datadog)</li>
        <li>Organizations without DevOps resources for self-hosting</li>
        <li>Legacy monolith applications</li>
        <li>Teams needing extensive pre-built integrations</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Truly open source (MIT + Apache 2.0 licenses)</li>
      <li>Native OpenTelemetry support - no proprietary agents</li>
      <li>Unified traces, metrics, and logs in one platform</li>
      <li>ClickHouse backend enables fast queries at scale</li>
      <li>No per-host or per-seat pricing surprises</li>
      <li>Correlated data - click from trace to logs instantly</li>
      <li>Self-hosted option for full data control</li>
      <li>Active community and rapid development</li>
    </ul>
    <div class="source"><a href="https://signoz.io/docs/" target="_blank">Official Docs</a> - <a href="https://github.com/SigNoz/signoz" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Self-hosted requires ClickHouse ops knowledge</li>
      <li>Fewer pre-built integrations than commercial tools</li>
      <li>UI polish still catching up to Datadog</li>
      <li>Alerting features less mature than established players</li>
      <li>Smaller ecosystem of dashboards and plugins</li>
      <li>Learning curve for OpenTelemetry newcomers</li>
    </ul>
    <div class="source"><a href="https://github.com/SigNoz/signoz/issues" target="_blank">GitHub Issues</a> - <a href="https://signoz.io/docs/community/" target="_blank">Community</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://signoz.io/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Community (Self-Hosted)</div>
    <div class="price">$0</div>
    <div class="desc">Full features, your infrastructure</div>
  </a>
  <a href="https://signoz.io/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Cloud Teams</div>
    <div class="price">Usage-based</div>
    <div class="desc">$0.30/GB logs, $0.10/GB traces</div>
  </a>
  <a href="https://signoz.io/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Cloud Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">SSO, SAML, SLAs, dedicated support</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Distributed tracing with flame graphs</li>
      <li>Metrics monitoring and dashboards</li>
      <li>Log management with full-text search</li>
      <li>Infrastructure monitoring</li>
      <li>Exception tracking</li>
      <li>Service maps and dependency graphs</li>
      <li>Custom dashboards and panels</li>
      <li>Alerting with multiple channels</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenTelemetry (all languages)</li>
      <li>Kubernetes / Docker</li>
      <li>AWS, GCP, Azure</li>
      <li>PostgreSQL, MySQL, MongoDB</li>
      <li>Redis, Elasticsearch</li>
      <li>Apache Kafka</li>
      <li>Nginx, Apache</li>
      <li>Prometheus exporters</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>SigNoz Cloud (managed)</li>
      <li>Self-hosted (Docker Compose)</li>
      <li>Self-hosted (Kubernetes/Helm)</li>
      <li>ClickHouse data backend</li>
      <li>Multi-region support (Cloud)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Language SDKs</h4>
    <ul>
      <li>Java / Spring Boot</li>
      <li>Python / Django / Flask</li>
      <li>Node.js / Express / NestJS</li>
      <li>Go</li>
      <li>.NET / C#</li>
      <li>Ruby on Rails</li>
      <li>PHP / Laravel</li>
      <li>Rust</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | SigNoz | Datadog | New Relic | Jaeger |
|---------|--------|---------|-----------|--------|
| Open Source | <span class="highlight">Yes (MIT/Apache)</span> | No | No | Yes |
| Self-Hosted | <span class="highlight">Yes</span> | No | No | Yes |
| Unified Platform | <span class="highlight">Traces + Metrics + Logs</span> | All-in-one | All-in-one | Traces only |
| OpenTelemetry Native | <span class="highlight">100% native</span> | Supported | Supported | Native |
| Data Backend | ClickHouse | Proprietary | Proprietary | Cassandra/ES |
| Pricing Model | Usage-based / Free | Per host + data | Per GB ingested | Free |
| Starting Cost | $0 (self-host) | ~$23/host/mo | $0 (100GB free) | $0 |
| Custom Dashboards | Yes | <span class="highlight">Extensive</span> | Yes | Limited |
| Alerting | Basic | <span class="highlight">Advanced</span> | Advanced | External |
| Best For | Cost-conscious, OTel users | Enterprise, full-stack | Full observability | Tracing only |

</div>

## Key Differentiators

<div class="info-grid">
  <div class="info-card">
    <h4>OpenTelemetry-First</h4>
    <ul>
      <li>No proprietary agents required</li>
      <li>Vendor-neutral instrumentation</li>
      <li>Future-proof your telemetry</li>
      <li>Easy migration between tools</li>
    </ul>
  </div>
  <div class="info-card">
    <h4>ClickHouse Performance</h4>
    <ul>
      <li>Columnar storage for fast aggregations</li>
      <li>Handles billions of events/day</li>
      <li>Cost-effective storage at scale</li>
      <li>Real-time querying capabilities</li>
    </ul>
  </div>
</div>
