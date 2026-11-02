# Local parallel execution and handoff

Use [feature briefs](README.md), not this file alone, to assign work. Read task-level dependencies; a feature may have useful preparatory tasks before its complete integration dependencies are ready. Task IDs link via the feature map.

## Ready waves

| Gate | Independent work when paths do not overlap | Integration gate |
| --- | --- | --- |
| Initial | P01.1 only | Runnable scaffold and actual commands |
| P01.1 accepted | P01.2; P02.1 hooks, P02.2 Actions, P02.3 base Dockerfile | Serialize package/script edits through platform owner |
| P01 accepted | B01.1; F01.1, F02.1, F03.1; A01.1 and A01.2; A02.1 and A02.2; A03.1 | Shared schemas and fixtures are stable; separate feature paths |
| B01.1 accepted | B01.2 creation and B01.3 reads | Real saved intake connects to F01/F02/F03 |
| B01 accepted | B02.1 claims and B02.2 outcomes; frontend API wiring; AI completion | One owner for job repository if actual paths overlap |
| B02.1 + B02.2 + A02 accepted | B02.3 real worker integration; F02.3/F03.2 refresh with assigned helper owner | Completion/missing-provider failure through real processes |
| B02 accepted | B03 retry; A03 review/regression; frontend polish | F03.3 waits for B03.2; integrated recovery evidence |
| Feature handoffs accepted | P03 integration/checks/walkthrough | GUIDE acceptance verified; unfinished checks explicit |

A wave grants no permission to edit overlapping files. A02 may test transport before A01 is finished; the complete adapter waits for validated output. B02 may use a fake adapter while A02 is pending; complete worker integration waits for A02. Resolve dependencies at child-task granularity and record acceptance, avoiding circular feature-level scheduling.

## Ownership and integration

Use [CLAIMS.md](CLAIMS.md) before starting. Foundation owns shared configuration/package edits; contract owner owns the shared boundary; persistence owner serializes migrations. Assign separate feature routes/components and test files. Helpers used by more than one frontend feature need one owner. Reassign an overlapping file or serialize rather than treating separate branches as conflict prevention.

Work in separate worktrees when practical. Tracked briefs travel with Git. Merge task updates deliberately, keeping one authoritative integration status board.

Integrate contracts → persistence → generation → recovery → delivery. Every accepted handoff includes actual paths, contract revision, commands/results, unrun checks and the next recipient/step using [the template](templates/HANDOFF.md). Integrator checks the actual feature boundary; fixture-only success does not complete a feature.

This is an assignment structure, not a command to spawn agents. No optional feature or distributed infrastructure is authorized by a parallel-work opportunity.
