# Session notes: where the tips came from

The raw input behind the 12 tips, kept so every article and post can be traced back to its origin.

## Source 1: conference slide photos

The 20 photos in [`source-slides/`](source-slides/). They are photos of slides from talks on AI coding agents and "software factories". They were compressed to 1400px wide for the repo; the original phone photos were about 2.4MB each. The articles don't name the talks or speakers. The tips are written as our own lessons.

## Source 2: the owner's notes (verbatim, from the brainstorm)

> On compact - tell it what to save and how to prepare for the next iteration.
>
> Dont switch model in the midel
>
> Work in 250k context window size - dont work with long contxt window it cost a lot.
>
> Define goal- what is succes? How does it look like?
>
> Question - is there an observibikty framework to show the status of the software comany?
>
> Build agent factory decopled from the vendor

Where each note went:

| Note | Tip / article |
|---|---|
| On compact, tell it what to save | 2 · `compact-with-instructions` |
| Don't switch model in the middle | 3 · `dont-switch-models-mid-session` |
| Work in a 250k context window | 4 · `keep-context-under-250k` |
| Define the goal: what is success? | 1 · `define-done-goal-in-five-lines` |
| Observability framework for the "software company"? | 12 · `observability-for-ai-software-factories` |
| Agent factory decoupled from the vendor | 11 · `vendor-neutral-agent-factory` |

## The answer to the observability question (summary)

There's no single off-the-shelf product yet. Teams build it from three layers:

1. **Agent and token layer.** Claude Code's OpenTelemetry export, traces in Langfuse or LangSmith, and cost per user or team from ccusage or LiteLLM.
2. **Delivery layer.** DORA-style engineering-metrics platforms such as LinearB, Swarmia, DX, Jellyfish or Faros.
3. **Factory-floor view.** Each station's queue, what's blocked on a human, and the risk tier. Today this is mostly custom: PR labels plus OTel data in Grafana.

The full write-up is in tip 12.

## Brief given for the outputs

- One website article per tip (`data/_learn/`), plus one LinkedIn post per tip.
- Posts are 3-5 lines, each with a picture or short video.
- Everything lives on one branch so it can be refined later from a computer.
