---
name: tool-page-content
description: Use when creating or editing AI tool review pages in the ai-tool-review Jekyll site. Handles frontmatter, content structure, styling conventions, and URL validation.
---

# Tool Page Content Skill

Use this skill when creating or editing tool pages in the AI landscape site.

## Pre-Flight Checks (MANDATORY)

Before creating or updating any tool, you MUST verify all URLs are live:

### 1. GitHub URL Validation

For any tool with a `github_url`:

```bash
# Check if GitHub repo exists (returns HTTP status)
curl -s -o /dev/null -w "%{http_code}" https://github.com/{org}/{repo}
```

- **200**: Repo is live - proceed
- **404**: Repo is DEAD - DO NOT add this tool. Inform the user.
- **301/302**: Repo was renamed/moved - follow redirect, use the new URL

### 2. Website URL Validation

For the primary `website` URL:

```bash
curl -s -o /dev/null -w "%{http_code}" -L {website_url}
```

- **200**: Site is live - proceed
- **404/5xx**: Site is down - warn the user, consider marking as `status: deprecated`

### 3. For GitHub-based Tools

If `website` points to GitHub, use `gh` CLI to get accurate data:

```bash
gh repo view {org}/{repo} --json name,description,stargazerCount,isArchived,updatedAt
```

Check for:
- `isArchived: true` → Mark as `status: deprecated`
- `updatedAt` older than 2 years → Lower `confidence_score`, note in description

## File Location

Tools go in: `/ai-tool-review/data/_tools/{track}/{category}/{subcategory}/{slug}.md`

- `track`: `users` or `developers`
- `category`: Primary category (e.g., `ai-coding`, `ai-chat-search`)
- `subcategory`: Subcategory (e.g., `coding-agents`, `code-intelligence`)
- `slug`: URL-safe lowercase identifier

## Required Frontmatter

```yaml
---
name: "Tool Name"
slug: "tool-name"
website: "https://tool.com"
type: oss | saas | commercial
track: users | developers
category: "category-slug"
subcategory: "subcategory-slug"
status: active | beta | deprecated | removed
description: "50-160 char SEO description"
pricing_model: free | freemium | paid | enterprise
founded_year: 2024
headquarters: "Location or —"
github_url: "https://github.com/org/repo"  # if applicable
github_stars: 1500  # if applicable
tags:
  - relevant
  - tags
last_verified: "YYYY-MM-DD"
confidence_score: 0.95
---
```

## Content Structure

Use this exact HTML structure for rich tool pages:

### Key Stats Block

```html
<div class="key-stats">
  <div class="key-stat">
    <span class="number">1.5k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">Feature</span>
    <span class="label">Label</span>
  </div>
  <div class="key-stat">
    <span class="number">2024</span>
    <span class="label">Founded</span>
  </div>
</div>
```

### Overview Section

```html
## Overview

<div class="overview">
<p>Tool description paragraph. 2-4 sentences covering what the tool does, who it's for, and key differentiators.</p>
</div>
```

### Verdict Section

```html
## The Verdict

<div class="verdict">
  <h3>Who Should Use {Tool}?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Target user type 1</li>
        <li>Use case 2</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Anti-pattern 1</li>
        <li>Poor fit scenario</li>
      </ul>
    </div>
  </div>
</div>
```

### Pros/Cons Section

```html
<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Pro 1</li>
      <li>Pro 2</li>
    </ul>
    <div class="source"><a href="{source_url}" target="_blank">Source</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Con 1</li>
      <li>Con 2</li>
    </ul>
    <div class="source"><a href="{source_url}" target="_blank">Source</a></div>
  </div>
</div>
```

### Pricing Section

```html
## Pricing

<div class="pricing-grid">
  <a href="{url}" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Plan Name</div>
    <div class="price">$0</div>
    <div class="desc">Plan description</div>
  </a>
</div>
```

### Expandable Details

```html
<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Feature 1</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Use case 1</li>
    </ul>
  </div>
</div>

</details>
```

### Comparison Table

```html
## How It Compares

<div class="comparison" markdown="1">

| Feature | This Tool | Competitor 1 | Competitor 2 |
|---------|-----------|--------------|--------------|
| Row 1   | Value     | Value        | Value        |

</div>
```

## Workflow Checklist

When adding a new tool:

1. [ ] **Validate GitHub URL** - Run curl check, confirm 200 status
2. [ ] **Validate website URL** - Run curl check, confirm not 404/5xx
3. [ ] **Check if archived** - Use `gh repo view` to check `isArchived`
4. [ ] **Get accurate star count** - Use `gh repo view` for real stars
5. [ ] **Determine correct category** - Check `_categories.yaml`
6. [ ] **Create file in correct path** - `_tools/{track}/{category}/{subcategory}/`
7. [ ] **Fill all frontmatter** - Include all required fields
8. [ ] **Write content sections** - Use HTML templates above
9. [ ] **Verify sources** - All claims should have verifiable sources
10. [ ] **Set last_verified date** - Today's date

## Red Flags - DO NOT ADD

- GitHub repo returns 404 → Tool is dead
- Website returns 404 for 3+ days → Tool may be abandoned
- `isArchived: true` on GitHub → Mark as deprecated, not active
- No commits in 2+ years → Lower confidence, note staleness
- Stars < 50 and no website → May not be notable enough

## Updating Existing Tools

When updating, always:

1. Re-validate all URLs
2. Update `last_verified` to today
3. Update `github_stars` with fresh count
4. Check for any status changes (deprecated, renamed, etc.)
