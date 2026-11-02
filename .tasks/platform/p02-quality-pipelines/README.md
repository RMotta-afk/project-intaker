# P02: Repeatable local checks, CI, and base container file

Status: DONE
Owner: Unassigned
Area: platform
Depends on: P01.1
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Pre-commit and GitHub Actions run real repository checks; the base Dockerfile is useful before application services exist.

## Tasks

- [ ] [P02.1: Add pre-commit checks](01-task.md) — depends on P01.1.
- [ ] [P02.2: Add GitHub Actions checks](02-task.md) — depends on P01.1.
- [ ] [P02.3: Add the base Dockerfile only](03-task.md) — depends on P01.1.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [x] All three child tasks and their focused verification complete.
- [x] Demonstrate the complete feature outcome above through its actual integration boundary.
- [x] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [x] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
