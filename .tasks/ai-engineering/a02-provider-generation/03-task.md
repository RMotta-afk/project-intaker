# A02.3: Expose integrated generation adapter

Status: DONE
Owner: Codex
Parent feature: [feature brief](README.md)
Depends on: A02.1 + A02.2 + A01
Blocks: downstream tasks referencing A02.3; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: generateTriage adapter and mocked integration tests.

## Small implementation steps

- [x] Join request, transport and validated response. Match shared signature/failure taxonomy; keep durable attempts in worker. Supply setup notes to platform owner; provide fake adapter to backend if needed.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Offline tests cover valid/invalid responses and missing config; hand off to B02.3, recording live provider generation only if performed.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `e3126c1`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test -- --run src/ai/provider` — 18/18 passed; `npm run typecheck` and `npm run lint` passed`.
- Next: B02.3 may consume `generateTriage`; no live provider run.
- Changed: `generate.ts`, `generate.test.ts`, `.env.example`, root setup instructions; integrates transport and A01 validator. Missing configuration returns classified safe failure.
