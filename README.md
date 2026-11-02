# Project Intaker

A project-intake tool for reviewing inbound requests with AI-generated summaries, tags, and risks. The app combines the intake UI, SQLite persistence, a durable worker, and an AI triage adapter.

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

The pre-commit hook runs `lint-staged` with ESLint autofix on staged JavaScript and TypeScript files. GitHub Actions runs lint, typecheck, unit tests, SQLite integration tests, and the build on pushes and pull requests.

SQLite uses Prisma. The setup commands above generate the Prisma client and apply checked-in migrations to `DATABASE_URL`. Set `DATABASE_URL="file:./test.db"` for a disposable migration; Prisma CLI resolves SQLite paths from `prisma/schema.prisma`, so this creates `prisma/test.db`. Remove that file after verification. The app client resolves the same relative setting under `prisma/`. Set `WORKER_ADAPTER_MODULE=./src/ai/provider/generate.ts` and run `npm run worker` in a separate process. For a local-only fake run, use `WORKER_ADAPTER_MODULE=./scripts/fake-worker-adapter.ts npm run worker`; set `FAKE_WORKER_FAILURE=auth` to simulate missing credentials, or `FAKE_WORKER_DELAY_MS` to simulate a slow call. The fake adapter must not be used for real intake analysis. `WORKER_LEASE_MS` and `WORKER_POLL_INTERVAL_MS` tune local polling in milliseconds. See [assessment scope](docs/GUIDE.md), [frontend guidance](docs/FRONTEND.md), [backend guidance](docs/BACKEND.md), and [AI guidance](docs/AIENGINEERING.md).

## Run the whole app with Docker

The image builds the Next.js app and Prisma client. On startup it applies checked-in SQLite migrations, then runs the web server and one triage worker. Both processes use the same database at `/data/intakes.db`; the container stops if either process exits unexpectedly. The image runs as the `node` user.

```sh
docker build -t project-intaker .
docker volume create project-intaker-data
docker run --rm -p 3000:3000 --mount source=project-intaker-data,target=/data project-intaker
```

Open `http://localhost:3000`. Intake creation, list and detail work without a provider key; triage becomes a visible retryable failure. To enable OpenRouter, create a local `.env.container` containing `OPENROUTER_API_KEY=...` and optionally `OPENROUTER_MODEL=...`, then add `--env-file .env.container` to `docker run`. Keep `DATABASE_URL` unset in that file so the image uses its persistent `/data/intakes.db` path. The local `.env` example is for running outside Docker and should not be passed to the container as-is.

Stop the container with Ctrl-C or `docker stop`. The named volume preserves requests across container restarts. For a host bind mount, ensure the container's `node` user can write the mounted directory. This is a single-container, single-worker local deployment; do not run multiple replicas against the same SQLite file.
