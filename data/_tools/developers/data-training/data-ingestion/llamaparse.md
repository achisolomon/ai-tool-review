---
category: data-training
confidence_score: 0.95
description: "LlamaParse is an enterprise document parsing API by LlamaIndex that converts complex PDFs, scans, and 130+ file formats into structured, LLM-ready data using agentic OCR with layout-aware multimodal understanding."
founded_year: 2022
headquarters: "San Francisco, CA"
last_verified: '2026-06-17'
name: LlamaParse
pricing_model: freemium
slug: llamaparse
status: active
subcategory: data-ingestion
tags:
  - api-available
  - rag
  - multimodal
  - python
  - typescript
track: developers
type: commercial
website: https://www.llamaindex.ai/llamaparse
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">1B+</span>
    <span class="label">Documents Parsed</span>
  </div>
  <div class="key-stat">
    <span class="number">300K+</span>
    <span class="label">Users</span>
  </div>
  <div class="key-stat">
    <span class="number">130+</span>
    <span class="label">File Formats</span>
  </div>
  <div class="key-stat">
    <span class="number">10K</span>
    <span class="label">Free Credits/mo</span>
  </div>
</div>

## Overview

<div class="overview">
<p>LlamaParse is the enterprise platform for turning documents into production AI pipelines. It converts complex, messy documents — PDFs with embedded charts, scans, multi-level tables, handwriting, and checkboxes — into clean, structured, LLM-ready output at scale. The service exposes six composable products (Parse, Extract, Classify, Split, Sheets, Index) through a single API, making it the document intelligence backbone for RAG pipelines and AI applications. LlamaParse v2 introduced a simplified tier-based system, version pinning for production stability, and a 50% price reduction on the top tier.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use LlamaParse?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building RAG pipelines that need reliable, structured document extraction</li>
        <li>Developers already using LlamaIndex who want native ecosystem integration</li>
        <li>Enterprises processing complex documents — insurance claims, scientific papers, financial reports with nested tables</li>
        <li>Multilingual document workflows (100+ languages supported)</li>
        <li>Projects needing schema-based JSON extraction from unstructured documents</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Compliance-sensitive environments requiring on-premise or self-hosted processing — LlamaParse is cloud-only</li>
        <li>High-volume, cost-sensitive pipelines where usage-based billing can spike unpredictably</li>
        <li>Simple plaintext documents where cheaper alternatives suffice</li>
        <li>Teams standardized on Azure who'd prefer Document Intelligence's native ecosystem fit</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Highest accuracy on complex documents — 92% F1 on tables and images in benchmarks</li>
      <li>Six composable products (Parse, Extract, Classify, Split, Sheets, Index) via one API key</li>
      <li>Agentic OCR handles messy layouts, split tables, scans, and embedded images that trip up simpler parsers</li>
      <li>Version pinning lets you lock parsing behavior to a specific date for production stability</li>
      <li>SOC2 Type 2, HIPAA, and GDPR compliant — enterprise-grade security</li>
      <li>10,000 free credits per month — enough to try before committing</li>
      <li>Native LlamaIndex integration makes RAG pipeline setup fast</li>
    </ul>
    <div class="source"><a href="https://www.llamaindex.ai/llamaparse" target="_blank" rel="noopener">Official Site</a> · <a href="https://www.llamaindex.ai/blog/introducing-llamaparse-v2-simpler-better-cheaper" target="_blank" rel="noopener">v2 Announcement</a> · <a href="https://www.llamaindex.ai/compare/llamaparse-vs-azure-document-intelligence" target="_blank" rel="noopener">LlamaIndex Comparison</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Cloud-only — no self-hosted or on-premise option, which disqualifies it for some compliance scenarios</li>
      <li>Usage-based billing can spike unpredictably at scale; Agentic Plus tier costs 45 credits/page</li>
      <li>Even the managed vision pipeline can miss content in very complex multi-level nested tables</li>
      <li>Previous versions required mastering multiple config options — v2 simplified this but some flexibility was traded away</li>
    </ul>
    <div class="source"><a href="https://blazedocs.io/blog/best-pdf-parser-for-rag" target="_blank" rel="noopener">BlazeDocs PDF Parser Review</a> · <a href="https://www.f22labs.com/blogs/5-best-document-parsers-in-2025-tested/" target="_blank" rel="noopener">F22 Labs Document Parser Test</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://developers.llamaindex.ai/llamaparse/general/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">10,000 credits/month — ~3,300 pages at Cost-effective tier or 10,000 pages at Fast tier</div>
  </a>
  <a href="https://developers.llamaindex.ai/llamaparse/general/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Fast</div>
    <div class="price">$0.00125<small>/page</small></div>
    <div class="desc">1 credit/page ($1.25 per 1,000 credits). Simple text-heavy documents, no markdown output</div>
  </a>
  <a href="https://developers.llamaindex.ai/llamaparse/general/pricing/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Agentic</div>
    <div class="price">$0.0125<small>/page</small></div>
    <div class="desc">10 credits/page. Complex layouts, multimodal content — recommended for most RAG pipelines</div>
  </a>
  <a href="https://developers.llamaindex.ai/llamaparse/general/pricing/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Agentic Plus</div>
    <div class="price">$0.05625<small>/page</small></div>
    <div class="desc">45 credits/page. Mission-critical maximum accuracy. 50% cheaper than previous top tier</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Parse Tiers (v2)</h4>
    <ul>
      <li><strong>Fast</strong> (1 credit/page) — spatial text only, fastest throughput</li>
      <li><strong>Cost-effective</strong> (3 credits/page) — balanced everyday performance, markdown output</li>
      <li><strong>Agentic</strong> (10 credits/page) — complex layouts, tables, multimodal</li>
      <li><strong>Agentic Plus</strong> (45 credits/page) — maximum accuracy, mission-critical</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Six Composable Products</h4>
    <ul>
      <li><strong>Parse</strong> — Agentic OCR for 130+ formats into LLM-ready text</li>
      <li><strong>Extract</strong> — Schema-based structured JSON extraction with confidence scores</li>
      <li><strong>Classify</strong> — Document categorization using natural-language rules</li>
      <li><strong>Split</strong> — Segment concatenated PDFs into logical sections (4 credits/page)</li>
      <li><strong>Sheets</strong> — Spreadsheet extraction with rich metadata (beta, free)</li>
      <li><strong>Index</strong> — Hosted vector search pipelines for RAG (beta, free)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Formats & Languages</h4>
    <ul>
      <li>130+ file formats including PDF, DOCX, PPTX, XLSX, images, audio</li>
      <li>100+ languages with multilingual parsing support</li>
      <li>Scanned PDFs and handwritten documents via agentic OCR</li>
      <li>Embedded charts, tables, checkboxes, and form fields</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Compliance & Security</h4>
    <ul>
      <li>SOC2 Type 2 certified</li>
      <li>HIPAA compliant</li>
      <li>GDPR compliant</li>
      <li>Enterprise support with dedicated account managers</li>
      <li>Version pinning for production stability (pin to YYYY-MM-DD)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Output Formats</h4>
    <ul>
      <li>Markdown (default for most tiers)</li>
      <li>Structured JSON (Extract product)</li>
      <li>Plain text (Fast tier)</li>
      <li>Bounding boxes and semantic reading order metadata</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Cost Optimization Features</h4>
    <ul>
      <li>48-hour file caching reduces repeat processing costs</li>
      <li>Page-range parsing — process only what you need</li>
      <li>Classification pre-filter before expensive Agentic parsing</li>
      <li>Auto cost optimizer for mixed document types</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | LlamaParse | Unstructured.io | Azure Document Intelligence |
|---------|-----------|-----------------|----------------------------|
| File Formats | <span class="highlight">130+</span> | 30+ | Standard business formats |
| Complex Table Handling | <span class="highlight">Excellent (8.5/10)</span> | Good | Struggles with complex layouts |
| Self-hosted Option | No | Yes | Azure cloud only |
| Free Tier | <span class="highlight">10K credits/mo</span> | Limited | Pay-as-you-go |
| RAG Integration | <span class="highlight">Native LlamaIndex</span> | LangChain | Azure ecosystem |
| Compliance | SOC2, HIPAA, GDPR | SOC2 | Azure compliance |
| Best For | Complex docs, RAG pipelines | Diverse file types | Microsoft-native teams |
| Pricing Model | Credit-based/page | Usage-based | Pay-per-page |

</div>
