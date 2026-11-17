# KlikBeres AI

**Tell it what to do. Watch it get done.**

KlikBeres is a human-approved task assistant prototype. It converts a plain-language request into a reviewable plan, waits for explicit approval, runs a local-only demo task, and records verifiable evidence.

## Why this project
Most AI assistants stop at advice. KlikBeres demonstrates a safer task workflow: plan first, ask permission, execute in a controlled environment, and verify the outcome.

## Current MVP
- Natural-language task intake
- Five-step reviewable plan
- Explicit approval gate
- Local demo registration form workflow
- Evidence record with external-submission safety flag
- Node unit tests
- Kane CLI browser verification and evidence-driven feedback loop

## Safety boundary
The current executor is deliberately local-only. It does not log into websites, submit external forms, send email, make purchases, or handle credentials.

## Run locally
Requires Node.js 20+.

```bash
npm test
npm run dev
```

Open http://localhost:4173.

## Kane CLI
Install and authenticate Kane CLI:

```bash
npm install -g @testmuai/kane-cli
kane-cli login
kane-cli --version
```

For Android/Termux, use Kane's remote execution grid (the cloud runs Chrome; your phone does not need desktop Chrome). First deploy an approved preview URL, then install the remote plugin:

```bash
kane-cli plugin install remote-execution
APP_URL=https://your-approved-preview.example npm run kane
```

The run writes:
- `artifacts/kane-latest.ndjson`
- `artifacts/kane-latest.exit`

Read `scripts/kane-loop.md` and `AGENTS.md` for the required closed-loop process. Do not claim Kane passed until a real remote run has completed.

## Demo flow
1. Enter "Fill the demo community volunteer registration form".
2. Click **Build my plan**.
3. Review the five steps.
4. Click **Approve plan**.
5. Click **Run approved task**.
6. Inspect the verified evidence and the explicit `External submission: NO` result.

## Hackathon checklist
- [ ] Create a new public GitHub repository during the event window (after 12 Nov 2026).
- [ ] Push this source only after reviewing it.
- [ ] Register on TestMu AI and claim the hackathon credits using the same email.
- [ ] Run at least one real Kane CLI flow.
- [ ] Capture a 3–5 minute demo video.
- [ ] Publish at least two public project posts.
- [ ] Submit the official form before the deadline.
- [ ] Obtain explicit owner approval before any public posting or submission.

## Project status
Prototype source package. No GitHub repository created, no commit/push, no deployment, no public posts, and no hackathon submission have been performed.
