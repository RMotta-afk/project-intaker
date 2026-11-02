# A02.2: Implement provider transport

Status: DONE
Owner: Codex
Parent feature: [feature brief](README.md)
Depends on: P01
Blocks: downstream tasks referencing A02.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: Server-only provider HTTP/config/timeout and error classifier tests.

## Small implementation steps

- [x] Use chosen OpenRouter model/settings; key never enters client. Set finite timeout shorter than lease and classify missing/auth config as terminal, timeouts/429/selected 5xx as transient. Worker owns retry; transport makes one bounded call per attempt.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Mock success, timeout, abort, 429, 5xx and auth errors; sanitize and cap diagnostics without logging keys/raw intake.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

- Branch: `feature/ai-engineering`; commit `34d88ee`.
- Contract: v1 in `src/contracts/intake.ts`.
- Verification: `npm test -- --run src/ai/provider` — transport tests passed`.
- Next: A02.3 adapter (accepted in `e3126c1`).
- Changed: `transport.ts`, `transport.test.ts`; 15-second timeout, one request per attempt, server-only env key, safe bounded diagnostics and classified errors. Live provider call not run.
