# A02: Bounded server-only provider generation

Status: DONE
Owner: Codex
Area: ai-engineering
Depends on: P01; A01 for complete adapter
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Adapter returns validated triage or a classified safe failure, including when credentials are absent.

## Tasks

- [x] [A02.1: Create prompt and request builder](01-task.md) — depends on P01.
- [x] [A02.2: Implement provider transport](02-task.md) — depends on P01.
- [x] [A02.3: Expose integrated generation adapter](03-task.md) — depends on A02.1 + A02.2 + A01.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [x] All three child tasks and their focused verification complete.
- [x] Demonstrate the complete feature outcome above through its actual integration boundary.
- [x] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [x] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

- Feature: A02; status DONE; owner Codex; branch `feature/ai-engineering`.
- Commits: `34d88ee` (prompt/transport), `e3126c1` (validated adapter and setup notes).
- Contract: v1 in `src/contracts/intake.ts`.
- Outcome: bounded `triage-v1` request, server environment key, finite 15-second one-call transport attempt, typed safe provider errors, and integrated `generateTriage` that returns only A01-validated output.
- Verification: provider tests passed, 18/18; full suite passed, 53/53; typecheck and lint passed; build passed.
- Live provider: not called; `OPENROUTER_API_KEY` absent.
- Next consumer: B02.3 worker integration. Retries remain the durable worker's responsibility.
