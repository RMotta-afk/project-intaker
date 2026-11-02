# P03.2: Run complete repository checks

Status: BLOCKED
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: P03.1 + P02 + A03
Blocks: downstream tasks referencing P03.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Verification report and narrowly scoped check fixes.

## Small implementation steps

- [ ] Run declared focused tests, type/lint/build; confirm CI setup includes Prisma/disposable SQLite as needed. Verify hook and base Dockerfile scope; fix failures then rerun affected checks.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Exact commands/exit outcomes recorded; local CI equivalent succeeds; remote Actions/Docker/live provider unrun status remains explicit.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.

## Current blocker

P03.2 awaits P03.1, integrated feature tasks and A03 regression coverage. Scaffold lint, typecheck, unit tests and build pass; full repository checks cannot claim feature acceptance yet.
