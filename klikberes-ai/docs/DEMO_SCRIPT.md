# 3–5 minute KaneCLI Hackathon demo script

## 0:00–0:25 — The problem
"AI coding agents can write code fast. Proving it actually works, and that the safety rules hold, is still hard. KlikBeres + Kane closes that loop."

## 0:25–1:40 — Ships (end-to-end)
Live: enter a registration task → Build plan → show the five steps → Approve → local form appears only after approval → Run task → evidence with External submission: NO.

## 1:40–2:30 — Verified (Kane)
Show the terminal: `APP_URL=... npm run kane`. Show the real browser steps (or the NDJSON / Result). Point at the exit code 0 and the evidence that the approval gate and safety flag were checked.

## 2:30–3:20 — Closed loop
"If Kane fails, we feed the full NDJSON to the coding agent. It writes a regression test, fixes the smallest thing, re-runs unit tests, then re-runs Kane. That's the loop."

## 3:20–4:00 — Craft
Show the clean UI, the EN/ID toggle, and the fact that the demo never contacts external sites. Mention zero runtime dependencies.

## 4:00–4:30 — Close
"KlikBeres: the agent plans, the human approves, Kane verifies. You stay in control."
