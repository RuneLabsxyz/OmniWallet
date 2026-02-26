#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/server/clawd/projects/OmniWallet"
VAULT_DOC="/home/server/vault-human/life/areas/projects/omniwallet.md"
MIN_ACTIVE="${MIN_ACTIVE_TASKS:-8}"
MODEL="${OTHALA_MODEL:-codex}"

cd "$REPO_DIR"

# Reliability preflight (Graphite tracking + wallet JSON normalization)
./scripts/othala/preflight-reliability.sh >/dev/null 2>&1 || true

if [ ! -f "$VAULT_DOC" ]; then
  echo "[seed] vault doc missing: $VAULT_DOC"
  exit 0
fi

# Count active tasks (not MERGED, CANCELLED, STOPPED)
active_count=$(othala list --json 2>/dev/null | jq '[.[] | select(.state != "MERGED" and .state != "CANCELLED" and .state != "STOPPED")] | length' || echo 0)

echo "[seed] active tasks: $active_count (min=$MIN_ACTIVE)"
if [ "$active_count" -ge "$MIN_ACTIVE" ]; then
  echo "[seed] queue full; skipping"
  exit 0
fi

# Get existing titles to avoid duplicates
mapfile -t existing_titles < <(othala list --json 2>/dev/null | jq -r '.[].title' | sort -u || true)

# Extract candidate tasks from vault
tmp_candidates=$(mktemp)
python3 - <<'PY' > "$tmp_candidates"
import re
from pathlib import Path

vault_path = Path('/home/server/vault-human/life/areas/projects/omniwallet.md')
if not vault_path.exists():
    exit(0)

text = vault_path.read_text()

candidates = []

# Extract all requirement bullets from Product Requirements section
m = re.search(r'## Product Requirements from Mugen.*?(?=\n## |\Z)', text, re.DOTALL)
if m:
    for line in m.group(0).splitlines():
        s = line.strip()
        if re.match(r'^\d+\.\s+', s):
            req = re.sub(r'^\d+\.\s+', '', s)
            candidates.append(req)

# Additional feature bullets from Security & Policy
m2 = re.search(r'## Security & Policy \(Required\).*?(?=\n## |\Z)', text, re.DOTALL)
if m2:
    for line in m2.group(0).splitlines():
        s = line.strip()
        if s.startswith('- '):
            candidates.append(s[2:])

# Routing/Provider Strategy
m3 = re.search(r'## Routing/Provider Strategy.*?(?=\n## |\Z)', text, re.DOTALL)
if m3:
    for line in m3.group(0).splitlines():
        s = line.strip()
        if s.startswith('- '):
            candidates.append(s[2:])

# Translate into concrete implementation tasks
tasks = []
seen = set()

for c in candidates:
    c = c.strip()
    if not c or c in seen:
        continue
    seen.add(c)
    
    lc = c.lower()
    
    # Public key retrieval
    if 'public key' in lc or 'retrieve' in lc and 'key' in lc:
        tasks.append('CLI: Implement get-public-key command for any configured wallet on any supported chain')
    # Send/transfer
    elif 'send money' in lc or 'transfer' in lc and 'flow' in lc:
        tasks.append('Implement send-tx CLI command with preview, fee estimation, and confirmation prompts')
    # Balance aggregation
    elif 'aggregate' in lc and 'balance' in lc:
        tasks.append('Implement balance aggregator: per-chain + total USD with live oracle pricing')
    # Ledger
    elif 'ledger' in lc or 'activity feed' in lc or 'transaction list' in lc:
        tasks.append('Implement ledger list command with explorer links and filtering by chain/asset')
    # Swap/AVNU
    elif 'avnu' in lc or 'swap' in lc and 'starknet' in lc:
        tasks.append('Integrate AVNU Starknet swap adapter with quote + execute + slippage guards')
    # Bridges
    elif 'bridge' in lc and ('cctp' in lc or 'hyperlane' in lc or 'orbiter' in lc):
        tasks.append('Add bridge adapters (CCTP, Hyperlane, Orbiter) with risk scoring and cost comparison')
    # Policy
    elif 'policy' in lc or 'cap' in lc or 'allowlist' in lc:
        tasks.append('Implement policy engine v2: daily/per-tx caps, address allowlists, auto-mode guardrails')
    # EVM/other chain adapters
    elif 'evm' in lc or '1inch' in lc or 'paraswap' in lc:
        tasks.append('Add EVM chain adapter with 1inch/0x aggregator integration for swaps')
    elif 'solana' in lc or 'jupiter' in lc:
        tasks.append('Add Solana chain adapter with Jupiter swap integration')
    elif 'bitcoin' in lc:
        tasks.append('Add Bitcoin chain adapter for UTXO management and send operations')
    # Custody/Cartridge
    elif 'cartridge' in lc or 'custody' in lc or 'signer' in lc:
        tasks.append('Implement optional Cartridge signer integration for Starknet wallet backend')
    # Interop/intent schema
    elif 'interop' in lc or 'intent' in lc and 'schema' in lc:
        tasks.append('Define OmniWallet tx-intent schema + CLI interface for all skills to route actions')
    # Modes
    elif 'mode' in lc and ('safe' in lc or 'guided' in lc or 'auto' in lc):
        tasks.append('Implement execution modes: safe (always confirm), guided (confirm risky), auto (policy-bound)')
    # Approval safety
    elif 'approval' in lc:
        tasks.append('Implement approval limit manager with revoke helpers and phishing checks')
    # Error handling/recovery
    elif 'recovery' in lc or 'backup' in lc:
        tasks.append('Add encrypted wallet backup/export/import and hardware key option skeleton')
    # E2E tests
    elif 'e2e' in lc or 'baseline' in lc or 'regression' in lc:
        tasks.append('Set up E2E test suite with baseline capture and post-change regression detection')
    # Default fallback for unmatched bullets
    else:
        # Clean up and use as-is if short enough
        if len(c) < 100:
            tasks.append(f'Implement: {c}')

# Dedupe while preserving order
final = []
seen_tasks = set()
for t in tasks:
    if t not in seen_tasks:
        final.append(t)
        seen_tasks.add(t)

for t in final:
    print(t)
PY

needed=$((MIN_ACTIVE - active_count))
if [ "$needed" -le 0 ]; then
  rm -f "$tmp_candidates"
  exit 0
fi

created=0
while IFS= read -r title; do
  [ -z "$title" ] && continue
  title=$(echo "$title" | xargs)  # trim whitespace
  [ -z "$title" ] && continue

  # Skip if exact title already exists
  skip=false
  for et in "${existing_titles[@]:-}"; do
    if [ "$et" = "$title" ]; then
      echo "[seed] skip (exists): $title"
      skip=true
      break
    fi
  done
  $skip && continue

  echo "[seed] create: $title"
  if othala chat new --repo . --title "$title" --model "$MODEL" --json >/dev/null 2>&1; then
    created=$((created + 1))
    existing_titles+=("$title")
    [ "$created" -ge "$needed" ] && break
  else
    echo "[seed]   FAILED to create"
  fi
done < "$tmp_candidates"

rm -f "$tmp_candidates"
echo "[seed] created $created new task(s), queue now at target"
