---
name: RAPTOR
slug: raptor
website: https://github.com/gadievron/raptor
type: open-source
track: developers
category: security
subcategory: security-scanning
status: active
description: Autonomous security research framework built on Claude Code that chains
  static analysis, binary analysis, LLM-powered vulnerability validation, exploit
  generation, and patch writing into a single workflow
github_url: https://github.com/gadievron/raptor
github_stars: 3667
pricing_model: open-source
founded_year: 2025
tags:
- agents
- python
- self-hosted
last_verified: '2026-06-12'
confidence_score: 0.95
---
<div class="key-stats">
  <div class="key-stat">
    <span class="number">2,950</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">13</span>
    <span class="label">Commands</span>
  </div>
  <div class="key-stat">
    <span class="number">9</span>
    <span class="label">Expert Personas</span>
  </div>
  <div class="key-stat">
    <span class="number">5</span>
    <span class="label">LLM Providers</span>
  </div>
</div>

## Overview

<div class="overview">
<p>RAPTOR (Recursive Autonomous Penetration Testing and Observation Robot) is an autonomous security research framework built on top of Claude Code that chains static analysis, binary analysis, LLM-powered vulnerability validation, exploit generation, and patch writing into a single workflow you can run against a codebase or binary. Created by veteran security researchers Gadi Evron, Daniel Cuthbert, Thomas Dullien (Halvar Flake), Michael Bargury, and John Cartwright, it configures the agent for adversarial thinking through rules, sub-agents, and skills. The architecture splits into a Python execution layer (Semgrep, CodeQL, SARIF parsing, LLM dispatch) that can run standalone in CI, and a Claude Code decision layer that prioritizes findings, interprets results, and judges exploitability.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use RAPTOR?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Security researchers hunting vulnerabilities in code and binaries</li>
        <li>Teams wanting LLM triage to cut SAST false positives</li>
        <li>Binary fuzzing and crash root-cause analysis (AFL++, rr)</li>
        <li>Supply chain audits with SBOM and SARIF output</li>
        <li>CI pipelines needing structured scan output without Claude Code</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Web application scanning (module is an alpha stub)</li>
        <li>Commercial use without license review (CodeQL dependency forbids it)</li>
        <li>Teams needing polished, supported commercial software</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Full autonomous pipeline: scan, validate, exploit, patch via <code>/agentic</code></li>
      <li>Multi-stage exploitability validation (Stages A–D) filters tool noise before reporting</li>
      <li>Z3 SMT pre-screening drops provably unreachable CodeQL paths before any LLM call</li>
      <li>Works fully offline for Semgrep scanning—registry packs shipped in the repo</li>
      <li>Provider-agnostic analysis layer: Anthropic, OpenAI, Gemini, Mistral, Ollama with per-role model assignment</li>
      <li>Built-in cost controls (<code>RAPTOR_MAX_COST</code>) and a trust scorecard for cheap-model short-circuiting</li>
      <li>Authored by recognized security researchers; MIT licensed</li>
    </ul>
    <div class="source"><a href="https://github.com/gadievron/raptor" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Self-described as "not polished software... held together with enthusiasm and duct tape"</li>
      <li>Web exploitation module is an alpha-stage stub</li>
      <li>CodeQL's license does not permit commercial use despite RAPTOR's MIT license</li>
      <li>Devcontainer image is large (~6 GB) and needs <code>--privileged</code> Docker for the rr debugger</li>
      <li>Full agentic workflow requires Claude Code; local Ollama models produce unreliable exploit and patch code</li>
    </ul>
    <div class="source"><a href="https://github.com/gadievron/raptor" target="_blank">GitHub README</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/gadievron/raptor" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT license; LLM API costs apply, capped per run via RAPTOR_MAX_COST</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Commands</h4>
    <ul>
      <li><code>/agentic</code> — full scan, validate, exploit, patch workflow</li>
      <li><code>/scan</code> — static analysis with Semgrep and CodeQL</li>
      <li><code>/understand</code> — attack surface mapping and data flow tracing</li>
      <li><code>/validate</code> — multi-stage exploitability validation</li>
      <li><code>/fuzz</code> — binary fuzzing with AFL++ and crash analysis</li>
      <li><code>/crash-analysis</code> — autonomous C/C++ crash root-cause analysis</li>
      <li><code>/sca</code> — software composition analysis with SBOM output</li>
      <li><code>/oss-forensics</code> — evidence-backed GitHub repo investigation</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Validation Pipeline</h4>
    <ul>
      <li>Stage A: real vulnerability or pattern-matching noise?</li>
      <li>Stage B: attacker requirements and obstacles</li>
      <li>Stage C: does the code path exist and is it reachable?</li>
      <li>Stage D: final call on test code, preconditions, hedging</li>
      <li>Cross-finding analysis for shared root causes and attack chains</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supply Chain Analysis</h4>
    <ul>
      <li>OSV advisories, CISA KEV, EPSS, SSVC enrichment</li>
      <li>CycloneDX SBOM with VEX data</li>
      <li>SARIF output for GitHub/GitLab code scanning</li>
      <li>Manifest, lockfile, workflow, and container package discovery</li>
      <li>Fix, upgrade, diff, and verify subcommands</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Model Flexibility</h4>
    <ul>
      <li>Roles: analysis, code, consensus, aggregate, fallback</li>
      <li>Multi-model correlation across providers</li>
      <li>Fast-tier short-circuit with Wilson-bound trust scorecard</li>
      <li>Z3 SMT dataflow pre-screening and one-gadget constraint analysis</li>
      <li>Offline Semgrep with bundled registry packs</li>
    </ul>
  </div>
</div>

</details>

## Expert Personas

<div class="info-grid">
  <div class="info-card">
    <h4>On-Demand Perspectives</h4>
    <ul>
      <li>Mark Dowd — binary exploitation and vulnerability research</li>
      <li>Charlie Miller / Halvar Flake — low-level exploitation</li>
      <li>Penetration Tester — realistic attack scenario assessment</li>
      <li>Fuzzing Strategist — corpus design and triage</li>
      <li>CodeQL Dataflow Analyst — query writing and path analysis</li>
    </ul>
    <div class="source"><a href="https://github.com/gadievron/raptor" target="_blank">GitHub README</a></div>
  </div>
  <div class="info-card">
    <h4>Project Workspaces</h4>
    <ul>
      <li>Merged findings across runs</li>
      <li>Coverage tracking per file</li>
      <li>Diffs between runs</li>
      <li>Export and report generation</li>
    </ul>
    <div class="source"><a href="https://github.com/gadievron/raptor" target="_blank">GitHub README</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | RAPTOR | Semgrep | CodeQL |
|---------|--------|---------|--------|
| Finding Validation | <span class="highlight">LLM multi-stage pipeline</span> | Rule-based only | Query-based only |
| Exploit Generation | <span class="highlight">PoC + patch output</span> | No | No |
| Binary Analysis | <span class="highlight">Fuzzing, crash triage, Z3</span> | No | No |
| Orchestration | <span class="highlight">Autonomous agent (Claude Code)</span> | CLI/CI | CLI/CI |
| False Positive Filtering | <span class="highlight">SMT + LLM validation</span> | Manual triage | Manual triage |
| Commercial Use | MIT, but CodeQL dependency restricted | Yes (OSS engine) | Restricted |

</div>
