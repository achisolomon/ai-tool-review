---
name: "Ghidra MCP"
slug: "ghidra-mcp"
website: "https://github.com/bethington/ghidra-mcp"
type: oss
track: developers
category: "ai-coding"
subcategory: "code-intelligence"
status: active
description: "Open-source MCP server bridging Ghidra's reverse engineering engine with AI assistants for binary decompilation and analysis"
pricing_model: free
founded_year: 2024
headquarters: "—"
github_url: "https://github.com/bethington/ghidra-mcp"
github_stars: 5864
tags:
  - mcp-server
  - agents
  - self-hosted
  - api-available
  - reverse-engineering
last_verified: "2026-10-17"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">5.7k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">200+</span>
    <span class="label">MCP Tools</span>
  </div>
  <div class="key-stat">
    <span class="number">2024</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Ghidra MCP is an open-source Model Context Protocol server that connects NSA's Ghidra reverse engineering suite to AI assistants and automation frameworks. A Java plugin exposes Ghidra's analysis engine over HTTP, while a Python MCP bridge translates those endpoints into standardized MCP calls, letting tools like Claude decompile functions, trace call graphs, map cross-references, and rename or type variables directly inside a live Ghidra project. It ships both a GUI plugin for interactive use and a headless server for CI pipelines, with Docker support and lazy tool loading to keep context usage manageable across its large tool surface.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Ghidra MCP?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Reverse engineers and malware analysts who want an AI assistant working inside Ghidra</li>
        <li>Security teams automating binary triage or documentation at scale</li>
        <li>Researchers needing cross-version function matching across patched binaries</li>
        <li>Teams building CI pipelines around headless, automated binary analysis</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Users without an existing Ghidra install or reverse engineering workflow</li>
        <li>Teams uncomfortable granting an AI agent write access to analysis projects</li>
        <li>Casual users who just want a one-off decompile without setting up MCP tooling</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Large tool surface with full write access (renaming, typing, structure creation, script execution, live debugging), not just read-only decompiles</li>
      <li>Batch operations and atomic transactions cut API calls and avoid partial failures during long analysis sessions</li>
      <li>Cross-binary documentation transfer via function hash matching speeds up re-analyzing patched versions</li>
      <li>Flexible deployment: GUI plugin, headless CI server, and Docker containers with optional authentication</li>
    </ul>
    <div class="source"><a href="https://github.com/bethington/ghidra-mcp" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires a specific Ghidra and Java version to stay compatible, so upgrades need coordination</li>
      <li>Write access and script execution mean a misconfigured or unsandboxed agent could corrupt analysis data</li>
      <li>Convention-enforcement tooling can reject renames outside its rules, which may surprise users expecting a stable API</li>
    </ul>
    <div class="source"><a href="https://github.com/bethington/ghidra-mcp/discussions/5" target="_blank">GitHub Discussions</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/bethington/ghidra-mcp" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Apache 2.0 licensed, free to self-host alongside your own Ghidra install</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Function decompilation, call graph analysis, and cross-reference mapping</li>
      <li>Data flow analysis using PCode-graph technology</li>
      <li>Structure and enumeration discovery with automated field naming</li>
      <li>String extraction with regex search and quality filtering</li>
      <li>P-code emulation for isolated function execution</li>
      <li>Live debugger integration via Ghidra's TraceRmi framework</li>
      <li>Lazy tool loading so AI clients load only the tool groups they need</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Malware analysis and behavioral detection</li>
      <li>Reverse engineering of closed-source binaries</li>
      <li>Automated documentation workflows for large codebases</li>
      <li>Cross-version binary matching and annotation propagation</li>
      <li>API hash resolution via emulation</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Ghidra MCP | suidpit/ghidra-mcp | reverse-engineering-assistant |
|---------|------------|---------------------|-------------------------------|
| Tool count | 200+ endpoints | Smaller, focused set | Focused set |
| Write access | Full (rename, type, script, debug) | Limited | Limited |
| Deployment | GUI, headless, Docker | GUI plugin | GUI plugin |
| Batch operations | Yes, atomic transactions | No | No |

</div>
