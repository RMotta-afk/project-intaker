# A02.3: Expose integrated generation adapter

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: A02.1 + A02.2 + A01
Blocks: downstream tasks referencing A02.3; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: generateTriage adapter and mocked integration tests.

## Small implementation steps

- [ ] Join request, transport and validated response. Match shared signature/failure taxonomy; keep durable attempts in worker. Supply setup notes to platform owner; provide fake adapter to backend if needed.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Offline tests cover valid/invalid responses and missing config; hand off to B02.3, recording live provider generation only if performed.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
