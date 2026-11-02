# F02: Scannable saved request list and navigation

Status: TODO
Owner: Unassigned
Area: front
Depends on: P01; B01.3 for integration
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Operator sees newest requests with readable statuses and can open details or create a request.

## Tasks

- [ ] [F02.1: Build queue presentation](01-task.md) — depends on P01.
- [ ] [F02.2: Connect persisted queue](02-task.md) — depends on F02.1 + B01.3.
- [ ] [F02.3: Finish queue status refresh](03-task.md) — depends on F02.2.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
