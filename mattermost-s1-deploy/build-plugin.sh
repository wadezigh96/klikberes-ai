#!/usr/bin/env bash
# Build the channel-export plugin bundle from the PINNED commit.
#
# Source: prefers the audited local clone (../mattermost-plugin-channel-export)
# after verifying its HEAD is exactly the pinned commit; otherwise clones from
# GitHub on the host and checks out the pin. The audited clone is exported via
# `git archive`, so it stays pristine.
#
# Output: ./plugin-dist/com.mattermost.plugin-channel-export-1.3.0.tar.gz
set -euo pipefail

cd "$(dirname "$0")"

PLUGIN_COMMIT="6c98b0b8f7396bcf30679cb6de8893ce8c688376"
PLUGIN_REPO="https://github.com/mattermost/mattermost-plugin-channel-export"
LOCAL_CLONE="../mattermost-plugin-channel-export"
OUT_DIR="plugin-dist"
SRC_DIR="plugin-src"

cleanup() { rm -rf "$SRC_DIR"; }
trap cleanup EXIT

rm -rf "$SRC_DIR" && mkdir -p "$SRC_DIR" "$OUT_DIR"

if [ -d "$LOCAL_CLONE/.git" ]; then
  actual="$(git -C "$LOCAL_CLONE" rev-parse HEAD)"
  if [ "$actual" != "$PLUGIN_COMMIT" ]; then
    echo "ERROR: local clone is at $actual, expected pinned $PLUGIN_COMMIT" >&2
    echo "Fix the clone first — do not build an unpinned tree." >&2
    exit 1
  fi
  echo "Local clone verified at pinned commit $PLUGIN_COMMIT"
  (cd "$LOCAL_CLONE" && git archive HEAD) | tar -x -C "$SRC_DIR"
else
  echo "WARNING: local clone $LOCAL_CLONE not found — cloning from GitHub." >&2
  git clone --quiet "$PLUGIN_REPO" "$SRC_DIR.tmp"
  git -C "$SRC_DIR.tmp" checkout --quiet "$PLUGIN_COMMIT"
  rm -rf "$SRC_DIR.tmp/.git"
  mv "$SRC_DIR.tmp"/* "$SRC_DIR/" 2>/dev/null || mv "$SRC_DIR.tmp"/. "$SRC_DIR/"
  rmdir "$SRC_DIR.tmp" 2>/dev/null || true
fi

docker build -f Dockerfile.plugin-build -t s1-plugin-build .

cid="$(docker create s1-plugin-build)"
docker cp "$cid:/out/." "$OUT_DIR/"
docker rm -f "$cid" >/dev/null

echo "Bundle(s) in $OUT_DIR/:"
ls -la "$OUT_DIR/"
echo "Record the bundle md5 for the evidence notes:"
md5sum "$OUT_DIR"/*.tar.gz || true
