#!/usr/bin/env bash
set -u
APP_URL="${APP_URL:-}"
OUT="artifacts/kane-latest.ndjson"
EXIT_FILE="artifacts/kane-latest.exit"
GENERATED_TEST="tests/klikberes_remote_test.md"
mkdir -p artifacts tests
if [[ -z "$APP_URL" ]]; then
  echo "Set APP_URL to the public HTTPS preview URL first."
  echo "Example: APP_URL=https://your-preview.vercel.app npm run kane"
  exit 2
fi
if [[ "$APP_URL" != https://* ]]; then
  echo "APP_URL must use HTTPS for remote grid testing."
  exit 2
fi
if ! command -v kane-cli >/dev/null 2>&1; then
  echo "Kane CLI is not installed. Install with: npm install -g @testmuai/kane-cli"
  exit 2
fi
if ! curl -fsS "$APP_URL/api/health" >/dev/null 2>&1; then
  echo "KlikBeres is not reachable at $APP_URL/api/health"
  exit 2
fi
if ! kane-cli plugin doctor remote-execution >/dev/null 2>&1; then
  echo "Warning: local remote-execution binary is unavailable; attempting cloud remote run anyway."
fi
sed "s|__APP_URL__|$APP_URL|g" tests/klikberes_test.md > "$GENERATED_TEST"
set +e
kane-cli testrun run "$GENERATED_TEST" --remote --agent --bug-detection continue | tee "$OUT"
CODE=${PIPESTATUS[0]}
set -e
printf '%s\n' "$CODE" > "$EXIT_FILE"
rm -f "$GENERATED_TEST"
echo
echo "Kane remote exit code: $CODE"
echo "Evidence stream: $OUT"
echo "Exit code: $EXIT_FILE"
exit "$CODE"
