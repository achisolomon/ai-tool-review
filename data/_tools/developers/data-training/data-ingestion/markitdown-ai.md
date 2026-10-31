---
name: "MarkItDown AI"
slug: "markitdown-ai"
website: "https://markitdownai.org/"
type: "saas"
track: "developers"
category: "data-training"
subcategory: "data-ingestion"
status: "active"
description: "Browser-based converter that turns PDF, Word, Excel and PowerPoint files into Markdown locally, with paid Enhanced mode for scanned and complex documents."
pricing_model: "freemium"
founded_year: 2026
tags:
  - doc-to-markdown
  - rag
  - no-code
last_verified: "2026-10-25"
confidence_score: 0.7
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">8</span>
    <span class="label">Input Formats</span>
  </div>
  <div class="key-stat">
    <span class="number">$0</span>
    <span class="label">Browser Basic</span>
  </div>
  <div class="key-stat">
    <span class="number">2026</span>
    <span class="label">Launched</span>
  </div>
</div>

## Overview

<div class="overview">
<p>MarkItDown AI is an independent web app that converts PDF, DOCX, PPTX, XLSX, HTML, CSV, JSON, and XML files into Markdown for use with ChatGPT, Claude, and RAG pipelines. Its free Browser Basic mode runs locally in your browser, so files are not uploaded. A paid Enhanced mode (sign-in required, files uploaded) adds support for complex tables, formulas, and scanned documents. The name echoes Microsoft's open-source MarkItDown library, but the site states it is not the official Microsoft website, and its <a href="https://github.com/ghanashyamgoha9934-commits/-markitdown-ai" target="_blank" rel="noopener">GitHub repository</a> currently holds only a README, not source code.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use MarkItDown AI?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Quick one-off conversions of Office files or PDFs into Markdown for an LLM prompt</li>
        <li>Privacy-sensitive files you don't want uploaded (Browser Basic stays local)</li>
        <li>Non-developers who won't install a Python CLI</li>
        <li>Occasional scanned-PDF jobs via cheap one-time page packs</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Batch or automated pipelines (one local file at a time, no API documented)</li>
        <li>Teams that want auditable open-source code (the repo has no source)</li>
        <li>Large documents on the free tier (10MB / 30-page PDF limits)</li>
        <li>Developers already comfortable with Microsoft MarkItDown, which is free and scriptable</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Browser Basic converts files locally with no sign-in and no upload</li>
      <li>Covers the common office formats plus HTML, CSV, JSON, and XML</li>
      <li>Enhanced mode handles complex tables, formulas, and scanned documents</li>
      <li>Low-commitment pricing: a $1.99 pack and a free 2-page Enhanced trial</li>
    </ul>
    <div class="source"><a href="https://markitdownai.org/pricing" target="_blank">Source</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>GitHub repo is README-only with no code, releases, or community activity, despite an MIT badge</li>
      <li>README speed figures are self-reported with no methodology</li>
      <li>Not affiliated with Microsoft despite the similar name</li>
      <li>Enhanced mode uploads your files; check the retention notice first</li>
      <li>No independent reviews found yet</li>
    </ul>
    <div class="source"><a href="https://github.com/ghanashyamgoha9934-commits/-markitdown-ai" target="_blank">Source</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://markitdownai.org/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Browser Basic</div>
    <div class="price">$0</div>
    <div class="desc">Local in-browser conversion; files up to 10MB, PDFs up to 30 pages</div>
  </a>
  <a href="https://markitdownai.org/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Starter Pack</div>
    <div class="price">$1.99</div>
    <div class="desc">One time: 30 Enhanced pages, valid 90 days</div>
  </a>
  <a href="https://markitdownai.org/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Flex Pack</div>
    <div class="price">$14.90</div>
    <div class="desc">One time: 300 Enhanced pages, valid 180 days; files up to 100MB</div>
  </a>
  <a href="https://markitdownai.org/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro Monthly</div>
    <div class="price">$29.90/mo</div>
    <div class="desc">1,000 Enhanced pages per period, 100 Basic conversions/day, PDFs up to 300 pages</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Inputs: PDF, DOCX, PPTX, XLSX, HTML, CSV, JSON, XML</li>
      <li>Output: GitHub-Flavored Markdown with headings and tables preserved</li>
      <li>Browser Basic: local processing via WebAssembly, no upload</li>
      <li>Enhanced: complex tables, formulas, scanned-document recovery</li>
      <li>Free 2-page Enhanced trial with a verified Google account</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Preparing documents for ChatGPT or Claude prompts</li>
      <li>Chunking source files for RAG ingestion</li>
      <li>Extracting slide text and speaker notes from decks</li>
      <li>Turning spreadsheets into Markdown tables</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | MarkItDown AI | [MarkItDown.tech](/tools/markitdown-tech/) | Microsoft MarkItDown |
|---------|---------------|-----------------|----------------------|
| Interface | Web app | Web app | Python CLI / library |
| Local, no-upload mode | Yes (Browser Basic) | Yes, for supported formats | Yes (runs on your machine) |
| Scanned PDFs | Paid Enhanced mode | AI OCR | Via plugins / extra setup |
| Source code | README only | Not open source | Open source (MIT) |
| Price | Free tier, packs from $1.99 | Freemium | Free |

</div>
