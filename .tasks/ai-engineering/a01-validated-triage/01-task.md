# A01.1: Implement strict response parser

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing A01.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: AI response extraction/parser and parser tests.

## Small implementation steps

- [ ] Use shared structural triage schema, require JSON and reject empty/malformed/unknown output. Define any envelope extraction explicitly; never manufacture missing values or silently truncate tags.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test valid response, malformed JSON, wrong shape, missing/extra fields and empty content.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
