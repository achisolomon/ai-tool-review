---
name: "Spring AI"
slug: "spring-ai"
website: "https://spring.io/projects/spring-ai"
type: "oss"
track: "developers"
category: "llm-frameworks"
subcategory: "app-frameworks"
status: "active"
description: "Spring Framework's official AI integration bringing familiar Spring idioms to GenAI with support for all major LLM providers"
github_url: "https://github.com/spring-projects/spring-ai"
github_stars: 8975
pricing_model: "free"
founded_year: 2023
headquarters: "Palo Alto, CA"
tags:
  - api-available
  - rag
  - self-hosted

# AI-Managed Metadata
last_verified: "2026-06-03"
confidence_score: 0.85
source_urls:
  - "https://spring.io/projects/spring-ai"
  - "https://github.com/spring-projects/spring-ai"
  - "https://docs.spring.io/spring-ai/reference/"
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">8.8K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">15+</span>
    <span class="label">AI Providers</span>
  </div>
  <div class="key-stat">
    <span class="number">1.0 GA</span>
    <span class="label">Production Ready</span>
  </div>
</div>

## Overview

<div class="overview">
<p>Spring AI is the official Spring Framework project for building AI-powered applications in Java and Kotlin. Developed by VMware (now Broadcom), it brings familiar Spring programming idioms like dependency injection, auto-configuration, and portable abstractions to generative AI development. Spring AI provides unified APIs across 15+ LLM providers (OpenAI, Anthropic, Azure OpenAI, Google Vertex AI, Amazon Bedrock, Ollama, and more), built-in support for RAG patterns with vector store integrations, function calling, and observability through Micrometer. It reached General Availability with version 1.0 in late 2024, making it production-ready for enterprise Java applications.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use Spring AI?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Java/Kotlin enterprise teams already using Spring Boot</li>
        <li>Organizations with existing Spring infrastructure</li>
        <li>Teams requiring vendor-agnostic LLM abstractions</li>
        <li>Enterprise apps needing observability & security</li>
        <li>Building RAG applications in the JVM ecosystem</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Python-first teams (use LangChain/LlamaIndex)</li>
        <li>Quick prototypes (Python is faster to iterate)</li>
        <li>Bleeding-edge experimental features</li>
        <li>Non-Spring Java projects (adds complexity)</li>
        <li>Serverless/FaaS with cold start constraints</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Native Spring Boot integration with auto-configuration</li>
      <li>Unified API across 15+ LLM providers (easy switching)</li>
      <li>Production-ready with 1.0 GA release</li>
      <li>Built-in RAG support with multiple vector stores</li>
      <li>Function calling with Spring's @Bean definitions</li>
      <li>Micrometer observability out of the box</li>
      <li>Type-safe, compile-time verified configurations</li>
      <li>Enterprise-grade reliability from Spring team</li>
    </ul>
    <div class="source"><a href="https://spring.io/projects/spring-ai">Spring.io</a> · <a href="https://github.com/spring-projects/spring-ai">GitHub</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Smaller community than Python alternatives</li>
      <li>Fewer tutorials and examples available</li>
      <li>JVM startup time for serverless use cases</li>
      <li>Newer project, still evolving rapidly</li>
      <li>Some advanced features lag Python frameworks</li>
      <li>Requires Spring Boot knowledge</li>
    </ul>
    <div class="source"><a href="https://github.com/spring-projects/spring-ai/issues">GitHub Issues</a> · <a href="https://stackoverflow.com/questions/tagged/spring-ai">Stack Overflow</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/spring-projects/spring-ai" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">Free</div>
    <div class="desc">Apache 2.0 License, full framework access</div>
  </a>
  <a href="https://spring.io/support" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">VMware Tanzu</div>
    <div class="price">Commercial</div>
    <div class="desc">Enterprise support via Tanzu subscription</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Core Features</h4>
    <ul>
      <li>ChatClient fluent API for conversations</li>
      <li>Prompt templates with variable substitution</li>
      <li>Output parsers (JSON, List, Bean mapping)</li>
      <li>Function/Tool calling support</li>
      <li>Streaming responses via Flux</li>
      <li>Multimodal support (images, audio)</li>
      <li>Embedding generation</li>
      <li>Model evaluation tools</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported LLM Providers</h4>
    <ul>
      <li>OpenAI (GPT-4, GPT-4o)</li>
      <li>Anthropic (Claude 3/4)</li>
      <li>Azure OpenAI</li>
      <li>Google Vertex AI (Gemini)</li>
      <li>Amazon Bedrock</li>
      <li>Ollama (local models)</li>
      <li>Mistral AI</li>
      <li>HuggingFace</li>
      <li>MiniMax, ZhiPu, QianFan</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Vector Store Integrations</h4>
    <ul>
      <li>PGVector (PostgreSQL)</li>
      <li>Pinecone</li>
      <li>Milvus</li>
      <li>Chroma</li>
      <li>Weaviate</li>
      <li>Qdrant</li>
      <li>Redis Vector</li>
      <li>Neo4j</li>
      <li>Elasticsearch</li>
      <li>Azure AI Search</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>RAG Features</h4>
    <ul>
      <li>Document readers (PDF, HTML, JSON, etc.)</li>
      <li>Text splitters with overlap control</li>
      <li>Embedding transformers</li>
      <li>Vector store retrieval</li>
      <li>Question answering chains</li>
      <li>Metadata filtering</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Observability</h4>
    <ul>
      <li>Micrometer metrics integration</li>
      <li>Trace context propagation</li>
      <li>Token usage tracking</li>
      <li>Latency measurements</li>
      <li>Spring Boot Actuator endpoints</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Spring Boot 3.2+</li>
      <li>Java 17+ / Kotlin</li>
      <li>GraalVM Native Image</li>
      <li>Any JVM deployment target</li>
      <li>Kubernetes / Cloud Foundry</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | Spring AI | LangChain (Python) | LlamaIndex |
|---------|-----------|-------------------|------------|
| Language | <span class="highlight">Java/Kotlin</span> | Python/JS | Python/TS |
| LLM Providers | 15+ | 50+ | 40+ |
| Vector Stores | 10+ | 50+ | 30+ |
| Spring Integration | <span class="highlight">Native</span> | None | None |
| Enterprise Ready | <span class="highlight">Yes (Spring)</span> | Growing | Growing |
| Community Size | Small | <span class="highlight">Very Large</span> | Large |
| Maturity | 1.0 GA (2024) | Mature (2022) | Mature (2022) |
| Function Calling | <span class="highlight">@Bean based</span> | Decorators | Tools |
| Observability | <span class="highlight">Micrometer</span> | LangSmith | LlamaTrace |
| Best For | Java enterprise | Python rapid dev | RAG-focused apps |

</div>

## Real-World Usage

<div class="info-grid">
  <div class="info-card">
    <h4>Community & Adoption</h4>
    <ul>
      <li>Active VMware/Broadcom backing</li>
      <li>Regular Spring Office Hours coverage</li>
      <li>Growing enterprise adoption</li>
    </ul>
    <div class="source">GitHub, June 2026</div>
  </div>
  <div class="info-card">
    <h4>Example Use Cases</h4>
    <ul>
      <li>Customer support chatbots</li>
      <li>Document search & QA systems</li>
      <li>Code analysis tools</li>
      <li>Internal knowledge bases</li>
    </ul>
    <div class="source">Spring AI Samples</div>
  </div>
</div>

## Code Example

```java
@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String message) {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }
}
```
