# KaneCLI Judging Optimization Notes

## Ships (25%)
- End-to-end flow is complete and deterministic.
- Approval gate is enforced on the **server**, not just the UI.
- Local demo form + evidence record are always produced after approval.
- Health endpoint (`/api/health`) exists for Kane and judges to confirm the app is live.

## Verified (25%)
- Dedicated Kane test: `tests/klikberes_test.md`
- The test explicitly checks:
  1. Approval gate (status starts as Awaiting approval)
  2. Form only appears after approval
  3. Evidence contains `External submission: NO` and `Verified: YES`
  4. Sample data is recorded correctly
- Kane remote grid is the source of truth (not local unit tests).

## Closed Loop (25%) — highest leverage
- Protocol is documented in `scripts/closed-loop-example.md`.
- Agent is instructed (in `AGENTS.md`) to:
  1. Consume real Kane NDJSON
  2. Write a regression test first
  3. Make the smallest fix
  4. Re-run Kane until exit 0
- Example failure → fix path is provided so judges can see the loop is real.

## Craft (25%)
- Zero runtime dependencies
- Clean, responsive UI with EN / Bahasa Indonesia
- Explicit safety boundaries
- One-command local start + one-command Kane run
- Clear README + submission pack

## What judges should notice in the video
1. Live flow from request to evidence (Ships)
2. Terminal showing Kane CLI + exit code / NDJSON (Verified)
3. Explicit statement of the feedback loop (Closed Loop)
4. Polish of the UI and safety design (Craft)
