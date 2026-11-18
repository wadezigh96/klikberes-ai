# KlikBeres AI

Human-approved task assistant with optional LLM plan generation and safe local demo execution.

## Features

- Natural language to a strictly validated five-step plan.
- Server-enforced approval state machine.
- Per-browser demo session isolation through an HttpOnly cookie.
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

## Optional LLM

Copy `.env.example` to `.env` and add an OpenRouter or compatible key:

```shell
OPENROUTER_API_KEY=sk-or-v1-...
```

When enabled, the task title is sent to `LLM_BASE_URL`. Do not enter passwords, payment details, API keys, or other sensitive data into the task title. The demo stores submitted sample form fields only in process memory and does not provide durable retention or account recovery.

## Deployment note

The Vercel handlers use the same task engine and API contract as the local server. The demo session prevents ordinary cross-user task access, but task state remains process-local because this repository has no durable database configured. Use a durable storage adapter and real authentication before treating the app as a production multi-user service.

## Kane verification

```shell
APP_URL=https://your-project.vercel.app npm run kane
```
