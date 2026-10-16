---
title: "The Builder Builds. A Fresh Context Judges."
slug: fresh-context-verifier
description: "The agent that wrote the code has already convinced itself it works. Split the roles: a creator builds against the goal, and a verifier in a fresh context tries to prove it isn't done."
author: AI Tool Review
date: 2026-10-16
category: AI Development
reading_time: 4
hero_image: /assets/images/learn/fresh-context-verifier.png
hero_image_alt: "A dark code-editor style card titled 'The Builder Builds. A Fresh Context Judges.' listing the creator role, the verifier role with a fresh context, and the verifier prompt 'Assume the implementation is wrong. Find the evidence.'"
hero_image_caption: "The reviewer should not share the builder's memory."
bottom_line: "A builder reviewing its own work reads its own reasoning back and agrees with it. **Give verification to a fresh context that starts from the goal and is told to disprove done**, and make every handoff carry result, evidence, open questions and next owner."
tags:
  - AI Agents
  - Code Review
  - Subagents
  - Claude Code
---

You ask the agent to implement a feature, then ask the same session "does this work?" It says yes. Of course it does: it has the whole story of why each choice made sense, and it reads its own code through that story.

That is not review. It is the builder agreeing with itself.

## The tip

Split the work into two roles with separate contexts.

- **Creator:** builds against the goal. Owns one surface (a module, an endpoint, a component), uses local feedback like tests and type checks, and returns what it did plus the tradeoffs it made.
- **Verifier:** tries to disprove that the work is done. Starts from the goal, not from the creator's explanation. Runs in a fresh context. Returns evidence and gaps.

The verifier prompt is short and hostile on purpose:

```text
You are verifying a change. You did not write it.

Goal: <paste the goal and the "done when" condition>
Changed files: <list, or the diff>

Assume the implementation is wrong. Find the evidence.

- Run the tests that cover the goal. Add one if none exists.
- Check edge cases the goal implies but the diff does not handle.
- Do not fix anything.

Return:
1. Verdict: done / not done
2. Evidence: commands run and their output
3. Gaps: what is missing or untested
4. Open questions for the creator
```

In Claude Code, run this as a subagent or in a new session. Do not paste in the creator's reasoning; give it the goal and the diff.

## Why it works

A fresh context has no stake in the existing code. It has not seen the dead ends, the "this should be fine" moments, or the shortcut taken at step 14. It reads what was built, compares it with what was asked, and has nothing to defend.

Framing matters too. "Check if this works" invites confirmation. "Assume it is wrong, find the evidence" sends the agent looking for failures and makes it back each claim with a command and its output.

## Don't become the message bus

Once you have more than one agent, the same idea applies to delegation. A common split is an **explorer** that maps call sites and constraints, an **implementer** that owns one surface, and a **verifier** with a fresh context and the goal.

If you are copying output from one agent into the next by hand, you are the message bus and the team is not autonomous. Make each handoff carry four things:

```text
result · evidence · unresolved questions · next owner
```

A subagent should return its conclusion, the evidence for it and what it is still unsure of, not a transcript. A coordinator owns the goal and the handoffs. Workers own their surface.

## How to apply it

1. **Write the goal down first** so the verifier has something to start from.
2. **Give the creator one surface** and let it use tests and type checks as it goes.
3. **Start the verifier fresh,** with the goal and the diff, not the chat history.
4. **Use the adversarial prompt** and require evidence with every claim.
5. **Send gaps back to the creator** as the next handoff, with a named owner.
6. **Run cheap roles on cheaper models** where you can (see [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/)).

## Related

- [One Sensor. One Stop. One Budget.](/guides/one-sensor-one-stop-one-budget/)
- [Define Done Before You Start: A Goal in Five Lines](/guides/define-done-goal-in-five-lines/)
- [Path Rules Set the Floor: Risk-Tiered Review for Agent PRs](/guides/risk-tiered-review-path-rules/)
- [Loop Engineering](/guides/loop-engineering/): "never let the generator grade its own work"
- [Stop Burning Tokens on Subagents](/guides/stop-burning-tokens-on-subagents/)
