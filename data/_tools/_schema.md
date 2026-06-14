# Tool Schema Definition

> This file defines the schema for tool markdown files. It serves as both documentation for humans and instructions for AI agents that create/update tools.

---

## File Location

Tools are organized by track and category:

```
/data/tools/
├── _schema.md          # This file
├── _categories.yaml    # Category definitions
├── users/              # Tools for non-developers
│   └── {category}/
│       └── {tool-slug}.md
└── developers/         # Tools for developers
    └── {category}/
        └── {tool-slug}.md
```

---

## Tool File Format

Each tool is a markdown file with YAML frontmatter:

```markdown
---
# Required Fields
name: "Tool Name"
slug: "tool-name"                 # URL-safe, lowercase, immutable after creation
website: "https://tool.com"
type: "commercial"                # oss | saas | commercial
track: "developers"               # users | developers | both
category: "ai-coding"             # Primary category slug
subcategory: "coding-agents"      # Subcategory slug
description: "Short description for SEO (50-160 chars)"

# Optional Fields
status: "active"                  # active | beta | deprecated | removed
aliases: ["old-slug"]             # Historical slugs for redirects
github_url: "https://github.com/org/repo"
github_stars: 15400               # GitHub stars count (for OSS tools rating)
pricing_model: "freemium"         # free | freemium | paid | enterprise
logo_url: "/logos/tool.svg"
founded_year: 2023
headquarters: "San Francisco, CA"
suggested_by: "contributor-name"  # public display name of community contributor

# Tags (for filtering, cross-category discovery)
tags:
  - reasoning
  - api-available
  - enterprise-ready

# For cross-listing in multiple categories
additional_categories:
  - category: "other-category"
    subcategory: "other-subcategory"

# AI-Managed Metadata
last_verified: "2026-05-17"
last_crawled: "2026-05-17"
confidence_score: 0.95
source_urls:
  - "https://tool.com/about"
---

Short description of the tool (1-2 sentences).

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Pricing

- Free tier: Description
- Pro ($X/mo): Description
- Enterprise: Custom pricing

## Recent Updates

- 2026-05-01: Major update description
- 2026-03-15: Feature release
```

---

## Schema Validation

```yaml
type: object
required:
  - name
  - slug
  - url
  - type
  - track
  - category
  - subcategory

properties:
  name:
    type: string
    minLength: 1
    maxLength: 100
    description: "Display name of the tool"

  slug:
    type: string
    pattern: "^[a-z0-9-]+$"
    description: "URL-safe identifier. Immutable after creation. Use aliases for renames."

  url:
    type: string
    format: uri
    description: "Primary website URL"

  type:
    enum: [oss, saas, commercial]
    description: |
      - oss: Open source, self-hostable
      - saas: Cloud-only, subscription
      - commercial: Paid product, may be on-prem

  track:
    enum: [users, developers, both]
    description: "Primary audience"

  category:
    type: string
    description: "Primary category slug (must exist in _categories.yaml)"

  subcategory:
    type: string
    description: "Subcategory slug (must exist under category in _categories.yaml)"

  description:
    type: string
    minLength: 50
    maxLength: 160
    description: "Short description for SEO meta tags and tool cards"

  status:
    enum: [active, beta, deprecated, removed]
    default: active
    description: |
      - active: Operational, accepting users
      - beta: Limited availability
      - deprecated: Still works but not recommended
      - removed: Soft-deleted from catalog

  aliases:
    type: array
    items:
      type: string
      pattern: "^[a-z0-9-]+$"
    description: "Historical slugs for URL redirects"

  tags:
    type: array
    items:
      type: string
      pattern: "^[a-z0-9-]+$"
    description: "Cross-cutting capabilities and characteristics"

  github_url:
    type: string
    format: uri

  github_stars:
    type: integer
    minimum: 0
    description: "GitHub stars count for OSS tools. Used as default rating until custom ratings are implemented."

  pricing_model:
    enum: [free, freemium, paid, enterprise]

  logo_url:
    type: string
    description: "Path to logo file"

  founded_year:
    type: integer
    minimum: 1990
    maximum: 2030

  headquarters:
    type: string

  last_verified:
    type: string
    format: date
    description: "Date when tool info was last verified accurate"

  last_crawled:
    type: string
    format: date
    description: "Date when AI last crawled this tool"

  confidence_score:
    type: number
    minimum: 0
    maximum: 1
    description: "AI's confidence in data accuracy"

  source_urls:
    type: array
    items:
      type: string
      format: uri
    description: "URLs where AI found information"

  additional_categories:
    type: array
    items:
      type: object
      properties:
        category:
          type: string
        subcategory:
          type: string
      required:
        - category
        - subcategory
    description: "Additional categories for cross-listing"

  suggested_by:
    type: string
    description: "Public display name of the community contributor who suggested this tool. Written by the apply script when the suggester opted into credit. Surfaces as a credit line on the tool page."
```

---

## Type Definitions

| Type | Definition | Examples |
|------|------------|----------|
| `oss` | Open source, self-hostable | LangChain, Ollama, Playwright |
| `saas` | Cloud-only, subscription | Claude.ai, Perplexity |
| `commercial` | Paid product, may include on-prem | GitHub Copilot, Cursor |

---

## Instructions for AI Agents

When creating or updating tool files:

1. **Slug is immutable**: Never change a slug after creation. Use `aliases` for renames.
2. **One file per tool**: Each tool gets its own markdown file.
3. **Verify URLs**: Check that all URLs are valid and not redirecting to errors.
4. **Be conservative**: Only include information you can verify from official sources.
5. **Set confidence_score**: Lower score if information is uncertain.
6. **Update timestamps**: Set `last_verified` and `last_crawled` appropriately.
7. **Keep descriptions concise**: 1-2 sentences for the main description.
8. **Use consistent formatting**: Follow the template exactly.

---

## Tag Taxonomy

Tags are a controlled vocabulary. **`_tags.yaml` is the single source of truth** — every tag in a tool's `tags:` list must have a matching `slug` there, grouped into one of the families: `capabilities`, `integrations`, `deployment`, `use-cases`. Add a tag to `_tags.yaml` before using it. Tags describe what a tool *is/does* (cross-cutting traits), never *where it lives* (that's category/subcategory).
