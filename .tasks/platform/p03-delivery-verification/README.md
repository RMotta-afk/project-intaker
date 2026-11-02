# P03: Verified vertical workflow and reviewer-ready setup

Status: BLOCKED
Owner: Unassigned
Area: platform
Depends on: P02 + B03 + F01 + F02 + F03 + A03
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Fresh setup and required/chosen acceptance paths are documented with precise executed/unrun evidence.

## Tasks

- [ ] [P03.1: Integrate real slices and setup](01-task.md) — depends on B03 + F01 + F02 + F03 + A02.
- [ ] [P03.2: Run complete repository checks](02-task.md) — depends on P03.1 + P02 + A03.
- [ ] [P03.3: Prepare acceptance walkthrough](03-task.md) — depends on P03.2.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.


## Current blocker

The repository has only the foundation scaffold; the back, front, and AI feature dependencies named above have not been implemented. P03 end-to-end work cannot be completed until those features hand off. Platform foundation checks are complete and recorded in the child handoffs.
