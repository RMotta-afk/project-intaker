# F01: Accessible intake form that saves before generation

Status: TODO
Owner: Unassigned
Area: front
Depends on: P01; B01.2 for integration
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Operator submits all five fields, gets useful validation and lands on the saved detail without waiting for AI.

## Tasks

- [ ] [F01.1: Build form and field feedback](01-task.md) — depends on P01.
- [ ] [F01.2: Connect submission and navigation](02-task.md) — depends on F01.1 + B01.2.
- [ ] [F01.3: Complete form state review](03-task.md) — depends on F01.2.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
