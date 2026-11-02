# Active claims and shared ownership

| Task | Owner | Status | Branch/worktree | Owned actual paths | Contract revision | Next handoff |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | Codex | DONE | shared workspace | scaffold, scripts, `src/contracts/intake.ts`, fixtures, local setup | v1 in `src/contracts/intake.ts` | Ready for front/back/AI consumers |
| P02 | Codex | DONE | shared workspace | `.husky`, `.github/workflows/quality.yml`, `Dockerfile`, npm scripts | v1 scripts in package.json | CI local-equivalent verified; Docker unavailable |
| P03 | Codex | IN_PROGRESS | integration/intake-workflow | page wiring, worker integration, checks, review report | v1 | Browser walkthrough, live provider review, task handoff reconciliation |
| B01–B03 | Integration review | IN_PROGRESS | integration/intake-workflow | merged backend plus `src/server/jobs/outcome.ts`, `worker-entry.ts` | v1 | Reconcile uncommitted backend handoffs; accept B02/B03 after final review |
| F01–F03 | Integration review | IN_PROGRESS | integration/intake-workflow | merged components plus app pages/refresh/retry | v1 | Browser, keyboard and responsive walkthrough; reconcile frontend handoffs |
| A01.1 + A01.2 | Codex / a01_components | DONE | shared workspace; `6cd1dec` | `src/ai/validated-triage/parser.ts`, `quality.ts`, focused tests | v1 in `src/contracts/intake.ts` | A01.3 accepted in `145b7e8` |
| A02.1 + A02.2 | Codex / a02_transport | DONE | shared workspace; `34d88ee` | `src/ai/provider/request.ts`, `transport.ts`, focused tests | v1 in `src/contracts/intake.ts` | A02.3 accepted in `e3126c1` |
| A03.1 | Codex / a03_cases | DONE | shared workspace; `70edbd2` | `src/ai/evaluation/cases.ts`, `src/ai/evaluation/review-rubric.md` | v1 in `src/contracts/intake.ts` | A03.2 accepted in `f9f9470` |
| A01.3 | Codex | DONE | shared workspace; `145b7e8` | `src/ai/validated-triage/index.ts` and tests | v1 in `src/contracts/intake.ts` | A01 integrated boundary complete |
| A02.3 | Codex | DONE | shared workspace; `e3126c1` | `src/ai/provider/generate.ts`, tests, setup notes | v1 in `src/contracts/intake.ts` | Available to B02.3; live call unrun |
| A03.2 | Codex | DONE | shared workspace; `f9f9470` | `src/ai/evaluation/regression.test.ts` | v1 in `src/contracts/intake.ts` | A03.3 accepted in `b16f173` |
| A03.3 | Codex | DONE | shared workspace; `b16f173` | `src/ai/evaluation/review-report.md` | prompt `triage-v1`, adapter default model | A03 integrated evidence complete; live review pending credentials |

## Shared-file owners

- Foundation/platform owner: package.json, lockfile, compiler/build/test config, root layout and environment example. Contributors request edits here instead of writing concurrently.
- Contract owner (P01.2): shared input/result/public/error/adapter contracts and typed fixtures. AI extends validation through the agreed boundary.
- Persistence owner (B01.1): Prisma schema, migrations, database setup; serialize later migrations.
- Frontend owners: separate form/list/detail paths. Assign one owner for any shared status/refresh helper before F02.3 or F03.2.
- Integration owner (assign before combining streams): cross-feature assembly, check evidence and readiness decisions. Coordinate shared README/guide edits.

At claim time replace role names with people/agents and exact paths. Use one writer per shared file. Update this board serially even when code tasks run in parallel.
