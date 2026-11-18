# KlikBeres AI — KaneCLI Online Hackathon Submission Pack

## About Your App (copy-paste ready)

**What we built:** KlikBeres AI — a human-approved task assistant that turns natural language into a reviewable 5-step plan, enforces an explicit approval gate, runs a safe local demo, and records verifiable evidence that no external website was contacted.

**Which agent:** Built and iterated with AI coding agents (Cursor / Claude / Grok). The agent writes code; Kane verifies the real browser behavior.

**What Kane does:** Kane CLI runs the full end-to-end flow in a real browser on the remote grid. It proves the approval gate cannot be bypassed, the local demo form works, and the evidence correctly records `External submission: NO`. The NDJSON evidence is fed back to the coding agent for closed-loop fixes.

**Why it matters:** Most agent demos stop at "it generated code." KlikBeres + Kane proves the shipped behavior matches the safety contract.

## Mandatory Deliverables Checklist

- [ ] Public GitHub repo (created 17 Nov 2026 — after 12 Nov cutoff)
- [ ] 3–5 min YouTube demo video showing real execution + Kane evidence
- [ ] At least two public posts (X, LinkedIn, Reddit, or HN)
- [ ] Optional: Live URL (set Vercel root directory to `klikberes-ai`)
- [ ] Kane remote run completed with evidence saved

## Judging Alignment

| Dimension | How KlikBeres scores |
|-----------|----------------------|
| **Ships** | Full request → plan → approve → execute → evidence flow works end-to-end |
| **Verified** | Kane CLI real-browser test proves approval gate + evidence |
| **Closed Loop** | Kane NDJSON → agent diagnoses → regression test → re-run |
| **Craft** | Clean UI, zero deps, i18n EN/ID, strong safety boundaries |

## Quick Kane Command

```bash
cd klikberes-ai
npm install -g @testmuai/kane-cli
kane-cli login
kane-cli plugin install remote-execution
APP_URL=https://your-preview.vercel.app npm run kane
```

Evidence lands in `artifacts/kane-latest.ndjson` and `artifacts/kane-latest.exit`.

## Demo Video Outline (3–5 min)

1. Problem (30s)
2. Live flow: create → plan → approve → run local form → evidence (90s)
3. Show Kane CLI run + NDJSON / exit code (60s)
4. Closed loop: "If Kane fails, the agent reads the evidence and fixes" (45s)
5. Close with safety promise (15s)

See `docs/DEMO_SCRIPT.md` for the full script.
