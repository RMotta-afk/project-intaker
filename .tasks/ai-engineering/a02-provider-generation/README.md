# A02: Bounded server-only provider generation

Status: TODO
Owner: Unassigned
Area: ai-engineering
Depends on: P01; A01 for complete adapter
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Adapter returns validated triage or a classified safe failure, including when credentials are absent.

## Tasks

- [ ] [A02.1: Create prompt and request builder](01-task.md) — depends on P01.
- [ ] [A02.2: Implement provider transport](02-task.md) — depends on P01.
- [ ] [A02.3: Expose integrated generation adapter](03-task.md) — depends on A02.1 + A02.2 + A01.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
