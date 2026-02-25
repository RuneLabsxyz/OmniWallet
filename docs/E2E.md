# End-to-End Testing Strategy

## Principle

We test like a user:

- ask for wallet setup
- ask for bridge quote
- ask for execution
- ensure policy gates hold

## Test tiers

1. **Local deterministic E2E** (required)
2. **Live testnet E2E** (optional/flagged)

## Commands

- `pnpm test:e2e` (required)
- `pnpm test:e2e:live` (requires `OMNIWALLET_ENABLE_LIVE_E2E=1`)

## Live testing guardrails

- low-value wallets only
- testnet-only default
- explicit opt-in env flags
