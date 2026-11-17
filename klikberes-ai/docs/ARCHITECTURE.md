# Architecture

```text
Browser UI
  |
  | HTTP JSON
  v
Node HTTP server
  |
  v
Task engine (pure state transitions)
  |
  +-- createTask -> awaiting_approval
  +-- approveTask -> approved
  +-- executeTask -> completed + evidence

Quality loop:
Node tests -> local server -> Kane CLI real-browser test
           -> NDJSON evidence -> coding agent
           -> regression test -> Kane rerun
```

## Contracts
- `POST /api/tasks` `{ title }` -> `201 { task }`
- `GET /api/tasks` -> `200 { tasks }`
- `POST /api/tasks/:id/approve` -> `200 { task }`
- `POST /api/tasks/:id/execute` -> `200 { task }`
- `GET /api/health` -> `200 { ok, app, version }`
- `POST /api/demo/reset` -> `200 { ok }`

Errors use `{ error: { code, message } }`.

## State machine
`awaiting_approval -> approved -> completed`

No other transition is valid. The server enforces the approval gate; hiding a button is not the security boundary.

## Evidence
The demo evidence includes the local environment, action, sample fields, verification timestamp, and `submittedToExternalWebsite: false`.
