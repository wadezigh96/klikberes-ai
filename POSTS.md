# Ready-to-post drafts — KaneCLI Hackathon

## LinkedIn

Most AI coding demos stop at “the agent wrote the code.”

For the KaneCLI Online Hackathon I built KlikBeres AI — a human-approved task assistant that turns a natural-language request into a reviewable plan, waits for explicit approval, runs a safe local demo, and records evidence that no external website was contacted.

The part that matters is the verification loop:

- Kane CLI runs the full flow in a real browser on TestMu’s remote grid
- It checks the approval gate, the local form, and the safety flag (`External submission: NO`)
- The NDJSON result is fed back to the coding agent so failures become regression tests

Repo: https://github.com/wadezigh96/klikberes-ai

Built with zero runtime dependencies and a hard safety boundary. Would love feedback from anyone working on agent reliability.

#KaneCLIHackathon #AIAgents #TestMuAI #BuildInPublic

## X / Twitter

**Post 1**
Building for the KaneCLI Online Hackathon.

KlikBeres AI = natural language → reviewable plan → human approval → local demo → verifiable evidence.

The agent plans. You approve. Kane CLI proves it in a real browser.

https://github.com/wadezigh96/klikberes-ai

**Post 2**
The closed loop that matters:

Kane runs the flow on the remote grid → NDJSON evidence → coding agent reads the failure → writes a regression test → re-runs Kane.

No more “it worked on my machine.”

#KaneCLI #KaneCLIHackathon

**Post 3**
Safety boundary on purpose:

- Approval gate enforced on the server
- Demo never contacts external sites
- Evidence always records External submission: NO

Useful automation without giving up control.
