# A01.1: Implement strict response parser

Status: DONE
Owner: Codex (a01_components)
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing A01.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: AI response extraction/parser and parser tests.

## Small implementation steps

- [x] Use shared structural triage schema, require JSON and reject empty/malformed/unknown output. Define any envelope extraction explicitly; never manufacture missing values or silently truncate tags.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test valid response, malformed JSON, wrong shape, missing/extra fields and empty content.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `6cd1dec`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test -- --run src/ai/validated-triage/parser.test.ts src/ai/validated-triage/quality.test.ts` — 14/14 passed`.
- Next: A01.3 integration (accepted in `145b7e8`).
- Changed: `parser.ts`, `parser.test.ts`; strict JSON object only, with malformed/empty/wrong/missing/extra content rejected.
