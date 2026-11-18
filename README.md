# KlikBeres AI

**Tell it what to do. Watch it get done. Stay in control.**

Human-approved task assistant for the KaneCLI Online Hackathon.

Turns a natural-language request into a reviewable plan, waits for explicit approval, runs a safe local demo, and records verifiable evidence.

**Live demo:** https://klikberes-ai.vercel.app  
**Repo:** https://github.com/wadezigh96/klikberes-ai

## Quick start

```bash
npm test
npm run dev
```

Open http://localhost:4173

## Kane CLI verification

```bash
npm install -g @testmuai/kane-cli
kane-cli login
kane-cli plugin install remote-execution
APP_URL=https://your-live-url.vercel.app npm run kane
```

Evidence: `artifacts/kane-latest.ndjson` + `artifacts/kane-latest.exit`

## Documentation

- [DEPLOY.md](./DEPLOY.md) — Vercel deployment
- [HACKATHON.md](./HACKATHON.md) — submission pack
- [POSTS.md](./POSTS.md) — LinkedIn & X drafts
- [scripts/closed-loop-example.md](./scripts/closed-loop-example.md) — Kane → agent feedback loop
- [docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md) — 3–5 min video script

## Safety

Local-only demo. Approval gate enforced on the server. Evidence always records `submittedToExternalWebsite: false`.

Built for people who want AI to help, not take over.
