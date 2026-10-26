---
name: "Maxwell"
slug: "maxwell"
website: "https://heymaxwell.ai/"
type: "commercial"
track: "developers"
category: "ai-infrastructure"
subcategory: "compute-optimization"
status: "beta"
description: "doubleAI's code execution model: rewrites running CPU and GPU code to fit hardware and data, with each change formally proven equivalent."
pricing_model: "enterprise"
founded_year: 2023
headquarters: "Tel Aviv area, Israel"
tags:
  - agents
  - cost-reduction
last_verified: "2026-10-26"
confidence_score: 0.8
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">38x</span>
    <span class="label">Faster Data Pipelines (company figure)</span>
  </div>
  <div class="key-stat">
    <span class="number">$220M</span>
    <span class="label">Raised (Nvidia, Dell, Lightspeed)</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Maxwell is what doubleAI calls "the first Code Execution Model." Instead of helping you write code, it works on code while it runs: it studies how a program uses the hardware and its data, rewrites the machine code to fit, and formally proves each change equivalent to the original. It targets CPU and GPU workloads such as data pipelines and AI inference kernels, without changes to your source code. doubleAI is led by Mobileye co-founder Amnon Shashua and launched Maxwell in October 2026 in controlled early access.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Maxwell?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>AI labs and companies with large GPU inference bills</li>
        <li>Teams running heavy Python data pipelines (pandas, graph analytics)</li>
        <li>Organizations that want speed-ups without rewriting source code</li>
        <li>Buyers who prefer paying from savings over a fixed license</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Individual developers or small teams (no self-serve signup)</li>
        <li>Anyone who needs it today: access is by application only</li>
        <li>Teams that require independent benchmarks before buying</li>
        <li>Light workloads where compute cost is not a real line item</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Works on the running program, so no source changes are needed</li>
      <li>Every rewrite comes with a formal proof that behavior is unchanged</li>
      <li>A guard falls back to the original code if the faster path's conditions stop holding</li>
      <li>Covers both CPUs and GPUs, from pandas pipelines to Blackwell kernels</li>
      <li>LTX cut 4K video generation from about 4 minutes to just over 2 per clip</li>
    </ul>
    <div class="source"><a href="https://heymaxwell.ai/" target="_blank" rel="noopener">heymaxwell.ai</a> · <a href="https://www.doubleai.com/research/maxwell-ltx-2-5-4k-in-half-the-time" target="_blank" rel="noopener">LTX case study</a> · <a href="https://thenextweb.com/news/doubleai-maxwell-code-execution-model-compute-costs" target="_blank" rel="noopener">The Next Web</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Early access only; acceptance is not guaranteed and there is no release date</li>
      <li>All speed-up figures come from doubleAI, with no independent benchmarks yet</li>
      <li>No public pricing; doubleAI plans to take an undisclosed share of savings</li>
      <li>Rewrites production code at runtime without human review, which some teams won't allow</li>
      <li>One named customer result (LTX) so far</li>
    </ul>
    <div class="source"><a href="https://thenextweb.com/news/doubleai-maxwell-code-execution-model-compute-costs" target="_blank" rel="noopener">The Next Web</a> · <a href="https://siliconangle.com/2026/10/19/ai-developer-doubleai-debuts-maxwell-code-execution-model/" target="_blank" rel="noopener">SiliconANGLE</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://heymaxwell.ai/contact" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Early Access</div>
    <div class="price">Share of savings</div>
    <div class="desc">No public price; doubleAI plans to charge a cut of the compute you save. Apply on the site</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>How It Works</h4>
    <ul>
      <li>Analyzes a running program against its hardware and data</li>
      <li>Rewrites machine code, not source code</li>
      <li>Writes a formal equivalence proof for each change</li>
      <li>Reverts to the original path when assumptions break</li>
      <li>Runs without a human in the loop</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Published Results (company-reported)</h4>
    <ul>
      <li>pandas: 38x on the PDS-H benchmark</li>
      <li>Nvidia cuGraph: 3.6x faster on average as a drop-in</li>
      <li>Blackwell: beat PyTorch baselines on most SOL-ExecBench kernels</li>
      <li>Whisper-small on an RTX 4090: 106s down to 50s for 180 transcriptions</li>
      <li>LTX-2.5 4K video on two B200s: 1.87x faster</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Targets</h4>
    <ul>
      <li>Python first (doubleAI has formalized Python)</li>
      <li>Examples in Rust and C</li>
      <li>PyTorch code replaced with GPU kernels</li>
      <li>CPUs (SIMD) and Nvidia GPUs</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Company</h4>
    <ul>
      <li>doubleAI (AA-I Technologies Ltd.), founded 2023</li>
      <li>CEO Amnon Shashua, co-founder of Mobileye</li>
      <li>$200M Series A from Lightspeed and Bessemer, with Nvidia and Dell</li>
      <li>Valued at over $1B</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Maxwell | torch.compile | Hand-tuned kernels |
|---------|---------|---------------|--------------------|
| Works on | <span class="highlight">Running machine code</span> | PyTorch source | Source you rewrite |
| Source changes | <span class="highlight">None</span> | Small | Large |
| Correctness | <span class="highlight">Formal proof per change</span> | Tests | Tests and review |
| Scope | CPU and GPU, any workload | PyTorch models | One kernel at a time |
| Availability | Early access | Free, open source | Engineer time |
| Cost | Share of savings | Free | Expert salaries |

</div>
