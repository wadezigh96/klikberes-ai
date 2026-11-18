# Closed-loop example (Kane → Agent)

This file shows the exact process the coding agent follows when Kane fails.

## 1. Consume real evidence
Open:
- `artifacts/kane-latest.ndjson`
- `artifacts/kane-latest.exit`

## 2. Classify the result
| Exit | Meaning | Action |
|------|---------|--------|
| 0 | Passed | Keep evidence |
| 1 | Product defect | Continue below |
| 2 | Env / auth / URL | Fix environment, do not treat as app bug |

## 3. Find the first failure
Look for the earliest step with `status: failed`.

Example (illustrative):
```json
{"type":"step_end","status":"failed","step":"Approve the plan and review the local demo form","reason":"Could not find button 'Approve plan'"}
```

## 4. Write regression test first
Add a failing test in `test/task-engine.test.mjs` that reproduces the same condition.

## 5. Smallest fix
Only change what the evidence supports.

## 6. Verify the loop closed
```bash
npm test
APP_URL=https://your-live-url.vercel.app npm run kane
```

The loop is complete only when a later Kane run exits 0 after the agent consumed real evidence.

Never invent Kane results.
