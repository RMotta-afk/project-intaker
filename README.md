# Project Intaker

A project-intake tool for reviewing inbound requests with AI-generated summaries, tags, and risks. This integration branch combines the intake UI, SQLite persistence, durable worker, and AI triage adapter.

## Local setup

- Requires Node.js 22 or later and npm.
- Run `npm ci` to install the locked dependencies and configure the Husky hook.
- Copy `.env.example` to `.env`; set the SQLite path and optional server-only OpenRouter key.

- Run `npm run db:generate` and `npm run db:migrate` to initialize SQLite.
- Run `npm run dev` to start the web app at `http://localhost:3000`.
- In a second terminal, run `npm run worker` to process saved intakes. Without a provider key, triage fails visibly and can be retried; the saved intake remains available.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run db:test` for opt-in SQLite and worker-process integration checks

The pre-commit hook runs `lint-staged` with ESLint autofix on staged JavaScript and TypeScript files. GitHub Actions runs the four checks above on pushes and pull requests.

The Dockerfile remains a service-free Node base image; app and worker container packaging is deferred. SQLite uses Prisma. The setup commands above generate the Prisma client and apply checked-in migrations to `DATABASE_URL`. Set `DATABASE_URL="file:./test.db"` for a disposable migration; Prisma CLI resolves SQLite paths from `prisma/schema.prisma`, so this creates `prisma/test.db`. Remove that file after verification. The app client resolves the same relative setting under `prisma/`. Set `WORKER_ADAPTER_MODULE=./src/ai/provider/generate.ts` and run `npm run worker` in a separate process. For a local-only fake run, use `WORKER_ADAPTER_MODULE=./scripts/fake-worker-adapter.ts npm run worker`; set `FAKE_WORKER_FAILURE=auth` to simulate missing credentials, or `FAKE_WORKER_DELAY_MS` to simulate a slow call. The fake adapter must not be used for real intake analysis. `WORKER_LEASE_MS` and `WORKER_POLL_INTERVAL_MS` tune local polling in milliseconds. See [assessment scope](docs/GUIDE.md), [frontend guidance](docs/FRONTEND.md), [backend guidance](docs/BACKEND.md), and [AI guidance](docs/AIENGINEERING.md).
