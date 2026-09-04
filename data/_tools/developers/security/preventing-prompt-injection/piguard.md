---
name: "PIGuard"
slug: "piguard"
website: "https://injecguard.github.io/"
type: "oss"
track: "developers"
category: "security"
subcategory: "preventing-prompt-injection"
status: "active"
description: "Academic ACL 2025 prompt-injection classifier that reduces false positives on benign trigger-word prompts"
pricing_model: "free"
founded_year: 2025
headquarters: "—"
github_url: "https://github.com/leolee99/PIGuard"
github_stars: 83
tags:
  - prompt-injection
  - classifier-model
last_verified: "2026-07-14"
confidence_score: 0.6
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">77+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">ACL 2025</span>
    <span class="label">Published</span>
  </div>
  <div class="key-stat">
    <span class="number">339</span>
    <span class="label">NotInject Benchmark Samples</span>
  </div>
</div>

## Overview

<div class="overview">
<p>PIGuard is the official code, dataset, and model release accompanying the ACL 2025 paper "PIGuard: Prompt Injection Guardrail via Mitigating Overdefense for Free" by Hao Li, Xiaogeng Liu, Ning Zhang, and Chaowei Xiao. It's a research-grade text-classification model (fine-tuned via a training strategy the paper calls "Mitigating Over-defense for Free," or MOF) aimed at a specific failure mode of existing prompt-guard classifiers: over-defense, where benign prompts that merely contain words common in injection attacks (e.g., "ignore," "system prompt," "instructions") get incorrectly flagged as attacks. The project was originally released under the name InjecGuard and later renamed to PIGuard for licensing reasons—the paper site and Hugging Face listings still reference the InjecGuard name in places. This is an academic single-paper release with model weights on Hugging Face and code/datasets on GitHub, not a maintained commercial product—there's no company, support contract, dashboard, or SLA behind it.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use PIGuard?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Researchers benchmarking prompt-guard models for over-defense / false-positive bias on trigger words</li>
        <li>ML engineers looking for a permissively licensed (MIT) classifier checkpoint to fine-tune or evaluate against</li>
        <li>Teams wanting the NotInject benchmark dataset to stress-test their own guardrail models for benign-prompt false positives</li>
        <li>Academic or hobbyist projects comfortable self-hosting a Hugging Face model with no vendor support</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing a maintained, production-supported guardrail with SLAs, uptime guarantees, or a dashboard</li>
        <li>Organizations that need vendor accountability, security patching cadence, or enterprise procurement/compliance paperwork</li>
        <li>Non-ML teams without the infrastructure to host and serve a classifier model themselves</li>
        <li>Anyone needing indirect-injection or agent-reasoning defenses—PIGuard is a single input classifier, not a multi-layer agent-security framework</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Directly targets a real, measurable weakness in existing prompt-guard models: several drop to near-random (~60%) accuracy on benign prompts containing trigger words</li>
      <li>Introduces NotInject, a reusable 339-sample benchmark for measuring over-defense, useful even if you don't adopt the PIGuard model itself</li>
      <li>Peer-reviewed via ACL 2025, giving it more methodological scrutiny than a typical unreviewed GitHub project</li>
      <li>MIT-licensed code and freely downloadable model weights on Hugging Face</li>
      <li>Reports beating the prior best model by roughly 30.8% on the NotInject over-defense benchmark, per the project's own README</li>
    </ul>
    <div class="source"><a href="https://github.com/leolee99/PIGuard" target="_blank">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Single-author academic repo with no company behind it—not a commercially supported product</li>
      <li>Renamed mid-life from InjecGuard to PIGuard for licensing reasons, which creates some confusing/inconsistent naming across the paper site, Hugging Face, and GitHub</li>
      <li>Performance and over-defense-reduction numbers come from the authors' own paper and README; independent third-party validation is limited</li>
      <li>No dedicated product website—the "website" is a GitHub Pages paper landing page, not a maintained docs/marketing site</li>
      <li>Only addresses direct prompt injection input classification; no coverage of indirect injection, agent reasoning, or tool-output scanning</li>
    </ul>
    <div class="source"><a href="https://injecguard.github.io/" target="_blank">Paper Site</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/leolee99/PIGuard" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Research code + model weights (MIT license), self-hosted via Hugging Face Transformers</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>MOF (Mitigating Over-defense for Free): training strategy designed to reduce bias toward flagging benign prompts that contain injection-attack trigger words</li>
      <li>NotInject: 339-sample benign evaluation dataset spanning three trigger-word-density tiers and four topic areas (Common Queries, Technique Queries, Virtual Creation, Multilingual Queries)</li>
      <li>Pretrained sequence-classification model published on Hugging Face (`leolee99/PIGuard`), usable directly via `transformers` `pipeline("text-classification", ...)`</li>
      <li>Evaluated across four benchmarks: NotInject, PINT, Wildguard-Benign, and BIPIA</li>
      <li>Full training and evaluation code released on GitHub alongside the paper</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Academic benchmarking of prompt-injection classifiers for both attack recall and benign-prompt false-positive rate</li>
      <li>Stress-testing an existing in-house or vendor guardrail against the NotInject dataset to check for over-defense</li>
      <li>Self-hosted, low-cost prompt-injection filtering for hobby or research projects that don't require commercial support</li>
      <li>Starting point for further fine-tuning on domain-specific injection/benign prompt data</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | PIGuard | ProtectAI DeBERTa | LlamaFirewall PromptGuard |
|---------|---------|--------------------|-----------------------------|
| Deployment | Self-hosted, open source (Hugging Face) | Self-hosted, open source (Hugging Face) | Self-hosted, open source (part of LlamaFirewall) |
| Backing | Single-author academic project (ACL 2025 paper) | ProtectAI (commercial security vendor) | Meta (Purple Llama, used internally in production) |
| Over-defense / false-positive focus | <span class="highlight">Core contribution—purpose-built MOF training + NotInject benchmark</span> | Not a primary design focus | Not a primary design focus |
| Benchmark dataset released | <span class="highlight">Yes—NotInject (339 samples)</span> | No dedicated over-defense dataset | No dedicated over-defense dataset |
| License | MIT | Apache 2.0 | MIT (framework); Llama Community License (models) |
| Maturity / support | Research prototype, no commercial support | Backed by a security company, more production usage | Backed by Meta, actively maintained |
| GitHub stars | 77 | Higher (widely used base model) | 4,300+ (PurpleLlama repo) |

</div>
