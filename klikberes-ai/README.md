# KlikBeres AI

**Tell it what to do. Watch it get done. Stay in control.**

KlikBeres is a human-approved task assistant. It turns a plain-language request into a clear, reviewable plan, waits for your explicit approval, executes a safe local demo, and records verifiable evidence.

**Live demo:** [klikberes-ai.vercel.app](https://klikberes-ai.vercel.app) (configure Vercel root directory to `klikberes-ai` if needed)

## Why KlikBeres?

Most AI tools stop at advice or act without guardrails. KlikBeres demonstrates a safer workflow:

**Request → Plan → Approve → Execute (local) → Verify with evidence**

Nothing runs until you say yes. The demo never contacts external websites.

## Features

- Natural-language task intake
- Intelligent 5-step reviewable plan (adapts to keywords)
- Hard approval gate (enforced on server + UI)
- Local demo form workflow with sample data
- Explicit evidence record (`External submission: NO`)
- Full unit test coverage for the state machine
- Kane CLI real-browser verification loop
- Clean, responsive UI with EN / Bahasa Indonesia support
- Zero runtime dependencies

## Safety Boundaries

- Local-only executor
- No logins, credentials, payments, emails, or external form submissions
- Approval cannot be bypassed
- Evidence always records whether external contact happened (always `false` in demo)

## Quick Start

Requires **Node.js 20+**.

```bash
cd klikberes-ai   # if cloning the repo as-is
npm test          # run unit tests
npm run dev       # start local server
```

Open [http://localhost:4173](http://localhost:4173).

### Demo Flow

1. Enter: `Fill the demo community volunteer registration form`
2. Click **Build my plan**
3. Review the five steps
4. Click **Approve plan**
5. Fill/confirm the local form and click **Run approved task**
6. Inspect the verified evidence

## Kane CLI (Real Browser Verification)

```bash
npm install -g @testmuai/kane-cli
kane-cli login
kane-cli plugin install remote-execution
APP_URL=https://your-preview.vercel.app npm run kane
```

See `scripts/kane-loop.md` and `AGENTS.md` for the closed-loop process.

## Tech Stack

- Node.js 20+ native HTTP server
- Vanilla HTML / CSS / JS (no frameworks)
- Pure task engine with `node:test`
- Designed for easy local demo and Kane verification

## Hackathon Notes

- Built with strong safety-first principles
- Deterministic plan generation + human gate = trustworthy automation
- Ready for demo video, Kane evidence, and public posts
- Indonesia-first UX with English support

## License

MIT (for hackathon use)

---

Built for people who want AI to help, not take over.
