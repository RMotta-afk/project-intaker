# B02.3: Wire explicit worker process

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: B02.1 + B02.2; A02 for real adapter
Blocks: downstream tasks referencing B02.3; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Worker entry point, adapter wiring, worker startup documentation.

## Small implementation steps

- [ ] Run a modest poller as a separate long-lived process; handle shutdown and idle loops. Call adapter outside transactions. Use fake adapter while A02 is pending; finish only after real integration. Request script/env changes from platform owner.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Exercise create → worker → validated completion and missing-key failure; kill/restart worker and demonstrate expired work recovery, labeling fake versus live provider runs.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
