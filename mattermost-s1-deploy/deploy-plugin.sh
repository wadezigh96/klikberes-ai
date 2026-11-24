#!/usr/bin/env bash
# Upload + enable the built channel-export plugin bundle on the local
# instance, as admin A. Run setup-actors.sh first (it creates A and writes
# .env.test). Test plan §1.3: leave EnableAdminRestrictions at its default
# (false) for the main run — this script does not touch plugin config.
set -euo pipefail

cd "$(dirname "$0")"

[ -f .env.test ] || { echo "ERROR: .env.test missing — run ./setup-actors.sh first" >&2; exit 1; }
# shellcheck disable=SC1091
. ./.env.test

API="$BASE_URL/api/v4"
PLUGIN_ID="com.mattermost.plugin-channel-export"

BUNDLE="$(ls plugin-dist/com.mattermost.plugin-channel-export-*.tar.gz 2>/dev/null | head -1 || true)"
[ -n "$BUNDLE" ] || { echo "ERROR: no bundle in plugin-dist/ — run ./build-plugin.sh first" >&2; exit 1; }
echo "Uploading $BUNDLE ..."

RESP="$(curl -s -X POST "$API/plugins/upload" -H "Authorization: Bearer $A_TOKEN" \
  -F "plugin=@$BUNDLE")"
echo "$RESP" | jq -e ".id == \"$PLUGIN_ID\"" >/dev/null || {
  echo "ERROR: upload did not return the expected plugin id:" >&2
  echo "$RESP" >&2
  exit 1
}

echo "Enabling $PLUGIN_ID ..."
curl -s -X POST "$API/plugins/$PLUGIN_ID/enable" -H "Authorization: Bearer $A_TOKEN" >/dev/null

STATUS="$(curl -s "$API/plugins" -H "Authorization: Bearer $A_TOKEN" \
  | jq -r --arg id "$PLUGIN_ID" '.active[]? | select(.id==$id) | .id')"
if [ "$STATUS" = "$PLUGIN_ID" ]; then
  echo "Plugin active: $PLUGIN_ID"
else
  echo "ERROR: plugin not in the active list after enable:" >&2
  curl -s "$API/plugins" -H "Authorization: Bearer $A_TOKEN" >&2
  exit 1
fi
