# Contributing to AI Tool Review

Thank you for your interest in contributing to AI Tool Review!

## Adding a New Tool

1. Fork this repository
2. Create a new MD file in the appropriate category:
   - `data/tools/users/{category}/{subcategory}/{tool-slug}.md` for user-facing tools
   - `data/tools/developers/{category}/{subcategory}/{tool-slug}.md` for developer tools
3. Use this template:

```yaml
---
name: "Tool Name"
slug: "tool-name"
url: "https://tool.com"
type: "oss"                      # oss | saas | commercial
track: "developers"              # users | developers | both
category: "category-slug"
subcategory: "subcategory-slug"
description: "Short description for SEO (50-160 chars max)"
pricing_model: "freemium"        # free | freemium | paid | enterprise
github_url: "https://github.com/org/repo"  # if applicable
github_stars: 1000               # if applicable
---

Longer description of the tool.

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Pricing

- Free: Description
- Pro ($X/mo): Description
```

4. Submit a pull request

## Updating an Existing Tool

1. Fork this repository
2. Find the tool's MD file
3. Make your updates
4. Submit a pull request with a clear description of what changed

## Guidelines

- Keep descriptions factual and neutral
- Verify all information from official sources
- Do not include promotional language
- Check that URLs are valid

## License

By submitting a pull request, you agree that your contribution is licensed under the MIT License.
