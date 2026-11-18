# KlikBeres AI — KaneCLI Online Hackathon

## About Your App (copy-paste for submission)

**What we built:** KlikBeres AI is a human-approved task assistant. It turns a natural-language request into a reviewable 5-step plan, enforces an explicit approval gate on the server, runs a safe local demo form, and records verifiable evidence that no external website was contacted.

**Which agent:** Built and iterated with AI coding agents. The agent writes and refines the code; Kane CLI verifies the real browser behavior.

**What Kane does:** Kane CLI runs the full end-to-end flow on TestMu’s remote browser grid. It proves the approval gate cannot be bypassed, the local demo form works, and the evidence correctly records `External submission: NO`. The NDJSON evidence is fed back to the coding agent so failures become regression tests.

**Closed loop:** Kane result → agent reads NDJSON → writes failing unit test → smallest fix → re-run Kane until exit 0.

## Judging Scorecard Alignment

| Dimension | Evidence |
|-----------|----------|
| Ships | Full live flow: create → plan → approve → execute → evidence |
| Verified | Kane CLI real-browser test (`tests/klikberes_test.md`) |
| Closed Loop | `scripts/closed-loop-example.md` + Kane NDJSON feedback |
| Craft | Minimal dependency footprint, responsive UI, EN/ID, Neon persistence, strong safety boundaries |

## Mandatory Deliverables

- Public GitHub: https://github.com/wadezigh96/klikberes-ai (created after 12 Nov)
- Live URL: deploy with Root Directory = `.`
- 3–5 min YouTube video (script in `docs/DEMO_SCRIPT.md`)
- At least two public posts (drafts in `POSTS.md`)
- Kane remote run evidence

## Quick Commands

```bash
npm test
npm run dev
APP_URL=https://your-url.vercel.app npm run kane
```
