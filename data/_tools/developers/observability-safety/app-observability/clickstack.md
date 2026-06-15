---
name: "ClickStack"
slug: "clickstack"
website: "https://clickhouse.com/clickstack"
type: "oss"
track: "developers"
category: "observability-safety"
subcategory: "app-observability"
status: "active"
description: "Open-source observability platform built on ClickHouse for unified logs, metrics, and traces with OpenTelemetry-native ingestion."
pricing_model: "freemium"
founded_year: 2024
headquarters: "San Francisco, CA"
github_url: "https://github.com/ClickHouse/clickstack"

tags:
  - api-available
  - observability
  - self-hosted

# AI-Managed Metadata
last_verified: "2026-06-03"
confidence_score: 0.85
source_urls:
  - "https://clickhouse.com/clickstack"
  - "https://github.com/ClickHouse/clickstack"
  - "https://clickhouse.com/docs/observability"
github_stars: 103
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">10x</span>
    <span class="label">Faster Queries</span>
  </div>
  <div class="key-stat">
    <span class="number">90%</span>
    <span class="label">Cost Reduction</span>
  </div>
  <div class="key-stat">
    <span class="number">OTel</span>
    <span class="label">Native Support</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">Open Source</span>
  </div>
</div>

## Overview

<div class="overview">
<p>ClickStack is ClickHouse's official open-source observability stack that provides a complete solution for collecting, storing, and analyzing logs, metrics, and traces. Built entirely on ClickHouse's columnar database architecture, it delivers exceptional query performance and storage efficiency for observability data at any scale.</p>

<p>The platform is designed to be OpenTelemetry-native from the ground up, enabling seamless integration with the OTel ecosystem while leveraging ClickHouse's strengths in real-time analytics. ClickStack offers a unified approach to the three pillars of observability without requiring separate backends for each telemetry type.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use ClickStack?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams already using or familiar with ClickHouse who want native observability</li>
        <li>Organizations seeking to reduce observability costs with efficient storage</li>
        <li>Engineers who need fast ad-hoc queries across logs, metrics, and traces</li>
        <li>Companies wanting full control with self-hosted observability</li>
        <li>Teams standardizing on OpenTelemetry for instrumentation</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing fully managed SaaS with zero ops overhead</li>
        <li>Organizations requiring extensive pre-built integrations out of the box</li>
        <li>Small teams without ClickHouse expertise or resources to self-host</li>
        <li>Use cases requiring advanced APM features like code-level profiling</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li><strong>Exceptional query performance</strong> - ClickHouse's columnar architecture delivers sub-second queries even on billions of events</li>
      <li><strong>Significant cost savings</strong> - High compression ratios and efficient storage reduce infrastructure costs by up to 90% compared to alternatives</li>
      <li><strong>Unified data model</strong> - Logs, metrics, and traces in a single backend simplifies architecture and correlation</li>
      <li><strong>OpenTelemetry native</strong> - First-class OTel support means easy adoption with standard instrumentation</li>
      <li><strong>SQL-based querying</strong> - Familiar SQL syntax lowers the learning curve for exploring observability data</li>
      <li><strong>Fully open source</strong> - No vendor lock-in with Apache 2.0 licensed codebase</li>
    </ul>
    <div class="source"><a href="https://clickhouse.com/clickstack">ClickHouse Official</a> - <a href="https://clickhouse.com/docs/observability">Documentation</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li><strong>Self-hosting complexity</strong> - Requires operational expertise to deploy and maintain ClickHouse clusters</li>
      <li><strong>Emerging ecosystem</strong> - Newer than established alternatives like Datadog or Grafana stack, with evolving UI/UX</li>
      <li><strong>Limited APM features</strong> - Focused on core observability; lacks advanced features like code profiling or AI-powered insights</li>
      <li><strong>Dashboard limitations</strong> - May require external visualization tools like Grafana for advanced dashboards</li>
    </ul>
    <div class="source"><a href="https://github.com/ClickHouse/clickstack">GitHub Discussions</a> - Community Feedback</div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://clickhouse.com/clickstack" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Self-hosted, unlimited data, full feature access, Apache 2.0 license</div>
  </a>
  <a href="https://clickhouse.com/cloud" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">ClickHouse Cloud</div>
    <div class="price">Usage-based</div>
    <div class="desc">Managed ClickHouse with observability templates, starting at $0.30/GB stored</div>
  </a>
  <a href="https://clickhouse.com/company/contact" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Dedicated support, SLAs, professional services, on-premise deployment options</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>
<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Unified logs, metrics, and traces storage</li>
      <li>OpenTelemetry Collector integration</li>
      <li>OTLP (OpenTelemetry Protocol) native support</li>
      <li>SQL-based query interface</li>
      <li>Real-time data ingestion</li>
      <li>Materialized views for pre-aggregation</li>
      <li>Built-in alerting capabilities</li>
      <li>Trace waterfall visualization</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Data Capabilities</h4>
    <ul>
      <li>Columnar compression (10-40x reduction)</li>
      <li>Distributed query execution</li>
      <li>Time-series optimized storage</li>
      <li>JSON and semi-structured data support</li>
      <li>Secondary indexes for fast filtering</li>
      <li>Data retention policies (TTL)</li>
      <li>Async inserts for high throughput</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenTelemetry SDK (all languages)</li>
      <li>Grafana data source</li>
      <li>Prometheus remote write/read</li>
      <li>Fluentd and Fluent Bit</li>
      <li>Vector by Datadog</li>
      <li>Jaeger trace backend</li>
      <li>Kubernetes and Docker native</li>
      <li>AWS, GCP, Azure deployment</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>Docker and Docker Compose</li>
      <li>Kubernetes with Helm charts</li>
      <li>ClickHouse Operator for K8s</li>
      <li>ClickHouse Cloud (managed)</li>
      <li>Single-node development setup</li>
      <li>Multi-node production clusters</li>
      <li>Hybrid cloud configurations</li>
    </ul>
  </div>
</div>
</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | ClickStack | SigNoz | Datadog | Grafana Stack |
|---------|------------|--------|---------|---------------|
| **Deployment** | Self-hosted / Cloud | Self-hosted / Cloud | SaaS only | Self-hosted / Cloud |
| **Backend** | <span class="highlight">ClickHouse native</span> | ClickHouse | Proprietary | Multiple (Loki, Mimir, Tempo) |
| **OpenTelemetry** | <span class="highlight">Native OTLP</span> | Native | Supported | Supported |
| **Query Language** | SQL | ClickHouse SQL | Proprietary | PromQL, LogQL, TraceQL |
| **Cost Efficiency** | <span class="highlight">Excellent</span> | Very Good | High cost | Good |
| **Managed Option** | ClickHouse Cloud | SigNoz Cloud | Yes (default) | Grafana Cloud |
| **APM Features** | Basic | Good | <span class="highlight">Extensive</span> | Good |
| **Learning Curve** | SQL familiarity helps | Moderate | Low (but costly) | Moderate |
| **License** | Apache 2.0 | Apache 2.0 / EE | Proprietary | AGPL / Apache |
| **Pricing** | Free (self-host) | Free tier available | $$$$$ | Free tier available |

</div>

## Getting Started

To quickly set up ClickStack for development:

```bash
# Clone the repository
git clone https://github.com/ClickHouse/clickstack.git
cd clickstack

# Start with Docker Compose
docker-compose up -d

# Access the UI at http://localhost:8123
```

Configure your applications to send telemetry using OpenTelemetry SDKs with the OTLP exporter pointing to your ClickStack endpoint.
