---
category: data-training
confidence_score: 0.97
description: "Docling is an open-source document parser by IBM Research that converts PDFs, Office files, and 20+ formats into structured, LLM-ready data using layout-aware AI models with best-in-class table extraction accuracy."
founded_year: 2024
github_url: "https://github.com/DS4SD/docling"
github_stars: 62774
headquarters: "IBM Research Zurich"
last_verified: '2026-06-17'
name: Docling
pricing_model: open-source
slug: docling
status: active
subcategory: data-ingestion
tags:
  - rag
  - python
  - self-hosted
  - mcp-server
track: developers
type: open-source
website: https://github.com/DS4SD/docling
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">61.7K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">97.9%</span>
    <span class="label">Table Accuracy</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">Releases</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">MIT License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Docling is IBM Research's open-source document intelligence toolkit, designed to get documents ready for generative AI. It converts PDFs, DOCX, PPTX, XLSX, HTML, images, audio, and more into a unified structured representation using state-of-the-art layout models and the TableFormer model — trained on 1M+ tables — for 97.9% cell accuracy on complex tables. It runs fully local with no API costs, GPU acceleration support, and air-gapped deployment capability, making it the go-to choice for privacy-sensitive and cost-sensitive RAG pipelines. Donated to the Linux Foundation's Agentic AI Foundation in 2025, it has seen rapid community adoption since its public launch in August 2025.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Docling?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building RAG pipelines that need the highest document parsing accuracy, especially complex tables</li>
        <li>Organizations with compliance or privacy requirements that prohibit sending documents to cloud APIs</li>
        <li>Cost-sensitive workloads processing millions of pages — zero per-page cost vs. $0.10+/page for SaaS alternatives</li>
        <li>Developers in the LangChain, LlamaIndex, Haystack, or Crew AI ecosystems — native integrations exist</li>
        <li>Teams processing scientific papers, XBRL financial filings, JATS articles, or mixed-media documents</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing the fastest processing — cloud APIs like LlamaParse are ~10x faster (6s vs. 65s for 50 pages)</li>
        <li>Handwriting recognition or form checkbox extraction — not yet supported</li>
        <li>Chart and figure extraction — still listed as coming soon</li>
        <li>Teams needing vendor-backed enterprise compliance certifications (SOC 2, HIPAA) from the tool provider</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Best-in-class table extraction — 97.9% cell accuracy on complex tables (vs. 75% for Unstructured, unreliable for LlamaParse)</li>
      <li>100% text extraction accuracy on independent benchmarks</li>
      <li>Fully free and open-source (MIT) — no per-page fees, no API dependency, no vendor lock-in</li>
      <li>Self-hosted and air-gapped deployment for regulated industries</li>
      <li>Up to 6x GPU speedup on NVIDIA CUDA, AMD ROCm, and Apple Silicon MLX</li>
      <li>TableFormer model trained on 1M+ tables; layout model on 81,000 manually labeled pages</li>
      <li>MCP integration for agentic AI workflows</li>
      <li>IBM processed 2.1M PDFs from Common Crawl using Docling — proven at scale</li>
    </ul>
    <div class="source"><a href="https://github.com/DS4SD/docling" target="_blank" rel="noopener">GitHub (official)</a> · <a href="https://procycons.com/en/blogs/pdf-data-extraction-benchmark/" target="_blank" rel="noopener">procycons Benchmark</a> · <a href="https://idp-software.com/vendors/docling/" target="_blank" rel="noopener">IDP Software Review</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Slower than cloud APIs — ~65 seconds for 50 pages locally vs. ~6 seconds for LlamaParse</li>
      <li>Chart and figure extraction not yet available — listed as coming soon</li>
      <li>No form extraction or handwriting recognition</li>
      <li>Multilingual support for Arabic, Chinese, Japanese is experimental, not enterprise-validated</li>
      <li>TableFormer uses fixed batch size of 4 regardless of GPU VRAM — inefficient for high-VRAM setups</li>
      <li>Large container images: 4.4GB (CPU) to 11.4GB (CUDA)</li>
    </ul>
    <div class="source"><a href="https://procycons.com/en/blogs/pdf-data-extraction-benchmark/" target="_blank" rel="noopener">procycons Benchmark</a> · <a href="https://llms.reducto.ai/document-parser-comparison" target="_blank" rel="noopener">Reducto Comparison</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/DS4SD/docling" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT License. Self-hosted, air-gapped, no API costs. GPU acceleration included. No page limits.</div>
  </a>
  <a href="https://github.com/DS4SD/docling" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Granite-Docling VLM</div>
    <div class="price">Free</div>
    <div class="desc">258M parameter visual language model (Apache 2.0). Download separately for production-grade visual understanding.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Supported File Formats</h4>
    <ul>
      <li>PDF (layout-aware, scanned via OCR)</li>
      <li>DOCX, PPTX, XLSX (Office documents)</li>
      <li>HTML, EPUB (web and ebook)</li>
      <li>PNG, TIFF, JPEG (images)</li>
      <li>WAV, MP3 (audio transcription)</li>
      <li>WebVTT (captions)</li>
      <li>EML, MSG (email)</li>
      <li>LaTeX, plain text</li>
      <li>XBRL (financial/regulatory)</li>
      <li>JATS (scientific articles)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Key AI Models</h4>
    <ul>
      <li><strong>TableFormer</strong> — trained on 1M+ tables for complex table extraction</li>
      <li><strong>Granite-Docling-258M VLM</strong> — 258M parameter visual language model (Apache 2.0)</li>
      <li>Layout model trained on 81,000 manually labeled pages</li>
      <li>DocTags markup format preserving structure and provenance</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Output Formats</h4>
    <ul>
      <li>Markdown (with structure preserved)</li>
      <li>HTML</li>
      <li>JSON (DoclingDocument schema)</li>
      <li>Structured data via Pydantic schemas</li>
      <li>Bounding box metadata for citations</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>LangChain, LlamaIndex, Crew AI, Haystack (native)</li>
      <li>Model Context Protocol (MCP) for agentic workflows</li>
      <li>Red Hat AI 3.3 and OpenShift AI</li>
      <li>Anyscale / KubeRay for distributed processing</li>
      <li>Java via docling-serve REST API</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Performance</h4>
    <ul>
      <li>Up to 6x speedup with GPU over CPU-only</li>
      <li>NVIDIA CUDA, AMD ROCm, Apple Silicon MLX support</li>
      <li>Distributed batch processing via Ray Data</li>
      <li>DocLayNet 88.5% mAP on layout analysis benchmark</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Deployment Options</h4>
    <ul>
      <li>Local Python library (pip install docling)</li>
      <li>Docker container (CPU: 4.4GB, CUDA: 11.4GB)</li>
      <li>Air-gapped / offline deployment</li>
      <li>docling-serve REST API wrapper</li>
      <li>OpenShift Operator for enterprise Kubernetes</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Docling | LlamaParse | Unstructured |
|---------|---------|-----------|--------------|
| Text Accuracy | <span class="highlight">100%</span> | Good | High |
| Complex Table Accuracy | <span class="highlight">97.9%</span> | Inconsistent | 75% |
| Processing Speed (50 pages) | ~65s local | <span class="highlight">~6s (cloud)</span> | ~141s |
| Cost | <span class="highlight">Free (MIT)</span> | $0.0013–$0.056/page | $0.03/page |
| Self-hosted / Air-gapped | <span class="highlight">Yes</span> | No | Yes (Business) |
| GPU Acceleration | <span class="highlight">Yes</span> | N/A (cloud) | No |
| Enterprise Compliance | Self-managed | No | <span class="highlight">SOC2, HIPAA</span> |
| File Formats | 20+ | 130+ | 60+ |
| MCP Support | <span class="highlight">Yes</span> | No | No |
| Best For | Accuracy + privacy | Speed + APIs | Compliance + breadth |

</div>
