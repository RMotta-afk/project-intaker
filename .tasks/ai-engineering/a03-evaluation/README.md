# A03: Small reproducible triage quality review

Status: DONE
Owner: Codex
Area: ai-engineering
Depends on: A01; A02 for adapter checks
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Representative cases and honest evidence distinguish schema validity from qualitative usefulness.

## Tasks

- [x] [A03.1: Prepare representative cases](01-task.md) — depends on P01.
- [x] [A03.2: Add deterministic regression coverage](02-task.md) — depends on A03.1 + A02.
- [x] [A03.3: Record qualitative review](03-task.md) — depends on A03.2; live credentials only for live review.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [x] All three child tasks and their focused verification complete.
- [x] Demonstrate the complete feature outcome above through its actual integration boundary.
- [x] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [x] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

- Feature: A03; status DONE; owner Codex; branch `feature/ai-engineering`.
- Commits: `70edbd2` (cases/rubric), `f9f9470` (offline regression suite), `b16f173` (review evidence).
- Contract: v1 `IntakeInput` and `TriageSchema`; prompt `triage-v1`; adapter default model `openai/gpt-4o-mini`.
- Outcome: five representative typed cases, qualitative source-fidelity rubric, and deterministic mocked tests through the actual generation adapter.
- Verification: regression cases 10/10 passed; full suite 53/53; typecheck, lint, and production build passed.
- Manual/live quality review: unrun because no provider key was configured; report makes no model quality claims.
- Next step: repeat manual rubric review when an authorized provider key and output are available.
