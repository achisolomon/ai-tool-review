---
name: "IBM Granite Guardian"
slug: "granite-guardian"
website: "https://www.ibm.com/granite/docs/models/guardian"
type: "oss"
track: "developers"
category: "security"
subcategory: "preventing-prompt-injection"
status: "active"
description: "IBM's open-source guardrail model family that scores prompts and responses for jailbreaks, prompt injection, and harm"
pricing_model: "free"
founded_year: 2024
headquarters: "Armonk, NY"
github_url: "https://github.com/ibm-granite/granite-guardian"
github_stars: 162
tags:
  - prompt-injection
  - classifier-model
  - self-hosted
last_verified: "2026-07-14"
confidence_score: 0.85
---
<div class="key-stats">
  <div class="key-stat">
    <span class="number">162+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">2B-8B</span>
    <span class="label">Model Sizes</span>
  </div>
  <div class="key-stat">
    <span class="number">Apache 2.0</span>
    <span class="label">License</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Granite Guardian is IBM's open-source family of guardrail models, fine-tuned from Granite base models to act as a judge over the inputs and outputs of an LLM pipeline. Instead of generating content, each model scores prompts and responses against a set of risk dimensions—jailbreak and prompt-injection attempts, harmful or profane content, social bias, and violence—plus RAG-specific risks like groundedness and answer relevance, and agentic risks like function-calling hallucination. The latest release, Granite-Guardian-4.1-8B, adds expanded "Bring Your Own Criteria" (BYOC) support, letting teams define custom judging rules (formatting, length, domain-specific policy) on top of the pre-baked detectors. Models range from lightweight 38M/125M HAP (hate/abuse/profanity) classifiers up through 2B, 3B, 5B, and 8B variants, so teams can trade off latency and accuracy for a given deployment.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use IBM Granite Guardian?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams already running watsonx or Granite models who want a native guardrail layer</li>
        <li>Self-hosted deployments that need risk detection to stay in-VPC rather than calling an external moderation API</li>
        <li>Applications needing more than binary block/allow—Granite Guardian outputs calibrated risk scores per category</li>
        <li>RAG and agentic/tool-calling systems that need hallucination and function-call-risk detection alongside prompt injection</li>
        <li>Teams wanting to define custom judging criteria via BYOC instead of relying only on fixed risk categories</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams wanting a drop-in hosted API with no model-serving infrastructure to manage</li>
        <li>Ultra-low-latency inline filtering where even the smallest classifier (e.g., DeBERTa-scale) adds too much overhead versus the 2B+ Guardian models</li>
        <li>Non-English-heavy workloads where language coverage hasn't been independently verified</li>
        <li>Teams that need a turnkey, pre-integrated firewall product rather than a model they must wire into their own pipeline</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Covers a broad risk taxonomy in one family: jailbreak/prompt injection, harm, profanity, bias, RAG hallucination, and agentic tool-call risk</li>
      <li>Bring Your Own Criteria (BYOC) lets teams judge custom policies beyond the built-in detectors</li>
      <li>Multiple model sizes (38M HAP classifiers up to 8B) so teams can tune the latency/accuracy tradeoff</li>
      <li>Apache 2.0 licensed and downloadable from Hugging Face for fully self-hosted use</li>
      <li>Backed by a published technical report and benchmark methodology for risk-detection accuracy</li>
    </ul>
    <div class="source"><a href="https://github.com/ibm-granite/granite-guardian" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Requires self-hosting or watsonx access—no standalone hosted moderation endpoint outside IBM's platform</li>
      <li>Larger variants (5B/8B) add meaningful inference cost and latency compared to lightweight DeBERTa-style classifiers built specifically for prompt injection</li>
      <li>Documentation and versioning span multiple generations (3.1, 3.2, 3.3, 4.1, HAP), which can make it unclear which checkpoint to pick for a new project</li>
      <li>As a judge/classifier model it still requires prompt-engineering the risk definitions correctly to get reliable scores, especially for BYOC criteria</li>
    </ul>
    <div class="source"><a href="https://www.ibm.com/granite/docs/models/guardian" target="_blank">IBM Docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/ibm-granite/granite-guardian" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0 licensed weights, self-host or run via watsonx / Hugging Face</div>
  </a>
  <a href="https://huggingface.co/ibm-granite" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Hugging Face Hub</div>
    <div class="price">Free</div>
    <div class="desc">Download individual model checkpoints (HAP 38M/125M through Guardian 2B-8B)</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Judges both prompts and model responses for risk, returning a risk probability per category</li>
      <li>Detects jailbreak attempts and prompt injection alongside harm, profanity, bias, and violence</li>
      <li>RAG-specific checks: groundedness, context relevance, and answer relevance</li>
      <li>Agentic/tool-use checks: function-calling hallucination and tool-call risk</li>
      <li>Bring Your Own Criteria (BYOC, expanded in 4.1) for custom, domain-specific judging rules</li>
      <li>Lightweight HAP (hate, abuse, profanity) classifiers at 38M/125M parameters for low-latency filtering</li>
      <li>Larger Guardian checkpoints at 2B, 3B, 5B, and 8B parameters across the 3.1–4.1 generations</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Input-side prompt injection and jailbreak detection before a request reaches the main LLM</li>
      <li>Output-side moderation of generated responses for harm, bias, and profanity</li>
      <li>Hallucination scoring for RAG pipelines to flag ungrounded answers</li>
      <li>Risk scoring for agentic systems that make tool/function calls</li>
      <li>Custom policy enforcement (formatting, length, domain rules) via BYOC prompts</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Granite Guardian | LlamaFirewall (PromptGuard) | ProtectAI DeBERTa | Meta Llama Guard |
|---------|-------------------|------------------------------|--------------------|--------------------|
| Primary Focus | <span class="highlight">Broad risk taxonomy: injection, harm, RAG & agentic risk, custom criteria</span> | Prompt injection / jailbreak detection | Prompt injection detection | Content-safety moderation (with injection coverage) |
| Model Size | 38M (HAP) up to 8B | ~86M (mDeBERTa-based) | ~86M (DeBERTa-based) | 1B-8B |
| Custom Criteria (BYOC) | <span class="highlight">Yes, expanded in 4.1</span> | No | No | No |
| RAG / Agentic Risk Checks | <span class="highlight">Groundedness, relevance, function-call risk</span> | No | No | No |
| Inference Cost | Higher at 5B/8B, low at HAP tier | <span class="highlight">Very low—built for inline filtering</span> | <span class="highlight">Very low—built for inline filtering</span> | Moderate |
| License | Apache 2.0 | MIT | Apache 2.0 | Llama license (custom, some use restrictions) |
| Ecosystem | watsonx, Hugging Face, IBM Granite docs | Meta PurpleLlama project | Hugging Face, LangChain integrations | Meta Llama ecosystem |

</div>
