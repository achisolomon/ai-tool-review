---
category: ai-coding
confidence_score: 0.9
description: 'Polyglot dev tool version manager: manage languages, env vars, and tasks per project with a single, reproducible configuration tool.'
github_stars: 10500
last_verified: '2026-06-03'
name: mise
pricing_model: free
slug: mise
status: active
subcategory: dev-environment
track: developers
type: oss
website: https://mise.jdx.dev/
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">10.5K</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">100+</span>
    <span class="label">Supported Tools</span>
  </div>
  <div class="key-stat">
    <span class="number">2023</span>
    <span class="label">Founded</span>
  </div>
</div>

## Overview

<div class="overview">
<p>mise (formerly rtx) is a polyglot runtime version manager that replaces tools like asdf, nvm, pyenv, and rbenv with a single, fast, Rust-based CLI. It manages programming language versions, environment variables, and task automation per project, ensuring reproducible development environments across teams. With native support for over 100 tools and seamless integration with CI/CD pipelines, mise streamlines dependency management while maintaining compatibility with existing .tool-versions files.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use mise?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Teams managing multiple programming languages and their versions across projects</li>
        <li>Developers seeking faster performance than asdf or other version managers</li>
        <li>Projects requiring reproducible environments with env var management</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Developers committed to a single-language toolchain (nvm, rbenv may suffice)</li>
        <li>Teams requiring Windows-native support (currently Linux/macOS focused)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Significantly faster than asdf (written in Rust vs Ruby)</li>
      <li>Unified management of versions, environment variables, and tasks</li>
      <li>Compatible with asdf plugins and .tool-versions files</li>
      <li>Built-in task runner replaces need for separate Makefile/scripts</li>
      <li>Active development with responsive maintainer community</li>
    </ul>
    <div class="source"><a href="https://mise.jdx.dev/" target="_blank">Official Site</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Relatively new compared to established tools (less battle-tested)</li>
      <li>Learning curve for teams migrating from multiple specialized tools</li>
      <li>Some asdf plugins may have compatibility issues</li>
      <li>Documentation still evolving for advanced use cases</li>
    </ul>
    <div class="source"><a href="https://github.com/jdx/mise" target="_blank">GitHub Repository</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://mise.jdx.dev/" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Open Source</div>
    <div class="price">$0</div>
    <div class="desc">Fully free and open source under MIT license. All features available to everyone.</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Multi-language version management (Node.js, Python, Ruby, Go, Java, etc.)</li>
      <li>Environment variable management per project</li>
      <li>Built-in task runner (replaces make, npm scripts)</li>
      <li>Compatible with asdf plugins (400+ tools)</li>
      <li>Shell completions (bash, zsh, fish)</li>
      <li>Configuration via .mise.toml or .tool-versions</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Platforms</h4>
    <ul>
      <li>Linux (x86_64, aarch64)</li>
      <li>macOS (Intel, Apple Silicon)</li>
      <li>WSL2 on Windows</li>
      <li>CI/CD: GitHub Actions, GitLab CI, CircleCI</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | mise | asdf | nvm |
|---------|--------|--------------|--------------|
| Performance | Fast (Rust) | Slower (Ruby) | Fast (Shell) |
| Multi-Language | 100+ tools | 400+ plugins | Node.js only |
| Env Var Management | Built-in | Plugin needed | Not supported |
| Task Runner | Built-in | Not available | Not available |
| Pricing | Free/OSS | Free/OSS | Free/OSS |
| Best For | Polyglot teams | Plugin ecosystem | Node.js developers |

</div>
