# B01: Saved intake creation, listing and detail API

Status: TODO
Owner: Unassigned
Area: back
Depends on: P01
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Five required fields persist in SQLite before any AI call, and saved requests can be listed and opened after restart.

## Tasks

- [ ] [B01.1: Create SQLite persistence](01-task.md) — depends on P01.
- [ ] [B01.2: Deliver validated intake creation](02-task.md) — depends on B01.1.
- [ ] [B01.3: Deliver list and detail reads](03-task.md) — depends on B01.1.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
