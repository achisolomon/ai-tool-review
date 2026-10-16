---
title: "Cut the Noise Before the Agent Reads It"
slug: cut-the-noise-before-the-agent-reads
description: "Agents read everything you hand them: whole logs, raw PDFs, unbounded grep output. Filter, convert and cap the input first, and the agent gets cheaper and more accurate."
author: AI Tool Review
date: 2026-10-16
category: Claude Code
reading_time: 4
hero_image: /assets/images/learn/cut-the-noise-before-the-agent-reads.png
hero_image_alt: "A dark code-editor style card titled 'Cut the Noise Before the Agent Reads It' with four points: PDF to Markdown or image, logs to errors only, grep and find scoped and capped, and read symbols, not whole files."
hero_image_caption: "Trim the input, not the answer."
bottom_line: "Every line the agent reads costs tokens and competes for its attention. **Convert documents, filter logs, cap searches and look up symbols instead of whole files**, and you pay for the signal instead of the noise."
tags:
  - Claude Code
  - Context Engineering
  - Token Usage
  - AI Agents
---

A test fails, so the agent reads the whole CI log. Ten thousand lines of install output, progress bars and passing tests, to find one stack trace. Then it greps the repo without a path, gets back every match in `node_modules`, and reads three full files to find one function.

All of that goes into the context window, gets billed, and gets re-sent on every following turn.

## The tip

Cut the noise before the agent reads it, not after. Four habits cover most of it:

- **PDF → Markdown or image.** Convert documents to clean text first. If layout matters, a screenshot of the page is often smaller and clearer than extracted text.
- **Logs → errors only.** Filter to the failures and a little context around them.
- **grep / find → scoped and capped.** Give a path, a file type and a line limit.
- **Read symbols, not whole files.** Ask for the function or class you need.

Here is what that looks like in practice:

```bash
# Logs: only errors, with a few lines of context, capped
grep -nE "ERROR|FAIL|Traceback|panic" build.log -A 5 | head -n 80

# Search: one directory, one file type, capped
grep -rn "parseInvoice" src/ --include="*.ts" | head -n 20

# Find: skip dependencies and build output
find src -name "*.test.ts" -not -path "*/node_modules/*" | head -n 50

# JSON: keep only the fields you need
jq '.items[] | {id, status, error}' response.json
```

You can put the same rules in `CLAUDE.md` so the agent follows them without being told each time:

```markdown
## Reading input
- Filter logs to errors before reading them. Never read a full log.
- Always scope grep/find to a directory and pipe through `head`.
- Convert PDFs and Office files to Markdown before reading.
```

## Why it works

The agent has no way to skip text it has already been given. Everything it reads stays in the context, costs tokens on that turn and on every turn after, and has to be weighed against the part that matters. Less noise means a smaller bill and fewer chances for the agent to fixate on an irrelevant warning.

It also keeps sessions shorter, which delays compaction and the information loss that comes with it.

## How to apply it

1. **Measure first.** Use `/context` and `/cost` to see what fills the window. ccusage reports tokens and cost per session; [Langfuse](/tools/langfuse/) does the same per trace if you run agents through an API.
2. **Convert documents.** MarkItDown turns PDF and Office files into Markdown, [Docling](/tools/docling/) does the same for documents, and Jina Reader from [Jina AI](/tools/jina-ai/) turns a web page into Markdown. Use `jq` to pull only the JSON you need.
3. **Find, don't read.** [Serena MCP](/tools/serena-mcp/) returns symbols instead of whole files, ast-grep searches by code structure, claude-context adds semantic code search, and [Context7](/tools/context7/) fetches current library docs instead of letting the agent guess or crawl.
4. **Pack deliberately.** When you need a lot of code at once, Repomix packs a repo in compressed form and code2prompt includes only the files you pick. LLMLingua compresses long prompts.
5. **Filter tool output automatically.** [Headroom](/tools/headroom/), [RTK](/tools/rtk/) and [Context Mode](/tools/context-mode/) trim command and tool output before it reaches the model.
6. **Reset when it's full of noise anyway.** `/compact` with instructions, or `/clear` and start fresh.
7. **Set a budget at the gateway.** [LiteLLM](/tools/litellm/) can enforce budgets and caching in front of your models.

## Related

- [Work in a 250k Context Window, Not a 1M One](/guides/keep-context-under-250k/)
- [Don't Just /compact: Tell It What to Keep](/guides/compact-with-instructions/)
- [Compaction Forgets. CLAUDE.md Doesn't.](/guides/claude-md-survives-compaction/)
- [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/)
- [Managing AI Coding Tool Budgets](/guides/managing-ai-coding-tool-budgets/)
- [Browse cost-reduction tools](/?subcategory=cost-reduction)
