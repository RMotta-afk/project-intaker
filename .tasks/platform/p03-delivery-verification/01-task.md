# P03.1: Integrate real slices and setup

Status: IN_PROGRESS
Owner: Codex
Parent feature: [feature brief](README.md)
Depends on: B03 + F01 + F02 + F03 + A02
Blocks: downstream tasks referencing P03.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Integration fixes, actual setup/process README and specialist-doc updates.

## Small implementation steps

- [ ] Run persistence slice first, then generation and retry through actual API/database/worker. Confirm one shared contract and no mocked UI left in live routes. Align app/worker/migration commands with installed versions; do not add container services.
- [ ] Keep edits within claimed ownership; request shared-file changes from their owner.
- [ ] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Fresh local setup creates and reads intake without provider; controlled failure/retry and worker restart/reclaim are recorded.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.

## Current blocker

P03.1 awaits B03, F01, F02, F03 and A02. The local README/setup work needed for the scaffold was completed, but no full API/database/worker workflow exists yet. After dependencies land, run the persistence, generation and retry slices, then update documentation.

## Integration progress — 2026-11-02

Merged committed feature heads on `integration/intake-workflow` and connected page routes, persistence, refresh, retry, worker environment loading and provider failure classification. Local no-key and fake-adapter workflow passed. Browser interaction and live-provider behavior remain unverified. See [integration review](../../INTEGRATION_REVIEW.md).
