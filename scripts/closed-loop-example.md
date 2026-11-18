# Closed-loop protocol (Kane → Agent)

## Steps the coding agent must follow

1. Read `artifacts/kane-latest.ndjson` and `artifacts/kane-latest.exit`.
2. Classify:
   - exit 0 → pass, keep evidence
   - exit 1 → product defect
   - exit 2 → environment/auth/URL problem (do not treat as app bug)
3. Find the first failed step in the NDJSON.
4. Write a failing unit test in `test/task-engine.test.mjs` that reproduces the condition.
5. Make the smallest fix.
6. Run `npm test` then `APP_URL=... npm run kane`.

A closed loop is complete only when the agent consumed a real Kane result and a later run exits 0.

Never invent Kane results.

## Example failure signal (illustrative)
```json
{"type":"step_end","status":"failed","step":"Approve the plan","reason":"Could not find button Approve plan"}
```
