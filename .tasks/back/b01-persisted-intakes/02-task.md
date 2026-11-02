# B01.2: Deliver validated intake creation

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: B01.1
Blocks: downstream tasks referencing B01.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Create service and POST intake route with focused tests.

## Small implementation steps

- [ ] Validate input via shared schema; persist PENDING then return 201/id promptly. Do not import or call provider. Map validation/storage errors to safe responses.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test invalid input is not saved and valid input returns persisted ID/status; prove provider is not part of the path.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
