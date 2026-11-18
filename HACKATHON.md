# KlikBeres AI — KaneCLI Online Hackathon Submission Pack

## About Your App (copy-paste ready)

**What we built:** KlikBeres AI — a human-approved task assistant that turns natural language into a reviewable 5-step plan, enforces an explicit approval gate, runs a safe local demo, and records verifiable evidence that no external website was contacted.

**Which agent:** Built and iterated with AI coding agents. The agent writes code; Kane verifies the real browser behavior.

**What Kane does:** Kane CLI runs the full end-to-end flow in a real browser on the remote grid. It proves the approval gate cannot be bypassed, the local demo form works, and the evidence correctly records `External submission: NO`. The NDJSON evidence is fed back to the coding agent for closed-loop fixes.

## Deliverables Checklist

- [x] Public GitHub repo (created after 12 Nov)
- [ ] 3–5 min YouTube demo video
- [ ] At least two public posts
- [ ] Live URL (deploy with root directory = `.`)
- [ ] Kane remote run with evidence

## Judging Alignment

- **Ships**: Full request → plan → approve → execute → evidence
- **Verified**: Kane CLI real-browser test
- **Closed Loop**: NDJSON → agent → regression → re-run
- **Craft**: Clean UI, zero deps, EN/ID, strong safety
