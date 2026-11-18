# Closed-loop example (Kane → Agent)

This is the protocol the coding agent follows when Kane fails.

## 1. Read the evidence
Open `artifacts/kane-latest.ndjson` and `artifacts/kane-latest.exit`.

Typical failure signals:
- Exit code `1` → product defect
- Exit code `2` → environment / auth / URL problem (do not treat as app bug)

## 2. Identify the first failed step
Look for the first step with `status: failed` or a clear assertion mismatch.

Example snippet (illustrative):
```json
{"type":"step_end","status":"failed","step":"Approve the plan and review the local demo form","reason":"Could not find button 'Approve plan'"}
```

## 3. Write a regression test first
Add a failing unit test in `test/task-engine.test.mjs` that reproduces the same condition.

## 4. Make the smallest fix
Only change what the evidence supports.

## 5. Verify
```bash
npm test
APP_URL=https://your-live-url.vercel.app npm run kane
```

A closed loop is complete only when:
- The agent consumed a real Kane result, and
- A later Kane run exits with code `0`.

Never invent Kane results.
