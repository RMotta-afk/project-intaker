# B03.3: Verify retry through worker

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: B03.2 + B02.3
Blocks: downstream tasks referencing B03.3; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Retry workflow verification evidence and any retry-only fixes.

## Small implementation steps

- [ ] Drive a failure then explicit retry to completion through real API/SQLite/worker using controlled adapter behavior. Record any live-provider path separately.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Same intake ID and count before/after retry; bounded attempts; source unchanged; stale previous attempt cannot commit.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
