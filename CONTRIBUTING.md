# Contributing to AI Tool Review

Thank you for your interest in contributing to AI Tool Review!

## The Quickest Way: In-App Suggestions (Recommended)

The easiest way to contribute is directly from the site:

1. Sign in with GitHub on [AI Tool Review](https://aitoolreview.dev)
2. Click **+ Suggest** on the [Landscape page](https://aitoolreview.dev/landscape.html)
3. Choose what to suggest:
   - **Add a missing tool** — fill in the name, website, description, and (optionally) where it belongs on the map
   - **Improve the taxonomy** — propose a new category, subcategory, or tag
   - Or click **Suggest an edit** on any tool page to fix details or re-tag
4. Your suggestion goes into a moderation queue; the maintainer reviews and applies approved ones
5. You get credit on the tool's page (and the changelog) when applied

Track your submissions at [My Suggestions](https://aitoolreview.dev/my-suggestions.html).

Not sure where a tool belongs? Read [How the map is organized](https://aitoolreview.dev/about.html#how-its-organized).

---

## Power-User Path: Pull Requests

If you prefer to work directly with the data files (e.g. you're adding many tools at once, or you want to see the full schema), pull requests are welcome.

### Adding a New Tool

1. Fork this repository
2. Create a new MD file in the appropriate category:
   - `data/_tools/users/{category}/{subcategory}/{tool-slug}.md` for user-facing tools
   - `data/_tools/developers/{category}/{subcategory}/{tool-slug}.md` for developer tools
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

1. Submit a pull request

### Updating an Existing Tool

1. Fork this repository
2. Find the tool's MD file
3. Make your updates
4. Submit a pull request with a clear description of what changed

### Guidelines

- Keep descriptions factual and neutral
- Verify all information from official sources
- Do not include promotional language
- Check that URLs are valid
- For taxonomy (categories/subcategories/tags), read [How the map is organized](https://aitoolreview.dev/about.html#how-its-organized) before proposing structural changes

## License

By submitting a pull request or in-app suggestion, you agree that your contribution is licensed under the MIT License.
