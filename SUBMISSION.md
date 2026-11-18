# KaneCLI Online Hackathon — Submission Pack

**Project:** KlikBeres AI  
**Repo:** https://github.com/wadezigh96/klikberes-ai  
**Live:** https://klikberes-ai.vercel.app (Root Directory must be `.`)

## About Your App (copy-paste)

**What we built:** KlikBeres AI turns a natural-language request into a reviewable 5-step plan, enforces an explicit server-side approval gate, runs a safe local demo, and records evidence that no external website was contacted. Optional LLM plan generation falls back to a local planner when no API key is present.

**Which agent:** Built and iterated with AI coding agents. Kane CLI is the verification layer.

**What Kane does:** Runs the full flow on TestMu’s remote browser grid. It proves the approval gate cannot be bypassed and that the evidence correctly shows `External submission: NO`.

**Closed loop:** Kane NDJSON → agent reads failure → writes regression test → smallest fix → re-run Kane until exit 0.

## Checklist

- [ ] Live URL works (`/api/health` returns JSON)
- [ ] Kane run completed (`APP_URL=... npm run kane`)
- [ ] Video 3–5 min uploaded (script: `docs/DEMO_SCRIPT.md`)
- [ ] At least 2 public posts (drafts in `POSTS.md`)
- [ ] Repo is public and created after 12 Nov

## Key files for judges

| File | Purpose |
|------|---------|
| `HACKATHON.md` | Submission text + scorecard mapping |
| `JUDGING.md` | Explicit alignment to 4 criteria |
| `tests/klikberes_test.md` | Kane test |
| `scripts/closed-loop-example.md` | Closed-loop protocol |
| `AGENTS.md` | Agent instructions for the loop |
| `POSTS.md` | Ready-to-post LinkedIn + X |
| `docs/DEMO_SCRIPT.md` | Video script |
