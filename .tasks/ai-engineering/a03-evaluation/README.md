# A03: Small reproducible triage quality review

Status: TODO
Owner: Unassigned
Area: ai-engineering
Depends on: A01; A02 for adapter checks
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Representative cases and honest evidence distinguish schema validity from qualitative usefulness.

## Tasks

- [ ] [A03.1: Prepare representative cases](01-task.md) — depends on P01.
- [ ] [A03.2: Add deterministic regression coverage](02-task.md) — depends on A03.1 + A02.
- [ ] [A03.3: Record qualitative review](03-task.md) — depends on A03.2; live credentials only for live review.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
