---
name: "OmniVoice"
slug: "omnivoice"
website: "https://omnivoice.app/"
type: "open-source"
track: "users"
category: "generative-media"
subcategory: "voice-speech"
status: "active"
description: "Open-source zero-shot text-to-speech and voice cloning model covering 600+ languages, from the k2-fsa (Kaldi) team, with a paid hosted web app at omnivoice.app"
github_url: "https://github.com/k2-fsa/OmniVoice"
github_stars: 15974
pricing_model: "open-source"
founded_year: 2026
tags:
  - self-hosted
  - python
last_verified: "2026-10-16"
confidence_score: 0.85
---

<div class="key-stats">
  <div class="key-stat">
    <span class="number">600+</span>
    <span class="label">Languages</span>
  </div>
  <div class="key-stat">
    <span class="number">14.6k</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">40x</span>
    <span class="label">Faster Than Real-Time</span>
  </div>
</div>

## Overview

<div class="overview">
<p>OmniVoice is an open-source, zero-shot text-to-speech model released in March 2026 by the k2-fsa team, the group behind the Kaldi and k2 speech toolkits. A single model covers 600+ languages (the Hugging Face model card lists 646), including many low-resource languages that commercial voice platforms skip. It supports three modes: voice cloning from a short reference clip, voice design from attributes such as gender, age, pitch, accent and whispering, and an automatic voice. Expressive tags like [laughter] and [sigh] are supported too. The model is Apache 2.0 licensed and runs on NVIDIA GPUs, Apple Silicon and Intel Arc. The omnivoice.app website is a hosted web app built on the model, with pay-as-you-go credits. It is not linked from the official k2-fsa repository, so treat it as a convenience front end rather than the project's official home.</p>
</div>

## The Verdict

<div class="verdict">
  <h3>Who Should Use OmniVoice?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Creators who need voiceovers in languages ElevenLabs and similar tools don't cover</li>
        <li>Developers who want a free, self-hostable ElevenLabs-style voice cloning model</li>
        <li>Localization projects that need one consistent voice across many languages</li>
        <li>Occasional users who prefer one-time credits over a monthly subscription</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Teams that need a polished studio (dubbing editor, audiobook projects, voice library)</li>
        <li>Enterprises that need an SLA, a vendor contract and support from the model's authors</li>
        <li>Non-technical users who want to self-host for free (needs a GPU and Python setup)</li>
      </ul>
    </div>
  </div>
</div>

<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Broadest language coverage of any zero-shot TTS model: 600+ languages in one model</li>
      <li>Fully open source under Apache 2.0, commercial use allowed, no per-character fees when self-hosted</li>
      <li>Very fast inference: real-time factor around 0.025, about 40x faster than real time</li>
      <li>Voice cloning from a few seconds of audio, plus voice design from text attributes</li>
      <li>Strong community adoption on GitHub since launch (see badge for count)</li>
      <li>Hosted app uses one-time credits that never expire, so no subscription is needed</li>
    </ul>
    <div class="source"><a href="https://github.com/k2-fsa/OmniVoice" target="_blank">GitHub</a> · <a href="https://arxiv.org/abs/2604.00688" target="_blank">arXiv Paper</a> · <a href="https://huggingface.co/k2-fsa/OmniVoice" target="_blank">Hugging Face</a> · <a href="https://omnivoice.app/pricing" target="_blank">omnivoice.app Pricing</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>omnivoice.app is not linked from the official repo; vet it before uploading voices or paying</li>
      <li>Self-hosting needs a capable GPU (or Apple Silicon) and Python know-how</li>
      <li>A research model, not a full product: no dubbing editor, projects or curated voice library</li>
      <li>Quality varies across languages, especially low-resource ones with less training data</li>
      <li>Voice cloning carries consent and misuse risks; there's no built-in voice verification</li>
    </ul>
    <div class="source"><a href="https://github.com/k2-fsa/OmniVoice" target="_blank">GitHub README</a> · <a href="https://dev.to/sangrokjung/omnivoice-open-source-tts-with-600-languages-and-zero-shot-voice-cloning-1mpn" target="_blank">DEV Community</a></div>
  </div>
</div>

## Pricing

<div class="pricing-grid">
  <a href="https://github.com/k2-fsa/OmniVoice" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Self-Hosted</div>
    <div class="price">$0</div>
    <div class="desc">Apache 2.0, run on your own GPU</div>
  </a>
  <a href="https://omnivoice.app/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Free Trial</div>
    <div class="price">$0</div>
    <div class="desc">2 credits, about 200 characters</div>
  </a>
  <a href="https://omnivoice.app/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Basic</div>
    <div class="price">$9.90</div>
    <div class="desc">800 credits (~80K chars), one-time</div>
  </a>
  <a href="https://omnivoice.app/pricing" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Pro</div>
    <div class="price">$29.90</div>
    <div class="desc">3,000 credits (~300K chars), one-time</div>
  </a>
  <a href="https://omnivoice.app/pricing" class="pricing-card" target="_blank" rel="noopener">
    <div class="plan-name">Business</div>
    <div class="price">$49.90</div>
    <div class="desc">6,000 credits (~600K chars), one-time</div>
  </a>
</div>

<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Voice Generation</h4>
    <ul>
      <li>Zero-shot voice cloning from a short reference clip</li>
      <li>Cross-lingual cloning (one voice, many languages)</li>
      <li>Voice design from attributes (gender, age, pitch, accent, whisper)</li>
      <li>Auto voice mode</li>
      <li>Non-verbal tags: [laughter], [sigh], [surprise-ah]</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Control</h4>
    <ul>
      <li>Pronunciation control via pinyin (Chinese) and CMU phonemes (English)</li>
      <li>Speaking speed adjustment (0.5x to 2.0x on omnivoice.app)</li>
      <li>Single-stage, non-autoregressive diffusion language model architecture</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Hardware</h4>
    <ul>
      <li>NVIDIA GPUs (CUDA)</li>
      <li>Apple Silicon (MPS)</li>
      <li>Intel Arc GPUs (XPU)</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Ways to Try It</h4>
    <ul>
      <li><a href="https://huggingface.co/spaces/k2-fsa/OmniVoice" target="_blank">Official Hugging Face Space</a> (free demo)</li>
      <li><a href="https://zhu-han.github.io/omnivoice" target="_blank">Official demo page</a> with samples</li>
      <li>omnivoice.app hosted web app (paid credits)</li>
    </ul>
  </div>
</div>

</details>

## How It Compares

<div class="comparison" markdown="1">

| Feature | OmniVoice | ElevenLabs | PlayHT | Resemble AI |
|---------|-----------|------------|--------|-------------|
| Languages | <span class="highlight">600+</span> | 32+ | 142+ | 24+ |
| Open Source | <span class="highlight">Yes (Apache 2.0)</span> | No | No | Partial |
| Voice Cloning | Zero-shot | <span class="highlight">Instant & Pro</span> | Yes | Yes |
| Dubbing / Studio | No | <span class="highlight">Yes</span> | No | No |
| Pricing | <span class="highlight">Free self-hosted; one-time credits</span> | From $5/mo | From $31/mo | From $25/mo |
| Best For | Rare languages, self-hosting | Quality-first production | Multilingual | Custom voices |

</div>
