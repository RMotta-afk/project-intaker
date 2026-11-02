# Project Intaker

A project-intake tool for reviewing inbound requests with AI-generated summaries, tags, and risks. The current app is a runnable Next.js foundation; intake persistence, worker, UI workflow, and provider integration remain planned features.

## Local setup

- Requires Node.js 22 or later and npm.
- Run `npm ci` to install the locked dependencies and configure the Husky hook.
- Copy `.env.example` to `.env` to configure the local SQLite database. No credentials are needed to run the app.
- Run `npm run dev` to start the web app at `http://localhost:3000`.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

The pre-commit hook runs `lint-staged` with ESLint autofix on staged JavaScript and TypeScript files. GitHub Actions runs the four checks above on pushes and pull requests.

The Dockerfile remains a service-free Node base image; app and worker container packaging is deferred. SQLite uses Prisma. Run `npm run db:generate` after installing dependencies, then `npm run db:migrate` to apply checked-in migrations to `DATABASE_URL`. Set `DATABASE_URL="file:./test.db"` for a disposable migration; Prisma CLI resolves SQLite paths from `prisma/schema.prisma`, so this creates `prisma/test.db`. Remove that file after verification. The app client resolves the same relative setting under `prisma/`. After A02 supplies its adapter, set `WORKER_ADAPTER_MODULE` to that server-side module path and run `npm run worker`. For a local-only fake run, use `WORKER_ADAPTER_MODULE=./scripts/fake-worker-adapter.ts npm run worker`; set `FAKE_WORKER_FAILURE=auth` to simulate missing credentials, or `FAKE_WORKER_DELAY_MS` to simulate a slow call. The fake adapter must not be used for real intake analysis. `WORKER_LEASE_MS` and `WORKER_POLL_INTERVAL_MS` tune local polling in milliseconds. See [assessment scope](docs/GUIDE.md), [frontend guidance](docs/FRONTEND.md), [backend guidance](docs/BACKEND.md), and [AI guidance](docs/AIENGINEERING.md).
