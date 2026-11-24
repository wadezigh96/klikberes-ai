# S1 dynamic test — provisioning + run package

Everything needed to run the channel-export **S1** dynamic test
(`../poc/S1-test-plan.md`) on an instance **you own**, as one command
sequence. Nothing in this package talks to any server except the local
instance it provisions.

**The finding (from `../AUDIT-SUMMARY.md`):** the channel-export plugin's
HTTP read gate is RBAC-only (`hasPermissionToChannel`) and never enforces
core's ABAC channel access policy. A channel member whom an access policy
denies `channel_read_access` — denied by the UI, the REST API, WebSocket
delivery, and the `/export` slash command — can still download the channel's
full history via
`GET /plugins/com.mattermost.plugin-channel-export/api/v1/export?channel_id=…&format=csv`.

**Pinned versions**
- Mattermost server **11.11.4** (`mattermost/mattermost-team-edition:11.11.4`).
  The test plan requires **≥ v11.9** (the line shipping ABAC channel
  permission policies + `channel_access.go` enforcement); 11.11.4
  (2026-11-05) is the newest patch of the newest v11 feature release, pinned
  for reproducibility.
- Channel-export plugin **v1.3.0 @ 6c98b0b8f7396bcf30679cb6de8893ce8c688376**
  (the audited commit; `build-plugin.sh` refuses to build anything else).
- Metrics plugin @ 9c6aa0a is in scope for the program but is **not** part of
  this test (uniformly admin-gated; see AUDIT-SUMMARY).

---

## Prerequisites

- A Docker host with `docker compose` (v2), `git`, `curl`, `jq`.
  Sized for a **2-core / 8 GB** machine.
- Where it can run: the GitHub Codespace **"cautious space potato"**
  (2-core / 8 GB / 32 GB — `gh codespace ssh -c
  cautious-space-potato-q7rx59j65j94cx44g`; remember the free quota, stop the
  Codespace when idle), any VPS, or a local machine. In a Codespace, use the
  forwarded URL for port **8065** as `BASE_URL` if you open the System
  Console in a browser; the scripts themselves run against
  `http://localhost:8065` inside the Codespace.
- Outbound internet during setup: pulling images, building the plugin, and
  **activating the Enterprise Advanced trial** (license step).
- A Bugcrowd researcher identity (account + @bugcrowdninja.com email) —
  the test accounts here use that domain per program rules; they are
  admin-created, so no mailbox access is needed.

## Command order (the whole run)

```bash
cd deploy/

# 0. Placeholder passwords are at the top of setup-actors.sh
#    (ADMIN_PASSWORD / USER_PASSWORD env vars override). Fine for a
#    throwaway local instance; change them if the host is reachable.

# 1. Bring up the instance (flag MM_FEATUREFLAGS_CHANNELPERMISSIONACTIONS
#    is set by compose)
docker compose up -d

# 2. Build the plugin bundle from the pinned commit
./build-plugin.sh            # -> plugin-dist/com.mattermost.plugin-channel-export-1.3.0.tar.gz

# 3. Create actors A–E, team, channels X/Y/Z, canary posts; writes .env.test
./setup-actors.sh

# 4. Upload + enable the plugin (as admin A)
./deploy-plugin.sh

# 5. MANUAL — ENFORCEMENT-CHECKLIST.md Part 1 (System Console, as s1a-admin):
#      a. Start the Enterprise ADVANCED trial   <-- the hard gate
#      b. Enable ABAC (System Attributes)
#      c. Confirm plugin EnableAdminRestrictions = false (default)
#    Then verify from the API side:
./configure-enforcement.sh

# 6. The test. It runs the 3.1 baseline, then PAUSES for checklist Part 2
#    (create `clearance` attribute: B=none, D=full; author the
#    channel_read_access policy on X), then 3.2 -> 3.3 -> 3.4 automatically.
./run-test.sh
#    Non-interactive variant if the policy is already applied:
#    POLICY_ALREADY_APPLIED=1 ./run-test.sh
#    Optional §3.5 variant afterwards (manual prereqs in the checklist):
#    RUN_VARIANT=1 POLICY_ALREADY_APPLIED=1 ./run-test.sh
```

**Expected runtime:** ~15–25 min of machine time (image pulls + plugin build
dominate) plus ~10 min of manual System Console work (trial, ABAC, policy).
The test sequence itself is under a minute.

## The abort condition (test plan §5)

If, after the policy is applied, **B can still read X via the core posts API**
(step 3.2.1), `run-test.sh` prints **“ENFORCEMENT INACTIVE — no conclusion”**
and exits (code 2) *before* touching the plugin endpoint. That means the
precondition (Advanced license + ABAC + flag + policy) is not actually
engaged — fix the checklist items and re-run. A plugin result obtained
without core denying B first would prove nothing.

## What stays manual, and why

| Step | Why it is not scripted |
|---|---|
| Enterprise Advanced **trial activation** | System Console / licensing-server interaction tied to the operator's Mattermost account. **Dev-mode is not a substitute** — it satisfies the plugin's E20 check but core's ABAC enforcement requires the real Advanced tier. |
| Enabling **ABAC** | System Console toggle (System Attributes); no supported API key is assumed. |
| `clearance` **attribute** + per-user values | System Attributes UI on this version line. |
| **Policy** authoring on X | The UI construct for governing `channel_read_access` may vary (channel-linked vs team/system policy); the plan instructs using whichever construct makes core deny B — and recording exactly which. |
| §3.5 variant prereqs | Plugin setting toggle + making B channel admin (UI). |

Everything else — users, team, channels, memberships, canary posts with an
attachment, plugin upload/enable, baselines, denial checks, the export test,
all four controls, evidence capture — is scripted.

## Results → Bugcrowd evidence mapping

`run-test.sh` writes `results/<timestamp>/`:

| File(s) | Report use (test plan §4) |
|---|---|
| `summary.txt` | The run narrative: every step, status, verdict, timestamps. |
| `env-ping.json`, `env-config-client.json`, `env-license-client.json`, `env-plugins.json` | Server version, license tier, plugin version/commit context. |
| `3.1-b-posts-baseline.*` | B's normal member read before the policy. |
| `3.2.1-b-posts-denied.*`, `3.2.2-b-command-execute.*` | Core denying B on both other content paths. |
| `3.3-b-plugin-export.body` | **The evidence**: CSV with header row + canary row. Redact everything else before attaching. |
| `3.4.1…3.4.4-*` | The four controls (D allowed, E 404, ungoverned 200, archived 404). |
| `variant-*` (if run) | §3.5 config-mitigation rebuttal evidence. |

Plus, from the manual steps: a screenshot/export of the **policy definition**
(role, `channel_read_access`, `clearance = full` condition) and of the
license/ABAC/flag settings — the script cannot capture those; take them
during checklist Parts 1–2.

Severity framing for the report (from the audit): Medium ($300) with an
honest High ($750) argument — Broken Access Control / authorization bypass
of an explicit access policy, full channel content, non-admin attacker.

## Safety rails

- Own instance only. The scripts refuse nothing network-wise — **you** are
  the rail: never set `BASE_URL` to any server you do not own (program STOP
  conditions, `../SCOPE.md` §5).
- If any response ever contains data of users other than A–E: stop, keep the
  minimum evidence, report via Bugcrowd only.
- `.env.test` holds live session tokens for the test actors — it is
  git-ignored here; keep it that way.
- Tear down with `docker compose down -v` when finished (Codespace quota).
