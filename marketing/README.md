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
  source-slides/NN-name.jpg # conference slide photos the tips came from (compressed, 1400px)
  session-notes.md          # the original brainstorm: owner notes + questions, verbatim
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
| 1 | define-done-goal-in-five-lines | [14-goal-five-lines](source-slides/14-goal-five-lines.jpg), [05-station-contract](source-slides/05-station-contract.jpg) | Goal template; "contract first" + owner note "define success" |
| 2 | compact-with-instructions | [15-context-control](source-slides/15-context-control.jpg) | Owner note: tell /compact what to keep and how to prep the next iteration |
| 3 | dont-switch-models-mid-session | n/a (owner note) | Owner note |
| 4 | keep-context-under-250k | [15-context-control](source-slides/15-context-control.jpg), [16-takeaways](source-slides/16-takeaways.jpg) | Owner note: work in ~250k, long context is expensive |
| 5 | claude-md-survives-compaction | [19-compaction-forgets](source-slides/19-compaction-forgets.jpg) | "Compaction forgets" |
| 6 | cut-the-noise-before-the-agent-reads | [20-cut-the-noise](source-slides/20-cut-the-noise.jpg), [17-toolbox](source-slides/17-toolbox.jpg) | "Cut the noise" + the toolbox |
| 7 | one-sensor-one-stop-one-budget | [10-one-sensor-stop-budget](source-slides/10-one-sensor-stop-budget.jpg), [13-feedback-loop](source-slides/13-feedback-loop.jpg) | Live loop + "agent is the feedback loop" |
| 8 | fresh-context-verifier | [12-creator-verifier](source-slides/12-creator-verifier.jpg), [11-delegation](source-slides/11-delegation.jpg) | Creator/verifier + delegation |
| 9 | risk-tiered-review-path-rules | [06-risk-foreman](source-slides/06-risk-foreman.jpg), [04-specialist-reviewers](source-slides/04-specialist-reviewers.jpg), [05-station-contract](source-slides/05-station-contract.jpg) | Foreman/risk router + specialist reviewers |
| 10 | failure-should-improve-the-next-run | [09-failure-improves-next-run](source-slides/09-failure-improves-next-run.jpg), [08-who-says-done](source-slides/08-who-says-done.jpg), [07-automate-handoffs](source-slides/07-automate-handoffs.jpg) | Antifragile + "who says done" + handoffs |
| 11 | vendor-neutral-agent-factory | [01-factory-factory-java](source-slides/01-factory-factory-java.jpg), [02-domain-factories](source-slides/02-domain-factories.jpg), [03-robot-strike](source-slides/03-robot-strike.jpg), [18-prompt-to-factory-journey](source-slides/18-prompt-to-factory-journey.jpg) | Owner note: agent factory decoupled from vendor |
| 12 | observability-for-ai-software-factories | [16-takeaways](source-slides/16-takeaways.jpg) | Owner question: observability for the agent "company" |

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
