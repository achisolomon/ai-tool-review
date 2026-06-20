---
name: "Arize AI"
slug: "arize-ai"
website: "https://arize.com/"
type: "commercial"
track: "developers"
category: "observability-safety"
subcategory: "llm-observability"
status: "active"
description: "AI observability platform for LLM and ML monitoring with automatic drift detection, root cause analysis, and production debugging"
github_url: "https://github.com/Arize-ai/phoenix"
github_stars: 10204
pricing_model: "freemium"
founded_year: 2020
headquarters: "Berkeley, CA"
tags:
  - observability
last_verified: "2026-06-02"
confidence_score: 0.92
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">$62M</span>
    <span class="label">Series B</span>
  </div>
  <div class="key-stat">
    <span class="number">8.5K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">500+</span>
    <span class="label">Enterprise Customers</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Arize AI is a comprehensive ML and LLM observability platform that helps teams monitor, troubleshoot, and optimize AI applications in production. Founded in 2020 by former Uber and TubeMogul engineers, Arize provides automatic performance monitoring, drift detection, and root cause analysis for both traditional ML models and LLM applications. The platform offers production tracing, prompt engineering tools, retrieval analysis for RAG systems, and LLM-as-judge evaluations. Arize also maintains Phoenix, the open-source LLM observability library that has become a community standard for local development and testing before scaling to production.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Arize AI?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Enterprise ML teams with production models</li>
        <li>LLM applications needing trace debugging</li>
        <li>RAG systems requiring retrieval analysis</li>
        <li>Teams needing automatic drift detection</li>
        <li>Organizations with compliance requirements</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Hobbyists or early prototypes (use Phoenix OSS)</li>
        <li>Pure LangChain shops (LangSmith more native)</li>
        <li>Budget-conscious startups (Langfuse cheaper)</li>
        <li>Simple single-model deployments</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Unified platform for ML + LLM observability</li>
      <li>Automatic drift detection and alerting</li>
      <li>Powerful root cause analysis workflows</li>
      <li>OpenTelemetry-native tracing (OpenInference)</li>
      <li>Built-in LLM evaluation framework</li>
      <li>RAG-specific retrieval quality metrics</li>
      <li>Phoenix OSS for local development</li>
      <li>Strong enterprise security (SOC 2, HIPAA)</li>
    </ul>
    <div class="source"><a href="https://arize.com/docs/" target="_blank">Official Docs</a> - <a href="https://github.com/Arize-ai/phoenix" target="_blank">Phoenix GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Higher pricing than OSS alternatives</li>
      <li>Learning curve for full platform features</li>
      <li>Phoenix and Arize cloud feature parity gaps</li>
      <li>ML-focused heritage may feel heavy for LLM-only teams</li>
      <li>Self-hosting requires enterprise plan</li>
    </ul>
    <div class="source"><a href="https://github.com/Arize-ai/phoenix/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://arize.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Developer</div>
    <div class="price">$0</div>
    <div class="desc">10K spans/mo, 1 user, community support</div>
  </a>
  <a href="https://arize.com/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Team</div>
    <div class="price">$150<small>/mo</small></div>
    <div class="desc">100K spans/mo, unlimited users, email support</div>
  </a>
  <a href="https://arize.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$600<small>/mo</small></div>
    <div class="desc">1M spans/mo, SSO, priority support</div>
  </a>
  <a href="https://arize.com/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">Unlimited, HIPAA, dedicated support, self-hosted</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>LLM Observability</h4>
    <ul>
      <li>Distributed tracing (OpenTelemetry)</li>
      <li>Prompt & response logging</li>
      <li>Token usage & cost tracking</li>
      <li>Latency monitoring</li>
      <li>Error rate analysis</li>
      <li>Session replay & debugging</li>
      <li>Span-level annotations</li>
      <li>Multi-model support</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Evaluations</h4>
    <ul>
      <li>LLM-as-judge evaluations</li>
      <li>Retrieval quality (MRR, NDCG)</li>
      <li>Hallucination detection</li>
      <li>Toxicity & safety checks</li>
      <li>Custom eval templates</li>
      <li>Human annotation workflows</li>
      <li>A/B experiment tracking</li>
      <li>Regression alerts</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>ML Monitoring</h4>
    <ul>
      <li>Data drift detection</li>
      <li>Prediction drift alerts</li>
      <li>Feature importance</li>
      <li>Model performance tracking</li>
      <li>Root cause analysis</li>
      <li>Cohort analysis</li>
      <li>Fairness metrics</li>
      <li>Explainability (SHAP)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>OpenAI / Azure OpenAI</li>
      <li>Anthropic Claude</li>
      <li>LangChain / LangGraph</li>
      <li>LlamaIndex</li>
      <li>AWS Bedrock</li>
      <li>Vertex AI</li>
      <li>DSPy</li>
      <li>AutoGen / CrewAI</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Phoenix OSS</h4>
    <ul>
      <li>Local trace visualization</li>
      <li>Notebook integration</li>
      <li>OpenInference instrumentation</li>
      <li>Evaluation harnesses</li>
      <li>Export to Arize cloud</li>
      <li>Docker/pip install</li>
      <li>Active community</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Security & Compliance</h4>
    <ul>
      <li>SOC 2 Type II</li>
      <li>HIPAA compliant (Enterprise)</li>
      <li>GDPR ready</li>
      <li>SSO / SAML</li>
      <li>RBAC permissions</li>
      <li>Data retention controls</li>
      <li>VPC deployment option</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Arize AI | Langfuse | W&B Weave | LangSmith |
|---------|----------|----------|-----------|-----------|
| Open Source | <span class="highlight">Phoenix (MIT)</span> | Yes (MIT) | No | No |
| Self-Hosted | Enterprise only | <span class="highlight">Yes (free)</span> | No | No |
| ML Monitoring | <span class="highlight">Full suite</span> | LLM only | ML + LLM | LLM only |
| Drift Detection | <span class="highlight">Automatic</span> | Manual | Basic | No |
| LLM Tracing | OpenInference | Custom | Custom | Native |
| RAG Analysis | <span class="highlight">Deep retrieval</span> | Basic | Basic | Good |
| Evaluations | <span class="highlight">LLM-as-judge</span> | LLM-as-judge | Advanced | Online evals |
| Free Tier | 10K spans/mo | 50K obs/mo | Limited | 5K traces/mo |
| Starting Price | $150/mo | $59/mo | Contact | $39/mo |
| Best For | Enterprise ML+LLM | Full control | ML teams | LangChain users |

</div>
