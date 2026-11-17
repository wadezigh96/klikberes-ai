# Product specification — KlikBeres AI

## Target
Indonesia-first and global-ready, with English and Bahasa Indonesia UX planned. Primary users: students, job seekers, freelancers, small-business operators, and everyday web users.

## User problem
People repeatedly navigate forms and multi-step websites. Existing assistants often provide instructions but do not provide a transparent, reviewable path from request to verified outcome.

## Core promise
Turn a natural-language request into a plan that the user can inspect, approve, execute, and verify.

## MVP user journey
1. User enters a task.
2. System validates and creates a five-step plan.
3. Task enters `awaiting_approval`.
4. User explicitly approves; task enters `approved`.
5. User starts the controlled local demo; task enters `completed`.
6. Evidence records what happened and whether any external website was contacted.

## Non-goals for hackathon MVP
- Arbitrary website automation
- Login or credential management
- Payments or purchases
- External form submission
- Email sending
- Autonomous irreversible actions

## Success criteria
- A first-time user can finish the demo without instructions.
- The approval gate cannot be bypassed through the UI or API.
- Evidence is explicit and inspectable.
- Kane CLI verifies the critical flow in a real browser.
- A Kane failure is fed back to a coding agent and followed by a regression run.
