---
name: "Headroom"
slug: "headroom"
website: "https://github.com/chopratejas/headroom"
type: "oss"
track: "developers"
category: "ai-coding"
subcategory: "cost-reduction"
status: "active"
description: "Context compression system that reduces AI agent token usage by 60-95% while maintaining accuracy"
github_url: "https://github.com/chopratejas/headroom"
github_stars: 66273
pricing_model: "free"
founded_year: 2026
tags:
  - mcp-server
  - skill
  - cost-reduction
last_verified: "2026-06-08"
confidence_score: 0.95
source_urls:
  - "https://github.com/chopratejas/headroom"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">18K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">60-95%</span>
    <span class="label">Token Savings</span>
  </div>
  <div class="key-stat">
    <span class="number">4</span>
    <span class="label">Deployment Modes</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Headroom is a context compression system that reduces token usage for AI agents by 60-95% while maintaining accuracy. It compresses everything agents read—tool outputs, logs, RAG chunks, files, and conversation history—before sending to LLMs. Supports library, proxy, MCP server, and agent wrapper deployment modes with reversible compression (CCR) that preserves originals for LLM retrieval.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Headroom?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams running daily AI coding agents</li>
        <li>High-volume agentic workflows</li>
        <li>Multi-agent systems needing shared memory</li>
        <li>SRE/DevOps with large log analysis</li>
        <li>RAG pipelines with token constraints</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple single-query use cases</li>
        <li>Projects with minimal context needs</li>
        <li>Teams not tracking token costs</li>
        <li>Workflows requiring exact original text</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>92% token reduction on code search (100 results)</li>
      <li>92% savings on SRE incident debugging</li>
      <li>Multiple deployment modes (library, proxy, MCP, wrapper)</li>
      <li>Reversible compression preserves originals</li>
      <li>Cross-agent memory with automatic deduplication</li>
      <li>Accuracy preserved on GSM8K, TruthfulQA, SQuAD v2</li>
      <li>Works with Anthropic, OpenAI, Bedrock, any OpenAI-compatible</li>
    </ul>
    <div class="source"><a href="https://github.com/chopratejas/headroom" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Additional processing overhead</li>
      <li>Compression may lose nuance in some cases</li>
      <li>Requires Python 3.10+ or Node.js</li>
      <li>Learning curve for optimal configuration</li>
    </ul>
  </div>
</div>

<div class="editor-note">
<h3>Editor's Note</h3>
<p>The 90% token savings claim is misleading. Like RTK and similar tools, Headroom focuses on one narrow piece of the waste puzzle: compressing tool output before the model sees it. That's the entire source of savings.</p>
<p>The "90%" figure refers specifically to reducing tool output size—not your total token usage. In practice, this represents a small fraction of actual spend. For 85-90% of real-world token waste, these tools simply don't help.</p>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/chopratejas/headroom" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Free</div>
    <div class="price">$0</div>
    <div class="desc">Open source, Apache 2.0</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Deployment Modes</h4>
    <ul>
      <li>Library: compress(messages) API</li>
      <li>Local proxy: zero code changes</li>
      <li>Agent wrapper for claude/cursor/codex/aider</li>
      <li>MCP server with headroom_compress tool</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Compression Engines</h4>
    <ul>
      <li>SmartCrusher for JSON structures</li>
      <li>CodeCompressor with AST awareness</li>
      <li>Kompress-base (custom HuggingFace model)</li>
      <li>CacheAligner for KV cache optimization</li>
      <li>IntelligentContext for score-based fitting</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Real-World Results</h4>
    <ul>
      <li>Code search: 17,765 → 1,408 tokens (92%)</li>
      <li>SRE debugging: 65,694 → 5,118 tokens (92%)</li>
      <li>GitHub triage: 54,174 → 14,761 tokens (73%)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Platforms</h4>
    <ul>
      <li>Python (pip install headroom-ai)</li>
      <li>TypeScript/Node (npm install headroom-ai)</li>
      <li>Docker image available</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Category | Token Optimizer | Headroom | RTK |
|----------|-----------------|----------|-----|
| **Tool output compression** | <span class="highlight">99%+ per-output, progressive disclosure</span> | 60-95% (cherry-picked benchmarks) | 60-90% (CLI only) |
| **First-read file skeletons** | <span class="highlight">Shadow-validated, fail-open</span> | — | — |
| **Bash/CLI output compression** | <span class="highlight">Generic + git/ls/pytest patterns</span> | Partial | <span class="highlight">Yes (main feature)</span> |
| **Tabular/JSON compression** | <span class="highlight">Value-preserving columnar</span> | <span class="highlight">Yes (main feature)</span> | — |
| **Delta reads (re-read = diff only)** | <span class="highlight">Yes</span> | — | — |
| **Model routing (wrong model for task)** | <span class="highlight">9 waste detectors</span> | — | — |
| **Loop/spin detection** | <span class="highlight">Yes</span> | — | — |
| **Context quality scoring** | <span class="highlight">Per-session, cross-session average</span> | — | — |
| **Cache instability detection** | <span class="highlight">Yes</span> | — | — |
| **Retry churn detection** | <span class="highlight">Yes</span> | — | — |
| **Tool cascade waste** | <span class="highlight">Yes</span> | — | — |
| **Code structure maps** | <span class="highlight">Outlines on repeated reads</span> | — | — |
| **Conversation history** (60-75% of cost) | <span class="highlight">Checkpoint + compaction awareness</span> | Doesn't touch it | Doesn't touch it |
| **Quality gates** | <span class="highlight">3-tier system, edit-rate proxies</span> | "Same answers" (untested) | — |
| **Measured dollar savings** | <span class="highlight">Real bill reduction per category</span> | Per-output ratios only | `rtk gain` analytics |
| **Multi-platform** | <span class="highlight">Claude Code, Codex, OpenClaw, OpenCode</span> | Python library + proxy | <span class="highlight">macOS, Linux, WSL</span> |

**Summary:** Token Optimizer covers 16/16 categories. Headroom and RTK each focus on one narrow slice (tool output compression) and miss 85-90% of actual token waste.

</div>
