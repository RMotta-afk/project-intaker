# A03.2: Add deterministic regression coverage

Status: DONE
Owner: Codex
Parent feature: [feature brief](README.md)
Depends on: A03.1 + A02
Blocks: downstream tasks referencing A03.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Evaluation tests and simulated provider-response fixtures.

## Small implementation steps

- [x] Exercise cases using mocked responses/errors; include wrong tag count, malformed output, empty output, rate limit and auth failure. Do not claim mocks measure live quality.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Run offline focused tests with no credentials and record exact command/result.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `f9f9470`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test -- --run src/ai/evaluation/regression.test.ts` — 10/10 passed`.
- Next: A03.3 review record (accepted in `b16f173`).
- Changed: `regression.test.ts`; offline mocks cover typed cases, wrong tag count, malformed/empty output, rate limit and auth failure. Mocks do not measure live quality.
