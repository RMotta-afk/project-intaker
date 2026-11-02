# A01.3: Assemble validation boundary

Status: DONE
Owner: Codex
Parent feature: [feature brief](README.md)
Depends on: A01.1 + A01.2
Blocks: downstream tasks referencing A01.3; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Combined validate function and adversarial response cases.

## Small implementation steps

- [x] Combine parser/format checks into one boundary yielding validated triage or typed safe invalid-output failure. Default to terminal invalid output; add no repair loop unless separately agreed within total budget.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Prove every malformed fixture is rejected and valid output survives unchanged apart from documented normalization.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `145b7e8`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test -- --run src/ai/validated-triage` — 21/21 passed`.
- Next: A01 feature handoff accepted.
- Changed: `index.ts`, `index.test.ts`; parser and quality validation map to terminal typed `INVALID_OUTPUT` without returning raw provider content.
