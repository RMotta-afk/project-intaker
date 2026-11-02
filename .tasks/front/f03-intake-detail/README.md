# F03: Original request, generated triage and recovery in one detail view

Status: TODO
Owner: Unassigned
Area: front
Depends on: P01; B01.3 for reads; B03.2 for retry
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Operator can read original input in every state, review validated triage and retry failed generation.

## Tasks

- [ ] [F03.1: Build detail presentation for every state](01-task.md) — depends on P01.
- [ ] [F03.2: Connect reads and status refresh](02-task.md) — depends on F03.1 + B01.3.
- [ ] [F03.3: Connect retry and complete accessibility](03-task.md) — depends on F03.2 + B03.2.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
