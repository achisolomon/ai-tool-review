---
name: "OpenRewrite"
slug: "openrewrite"
website: "https://docs.openrewrite.org/"
type: oss
track: developers
category: "ai-coding"
subcategory: "code-intelligence"
status: active
description: "Open-source automated refactoring ecosystem that eliminates technical debt through intelligent code transformations and migrations at scale"
pricing_model: free
founded_year: 2018
headquarters: "San Francisco, CA"
github_url: "https://github.com/openrewrite/rewrite"
github_stars: 3640
last_verified: "2026-06-03"
confidence_score: 0.9
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">2K+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">500+</span>
    <span class="label">Recipes</span>
  </div>
  <div class="key-stat">
    <span class="number">2018</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OpenRewrite is an open-source automated refactoring ecosystem designed to eliminate technical debt at scale by enabling developers to perform large-scale code transformations safely and reliably. The platform provides a library of pre-built "recipes" that can automatically update frameworks, migrate between versions, apply security patches, and modernize code patterns across entire repositories or organizations. Unlike simple find-and-replace tools, OpenRewrite uses semantic code analysis and type-aware transformations to ensure correctness, making it possible to perform complex refactorings that would be error-prone or impossible to do manually. The project is backed by Moderne, which offers commercial services for enterprise-scale code modernization.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OpenRewrite?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Engineering teams managing large Java/Kotlin codebases with significant technical debt</li>
        <li>Organizations performing framework migrations (Spring Boot, JUnit, Java versions)</li>
        <li>Platform teams standardizing code patterns and best practices across repositories</li>
        <li>Security teams applying vulnerability patches and security fixes at scale</li>
        <li>Companies with microservices architectures requiring consistent updates across services</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Small projects where manual refactoring is manageable</li>
        <li>Languages other than Java, Kotlin, or Groovy (limited support for others)</li>
        <li>Teams without CI/CD infrastructure to integrate automated refactoring</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Completely open-source with extensive library of pre-built refactoring recipes</li>
      <li>Type-aware transformations ensure correctness and prevent breaking changes</li>
      <li>Handles complex migrations like Spring Boot upgrades, Java version updates automatically</li>
      <li>Active community with weekly code remix sessions and comprehensive documentation</li>
      <li>Integrates with Maven, Gradle, and CI/CD pipelines for automated execution</li>
    </ul>
    <div class="source"><a href="https://docs.openrewrite.org/" target="_blank">Official Site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Learning curve required to write custom recipes effectively</li>
      <li>Primarily focused on JVM languages, limited support for other ecosystems</li>
      <li>Some complex transformations may require manual review and adjustment</li>
    </ul>
    <div class="source"><a href="https://github.com/openrewrite/rewrite" target="_blank">GitHub</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://docs.openrewrite.org/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Free forever - all recipes and tools available open-source</div>
  </a>
  <a href="https://www.moderne.io/" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Moderne Platform</div>
    <div class="price">Contact Sales</div>
    <div class="desc">Enterprise features for large-scale refactoring via Moderne</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>500+ pre-built refactoring recipes</li>
      <li>Type-aware code transformation engine</li>
      <li>Framework migration (Spring Boot, Quarkus, Micronaut)</li>
      <li>Java version upgrades (8 to 11, 11 to 17, etc.)</li>
      <li>Security vulnerability patching</li>
      <li>Custom recipe development with Java DSL</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Supported Languages</h4>
    <ul>
      <li>Java (primary)</li>
      <li>Kotlin</li>
      <li>Groovy</li>
      <li>XML, YAML, JSON (config files)</li>
      <li>Limited: Python, JavaScript (experimental)</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OpenRewrite | Semgrep | Sensei |
|---------|-------------|---------|--------|
| Approach | Automated refactoring | Static analysis + autofix | IDE-based refactoring |
| Language Support | Java/Kotlin primary | 30+ languages | IntelliJ supported languages |
| Pricing | Free (OSS) | Free + Pro | Commercial |
| Best For | Large-scale migrations | Security scanning | Developer-guided refactoring |

</div>
