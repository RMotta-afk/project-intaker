# P01: Runnable application foundation and stable contracts

Status: DONE
Owner: Unassigned
Area: platform
Depends on: None
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Next.js app boots, focused test runner works, and consumers share one versioned intake/triage/error contract.

## Tasks

- [ ] [P01.1: Scaffold the application](01-task.md) — depends on None.
- [ ] [P01.2: Publish shared contracts](02-task.md) — depends on P01.1.
- [ ] [P01.3: Prepare local configuration and fixtures](03-task.md) — depends on P01.2.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [x] All three child tasks and their focused verification complete.
- [x] Demonstrate the complete feature outcome above through its actual integration boundary.
- [x] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [x] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
