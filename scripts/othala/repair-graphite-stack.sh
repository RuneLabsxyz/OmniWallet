#!/usr/bin/env bash
set -euo pipefail

# Restack/conflict repair operator for Othala worktrees.
# Goal: recover a broken Graphite stack with minimal manual intervention.

REPO_DIR="/home/server/clawd/projects/OmniWallet"
MAX_PASSES="${MAX_PASSES:-4}"

cd "$REPO_DIR"

echo "[repair] starting graphite stack repair"

track_all() {
  shopt -s nullglob
  local wt
  for wt in .orch/wt/chat-*; do
    [ -e "$wt/.git" ] || continue
    (
      cd "$wt"
      gt track --force --no-interactive >/dev/null 2>&1 || true
    )
  done
  shopt -u nullglob
}

restack_one() {
  local wt="$1"
  (
    cd "$wt"
    git reset --hard >/dev/null 2>&1 || true
    git clean -fd >/dev/null 2>&1 || true
    gt restack --upstack --no-interactive >/dev/null 2>&1 || \
      gt restack --only --no-interactive >/dev/null 2>&1 || true
  )
}

get_needs_restack() {
  gt log --no-interactive | sed -n 's/.*(needs restack).*\(chat-[0-9]\+\).*/\1/p' | sort -u
}

track_all

pass=1
while [ "$pass" -le "$MAX_PASSES" ]; do
  echo "[repair] pass $pass/$MAX_PASSES"

  # Broad pass over all worktrees
  shopt -s nullglob
  for wt in .orch/wt/chat-*; do
    [ -e "$wt/.git" ] || continue
    restack_one "$wt"
  done
  shopt -u nullglob

  # Targeted pass for explicit needs-restack markers
  mapfile -t pending < <(get_needs_restack)
  if [ "${#pending[@]}" -eq 0 ]; then
    echo "[repair] stack clean"
    exit 0
  fi

  for id in "${pending[@]}"; do
    wt=".orch/wt/$id"
    [ -d "$wt" ] || continue
    restack_one "$wt"
  done

  pass=$((pass + 1))
  track_all

done

echo "[repair] incomplete after $MAX_PASSES passes"
get_needs_restack || true
exit 1
