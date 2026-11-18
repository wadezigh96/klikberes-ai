# KlikBeres AI

Human-approved task assistant with optional LLM plan generation and Kane CLI verification.

## Features
- Natural language → reviewable 5-step plan
- Explicit server-enforced approval gate
- Local-only demo execution (never contacts external sites)
- Optional LLM plan generation (OpenRouter / any OpenAI-compatible endpoint)
- Falls back to local keyword planner when no API key is present
- Kane CLI real-browser verification + closed-loop feedback

## Quick start
```bash
npm install
npm run dev
```

Open http://localhost:4173

## Optional LLM
Copy `.env.example` to `.env` and add an OpenRouter (or compatible) key:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
```
Without a key the app still works fully using the local planner.

## Kane verification
```bash
APP_URL=https://klikberes-ai.vercel.app npm run kane
```
