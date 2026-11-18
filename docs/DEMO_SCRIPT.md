# 3–5 minute KaneCLI demo script

## 0:00–0:20 — Problem
"AI agents write code fast. Proving the safety rules actually hold in a real browser is still hard. KlikBeres + Kane closes that loop."

## 0:20–1:30 — Ships (live)
Open the app. Type “Fill the demo community volunteer registration form”. Build plan. Show the five steps. Approve. Show that the form only appears after approval. Run the local form. Show evidence: External submission: NO.

## 1:30–2:20 — Verified
Show terminal: `APP_URL=https://... npm run kane`. Point at the real browser steps or the NDJSON. Show exit code 0 and the checks that passed (approval gate + evidence).

## 2:20–3:10 — Closed Loop
"If Kane fails, we feed the full NDJSON to the coding agent. It writes a regression test, fixes the smallest thing, then re-runs Kane. That’s the loop."

## 3:10–3:50 — Craft
Show the clean UI, EN/ID toggle, and mention zero runtime dependencies + server-enforced approval gate.

## 3:50–4:20 — Close
"KlikBeres: the agent plans, you approve, Kane verifies. You stay in control."
