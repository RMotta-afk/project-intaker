# A01: Untrusted model response becomes validated advisory triage

Status: TODO
Owner: Unassigned
Area: ai-engineering
Depends on: P01
Scope: Required workflow and/or confirmed candidate decisions; P02 includes explicitly requested delivery tooling.

## Complete feature outcome

Malformed or contract-breaking output cannot be returned as successful triage.

## Tasks

- [ ] [A01.1: Implement strict response parser](01-task.md) — depends on P01.
- [ ] [A01.2: Implement format-quality checks](02-task.md) — depends on P01.
- [ ] [A01.3: Assemble validation boundary](03-task.md) — depends on A01.1 + A01.2.

## Parallel boundary

Child tasks with satisfied dependencies may be assigned separately only after recording disjoint actual paths in [the claim board](../../CLAIMS.md). Numbering does not imply a dependency: read each Depends on field. Tasks that share a file, migration, contract, script or layout must serialize or send the change to its owner. Fixture work is preparation, not completed integration.

## Feature acceptance

- [ ] All three child tasks and their focused verification complete.
- [ ] Demonstrate the complete feature outcome above through its actual integration boundary.
- [ ] Preserve original intake, safe errors and requirement/decision distinctions where relevant.
- [ ] Integrator accepts handoff and updates downstream readiness in the local task map.

## Handoff

Use [HANDOFF.md](../../templates/HANDOFF.md), including feature-level evidence and remaining consumers. Do not mark feature DONE solely because individual components work with mocks.
