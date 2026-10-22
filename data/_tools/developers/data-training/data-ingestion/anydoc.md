---
name: "Anydoc"
slug: "anydoc"
website: "https://github.com/firecrawl/anydoc"
type: "open-source"
track: "developers"
category: "data-training"
subcategory: "data-ingestion"
status: "active"
description: "Fast Rust library by Firecrawl that converts Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV, and PDF files into clean GitHub-Flavored Markdown with sub-5ms median conversion time."
github_url: "https://github.com/firecrawl/anydoc"
github_stars: 23031
pricing_model: "open-source"
founded_year: 2026
tags:
  - rag
  - self-hosted
  - api-available
  - doc-to-markdown
last_verified: "2026-10-16"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">22.9K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">&lt;5ms</span>
    <span class="label">Median Conversion</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">MIT License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Anydoc is Firecrawl's open-source Rust library for converting documents into consistent, GitHub-Flavored Markdown. It handles Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV, and PDF through a unified document model, so output structure stays the same no matter which format goes in. It detects format from content rather than file extension, preserves headings with anchors, tables with merged cells, footnotes, and speaker notes, and supports mathematical equations (Word OMML, OpenDocument MathML, RTF to LaTeX). The core library runs with no ML models or external service dependencies; an optional hosted OCR service (via Firecrawl Parse) handles scanned PDFs.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Anydoc?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Developers who need fast, dependency-free document-to-Markdown conversion embedded in a pipeline</li>
        <li>Teams already in the Firecrawl ecosystem wanting consistent output across mixed document formats</li>
        <li>Projects needing Node.js, Python, WebAssembly, or CLI bindings for a Rust-speed converter</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Scanned-document-heavy workloads without a hosted OCR key or self-hosted OCR endpoint</li>
        <li>Teams wanting a no-code, browser-based converter (it's a library/CLI, not a hosted app)</li>
        <li>Non-Latin script handling requiring guaranteed correct reading order — check output before trusting it for RTL languages</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Pure Rust implementation, sub-5ms median conversion, no ML models required for core processing</li>
      <li>Unified document model gives consistent Markdown structure across all supported formats</li>
      <li>Broad format coverage: Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV, PDF</li>
      <li>Multiple language bindings: Node.js, Python, WebAssembly, plus a Claude Agent Skill interface</li>
      <li>Strong adoption signal: 1,471 forks and active community engagement (see badge for current star count)</li>
    </ul>
    <div class="source"><a href="https://github.com/firecrawl/anydoc" target="_blank" rel="noopener">GitHub (official)</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Scanned-PDF OCR depends on Firecrawl's hosted Parse service (free tier limits apply) or a self-hosted equivalent</li>
      <li>111 open issues at time of review — check issue tracker for known format edge cases before relying on it in production</li>
      <li>No independent third-party review coverage found (Reddit/HN discussion not located)</li>
    </ul>
    <div class="source"><a href="https://github.com/firecrawl/anydoc/issues" target="_blank" rel="noopener">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/firecrawl/anydoc" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT license. No dependencies for core text-format conversion.</div>
  </a>
  <a href="https://github.com/firecrawl/anydoc" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Hosted OCR</div>
    <div class="price">Free tier + paid</div>
    <div class="desc">Optional Firecrawl Parse service for scanned PDFs; self-hostable alternative available.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Supported Formats</h4>
    <ul>
      <li>Word (DOCX), PowerPoint (PPTX), Excel (XLSX)</li>
      <li>OpenDocument (ODT, ODP, ODS)</li>
      <li>RTF, EPUB, CSV</li>
      <li>PDF (text-based; OCR for scanned pages)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Structure Preservation</h4>
    <ul>
      <li>Headings with anchors</li>
      <li>Tables with merged cells</li>
      <li>Footnotes and speaker notes</li>
      <li>Embedded assets with alt text</li>
      <li>Mathematical equations (OMML, MathML, RTF→LaTeX)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Distribution</h4>
    <ul>
      <li>npm (@firecrawl/anydoc)</li>
      <li>pip (firecrawl-anydoc)</li>
      <li>Cargo (Rust)</li>
      <li>WebAssembly build</li>
      <li>CLI binary</li>
      <li>Agent Skill interface</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Anydoc | Docling | MarkItDown.tech |
|---------|--------|---------|------------------|
| Language | Rust | Python | Hosted (Python-based) |
| Conversion Speed | <span class="highlight">&lt;5ms median</span> | ~65s/50 pages (CPU) | Browser-dependent |
| Self-hosted | <span class="highlight">Yes</span> | Yes | No |
| License | MIT | MIT | Commercial (freemium) |
| OCR | Hosted/optional | Built-in | Built-in |
| GitHub Stars | 22,878 | 68,861 | N/A |

</div>
