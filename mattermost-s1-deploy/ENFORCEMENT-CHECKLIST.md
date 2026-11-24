# Enforcement checklist — S1 (test plan §1.2, §1.4, §2.1, §2.4)

The S1 finding only exists when core's ABAC channel-access enforcement is
**actually active**: Enterprise Advanced license + ABAC enabled +
`ChannelPermissionActions` feature flag on + a policy governing
`channel_read_access` on channel X. Three of these four cannot be fully
automated from the API (license activation and the attribute/policy
constructs are System Console operations on this version line), so they are
manual steps below. `run-test.sh` does not trust this checklist — it verifies
enforcement **behaviourally** (core must deny B's reads in step 3.2) and
aborts if it is not active.

Log in to the System Console as **A** (`s1a-admin`) at
`http://localhost:8065` (or the Codespace forwarded URL for port 8065).

---

## Part 1 — before `run-test.sh`

### 1. Enterprise Advanced trial license  ⚠️ MANUAL — the hard gate
- System Console → **Edition and License** → start the **Enterprise
  Advanced** trial (or upload a trial license file if you requested one).
- Verify the console shows the **Advanced** tier afterwards.
- ⚠️ **Dev-mode does NOT count.** Dev-mode satisfies the *plugin's* E20
  check (`IsE20LicensedOrDevelopment`), but core's ABAC enforcement checks
  the real license tier (`MinimumEnterpriseAdvancedLicense`, test plan
  §1.2). Without a real Advanced trial, enforcement silently never engages
  and the test can draw **no conclusion**.
- Trial activation needs outbound internet from the host (fine in a
  Codespace). If activation fails, stop and report that — do not substitute
  dev-mode.

### 2. Feature flag `ChannelPermissionActions` — already set
- `docker-compose.yml` sets `MM_FEATUREFLAGS_CHANNELPERMISSIONACTIONS=true`.
- `./configure-enforcement.sh` verifies it is visible in the live config.
- Equivalent alternatives if you run without compose: config.json
  `FeatureFlags.ChannelPermissionActions = true`, then restart.

### 3. Enable ABAC  ⚠️ MANUAL
- System Console → **System Attributes → Attribute-Based Access**: enable
  ABAC.
- (No supported API toggle is assumed by this package; if the pinned build
  exposes one, record it in the evidence notes and use it next time.)

### 4. Plugin config sanity
- System Console → Plugins → **Channel Export**: confirm
  `EnableAdminRestrictions` is at its default **false** for the main run
  (test plan §1.3). Do not change it except for the optional §3.5 variant.

Then run `./configure-enforcement.sh` — it re-checks the flag + license
from the API side and prints what is still outstanding.

---

## Part 2 — at the `run-test.sh` pause (after the 3.1 baseline)

`run-test.sh` first proves B can read X normally (baseline 3.1), then pauses
and asks you to do exactly this part. Do not do it earlier — the baseline
must be captured with **no** policy in force.

### 5. Create the `clearance` attribute and set values  ⚠️ MANUAL
- System Console → **System Attributes**: create a custom user attribute
  named `clearance` (single-value text/select is fine).
- Set per-user values (User Management / the attribute editor):
  - **B** (`s1b-attacker`) → `none`
  - **D** (`s1d-control`) → `full`
  - A, C, E: leave unset.

### 6. Author the channel access policy on X  ⚠️ MANUAL
- Create an **ABAC permission policy** governing the **`channel_read_access`**
  action for the **member role** on channel **X** (`s1-governed`), requiring
  **`clearance = full`**. Deny-by-default applies to members without a
  satisfying policy (the feature's documented semantics, test plan §2.4).
- If this version's UI exposes read-access governance differently
  (system-wide or team-level policy linked to the channel), use whichever
  construct makes core deny B's reads in step 3.2 — and **record exactly
  which construct you used** in the evidence notes (screenshot the policy
  definition: role, action `channel_read_access`, attribute condition —
  test plan §4).

### 7. Return to the terminal and press Enter
`run-test.sh` now runs step 3.2: B's posts-API read and B's `/export`
slash-command attempt must both be **denied by core**. If either succeeds,
the script prints **"ENFORCEMENT INACTIVE — no conclusion"** and stops:
fix Part 1/Part 2 and re-run; do not interpret any plugin result.

---

## Optional variant (test plan §3.5) — only after the main run

1. System Console → Plugins → Channel Export: set
   `EnableAdminRestrictions = true`.
2. Make **B a channel admin** of X (channel members → B → Channel Admin;
   role with ManageChannelRoles), while the read policy still denies B.
3. Re-run `./run-test.sh` with `RUN_VARIANT=1` (it re-checks core denial,
   then B's export). If the CSV still comes back, the config-mitigation
   rebuttal is proven empirically. If core's policy model exempts channel
   admins on this version, record that and drop the variant from the
   report — do not force it.
