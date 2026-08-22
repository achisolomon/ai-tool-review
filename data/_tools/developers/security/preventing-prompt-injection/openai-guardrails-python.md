---
name: "OpenAI Guardrails (Python)"
slug: "openai-guardrails-python"
website: "https://openai.github.io/openai-guardrails-python/"
type: "oss"
track: "developers"
category: "security"
subcategory: "preventing-prompt-injection"
status: "active"
description: "OpenAI's open-source Python guardrails package that detects prompt injection and validates tool calls against user intent"
pricing_model: "free"
founded_year: 2025
headquarters: "San Francisco, CA"
github_url: "https://github.com/openai/openai-guardrails-python"
github_stars: 235
tags:
  - prompt-injection
  - tool-call-guardrails
  - agent-security
last_verified: "2026-07-14"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">218+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">MIT</span>
    <span class="label">License</span>
  </div>
  <div class="key-stat">
    <span class="number">2</span>
    <span class="label">Checkpoint Stages</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OpenAI Guardrails (Python) is OpenAI's open-source package for adding configurable safety and compliance guardrails to LLM applications, distributed as a drop-in wrapper around the standard OpenAI Python client. Rather than requiring developers to build validation logic from scratch, it ships a library of pluggable checks—moderation, PII detection, hallucination detection, jailbreak and NSFW filtering, off-topic scoping, and URL allow/blocklisting—that run automatically against inputs and outputs. Its standout capability for agentic applications is a dedicated Prompt Injection Detection check that evaluates whether requested tool/function calls actually align with a user's stated goal before they execute, and again inspects tool outputs after execution to catch data exfiltration or scope creep smuggled back through tool results.</p>
<p>Configurations can be authored through a hosted UI at <a href="https://guardrails.openai.com/" target="_blank">guardrails.openai.com</a> or as JSON files loaded directly in code. For teams building on the OpenAI Agents SDK, the package provides a <code>GuardrailAgent</code> class for native multi-agent enforcement—distinct from (though complementary to) the Agents SDK's own lower-level "tool guardrails" concept, which wraps individual function tools with input/output checks rather than applying a centralized policy engine.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OpenAI Guardrails?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams building tool-calling agents on the OpenAI API or Agents SDK who want first-party guardrails maintained by OpenAI</li>
        <li>Developers who need to catch tool calls that drift from user intent (goal hijacking) rather than just filtering raw text</li>
        <li>Projects that want a no-code way to configure and iterate on guardrail policies via the hosted config UI</li>
        <li>Teams that need to benchmark and tune guardrail thresholds against labeled datasets before shipping</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Applications built on non-OpenAI model providers—checks are designed around OpenAI models and the OpenAI client/Agents SDK</li>
        <li>Teams wanting a mature, battle-tested library—this is an early-stage "Preview" project (2025) with a small star count and evolving API</li>
        <li>Cost-sensitive deployments where every LLM-based guardrail check adds an extra billed model call</li>
        <li>Non-Python stacks, since the package and its Agents SDK integration are Python-only</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Prompt Injection Detection check validates tool calls at two checkpoints—before execution (does the requested function match the user's goal?) and after execution (does the tool's response leak unrelated data?)</li>
      <li>Drop-in wrapper design means minimal code changes to add moderation, PII, hallucination, and jailbreak checks to an existing OpenAI client integration</li>
      <li>Built-in evaluation/benchmark CLI compares models via ROC curves and latency analysis against labeled JSONL datasets, so teams can tune confidence thresholds with data rather than guesswork</li>
      <li>Native `GuardrailAgent` integration with the OpenAI Agents SDK for enforcing policies across multi-agent workflows</li>
      <li>Hosted no-code configuration UI (guardrails.openai.com) lowers the barrier to defining and editing guardrail policies</li>
      <li>MIT licensed and maintained directly by OpenAI</li>
    </ul>
    <div class="source"><a href="https://github.com/openai/openai-guardrails-python" target="_blank">GitHub README</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Labeled "Preview" and still young (first releases in 2025)—expect breaking API changes as it matures</li>
      <li>LLM-based checks like Prompt Injection Detection require an extra model call per check (e.g. gpt-4.1-mini), adding latency (~1.5s median) and API cost on top of the primary request</li>
      <li>Detection quality is tied to the configured judge model and confidence threshold; tuning is required to balance false positives against missed injections</li>
      <li>Tightest fit is with OpenAI's own client and Agents SDK—less turnkey for multi-provider or non-OpenAI agent stacks</li>
      <li>Relatively small community (a few hundred GitHub stars) compared to more established guardrail frameworks</li>
    </ul>
    <div class="source"><a href="https://openai.github.io/openai-guardrails-python/" target="_blank">Docs</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/openai/openai-guardrails-python" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">MIT licensed; guardrail model calls (e.g. moderation, prompt injection detection) are billed at standard OpenAI API rates</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Drop-in wrapper around the OpenAI Python client for automatic input/output validation</li>
      <li>Prompt Injection Detection: LLM-judged check that validates tool-call alignment with user intent before execution, and re-checks tool outputs after execution for leaked/unrelated data</li>
      <li>Additional built-in checks: Moderation, URL Filter (allow/blocklist), PII detection, Hallucination Detection (via vector stores), Jailbreak detection, NSFW text filtering, Off-Topic Prompts</li>
      <li>Custom LLM-based guardrails for org-specific policies</li>
      <li><code>GuardrailAgent</code> class for native integration with the OpenAI Agents SDK in multi-agent workflows</li>
      <li>Evaluation CLI (<code>guardrails.evals.guardrail_evals</code>) with benchmark mode, ROC curve generation, and latency analysis across labeled JSONL datasets</li>
      <li>Hosted no-code configuration UI at guardrails.openai.com</li>
      <li>Configurable per-check parameters (e.g. model, confidence_threshold, max_turns, include_reasoning) for tuning accuracy vs. latency</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Preventing indirect prompt injection where malicious content in tool/function outputs tries to redirect an agent's next action</li>
      <li>Validating that an agent's requested tool calls actually serve the user's stated request (e.g. blocking a "transfer funds" call triggered by a weather query)</li>
      <li>Catching data exfiltration where a tool response smuggles unrelated sensitive data back into the conversation</li>
      <li>Adding moderation, PII redaction, and jailbreak filtering to production OpenAI-based chat and agent applications</li>
      <li>Benchmarking and tuning guardrail models/thresholds against internal red-team or labeled attack datasets before deployment</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OpenAI Guardrails | Guardrails AI | NeMo Guardrails |
|---------|--------------------|----------------|------------------|
| Deployment | Self-hosted, open source (MIT) | Self-hosted, open source | Self-hosted, open source |
| Tool-Call Alignment Checkpoint | <span class="highlight">Yes—checks tool calls pre-execution and tool outputs post-execution against user intent</span> | Not a core focus | Limited (dialogue rails, not tool-call specific) |
| Prompt Injection Detection | <span class="highlight">Dedicated LLM-judged check with tunable confidence threshold</span> | Community validator (heuristic/model-based) | Via configurable rails and third-party detectors |
| Native Agent Framework Integration | <span class="highlight">GuardrailAgent for OpenAI Agents SDK</span> | Framework-agnostic | Colang-based rails, works across LLM providers |
| Built-in Evaluation/Benchmark Tooling | <span class="highlight">Yes—ROC curves, latency analysis, model comparison</span> | Limited | Limited |
| Provider Focus | OpenAI-centric | Provider-agnostic | Provider-agnostic |
| Backing | OpenAI | Guardrails AI (startup) | NVIDIA |

</div>
