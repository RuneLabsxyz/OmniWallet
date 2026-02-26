#!/usr/bin/env bash
set -euo pipefail

# Reliability preflight for Othala worktrees.
# 1) Ensure Graphite tracks task branches (prevents gt modify untracked-branch failures)
# 2) Normalize generated wallet JSON formatting when valid (prevents prettier gate noise)

cd "$(dirname "$0")/../.."

track_worktrees() {
  shopt -s nullglob
  local wt branch
  for wt in .orch/wt/chat-*; do
    [ -e "$wt/.git" ] || continue
    (
      cd "$wt"
      branch="$(git branch --show-current 2>/dev/null || true)"
      [ -n "$branch" ] || exit 0
      gt track --force --no-interactive >/dev/null 2>&1 || true
    )
  done
  shopt -u nullglob
}

format_wallet_json() {
  shopt -s nullglob
  local f
  for f in .data/wallets.json .orch/wt/chat-*/.data/wallets.json; do
    [ -f "$f" ] || continue
    node -e '
      const fs = require("fs");
      const p = process.argv[1];
      try {
        const j = JSON.parse(fs.readFileSync(p, "utf8"));
        fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
      } catch (_) {
        // Keep invalid files untouched; failing task should surface exact error.
      }
    ' "$f" >/dev/null 2>&1 || true
  done
  shopt -u nullglob
}

track_worktrees
format_wallet_json

echo "[preflight] reliability preflight complete"
