# A02.1: Create prompt and request builder

Status: DONE
Owner: Codex
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing A02.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Versioned prompt and request serialization.

## Small implementation steps

- [x] Separate application instructions from serialized untrusted intake. Ask for required summary/tags/checklist, actionable uncertainties and no invented facts. Define finite output budget.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Inspect prompt fixtures including instruction-like descriptions; verify original intake is passed as data.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `34d88ee`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test -- --run src/ai/provider` — prompt and transport unit tests passed`.
- Next: A02.3 adapter (accepted in `e3126c1`).
- Changed: `request.ts`, `request.test.ts`; `triage-v1` separates system directions and serialized untrusted intake, with a 700-token output bound.
