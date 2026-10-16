# AI Tips & Tricks: content kit

Each tip ships as **one website article + one LinkedIn post + one image/video**. This folder is kept out of the Jekyll build (see `exclude` in `_config.yml`). The articles themselves live in `data/_learn/` and are published at `/guides/<slug>/`.

## Layout

```
marketing/
  tips.json                 # source of truth: slug, title, hook, points, takeaway, hashtags
  scripts/render-cards.mjs  # renders the images and videos from tips.json
  linkedin/<slug>/
    post.md                 # 3-5 line LinkedIn post (status: draft | ready | posted)
    card.png                # 1200x1200 feed image
    video.mp4               # ~9.5s, 1080x1080, 3 scenes (hook → points → takeaway), silent
  source-slides/NN.jpg      # conference slide photos the tips came from (compressed)
data/_learn/<slug>.md       # the matching website article
assets/images/learn/<slug>.png  # 1200x630 hero / og:image for the article
```

How-to for Claude: `.claude/skills/linkedin-post/SKILL.md` (invoke with `/linkedin-post`).

## Regenerating visuals

```bash
node marketing/scripts/render-cards.mjs                  # all tips (images + videos)
node marketing/scripts/render-cards.mjs <slug> --no-video
# If Playwright's bundled browser isn't installed:
CHROMIUM_PATH=/path/to/chromium node marketing/scripts/render-cards.mjs
```

Edit the copy in `tips.json`, then re-run. The script warns when text overflows the frame.

## The 12 tips

| # | Slug | Source slides | Origin |
|---|---|---|---|
| 1 | define-done-goal-in-five-lines | 14, 05 | Goal template; "contract first" + owner note "define success" |
| 2 | compact-with-instructions | 15 | Owner note: tell /compact what to keep and how to prep the next iteration |
| 3 | dont-switch-models-mid-session | n/a | Owner note |
| 4 | keep-context-under-250k | 15, 16 | Owner note: work in ~250k, long context is expensive |
| 5 | claude-md-survives-compaction | 19 | "Compaction forgets" |
| 6 | cut-the-noise-before-the-agent-reads | 20, 17 | "Cut the noise" + the toolbox |
| 7 | one-sensor-one-stop-one-budget | 10, 13 | Live loop + "agent is the feedback loop" |
| 8 | fresh-context-verifier | 12, 11 | Creator/verifier + delegation |
| 9 | risk-tiered-review-path-rules | 06, 04, 05 | Foreman/risk router + specialist reviewers |
| 10 | failure-should-improve-the-next-run | 09, 08, 07 | Antifragile + "who says done" + handoffs |
| 11 | vendor-neutral-agent-factory | 01, 02, 03, 18 | Owner note: agent factory decoupled from vendor |
| 12 | observability-for-ai-software-factories | 16 | Owner question: observability for the agent "company" |

Slide index: 01 factory-factory Java joke · 02 domain factories · 03 robot strike · 04 specialist reviewers · 05 station contract · 06 risk foreman · 07 automate handoffs · 08 who says done · 09 failure improves next run · 10 one sensor/stop/budget · 11 delegation · 12 creator + verifier · 13 feedback loop · 14 goal in five lines · 15 context control · 16 takeaways · 17 toolbox · 18 prompt → factory journey · 19 compaction forgets · 20 cut the noise

## Ideas not yet used

- **Series framing:** slide 18 (Prompt → Context → Goal → Loop → Team → Factory) could become a hub page that orders the 12 tips as a learning path.
- **Robot strike image (03):** a fun hook for a "keep humans in the loop / least-privilege agents" post.
- **Toolbox (17):** each listed tool without a tool page (MarkItDown, ast-grep, Repomix, code2prompt, LLMLingua, ccusage, claude-context) is a candidate for `data/_tools`.
- **Video upgrade:** the current videos are animated cards. For AI-generated footage or a voice-over, the Higgsfield MCP tools can do it, but they cost credits.

## Review checklist before posting

- [ ] Read the article on the local site (`npm run serve`) and fix any claim you can't stand behind
- [ ] Facts to double-check: `/compact <instructions>` syntax, Claude Code OpenTelemetry env vars (tip 12), `/goal` behaviour (tip 7)
- [ ] Post is 3-5 lines and the hook works above the "see more" fold
- [ ] Set `status: ready` in post.md, then `posted` with the date once it's live
