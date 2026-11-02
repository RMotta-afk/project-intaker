# Integration review — 2026-11-02

Branch: `integration/intake-workflow` (local). This branch merges the committed `feature/backend`, `feature/ai-engineering`, and `feature/frontend` heads without changing those branches. `AGENTS.md` and `docs/` remain untracked and outside this integration.

## Plan and task comparison

| Workstream | Code delivered | Task record seen | Integration assessment |
| --- | --- | --- | --- |
| Frontend F01–F03 | Form, queue and detail presentation with styles; no page routes, API calls, refresh or retry control on the feature branch | Three Fxx.1 handoffs are uncommitted in the frontend worktree and marked IN_PROGRESS; Fxx.2/Fxx.3 remain TODO | Presentation is useful, but feature outcomes were incomplete at the branch head. This integration branch adds routes, API submission, refresh and retry. Browser interaction and accessibility walkthrough remain. |
| Backend B01–B03 | Prisma/SQLite migration, create/list/detail/retry APIs, leased worker and fake-adapter process tests | B01 DONE; B02.3 and B03.3 BLOCKED on real AI adapter in uncommitted backend worktree handoffs | Persisted workflow passed database/process checks. Real adapter was available after merge; worker now loads `.env` and can run it. Missing-key classification needed an integration fix. |
| AI A01–A03 | Strict parse/format checks, OpenRouter transport, generation adapter, offline evaluation cases | A01/A02/A03 marked DONE in committed task files; qualitative live review explicitly unrun | Adapter runs from worker; no live provider key was used. Evaluation evidence is offline, not a live model quality claim. |
| Platform P03 | Previously blocked on feature integration | P01/P02 DONE; P03 remains open | Local integration path now exists. Full manual UI/accessibility and live-provider walkthrough remain. |

The frontend and backend worktrees have uncommitted task/handoff changes; they were read for this comparison and were not copied or edited. Their branch heads alone do not contain those status updates. Consolidate them in the integration task board before final review.

## Integrated evidence

- `npm ci`, `npm run db:generate`, `npm run db:migrate` succeeded locally.
- `npm run lint`, `npm run typecheck`, `npm test` (86 passed, 4 skipped), `npm run build` and `npm run db:test` (four process/database test invocations passed) succeeded. After the terminal-error fix, final lint/typecheck/build passed again and `npm test` reported 87 passed and 4 skipped; the focused outcome test passed all 8 cases.
- Real local API: POST saved a PENDING intake before worker processing; worker with no OpenRouter key reached FAILED, preserving the original fields and exposing `PROVIDER_UNAVAILABLE` and retry availability. POST retry requeued the same ID; a controlled fake adapter completed validated triage on that ID. GET list/detail returned saved status/output. `/`, `/new` and `/intakes/[id]` returned HTTP 200 and rendered expected content.
- The worker now loads `.env` in its separate process. CI config includes Prisma generation and disposable SQLite integration checks. Workflow YAML parsed locally.

## Remaining work before accepting P03

1. Verify GitHub Actions remotely after publishing this branch. Local final lint, typecheck, tests and build passed.
2. Complete a browser walkthrough: submit valid/invalid form values, verify field feedback and retained input, observe status refresh, inspect loading/empty/not-found/network states, retry from failure, and check keyboard/focus/responsive behavior. The HTTP route check does not verify client interaction.
3. Review live OpenRouter output with configured credentials if available; record model, prompt version, cost/latency and observed quality limitations. The no-key and fake-provider paths are verified; a live call is unrun.
4. Reconcile frontend/backend uncommitted handoffs into the authoritative task board. Update F01–F03, B02/B03 and P03 acceptance only for verified work.
5. Review npm audit findings reported during install (20 total: 16 moderate, 4 high); changes to dependencies need targeted assessment and checks. Docker image build remains unrun because Docker is unavailable locally.

Do not merge this integration branch into `main` until the remaining product checks and task status reconciliation are reviewed. The source branches remain available for handoff and fixes.
