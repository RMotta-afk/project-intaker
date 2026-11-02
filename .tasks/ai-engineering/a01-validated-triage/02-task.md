# A01.2: Implement format-quality checks

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing A01.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: AI format validator and focused tests.

## Small implementation steps

- [ ] Extend shared validation without copying schemas: exactly three distinct normalized tags, approximate 2–3 sentence rule and non-empty bounded risks. Document sentence-count limitations.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test duplicate/case/whitespace tags, sentence bounds, empty risks and overlong output bounds agreed in contract.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
