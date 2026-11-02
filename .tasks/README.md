# Local agent task workspace

This folder is local-only via `.git/info/exclude`; do not stage or publish it. Nothing here has been implemented. All tasks are TODO/unassigned. Shared product guidance remains in `docs/`; local task IDs are not public documentation contracts.

## Start a task

1. Read repository AGENTS.md, docs/GUIDE.md and relevant specialist guides, then [implementation order](IMPLEMENTATION_PLAN.md) and [parallel rules](PARALLEL_WORK.md).
2. Select a ready feature/task from the map below; confirm its dependencies have accepted handoffs. IDs reference the feature brief and numbered child files (for example P01.2).
3. Record owner, status, branch/worktree, actual paths and contract revision on [CLAIMS.md](CLAIMS.md). Claim one small task at a time.
4. Implement and run appropriate checks. Update task status and append [handoff evidence](templates/HANDOFF.md) before handing over.
5. Integrate complete features in vertical slices; all fixture-only implementations remain incomplete until connected.

No agents are launched by this documentation. Agent assignment requires the user's instruction or an applicable explicit instruction. Workstreams describe how to split work when assigned.

## Feature map

| Feature | Area | Dependencies | Status |
| --- | --- | --- | --- |
| [P01: Runnable application foundation and stable contracts](platform/p01-foundation/README.md) | platform | None | TODO |
| [P02: Repeatable local checks, CI, and base container file](platform/p02-quality-pipelines/README.md) | platform | P01.1 | TODO |
| [B01: Saved intake creation, listing and detail API](back/b01-persisted-intakes/README.md) | back | P01 | TODO |
| [B02: Durable background triage with restart recovery](back/b02-durable-triage/README.md) | back | B01 | TODO |
| [B03: Safe retry on the original failed intake](back/b03-retry-generation/README.md) | back | B02 | TODO |
| [F01: Accessible intake form that saves before generation](front/f01-new-intake/README.md) | front | P01; B01.2 for integration | TODO |
| [F02: Scannable saved request list and navigation](front/f02-intake-queue/README.md) | front | P01; B01.3 for integration | TODO |
| [F03: Original request, generated triage and recovery in one detail view](front/f03-intake-detail/README.md) | front | P01; B01.3 for reads; B03.2 for retry | TODO |
| [A01: Untrusted model response becomes validated advisory triage](ai-engineering/a01-validated-triage/README.md) | ai-engineering | P01 | TODO |
| [A02: Bounded server-only provider generation](ai-engineering/a02-provider-generation/README.md) | ai-engineering | P01; A01 for complete adapter | TODO |
| [A03: Small reproducible triage quality review](ai-engineering/a03-evaluation/README.md) | ai-engineering | A01; A02 for adapter checks | TODO |
| [P03: Verified vertical workflow and reviewer-ready setup](platform/p03-delivery-verification/README.md) | platform | P02 + B03 + F01 + F02 + F03 + A03 | TODO |

## Status and handoff rules

Use TODO → IN_PROGRESS → REVIEW → DONE. Use BLOCKED with a named dependency and concrete resumption step when a task cannot proceed; this is a task-board label, not an instruction to change any automated agent goal state. Do not mark DONE while required integration/checks remain unresolved. Integrator accepts REVIEW and unlocks dependents.

Each feature has a README, three child task files with acceptance checks, and an embedded handoff section. The template also works for interrupted work. If stopping mid-task, record what changed and the next executable step; never leave undocumented partial work.

## Local-only worktrees

Git does not distribute ignored files or local excludes to new clones/worktrees. Before assigning elsewhere, explicitly copy the needed local briefs/handoffs and apply the same exclude to that checkout; do not commit them to transfer context. Record the authoritative task board location to avoid conflicting status edits.
