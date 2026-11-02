# B02: Durable background triage with restart recovery

Status: TODO
Owner: Unassigned
Area: back
Depends on: B01
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

A saved intake is claimed, processed and committed with stale workers unable to overwrite newer work.

## Tasks

- [ ] [B02.1: Implement atomic claim and recovery](01-task.md) — depends on B01.
- [ ] [B02.2: Implement guarded completion and failure](02-task.md) — depends on B01.
- [ ] [B02.3: Wire explicit worker process](03-task.md) — depends on B02.1 + B02.2; A02 for real adapter.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
