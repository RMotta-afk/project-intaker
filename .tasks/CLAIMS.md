# Active claims and shared ownership

| Task | Owner | Status | Branch/worktree | Owned actual paths | Contract revision | Next handoff |
| --- | --- | --- | --- | --- | --- | --- |
| P01 | Codex | DONE | shared workspace | scaffold, scripts, `src/contracts/intake.ts`, fixtures, local setup | v1 in `src/contracts/intake.ts` | Ready for front/back/AI consumers |
| P02 | Codex | DONE | shared workspace | `.husky`, `.github/workflows/quality.yml`, `Dockerfile`, npm scripts | v1 scripts in package.json | CI local-equivalent verified; Docker unavailable |
| P03 | Codex | BLOCKED | shared workspace | setup/check documentation only | v1 | B03, F01/F02/F03, A03 must be implemented/integrated |

## Shared-file owners

- Foundation/platform owner: package.json, lockfile, compiler/build/test config, root layout and environment example. Contributors request edits here instead of writing concurrently.
- Contract owner (P01.2): shared input/result/public/error/adapter contracts and typed fixtures. AI extends validation through the agreed boundary.
- Persistence owner (B01.1): Prisma schema, migrations, database setup; serialize later migrations.
- Frontend owners: separate form/list/detail paths. Assign one owner for any shared status/refresh helper before F02.3 or F03.2.
- Integration owner (assign before combining streams): cross-feature assembly, check evidence and readiness decisions. Coordinate shared README/guide edits.

At claim time replace role names with people/agents and exact paths. Use one writer per shared file. Update this board serially even when code tasks run in parallel.
