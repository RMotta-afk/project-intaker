# A03.1: Prepare representative cases

Status: DONE
Owner: Codex (a03_cases)
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing A03.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Evaluation intake fixtures and review rubric.

## Small implementation steps

- [x] Add clear request, missing detail, budget/timeline conflict, unusual industry and injection-like input. Define actionable risks, faithfulness and unsupported-claim review criteria; avoid subjective benchmark claims.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Cases share contract types; rubric covers requested output and source fidelity.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `70edbd2`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `Typed cases checked by `npm run typecheck`; rubric reviewed`.
- Next: A03.2 regression coverage (accepted in `f9f9470`).
- Changed: `cases.ts`, `review-rubric.md`; five representative scenarios and source-fidelity/actionability criteria.
