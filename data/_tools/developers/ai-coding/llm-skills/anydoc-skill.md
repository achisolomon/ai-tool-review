---
name: "anydocSkill"
slug: "anydoc-skill"
website: "https://github.com/Amitro123/anydocSkill"
type: "open-source"
track: "developers"
category: "ai-coding"
subcategory: "llm-skills"
status: "active"
description: "Claude Code skill that converts documents to Markdown and HTML while preserving correct text order, built specifically to solve the Hebrew/right-to-left text extraction problem that scrambles output in most document extractors."
github_url: "https://github.com/Amitro123/anydocSkill"
github_stars: 2
pricing_model: "open-source"
founded_year: 2026
tags:
  - mcp-server
last_verified: "2026-10-16"
confidence_score: 0.75
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">2</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">1 mo</span>
    <span class="label">Project Age</span>
  </div>
  <div class="key-stat">
    <span class="number">Free</span>
    <span class="label">MIT License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>anydocSkill is a Claude Code skill that converts PDFs, Word, PowerPoint, Excel, OpenDocument, and EPUB files into Markdown and HTML. It wraps Firecrawl's <a href="/tools/anydoc/">anydoc</a> library for office formats, which it credits with the best structural fidelity, but deliberately avoids anydoc's PDF extractor in favor of pdf.js — because the author found Firecrawl's PDF path scrambles Hebrew and other right-to-left text beyond repair. The skill's core design principle is to refuse to output scrambled text rather than silently produce a wrong conversion, verifying its own output against the source document when the --verify flag is used. A companion anydoc-ocr skill handles scanned documents via ocrmypdf.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use anydocSkill?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Claude Code users converting Hebrew or other RTL-language documents, where mainstream extractors scramble reading order</li>
        <li>Legal or formatted documents needing preserved clause numbering and removed repeated headers/footers</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Production pipelines needing a proven track record — this is a one-month-old personal project with no visible adoption beyond its author</li>
        <li>Non-Claude-Code workflows — it's built specifically as a Claude Code skill, not a standalone CLI or API</li>
        <li>Teams needing active community support or a maintained roadmap</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Directly addresses a real, specific gap: scrambled Hebrew/RTL text extraction that mainstream tools (including Firecrawl's own PDF extractor) get wrong</li>
      <li>Verification mode (--verify) compares output against the source document instead of assuming correctness</li>
      <li>Preserves legal clause numbering and strips repeated headers/footers</li>
      <li>MIT licensed, free to use</li>
    </ul>
    <div class="source"><a href="https://github.com/Amitro123/anydocSkill" target="_blank" rel="noopener">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Very early-stage: created September 2026, 2 stars, 0 forks, built and maintained by a single developer</li>
      <li>No public adoption signal, third-party reviews, or community discussion found</li>
      <li>One open issue flags missing test fixtures for malformed packages and mixed-script RTL content</li>
      <li>Tied to the Claude Code skill ecosystem rather than usable as a general-purpose tool</li>
    </ul>
    <div class="source"><a href="https://github.com/Amitro123/anydocSkill/issues" target="_blank" rel="noopener">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/Amitro123/anydocSkill" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT license, no paid tier.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Supported Formats</h4>
    <ul>
      <li>PDF (via pdf.js, not anydoc's PDF path)</li>
      <li>DOCX, PPTX, XLSX, ODT, EPUB (via Firecrawl anydoc)</li>
      <li>Plain text</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Key Behaviors</h4>
    <ul>
      <li>Refuses scrambled Hebrew/RTL output instead of producing silently-wrong text</li>
      <li>--verify flag checks output against the source document</li>
      <li>Recovers section headings from hand-formatted documents</li>
      <li>Preserves table structure and legal clause numbering</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Related Skill</h4>
    <ul>
      <li>anydoc-ocr — companion skill for scanned documents using ocrmypdf</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | anydocSkill | Anydoc (Firecrawl) | MarkItDown.tech |
|---------|-------------|---------------------|------------------|
| RTL/Hebrew Handling | <span class="highlight">Purpose-built refusal logic</span> | Known to scramble (per author) | Not verified |
| Interface | Claude Code skill | Library/CLI/API | Browser app |
| Maturity | 1 month, 2 stars | 22.9K stars, active | Commercial, established |
| Output Verification | <span class="highlight">Built-in --verify flag</span> | No | No |
| License | MIT | MIT | Commercial (freemium) |

</div>
