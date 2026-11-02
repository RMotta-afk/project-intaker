# F03.2: Connect reads and status refresh

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: F03.1 + B01.3
Blocks: downstream tasks referencing F03.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Detail route, refresh controller and loading/error boundaries.

## Small implementation steps

- [ ] Start with server read; modest polling while active; cleanup at terminal/unmount and pause hidden pages if practical. Handle not-found/network errors; coordinate shared refresh helper with F02.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Use real saved detail and worker transitions; no perpetual polling after terminal state and no hidden source on failure.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
