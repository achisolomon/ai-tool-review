---
name: "pxpipe"
slug: "pxpipe"
website: "https://github.com/teamchong/pxpipe"
type: "open-source"
track: "developers"
category: "ai-coding"
subcategory: "cost-reduction"
status: "active"
description: "Local proxy that cuts Claude Code token bills 59–70% by re-rendering bulky context — system prompts, tool docs, and collapsed history — as compact PNGs, exploiting the fixed image-token cost of Fable 5's vision channel."
github_url: "https://github.com/teamchong/pxpipe"
github_stars: 7310
pricing_model: "free"
founded_year: 2026
headquarters: "Open Source"
tags:
  - typescript
  - api-available
  - self-hosted
  - cost-reduction
last_verified: "2026-07-08"
confidence_score: 0.92
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">59–70%</span>
    <span class="label">End-to-End Token Savings</span>
  </div>
  <div class="key-stat">
    <span class="number">~3.1×</span>
    <span class="label">Chars per Image-Token vs Text</span>
  </div>
  <div class="key-stat">
    <span class="number">4.8K+</span>
    <span class="label">GitHub Stars</span>
  </div>
</div>

## Overview

<div class="overview">
<p>pxpipe is a local MITM proxy that cuts Claude Code's input token bill by rendering bulky context — system prompts, tool docs, and older collapsed history — as compact PNGs before each request leaves your machine. An image's token cost is fixed by its pixel dimensions, not by how much text is inside it. Dense content (code, JSON, tool output) packs ~3.1 chars per image-token vs ~1 char per text-token on real Claude Code traffic. The proxy intercepts <code>/v1/messages</code>, rewrites eligible bulk into image blocks behind a per-request profitability gate, and forwards — responses stream normally. A live dashboard at <code>127.0.0.1:47821</code> shows tokens saved, text→image conversions side-by-side, and a kill switch. Recent turns always stay text; only the static prefix and older bulk history are imaged.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use pxpipe?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Claude Code users on Fable 5 with token-dense workloads (code, JSON, logs)</li>
        <li>Teams running long sessions with large system prompts and tool docs</li>
        <li>Developers who want measurable, per-request cost accountability via events log</li>
        <li>Projects where 59–70% end-to-end token savings justify some lossiness on imaged content</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Workflows requiring byte-exact recall of hex strings, IDs, or secrets from context (lossy by design)</li>
        <li>Opus 4.8 users — misread rate ~7% on rendered pages, opt-in only</li>
        <li>Sparse-prose workloads (~3.5 chars/token) where text wins on cost</li>
        <li>Teams needing zero added request latency (PNG encoding adds time before forwarding)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>30-second setup: <code>npx pxpipe-proxy</code> + one env var points Claude Code at it</li>
      <li>59–70% end-to-end bill reduction measured across all requests, not just compressed ones</li>
      <li>Savings measured honestly: free <code>count_tokens</code> probe on each original request, compared against actually-billed usage, no double-counting of cache discounts</li>
      <li>Fable 5 reads imaged context at 100/100 on novel arithmetic and 98/98 on gist recall benchmarks</li>
      <li>SWE-bench Lite pilot: 10/10 both arms at −65% request size</li>
      <li>Profitability gate — sparse prose stays text, images only when math wins</li>
      <li>MIT licensed, TypeScript, usable as a library without the proxy</li>
    </ul>
    <div class="source"><a href="https://github.com/teamchong/pxpipe" target="_blank">GitHub README</a> · <a href="https://github.com/teamchong/pxpipe/blob/main/FINDINGS.md" target="_blank">FINDINGS.md</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Lossy by design: verbatim 12-char hex recall drops to 13/15 on Fable 5, 0/15 on Opus — silent confabulation, not hard errors</li>
      <li>PNG encoding adds latency to large requests before they leave your machine</li>
      <li>Opus 4.8 and GPT 5.5 are deliberately opt-in — both read imaged content measurably worse</li>
      <li>Workload-dependent: wins on token-dense content, loses money on sparse prose</li>
      <li>Rendering research paused as of 2026-07-05 — verbatim misreads are capacity-bound, not solvable by layout tweaks</li>
    </ul>
    <div class="source"><a href="https://github.com/teamchong/pxpipe" target="_blank">GitHub README — The honest part &amp; Limitations</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/teamchong/pxpipe" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT license — proxy, dashboard, library API, and all benchmarks included</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>What Gets Compressed</h4>
    <ul>
      <li>Large <code>tool_result</code> bodies (file reads, command output, logs) above ~6k chars of token-dense content</li>
      <li>Older collapsed history: turns behind the live tail re-rendered as image pages</li>
      <li>Static system prompt + tool docs slab</li>
      <li>Everything else passes through byte-identical (messages, recent turns, model output)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Benchmarks (Fable 5)</h4>
    <ul>
      <li>Novel arithmetic (N=100): 100% accuracy, −38% tokens</li>
      <li>Gist recall with distractors (15k–45k char sessions, N=98/arm): 98/98 both arms</li>
      <li>State tracking (N=18/arm): 18/18 both arms</li>
      <li>Confabulation on never-stated facts (N=16/arm): 0/16 both arms</li>
      <li>SWE-bench Pro: 14/19 ON vs 15/19 OFF at −60%, 18/19 verdicts agree</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Model Scope</h4>
    <ul>
      <li>Default: <code>claude-fable-5</code> and <code>gpt-5.6</code></li>
      <li>Opus 4.8 and GPT 5.5: opt-in via <code>PXPIPE_MODELS</code> or dashboard (measurably worse at reading renders)</li>
      <li><code>PXPIPE_MODELS=off</code> disables imaging entirely</li>
      <li>Subagents on non-allowlisted models pass through as text</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Technical Details</h4>
    <ul>
      <li>1928px-wide columns, ~92,000 chars/page, ≈4,761 vision tokens per image</li>
      <li>Prompt caching preserved: static prefix splice kept cache-friendly</li>
      <li>Events log at <code>~/.pxpipe/events.jsonl</code> — per-request counterfactual and actual tokens</li>
      <li>Library mode: <code>renderTextToImages</code> / <code>transformAnthropicMessages</code> for direct integration</li>
      <li>Pure-JS runtime (Node and edge/Workers); <code>@napi-rs/canvas</code> build-time only</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | pxpipe | Token Optimizer | Context Mode | Manual Compaction |
|---------|--------|-----------------|--------------|-------------------|
| Approach | <span class="highlight">Image compression proxy</span> | Context pruning plugin | Selective context | Manual /compact |
| Token Savings | <span class="highlight">59–70% end-to-end</span> | Workload-dependent | Workload-dependent | Session-dependent |
| Setup | <span class="highlight">30 seconds, one command</span> | Plugin install | Toggle flag | Manual trigger |
| Lossiness | Imaged content (manageable) | None | None | None |
| Accuracy Measured | <span class="highlight">Per-request counterfactual</span> | Aggregate | Estimate | None |
| Model Scope | Fable 5, GPT 5.6 (default) | All | All | All |

</div>
