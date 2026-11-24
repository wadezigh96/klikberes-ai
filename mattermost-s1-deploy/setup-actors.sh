#!/usr/bin/env bash
# Provision the S1 test actors, team, channels and canary posts on the local
# instance, per ../poc/S1-test-plan.md §2. Pure REST API (curl + jq).
#
#   A  s1a-admin     System Admin (first user created -> system admin)
#   B  s1b-attacker  member of X; attribute clearance=none  (set later, UI)
#   C  s1c-victim    member of X; posts the canary messages
#   D  s1d-control   member of X; attribute clearance=full  (set later, UI)
#   E  s1e-outsider  team member, NOT a member of X
#
# Emails use the researcher's @bugcrowdninja.com domain (program rule,
# SCOPE.md §1). Users are admin-created, so no mailbox access is needed:
# they can log in with the password immediately.
#
# Output: ./.env.test with IDs + session tokens for run-test.sh.
# Idempotent where practical: existing users/teams/channels are reused.
set -euo pipefail

cd "$(dirname "$0")"

# --- Configuration (placeholders — override via environment) -----------------
BASE_URL="${BASE_URL:-http://localhost:8065}"
API="$BASE_URL/api/v4"
# PLACEHOLDER passwords for a throwaway local instance only. Change them if
# this instance is reachable by anyone else. >= 14 chars to satisfy strict
# password policies on recent builds.
ADMIN_PASSWORD="${ADMIN_PASSWORD:-S1-Admin-Pass-2026!}"
USER_PASSWORD="${USER_PASSWORD:-S1-User-Pass-2026!}"
ENV_FILE=".env.test"
# -----------------------------------------------------------------------------

command -v curl >/dev/null || { echo "ERROR: curl not found" >&2; exit 1; }
command -v jq   >/dev/null || { echo "ERROR: jq not found (apt-get install -y jq / brew install jq)" >&2; exit 1; }

echo "Waiting for Mattermost at $BASE_URL ..."
for i in $(seq 1 60); do
  if curl -sf "$API/system/ping" >/dev/null 2>&1; then break; fi
  if [ "$i" = "60" ]; then echo "ERROR: server did not come up" >&2; exit 1; fi
  sleep 2
done
echo "Server is up."

# login <login_id> <password> -> prints session token (from Token header)
login() {
  local id="$1" pw="$2" headers token
  headers="$(curl -si -X POST "$API/users/login" \
    -H 'Content-Type: application/json' \
    -d "{\"login_id\":\"$id\",\"password\":\"$pw\"}")"
  token="$(printf '%s' "$headers" | tr -d '\r' | awk 'tolower($1)=="token:" {print $2}')"
  if [ -z "$token" ]; then
    echo "ERROR: login failed for $id" >&2
    printf '%s\n' "$headers" | tail -5 >&2
    exit 1
  fi
  printf '%s' "$token"
}

# create_user <token> <email> <username> <password> <first> -> user id
# Falls back to looking the user up by username if it already exists.
create_user() {
  local token="$1" email="$2" username="$3" pw="$4" first="$5" resp id
  resp="$(curl -s -X POST "$API/users" -H "Authorization: Bearer $token" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"username\":\"$username\",\"password\":\"$pw\",\"first_name\":\"$first\"}")"
  id="$(printf '%s' "$resp" | jq -r '.id // empty')"
  if [ -z "$id" ]; then
    id="$(curl -s "$API/users/username/$username" -H "Authorization: Bearer $token" | jq -r '.id // empty')"
  fi
  if [ -z "$id" ]; then
    echo "ERROR: could not create/find user $username: $resp" >&2
    exit 1
  fi
  printf '%s' "$id"
}

# --- A: system admin ----------------------------------------------------------
# The FIRST user on a fresh self-hosted instance becomes system admin.
echo "Creating admin A (first user) ..."
A_CREATE="$(curl -s -X POST "$API/users" -H 'Content-Type: application/json' \
  -d "{\"email\":\"s1.a@bugcrowdninja.com\",\"username\":\"s1a-admin\",\"password\":\"$ADMIN_PASSWORD\",\"first_name\":\"S1 Admin A\"}")"
A_ID="$(printf '%s' "$A_CREATE" | jq -r '.id // empty')"
if [ -z "$A_ID" ]; then
  # Already exists (re-run): look it up after logging in below.
  A_ID="pending"
fi
A_TOKEN="$(login s1a-admin "$ADMIN_PASSWORD")"
if [ "$A_ID" = "pending" ]; then
  A_ID="$(curl -s "$API/users/me" -H "Authorization: Bearer $A_TOKEN" | jq -r '.id')"
fi
echo "A id: $A_ID"

# --- B..E ---------------------------------------------------------------------
B_ID="$(create_user "$A_TOKEN" s1.b@bugcrowdninja.com s1b-attacker "$USER_PASSWORD" "S1 B Attacker")"
C_ID="$(create_user "$A_TOKEN" s1.c@bugcrowdninja.com s1c-victim   "$USER_PASSWORD" "S1 C Victim")"
D_ID="$(create_user "$A_TOKEN" s1.d@bugcrowdninja.com s1d-control  "$USER_PASSWORD" "S1 D Control")"
E_ID="$(create_user "$A_TOKEN" s1.e@bugcrowdninja.com s1e-outsider "$USER_PASSWORD" "S1 E Outsider")"
echo "B id: $B_ID / C id: $C_ID / D id: $D_ID / E id: $E_ID"

# --- Team ---------------------------------------------------------------------
TEAM_ID="$(curl -s "$API/teams/name/s1test" -H "Authorization: Bearer $A_TOKEN" | jq -r '.id // empty')"
if [ -z "$TEAM_ID" ]; then
  TEAM_ID="$(curl -s -X POST "$API/teams" -H "Authorization: Bearer $A_TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"name":"s1test","display_name":"S1 Test","type":"O"}' | jq -r '.id')"
