# A03.2: Add deterministic regression coverage

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: A03.1 + A02
Blocks: downstream tasks referencing A03.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Evaluation tests and simulated provider-response fixtures.

## Small implementation steps

- [ ] Exercise cases using mocked responses/errors; include wrong tag count, malformed output, empty output, rate limit and auth failure. Do not claim mocks measure live quality.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Run offline focused tests with no credentials and record exact command/result.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
