# OmniWallet Skill

## Purpose

OmniWallet is a local-first multichain wallet and bridge orchestration skill for OpenClaw.

### Supported chains (v1)

- EVM
- Solana
- Bitcoin
- Starknet

## Safety invariants (HARD)

1. Never expose raw private keys
2. Agent interacts with signer API only
3. All tx execution must pass policy checks
4. Bridge providers must be allowlisted
5. High-value actions require human approval gate

## Core intents

- `wallet.ensure(chain)`
- `balance.get(chain, token?)`
- `bridge.quote(from, to, token, amount)`
- `tx.execute(chain, to, value, data?)`

## E2E standard

Before release, run:

- `pnpm verify`
- `pnpm test:e2e`
- Optional live flow: `pnpm test:e2e:live` (testnet only)
