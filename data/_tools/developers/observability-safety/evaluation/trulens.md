---
name: "TruLens"
slug: "trulens"
website: "https://www.trulens.org/"
type: "open-source"
track: "developers"
category: "observability-safety"
subcategory: "evaluation"
status: "active"
description: "Open-source library for evaluating and tracking LLM applications using feedback functions for groundedness, relevance, and safety"
github_url: "https://github.com/truera/trulens"
github_stars: 3403
pricing_model: "open-source"
founded_year: 2023
headquarters: "Redwood City, CA"
tags:
  - observability
last_verified: "2026-06-03"
confidence_score: 0.90
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">3.4K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">30+</span>
    <span class="label">Feedback Functions</span>
  </div>
  <div class="key-stat">
    <span class="number">100%</span>
    <span class="label">Open Source</span>
  </div>
</div>

## Overview

<div class="overview">
<p>TruLens is an open-source Python library developed by TruEra for evaluating, tracking, and iterating on LLM applications. It provides a comprehensive suite of "feedback functions" that measure key quality metrics like groundedness, answer relevance, context relevance, and harmlessness. TruLens integrates with popular frameworks including LangChain, LlamaIndex, and custom RAG pipelines, offering both programmatic evaluation and a local dashboard for visualizing results. Originally focused on model interpretability, TruEra pivoted TruLens to address the growing need for LLM observability and evaluation in production systems.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use TruLens?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>RAG application developers needing hallucination detection</li>
        <li>Teams requiring detailed groundedness scoring</li>
        <li>LangChain/LlamaIndex users wanting native integration</li>
        <li>Researchers needing customizable feedback functions</li>
        <li>Projects requiring self-hosted evaluation infrastructure</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams needing enterprise SaaS with support (consider Confident AI)</li>
        <li>Simple unit testing workflows (DeepEval is simpler)</li>
        <li>RAG-only metrics without custom needs (Ragas is more focused)</li>
        <li>Production monitoring at scale (consider Langfuse or Arize)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Rich library of pre-built feedback functions for RAG evaluation</li>
      <li>Excellent groundedness and hallucination detection metrics</li>
      <li>Native integration with LangChain and LlamaIndex</li>
      <li>Local dashboard for visualizing evaluation results</li>
      <li>Supports multiple LLM providers as evaluators</li>
      <li>Completely open-source with active community</li>
      <li>Modular design allows custom feedback function creation</li>
    </ul>
    <div class="source"><a href="https://github.com/truera/trulens" target="_blank">GitHub</a> - <a href="https://www.trulens.org/trulens/getting_started/" target="_blank">Official Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Steeper learning curve than simpler alternatives</li>
      <li>Dashboard is local-only without cloud hosting option</li>
      <li>Documentation can be fragmented across versions</li>
      <li>Evaluation costs add up when using LLM-based feedback</li>
      <li>Less focused than Ragas for pure RAG evaluation</li>
      <li>Requires more setup than managed platforms</li>
    </ul>
    <div class="source"><a href="https://github.com/truera/trulens/issues" target="_blank">GitHub Issues</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/truera/trulens" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Full library, self-hosted dashboard, all feedback functions</div>
  </a>
  <a href="https://www.trulens.org/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">TruEra Enterprise</div>
    <div class="price">Contact</div>
    <div class="desc">Enterprise ML observability platform with TruLens integration</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>Groundedness evaluation for RAG</li>
      <li>Answer relevance scoring</li>
      <li>Context relevance assessment</li>
      <li>Harmlessness/safety checks</li>
      <li>Custom feedback function creation</li>
      <li>Chain-of-thought tracing</li>
      <li>Cost and latency tracking</li>
      <li>Local evaluation dashboard</li>
      <li>Experiment comparison tools</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Feedback Functions</h4>
    <ul>
      <li>Groundedness (NLI-based)</li>
      <li>Answer relevance</li>
      <li>Context relevance</li>
      <li>Coherence scoring</li>
      <li>Conciseness check</li>
      <li>Harmlessness detection</li>
      <li>Sentiment analysis</li>
      <li>Moderation (toxicity, bias)</li>
      <li>Custom LLM-based evaluators</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Integrations</h4>
    <ul>
      <li>LangChain (TruChain)</li>
      <li>LlamaIndex (TruLlama)</li>
      <li>Custom Python apps (TruBasicApp)</li>
      <li>OpenAI, Anthropic, Bedrock</li>
      <li>HuggingFace models</li>
      <li>Snowflake Cortex</li>
      <li>Azure OpenAI</li>
      <li>Local LLMs via Ollama</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms & Requirements</h4>
    <ul>
      <li>Python 3.8+</li>
      <li>pip install trulens</li>
      <li>Local SQLite or PostgreSQL</li>
      <li>Streamlit dashboard</li>
      <li>Jupyter notebook support</li>
      <li>Docker deployment option</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | TruLens | Ragas | DeepEval |
|---------|---------|-------|----------|
| Focus | <span class="highlight">General LLM + RAG</span> | RAG-specific | General LLM |
| Groundedness | <span class="highlight">Excellent NLI-based</span> | Good | Good |
| Feedback Functions | <span class="highlight">30+ built-in</span> | 10+ RAG metrics | 14+ metrics |
| LangChain Integration | <span class="highlight">Native (TruChain)</span> | Yes | Yes |
| LlamaIndex Integration | <span class="highlight">Native (TruLlama)</span> | Limited | Yes |
| Dashboard | Local Streamlit | None (code-only) | Confident AI Cloud |
| Custom Evaluators | <span class="highlight">Very flexible</span> | Template-based | Class-based |
| Learning Curve | Medium-High | Low-Medium | Low |
| Best For | Detailed RAG analysis | Quick RAG metrics | CI/CD testing |
| GitHub Stars | ~2.1K | ~7K | ~3.5K |

</div>

## Real-World Usage

<div class="info-grid">
  <div class="info-card">
    <h4>Key Use Cases</h4>
    <ul>
      <li>RAG pipeline evaluation and debugging</li>
      <li>Hallucination detection in production</li>
      <li>A/B testing prompt variations</li>
      <li>Comparing retrieval strategies</li>
      <li>Safety and moderation checks</li>
      <li>Model comparison studies</li>
    </ul>
  </div>
  <div class="info-card">
    <h4>Evaluation Providers</h4>
    <ul>
      <li>OpenAI GPT-4/3.5</li>
      <li>Anthropic Claude</li>
      <li>Azure OpenAI</li>
      <li>AWS Bedrock</li>
      <li>HuggingFace models</li>
      <li>Local models via Ollama</li>
    </ul>
  </div>
</div>

## Getting Started

```python
from trulens.apps.langchain import TruChain
from trulens.providers.openai import OpenAI
from trulens.core import Feedback

# Initialize provider
provider = OpenAI()

# Define feedback functions
f_groundedness = Feedback(provider.groundedness_measure_with_cot_reasons)
f_relevance = Feedback(provider.relevance)

# Wrap your LangChain app
tru_recorder = TruChain(
    chain,
    app_name="RAG_App",
    feedbacks=[f_groundedness, f_relevance]
)

# Run with recording
with tru_recorder as recording:
    response = chain.invoke({"question": "What is RAG?"})

# Launch dashboard
from trulens.dashboard import run_dashboard
run_dashboard()
```
