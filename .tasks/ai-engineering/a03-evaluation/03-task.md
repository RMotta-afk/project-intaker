# A03.3: Record qualitative review

Status: DONE
Owner: Codex
Parent feature: [feature brief](README.md)
Depends on: A03.2; live credentials only for live review
Blocks: downstream tasks referencing A03.3; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Evaluation report with prompt/model/date and limitations.

## Small implementation steps

- [x] If authorized credentials exist, perform small live review with bounded calls; otherwise mark live review unrun. Record observed failures and feed blocking quality fixes to A01/A02 without expanding scope.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Evidence separates deterministic pass/fail from manual judgments and identifies all unrun live checks.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `b16f173`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test` — 53/53 passed; typecheck and lint passed; `npm run build` passed`.
- Next: A03 feature handoff accepted.
- Changed: `review-report.md`; records prompt version, default model, date, deterministic evidence, and the unrun live/manual review because no provider key was configured.
