# B02.1: Implement atomic claim and recovery

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: B01
Blocks: downstream tasks referencing B02.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Job claim/lease repository and transition tests.

## Small implementation steps

- [ ] Claim due PENDING or expired PROCESSING rows with compare-and-set, fresh token and incremented attempt. Respect exhausted budget even when reclaiming a crash. Keep one worker and no network transaction.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test competing claims, expired versus active leases, exhausted recovery budget and fresh tokens against SQLite.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
