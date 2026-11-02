# F02.2: Connect persisted queue

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: F02.1 + B01.3
Blocks: downstream tasks referencing F02.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: List route and its data loading/error boundaries.

## Small implementation steps

- [ ] Use agreed newest-first read contract. Keep safe errors/retry; show saved records with correct hrefs. Coordinate root layout edits through foundation owner.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Verify new persisted record appears first, timestamps/status match DB, and detail/create links work.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
