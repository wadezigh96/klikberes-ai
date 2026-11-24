#!/usr/bin/env bash
# Verify (from the API side) the scriptable parts of the S1 enforcement
# context, and print the manual steps still outstanding.
#
# This script deliberately does NOT guess at config keys for ABAC enablement
# or license activation: on this version line those are System Console
# operations (see ENFORCEMENT-CHECKLIST.md). What it CAN verify:
#   1. FeatureFlags.ChannelPermissionActions == true in the live config.
#   2. A license is present and reports an Advanced-tier feature set.
#   3. The channel-export plugin is active.
# The behavioural proof (core actually denies B) lives in run-test.sh §3.2.
set -euo pipefail

cd "$(dirname "$0")"

[ -f .env.test ] || { echo "ERROR: .env.test missing — run ./setup-actors.sh first" >&2; exit 1; }
# shellcheck disable=SC1091
. ./.env.test

API="$BASE_URL/api/v4"
PLUGIN_ID="com.mattermost.plugin-channel-export"
problems=0

echo "== Feature flag =="
FLAG="$(curl -s "$API/config" -H "Authorization: Bearer $A_TOKEN" \
  | jq -r '.FeatureFlags.ChannelPermissionActions // "absent"')"
echo "FeatureFlags.ChannelPermissionActions = $FLAG"
if [ "$FLAG" != "true" ]; then
  echo "  !! NOT TRUE — enforcement cannot engage. Check the compose env"
  echo "     MM_FEATUREFLAGS_CHANNELPERMISSIONACTIONS=true and restart."
  problems=1
fi

echo
echo "== License =="
LIC="$(curl -s "$API/license/client" -H "Authorization: Bearer $A_TOKEN")"
echo "$LIC" | jq . 2>/dev/null || echo "$LIC"
if ! printf '%s' "$LIC" | grep -qi 'advanced'; then
  echo "  !! No 'Advanced' tier visible in the client license."
  echo "     Do ENFORCEMENT-CHECKLIST.md Part 1 step 1 (real Advanced TRIAL;"
  echo "     dev-mode does not enable ABAC enforcement)."
  problems=1
fi

echo
echo "== Plugin =="
ACTIVE="$(curl -s "$API/plugins" -H "Authorization: Bearer $A_TOKEN" \
  | jq -r --arg id "$PLUGIN_ID" '.active[]? | select(.id==$id) | .id')"
if [ "$ACTIVE" = "$PLUGIN_ID" ]; then
  echo "Plugin active: $PLUGIN_ID"
else
  echo "  !! Plugin not active — run ./deploy-plugin.sh."
  problems=1
fi

echo
if [ "$problems" = "0" ]; then
  echo "Scriptable checks passed. Remaining manual items before run-test.sh:"
else
  echo "Some checks FAILED (above). Fix them, then re-run this script."
  echo "Remaining manual items (ENFORCEMENT-CHECKLIST.md Part 1):"
fi
echo "  - Advanced trial active in System Console (Edition and License)"
echo "  - ABAC enabled (System Console -> System Attributes)"
echo "  - Plugin EnableAdminRestrictions left at default false"
echo "Part 2 (clearance attribute + policy on X) happens at run-test.sh's pause."
[ "$problems" = "0" ]
