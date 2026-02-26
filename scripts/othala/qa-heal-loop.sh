#!/usr/bin/env bash
set -euo pipefail

# QA heal loop:
# - run verify
# - if failing, open one focused fix task (deduped by title)

REPO_DIR="/home/server/clawd/projects/OmniWallet"
MODEL="${OTHALA_MODEL:-codex}"

cd "$REPO_DIR"

if pnpm -s verify >/tmp/omni_verify.log 2>&1; then
  echo "[qa-heal] verify passed"
  exit 0
fi

# Build compact failure summary (first meaningful error lines)
summary="$(grep -E "(error|failed|FAIL|Cannot perform this operation|untracked branch|prettier|eslint|Test Files|Tests )" -i /tmp/omni_verify.log | head -n 8 | tr '\n' '; ' | sed 's/[[:space:]]\+/ /g' | cut -c1-180)"
[ -n "$summary" ] || summary="verify failing; inspect /tmp/omni_verify.log"

title="fix(qa): unblock verify gate - ${summary}"

# Deduplicate by exact title
if othala list --json 2>/dev/null | jq -e --arg t "$title" '.[] | select(.title == $t)' >/dev/null; then
  echo "[qa-heal] existing fix task present"
  exit 0
fi

echo "[qa-heal] creating fix task"
othala chat new --repo . --title "$title" --model "$MODEL" --json >/dev/null

echo "[qa-heal] created: $title"
