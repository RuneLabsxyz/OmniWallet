#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/server/clawd/projects/OmniWallet"
SLEEP_SECS="${SLEEP_SECS:-180}"

cd "$REPO_DIR"

echo "[autopilot] starting OmniWallet Othala loop (sleep=${SLEEP_SECS}s)"

while true; do
  echo "[autopilot] tick $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  othala daemon --once || true
  /home/server/clawd/projects/OmniWallet/scripts/othala/seed-from-vault.sh || true
  sleep "$SLEEP_SECS"
done
