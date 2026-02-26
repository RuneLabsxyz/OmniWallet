# OmniWallet Othala Autopilot

**Status: LIVE** ✅

OmniWallet is now running in autonomous "ship it" mode with Othala.

## How It Works

### Task Seeding (Every 20 min)

Preflight hardening now runs before seeding:

- force-track Othala worktree branches with Graphite (`gt track --force`)
- normalize `.data/wallets.json` formatting in repo/worktrees when JSON is valid
- operator report is structured by: queue summary, blocked tasks, ready tasks, seeded-from-vault tasks

- Cron job runs isolated agent to execute autopilot cycle
- Reads vault spec (`/home/server/vault-human/life/areas/projects/omniwallet.md`)
- Extracts Product Requirements + Security/Policy bullet points
- Converts bullets into concrete implementation tasks
- Queues new tasks if active queue < 8 tasks
- **Min queue: 8 parallel tasks**

### Daemon Execution (Every 20 min)

```bash
cd /home/server/clawd/projects/OmniWallet
othala daemon --once    # processes one iteration of work
./scripts/othala/seed-from-vault.sh  # tops up task queue
```

### Auto-Merge Mode

- Mode: `merge` (from `.othala/repo-mode.toml`)
- Graphite: `auto_submit = true`
- Every task that passes verification merges immediately to `chore/bootstrap-omniwallet-core`
- No manual PR review needed
- **Ship velocity: continuous**

### Permissions (Locked)

All system operations are pre-approved:

- `file_read`, `file_write`
- `shell_exec`, `git_ops`, `network`, `process`
- `package_install`, `env_access`, `graphite_ops`
- Default: **allow**

## Monitoring

### Check active tasks

```bash
cd /home/server/clawd/projects/OmniWallet
othala list --json | jq '[.[] | {state: .state, title: .title}]'
```

### Check queue status

```bash
othala list --json | jq '[.[] | select(.state=="CHATTING")] | length'
```

### Manual daemon tick

```bash
othala daemon --once
```

### Manual seeding

```bash
./scripts/othala/seed-from-vault.sh
```

## Cron Job (Active)

- **ID**: `35125e0a-8c22-4f6a-8ffb-7c4265a255f1`
- **Schedule**: every 20 minutes (1200s)
- **Action**: isolated agent turn (daemon + seeding)
- **Next run**: automatic

## Expected Behavior

1. **Every 20 minutes:**
   - Othala daemon processes active tasks
   - For tasks in READY → picks up and sends to AI agent
   - For tasks CHATTING → waits on agent output
   - For tasks with test output → runs `pnpm verify` gates
   - For tasks passing verify → auto-merges via graphite
   - Seed script tops up queue to 8 active tasks

2. **Expected merge rate:**
   - ~1 task per 10-15 min (depends on complexity)
   - Tasks stack as dependencies (later tasks wait on earlier merges)
   - Graphite auto-submit merges without bottleneck

3. **Vault-driven loop:**
   - New features added to vault spec → automatically seeded as tasks within next 20 min
   - Implementation → merged
   - **Loop: spec → seed → implement → ship → repeat**

## Stopping/Pausing

To pause autopilot:

```bash
# Disable cron job via gateway UI or:
cron action=update jobId=35125e0a-8c22-4f6a-8ffb-7c4265a255f1 patch='{"enabled":false}'
```

To resume:

```bash
cron action=update jobId=35125e0a-8c22-4f6a-8ffb-7c4265a255f1 patch='{"enabled":true}'
```

To run manual cycles:

```bash
cd /home/server/clawd/projects/OmniWallet
othala daemon --once
./scripts/othala/seed-from-vault.sh
```

## What Gets Shipped

Every merged task includes:

- Implementation code (CLI commands, adapters, etc.)
- E2E tests (black-box user journeys, not just unit tests)
- Commits + PRs auto-created via Graphite
- Full audit trail in `.orch/events/`

## Task Lifecycle

```
NEW → CHATTING (agent working) → READY (needs verification)
  → TESTING (verify gate) → AWAITING_MERGE (if graphite registered)
  → MERGED (auto-merged via auto_submit)
```

## Notes

- Graphite warnings about untracked branches are cosmetic (tasks still work)
- `.orch/` directory is Othala's state store (git submodules warnings are expected)
- Vault updates trigger new seeds automatically
- No manual intervention needed for task flow
