# B03: Safe retry on the original failed intake

Status: TODO
Owner: Unassigned
Area: back
Depends on: B02
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

An operator can requeue a failed analysis without duplicating the intake or bypassing lifecycle guards.

## Tasks

- [ ] [B03.1: Implement retry transition](01-task.md) — depends on B02.2.
- [ ] [B03.2: Expose retry endpoint](02-task.md) — depends on B03.1.
- [ ] [B03.3: Verify retry through worker](03-task.md) — depends on B03.2 + B02.3.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