fi
echo "Team id: $TEAM_ID"

for uid in "$A_ID" "$B_ID" "$C_ID" "$D_ID" "$E_ID"; do
  curl -s -X POST "$API/teams/$TEAM_ID/members" -H "Authorization: Bearer $A_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"team_id\":\"$TEAM_ID\",\"user_id\":\"$uid\"}" >/dev/null
done

# --- Channels -----------------------------------------------------------------
# get_or_create_channel <name> <display> -> channel id (private, created by A)
get_or_create_channel() {
  local name="$1" display="$2" id
  id="$(curl -s "$API/teams/$TEAM_ID/channels/name/$name" -H "Authorization: Bearer $A_TOKEN" | jq -r '.id // empty')"
  if [ -z "$id" ]; then
    id="$(curl -s -X POST "$API/channels" -H "Authorization: Bearer $A_TOKEN" \
      -H 'Content-Type: application/json' \
      -d "{\"team_id\":\"$TEAM_ID\",\"name\":\"$name\",\"display_name\":\"$display\",\"type\":\"P\"}" | jq -r '.id')"
  fi
  printf '%s' "$id"
}

add_member() { # <channel_id> <user_id>
  curl -s -X POST "$API/channels/$1/members" -H "Authorization: Bearer $A_TOKEN" \
    -H 'Content-Type: application/json' -d "{\"user_id\":\"$2\"}" >/dev/null
}

X_ID="$(get_or_create_channel s1-governed   "S1 Governed X")"
Y_ID="$(get_or_create_channel s1-ungoverned "S1 Ungoverned Y")"
Z_ID="$(get_or_create_channel s1-archived   "S1 Archived Z")"
echo "Channels: X=$X_ID Y=$Y_ID Z=$Z_ID"

# X: B, C, D members (A is creator/member). E deliberately NOT added.
for uid in "$B_ID" "$C_ID" "$D_ID"; do add_member "$X_ID" "$uid"; done
# Y (ungoverned control): B and C.
for uid in "$B_ID" "$C_ID"; do add_member "$Y_ID" "$uid"; done
# Z (archived control): B.
add_member "$Z_ID" "$B_ID"

# --- Actor tokens ---------------------------------------------------------------
B_TOKEN="$(login s1b-attacker "$USER_PASSWORD")"
C_TOKEN="$(login s1c-victim   "$USER_PASSWORD")"
D_TOKEN="$(login s1d-control  "$USER_PASSWORD")"
E_TOKEN="$(login s1e-outsider "$USER_PASSWORD")"

# --- Canary posts (as C) --------------------------------------------------------
CANARY="CANARY-S1-$(head -c4 /dev/urandom | od -An -tx1 | tr -d ' \n')"
post_as_c() { # <channel_id> <message> [file_ids_json]
  local chan="$1" msg="$2" files="${3:-[]}"
  curl -s -X POST "$API/posts" -H "Authorization: Bearer $C_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"channel_id\":\"$chan\",\"message\":\"$msg\",\"file_ids\":$files}" | jq -r '.id // "FAILED"'
}

echo "Posting canary messages as C in X ..."
P1="$(post_as_c "$X_ID" "S1 marker message one — ordinary channel content.")"
P2="$(post_as_c "$X_ID" "S1 canary post: $CANARY")"
# One file attachment (plan §2.3: confirm attachments are NOT in the CSV).
echo "s1 attachment content — not part of any export" > /tmp/s1-attachment.txt
FILE_ID="$(curl -s -X POST "$API/files?channel_id=$X_ID" -H "Authorization: Bearer $C_TOKEN" \
  -F "files=@/tmp/s1-attachment.txt" | jq -r '.file_infos[0].id // empty')"
rm -f /tmp/s1-attachment.txt
if [ -n "$FILE_ID" ]; then
  P3="$(post_as_c "$X_ID" "S1 marker message with attachment." "[\"$FILE_ID\"]")"
else
  echo "WARNING: attachment upload failed — continuing without it (note in evidence)." >&2
  P3="$(post_as_c "$X_ID" "S1 marker message three.")"
fi
echo "X posts: $P1 $P2 $P3"

echo "Posting marker in Y (ungoverned control) ..."
PY="$(post_as_c "$Y_ID" "S1 ungoverned-channel marker: $CANARY-Y")"
echo "Y post: $PY"

# --- Save state for run-test.sh ---------------------------------------------------
cat > "$ENV_FILE" <<EOF
BASE_URL=$BASE_URL
TEAM_ID=$TEAM_ID
CHAN_X_ID=$X_ID
CHAN_Y_ID=$Y_ID
CHAN_Z_ID=$Z_ID
A_ID=$A_ID
B_ID=$B_ID
C_ID=$C_ID
D_ID=$D_ID
E_ID=$E_ID
A_TOKEN=$A_TOKEN
B_TOKEN=$B_TOKEN
C_TOKEN=$C_TOKEN
D_TOKEN=$D_TOKEN
E_TOKEN=$E_TOKEN
CANARY=$CANARY
EOF
chmod 600 "$ENV_FILE"

echo
echo "Wrote $ENV_FILE (tokens for the test actors — keep it local)."
echo "Canary string: $CANARY"
echo
echo "NEXT (manual, see ENFORCEMENT-CHECKLIST.md Part 1):"
echo "  1. Start the Enterprise ADVANCED trial in the System Console (log in as s1a-admin)."
echo "  2. Enable ABAC (System Console -> System Attributes)."
echo "  Then run ./deploy-plugin.sh and ./configure-enforcement.sh."
