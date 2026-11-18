# KlikBeres AI

Human-approved task assistant with optional LLM plan generation and safe local demo execution.

## Features

- Natural language to a strictly validated five-step plan.
- Server-enforced approval state machine.
- Per-browser demo session isolation through an HttpOnly cookie.
- Persistent task storage in Neon Postgres when `DATABASE_URL` is configured.
- Local-only demo execution; no external website is contacted.
- Optional LLM plan enhancement with a 10-second timeout and local fallback.
- Request-size limits and baseline security headers.

## Quick start

```shell
npm install
npm test
npm run dev
```

Open `http://localhost:4173/`.

Without a database environment variable, tests and local development use an in-memory fallback. Production deployments should always provide `DATABASE_URL`.

## Neon database setup

Install Neon through the Vercel Marketplace and connect it to the project environments. The integration injects `DATABASE_URL` into Vercel. Then initialize the schema:

```shell
vercel env pull .env.local
npm run db:migrate
```

The schema is stored in `db/schema.sql`. The migration is idempotent and creates the `tasks` table plus indexes for owner and status queries. Do not commit `.env.local` or print the database URL.

## Optional LLM

Copy `.env.example` to `.env` and add an OpenRouter or compatible key:

```shell
OPENROUTER_API_KEY=sk-or-v1-...
```

When enabled, the task title is sent to `LLM_BASE_URL`. Do not enter passwords, payment details, API keys, or other sensitive data into the task title. Submitted sample form fields are stored in the task evidence JSON and should be treated as personal data.

## Deployment note

The Vercel handlers and local server use the same task engine and Neon repository. Approval and execution updates use conditional database updates, so a task can only transition once from `awaiting_approval` to `approved` and once from `approved` to `completed`.

Vercel Functions can run on different instances, so they must not use process memory as the source of truth. If `DATABASE_URL` is missing in a deployment, the app falls back to memory for demo compatibility; configure the variable before production use.

## Kane verification

```shell
APP_URL=https://your-project.vercel.app npm run kane
```
