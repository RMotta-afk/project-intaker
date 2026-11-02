# P01.1: Scaffold the application

Status: DONE
Owner: Unassigned
Parent feature: [feature brief](README.md)
Depends on: None
Blocks: downstream tasks referencing P01.1; parent feature completion

## Context and ownership

Read the root [agent workflow](../../README.md), [parallel rules](../../PARALLEL_WORK.md), the parent brief, and required repository guides before acting. Resolve dependencies from the [task map](../../README.md). These are planned responsibilities; confirm actual paths when claiming.

Owns: package.json, one lockfile, Next.js/TypeScript configuration, test-runner setup.

## Small implementation steps

- [x] Choose compatible versions and one package manager; scaffold App Router. Declare actual dev/test/type/lint/build commands where supported. Record Node/runtime and package-manager versions.
- [x] Keep edits within claimed ownership; request shared-file changes from their owner.
- [x] Verify the acceptance below and record exact evidence.

## Acceptance and verification

Install from the lockfile, run the declared scaffold checks, and record exact results.

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
