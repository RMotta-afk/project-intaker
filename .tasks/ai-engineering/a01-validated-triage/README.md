# A01: Untrusted model response becomes validated advisory triage

Status: DONE
Owner: Codex
Area: ai-engineering
Depends on: P01
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Malformed or contract-breaking output cannot be returned as successful triage.

## Tasks

- [x] [A01.1: Implement strict response parser](01-task.md) — depends on P01.
- [x] [A01.2: Implement format-quality checks](02-task.md) — depends on P01.
- [x] [A01.3: Assemble validation boundary](03-task.md) — depends on A01.1 + A01.2.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [x] All three child tasks and their focused verification complete.
- [x] Demonstrate the complete feature outcome above through its actual integration boundary.
- [x] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [x] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

- Feature: A01; status DONE; owner Codex; branch `feature/ai-engineering`.
- Commits: `6cd1dec` (parser/quality), `145b7e8` (combined boundary).
- Contract: v1 `TriageSchema` in `src/contracts/intake.ts`.
- Outcome: raw JSON only; malformed or contract-breaking output maps to safe terminal `INVALID_OUTPUT`; normalized triage is returned only after shared schema validation.
- Verification: focused A01 tests passed, 21/21; full suite passed, 53/53; typecheck and lint passed; build passed.
- Live provider: not called; provider key absent.
- Next consumer: A02 integrated generation adapter and downstream worker B02.3.
