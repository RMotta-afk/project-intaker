# P02.2: Add GitHub Actions checks

Status: DONE
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: P01.1
Blocks: downstream tasks referencing P02.2; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: GitHub Actions workflow and CI setup notes.

## Small implementation steps

- [x] Use the chosen Node/package manager, frozen lockfile installation and declared lint/type/test/build checks. Generate Prisma/apply migrations to disposable SQLite when B01 exists. Add triggers for pull requests and pushes; read-only permissions, no live model or developer secrets. Coordinate any script edits through platform owner.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Validate workflow syntax; run equivalent commands locally. Mark remote Actions run unverified until actually executed; later verify B01 setup in P03.

A task is DONE only after its dependency outputs are integrated, its required checks pass, and handoff is filled. A parent feature stays open until all child tasks and feature-level integration pass. Split this task further if the agreed scope no longer fits one focused change; preserve the ID and record new dependencies.

## Handoff

Copy [the handoff template](../../templates/HANDOFF.md) here before stopping. Include changed paths/branch, commands and results, contract version, unresolved risks, next task and exact resumption step. Keep status TODO until claimed; do not imply work or checks have run.


## Completed handoff

- Owner: Codex; status: DONE.
- Branch/worktree: shared workspace; uncommitted local changes.
- Contract revision: v1 in `src/contracts/intake.ts` (P01 tasks).
- Commands: `npm ci` completed; `npm run lint`, `npm run typecheck`, `npm test` (4 tests passed), `npm run build`, `git diff --check`; all passed. GitHub workflow YAML parsed with Ruby Psych.
- Changed paths: Next.js scaffold, npm scripts/lockfile, contract and tests, typed fixtures, environment example, README, Husky hook, GitHub Actions workflow and base Dockerfile.
- Limitations: Docker executable is unavailable, so image build was not run. Remote Actions has not run. Application feature integration is pending.
- Next handoff: P03 awaits back B03, front F01/F02/F03 and AI A03 feature integration; resume with P03.1 after those handoffs.

Workflow YAML parsed locally and its equivalent commands pass. Remote Actions execution remains unverified.
