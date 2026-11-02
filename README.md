# Project Intaker

Project Intaker helps a consulting team turn an incoming project request into a starting point for discovery. It keeps the client's original description beside an AI-generated summary, three topic tags, a risk checklist, and questions that can clarify the work. The triage is advisory: it does not approve a project, estimate its price, or replace a conversation with the client.

## What you can do

- Create a request with a title, description, one or more industries, a currency-aware budget range, and project dates. The form offers industry suggestions while still allowing custom tags and gives field-specific feedback.
- Browse saved requests by status and search by project name, industry, or AI-generated tags.
- Open a request to see the original input and its triage, including pending and failed states. The request stays available if AI generation fails.
- Edit a request or retry a completed or failed triage. A title-only edit leaves the current triage intact; changes to the other fields regenerate it. The previous result remains available for comparison.
- Answer clarification questions and generate a new triage that includes those answers.

## How it works

```text
Create request → validate and save in SQLite → PENDING
                                           ↓
                               separate worker claims job
                                           ↓
                  three concurrent OpenRouter requests:
                         summary · tags · risks + questions
                                           ↓
                 validate each result → COMPLETED or FAILED
```

The Next.js app serves the pages and API. Prisma stores the request, triage status, current and previous results, and clarification answers in SQLite. A separate worker claims due jobs with a lease, so processing can resume after a restart without depending on the browser or an HTTP request staying open. Model output is treated as untrusted: strict Zod schemas check each part before the result is saved, with one bounded repair attempt for malformed output. Provider credentials stay on the server, and the UI receives sanitized errors.

This is a local, single-worker application. Do not run multiple containers against the same SQLite file. The shared prompt prefix and OpenRouter session ID can help supported models reuse prompt tokens, but cache hits depend on the model and prompt size.

## Run with Docker

Docker runs the web app and worker together, applies checked-in database migrations on startup, and keeps requests in a named volume.

1. Put `OPENROUTER_API_KEY=...` in `.env.container` or `.env` to enable AI triage. You can also set `OPENROUTER_MODEL`; the default is `openai/gpt-4o-mini`. The rebuild script prefers `.env.container` when both files exist. Keep these files out of Git.
2. Run `npm run docker:up`.
3. Open [http://localhost:3000](http://localhost:3000).

Run `npm run docker:up` again after code or environment changes; it rebuilds and replaces the container while reusing the `project-intaker-data` volume. Use `npm run docker:logs` to follow logs and `npm run docker:stop` to stop the container. Set `PROJECT_INTAKER_PORT=3001` for another host port.

Without an OpenRouter key, you can still create, edit, search, and view requests. Triage moves to a visible failed state that can be retried after configuring a key.

## Run locally

Use Node.js 22 or later and npm. The web app and worker run in separate terminals.

```sh
npm ci
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Set `OPENROUTER_API_KEY` in `.env` for live triage. In a second terminal, start the worker:

```sh
npm run worker
```

The development app is available at [http://localhost:3000](http://localhost:3000). `DATABASE_URL` in `.env` points to the SQLite file; relative paths are resolved from `prisma/schema.prisma`. To exercise the workflow without provider calls, set `WORKER_ADAPTER_MODULE=./scripts/fake-worker-adapter.ts` in `.env` and restart the worker.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run db:test
npm run build
```

`db:test` uses a disposable SQLite database for API, lifecycle, and worker-process integration checks. The pre-commit hook runs ESLint on staged JavaScript and TypeScript files; GitHub Actions runs lint, typecheck, unit and database integration tests, and the production build.
