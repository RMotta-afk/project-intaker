# Project Intaker

A project-intake tool for reviewing inbound requests with AI-generated summaries, tags, and risks. The current app is a runnable Next.js foundation; intake persistence, worker, UI workflow, and provider integration remain planned features.

## Local setup

- Requires Node.js 22 or later and npm.
- Run `npm ci` to install the locked dependencies and configure the Husky hook.
- Copy `.env.example` to `.env` for local provider generation. Set `OPENROUTER_API_KEY` on the server; `OPENROUTER_MODEL` is optional and defaults to `openai/gpt-4o-mini`. No credentials are needed to run the scaffold.
- Run `npm run dev` to start the web app at `http://localhost:3000`.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

The pre-commit hook runs `lint-staged` with ESLint autofix on staged JavaScript and TypeScript files. GitHub Actions runs the four checks above on pushes and pull requests.

The Dockerfile is a service-free Node base image; app and worker runtime packaging is deferred. SQLite migrations, an app worker command, AI credentials, and the end-to-end intake walkthrough will be documented with those features. See [assessment scope](docs/GUIDE.md), [frontend guidance](docs/FRONTEND.md), [backend guidance](docs/BACKEND.md), and [AI guidance](docs/AIENGINEERING.md).
