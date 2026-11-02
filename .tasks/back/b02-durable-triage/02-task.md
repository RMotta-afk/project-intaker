# B02.2: Implement guarded completion and failure

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: B01
Blocks: downstream tasks referencing B02.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Job result/failure persistence and transition tests.

## Small implementation steps

- [ ] Commit validated output only for current token. Classify safe worker actions from adapter failures, bound backoff/jitter and attempts, release lease on scheduled PENDING or terminal FAILED. Inject clock/randomness.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test stale-token success/failure rejection, completion, bounded retry and terminal failure while original input remains unchanged.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
