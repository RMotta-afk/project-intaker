# B03.1: Implement retry transition

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: B02.2
Blocks: downstream tasks referencing B03.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Retry service and state tests.

## Small implementation steps

- [ ] Use conditional FAILED → PENDING; clear error/lease/results as specified by contract, reset the agreed per-run budget, preserve intake ID/source/timestamp. Reject active/completed states.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test legal/illegal states and simultaneous retry requests; ensure exactly one transition and no new intake.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
