---
name: linkedin-post
description: Use when turning an AI tip, guide, or Learn article from the ai-tool-review site into a LinkedIn post. Produces a 3-5 line post, a branded image card (and optional short video), and links it to the matching /guides/ article. Use for "make a LinkedIn post", "post this tip", "social post for this article".
---

# LinkedIn Post Skill

Every tip ships as a set of three:

1. **Website article:** `data/_learn/<slug>.md` (served at `/guides/<slug>/`)
2. **LinkedIn post:** `marketing/linkedin/<slug>/post.md`
3. **Visual:** `marketing/linkedin/<slug>/card.png` (1200x1200) and `video.mp4` (a short 3-scene clip), rendered from `marketing/tips.json`

`marketing/tips.json` is the single source of truth for each tip's slug, hook, points and takeaway. To add a tip, add it there first.

## Post format (strict)

- **3-5 lines of body text.** Each line is one sentence. No walls of text.
- **Line 1 is the hook:** a counter-intuitive claim or a concrete pain. Under about 12 words. It must work by itself above the "…see more" fold.
- **Lines 2-4:** the tip itself. Use a concrete example, command or number where one exists (for example `/compact keep: goal, decisions, next step`).
- **Last line:** the payoff, or a link to the full guide: `Full guide → https://aitoolreview.ai/guides/<slug>/`
- Then 3-4 hashtags on their own line, for example `#ClaudeCode #AIAgents #DeveloperProductivity`.
- First person, plain words. No emoji walls (at most one emoji), no "🚀 Excited to share", no "Here's the thing:", no engagement bait ("Agree?").
- Never invent statistics, quotes or benchmark numbers. If a number isn't sourced in the article, leave it out.
- Don't name the conference or speaker unless the user says so. Write it as our own lesson.

### post.md template

```markdown
---
slug: <slug>
article: https://aitoolreview.ai/guides/<slug>/
image: card.png
video: video.mp4
status: draft   # draft | ready | posted
---

<line 1 — hook>
<line 2>
<line 3>
<line 4 (optional)>
Full guide → https://aitoolreview.ai/guides/<slug>/

#Tag1 #Tag2 #Tag3
```

## Rendering the visuals

```bash
node marketing/scripts/render-cards.mjs            # all tips
node marketing/scripts/render-cards.mjs <slug>     # one tip
```

This writes:
- `marketing/linkedin/<slug>/card.png`: the 1200x1200 feed image
- `marketing/linkedin/<slug>/video.mp4`: about 9s, three scenes (hook → points → takeaway), 1080x1080, silent. Needs `ffmpeg`.
- `assets/images/learn/<slug>.png`: a 1200x630 version, used as the article's `hero_image` and `og:image`

The cards use the site's VS Code dark palette (`#1e1e1e` background, `#4ec9b0` / `#569cd6` / `#dcdcaa` accents, monospace). For AI-generated imagery or a narrated video, use the Higgsfield MCP tools, but ask the user first because it spends credits.

## Article format (for the matching Learn page)

Follow the frontmatter of the existing `data/_learn/*.md` files (title, slug, description, author: AI Tool Review, date, category, reading_time, hero_image, hero_image_alt, bottom_line, tags, sources). Tips articles are short: 400-700 words, `reading_time: 3`-`4`. Structure:
1. A 2-3 sentence opening that names the pain
2. `## The tip`: the rule, plus a copy-pasteable example
3. `## Why it works`
4. `## How to apply it`: a numbered checklist
5. `## Related` links to sibling tips (`/guides/<slug>/`) and relevant tool categories

Only cite sources you have verified exist. Leave `sources:` out rather than guess a URL.
