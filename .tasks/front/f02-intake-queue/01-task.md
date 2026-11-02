# F02.1: Build queue presentation

Status: TODO
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing F02.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Intake list component, feature-local empty/loading/error UI.

## Small implementation steps

- [ ] Use public fixtures for all statuses, title, industry, timestamp, optional tags; add new-intake/detail links and readable status text. Initial rendering should use server reads.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Inspect empty/populated and responsive/keyboard states without depending on AI.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.
