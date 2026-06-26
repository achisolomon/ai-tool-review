---
name: "DSPy"
slug: "dspy"
website: "https://dspy.ai/"
type: "oss"
track: "developers"
category: "agent-frameworks"
subcategory: "code-first"
status: "active"
description: "Framework for programming—not prompting—language models through declarative, self-improving Python code"
github_url: "https://github.com/stanfordnlp/dspy"
github_stars: 35410
pricing_model: "open-source"
founded_year: 2023
headquarters: "Stanford, CA"
tags:
  - python
last_verified: "2026-06-02"
confidence_score: 0.95
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">34.8K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">7M+</span>
    <span class="label">Monthly Downloads</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">Contributors</span>
  </div>
</div>

## Overview

<div class="overview">
<p>DSPy (Declarative Self-improving Python) is a Stanford NLP framework that fundamentally rethinks how developers interact with language models. Instead of manually crafting and tuning prompts, DSPy lets you write compositional Python code that defines your task's structure, then automatically optimizes prompts and even fine-tunes weights to maximize quality. Built on the research that produced the seminal "Demonstrate-Search-Predict" paper, DSPy treats prompts as hyperparameters to be learned rather than hand-engineered. This paradigm shift is particularly powerful for RAG pipelines, multi-hop reasoning, and any LLM system where reliability matters more than quick prototyping.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use DSPy?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>ML researchers and academics</li>
        <li>Teams building production RAG systems</li>
        <li>Multi-hop reasoning pipelines</li>
        <li>Projects requiring systematic prompt optimization</li>
        <li>Those tired of brittle, hand-tuned prompts</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Simple chatbot applications (overkill)</li>
        <li>Quick prototyping (use LangChain)</li>
        <li>Teams unfamiliar with ML concepts</li>
        <li>Real-time agent orchestration (use LangGraph)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Automatic prompt optimization eliminates manual tuning</li>
      <li>Modular, composable pipeline architecture</li>
      <li>Works with any LLM provider (OpenAI, Anthropic, local)</li>
      <li>Strong academic foundation (Stanford NLP)</li>
      <li>Active research community and rapid development</li>
      <li>Clean separation of program logic from prompts</li>
    </ul>
    <div class="source"><a href="https://github.com/stanfordnlp/dspy" target="_blank">GitHub</a> · <a href="https://dspy.ai/" target="_blank">Official Docs</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Steep learning curve requires ML background</li>
      <li>Less ecosystem and integrations than LangChain</li>
      <li>Optimization can be compute-intensive</li>
      <li>Documentation assumes research familiarity</li>
      <li>Smaller community for troubleshooting</li>
    </ul>
    <div class="source"><a href="https://github.com/stanfordnlp/dspy/discussions" target="_blank">GitHub Discussions</a> · <a href="https://discord.gg/XCGy2WDCQB" target="_blank">Discord Community</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/stanfordnlp/dspy" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Full framework, MIT license</div>
  </a>
  <a href="https://dspy.ai/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Community</div>
    <div class="price">Free</div>
    <div class="desc">Discord, GitHub discussions</div>
  </a>
  <a href="https://pypi.org/project/dspy/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">PyPI</div>
    <div class="price">pip install dspy</div>
    <div class="desc">7M+ monthly downloads</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Modules</h4>
    <ul>
      <li>dspy.Predict - basic LM calls</li>
      <li>dspy.ChainOfThought - reasoning steps</li>
      <li>dspy.ReAct - agent-like behavior</li>
      <li>dspy.ProgramOfThought - code generation</li>
      <li>dspy.Retrieve - retrieval augmentation</li>
      <li>dspy.Assert - runtime constraints</li>
      <li>dspy.Suggest - soft constraints</li>
      <li>Signatures - I/O declarations</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Optimizers (Teleprompters)</h4>
    <ul>
      <li>BootstrapFewShot - example selection</li>
      <li>BootstrapFewShotWithRandomSearch</li>
      <li>COPRO - prompt optimization</li>
      <li>MIPROv2 - multi-stage optimization</li>
      <li>SignatureOptimizer - structure tuning</li>
      <li>BootstrapFinetune - weight updates</li>
      <li>GEPA - reflective evolution</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>LLM Providers</h4>
    <ul>
      <li>OpenAI (GPT-4, GPT-4o)</li>
      <li>Anthropic (Claude 3.5, Claude 4)</li>
      <li>Google (Gemini)</li>
      <li>Cohere (Command)</li>
      <li>Ollama (local models)</li>
      <li>vLLM, Together, Anyscale</li>
      <li>Hugging Face models</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Retrieval Integrations</h4>
    <ul>
      <li>Pinecone</li>
      <li>Weaviate</li>
      <li>Chroma</li>
      <li>Qdrant</li>
      <li>FAISS</li>
      <li>ColBERTv2</li>
      <li>RAGatouille</li>
    </ul>
  </div>
</div>

</details>

<div class="info-grid">
  <div class="info-card">
    <h4>Community Stats</h4>
    <ul>
      <li>2,900+ forks</li>
      <li>100+ contributors</li>
      <li>Active Discord community</li>
    </ul>
    <div class="source"><a href="https://github.com/stanfordnlp/dspy" target="_blank">GitHub, June 2026</a></div>
  </div>
  <div class="info-card">
    <h4>Research Foundation</h4>
    <ul>
      <li>Stanford NLP Group</li>
      <li>ICLR 2024 publication</li>
      <li>10+ research papers</li>
      <li>Matei Zaharia, Omar Khattab et al.</li>
    </ul>
    <div class="source"><a href="https://arxiv.org/abs/2310.03714" target="_blank">DSPy Paper, Oct 2023</a></div>
  </div>
</div>

## How It Compares

<div class="comparison" markdown="1">

| Feature | DSPy | LangChain | LlamaIndex | Haystack |
|---------|------|-----------|------------|----------|
| Primary Focus | <span class="highlight">Prompt optimization</span> | General LLM apps | RAG & indexing | Search pipelines |
| GitHub Stars | 34.8K | 98K+ | 38K+ | 18K+ |
| Programming Model | <span class="highlight">Declarative Python</span> | Imperative chains | Data-centric | Pipeline-based |
| Auto-optimization | <span class="highlight">Yes (built-in)</span> | Manual | Manual | Manual |
| Learning Curve | Steep (ML background) | Moderate | Moderate | Easy |
| Agent Support | Basic (ReAct) | Full (LangGraph) | LlamaAgents | Basic |
| Production Tools | None | LangSmith | LlamaCloud | Haystack Cloud |
| Best For | Research & optimization | Full-stack apps | RAG systems | Enterprise search |

</div>
