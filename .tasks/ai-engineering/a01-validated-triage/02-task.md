# A01.2: Implement format-quality checks

Status: DONE
Owner: Codex (a01_components)
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing A01.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: AI format validator and focused tests.

## Small implementation steps

- [x] Extend shared validation without copying schemas: exactly three distinct normalized tags, approximate 2–3 sentence rule and non-empty bounded risks. Document sentence-count limitations.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Test duplicate/case/whitespace tags, sentence bounds, empty risks and overlong output bounds agreed in contract.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `6cd1dec`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test -- --run src/ai/validated-triage/parser.test.ts src/ai/validated-triage/quality.test.ts` — 14/14 passed`.
- Next: A01.3 integration (accepted in `145b7e8`).
- Changed: `quality.ts`, `quality.test.ts`; shared schema enforces normalization, summary sentence approximation, distinct tags and risk bounds.
