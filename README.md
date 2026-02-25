# OmniWallet

Local-first multichain wallet + bridge orchestration core for Runelabs/OpenClaw.

## Vision

A user asks in plain language:

- "set up wallet for Starknet"
- "bridge 250 USDC from Base to Starknet"
- "fund Ponziland wallet and execute"

OmniWallet handles wallet provisioning, bridge route selection, policy enforcement, and execution.

## v1 Chains

- EVM
- Solana
- Bitcoin
- Starknet

## Security model (non-negotiable)

- Private keys are **non-exportable** from signer interface
- Agent never receives raw keys
- Every tx passes policy checks
- Bridge providers allowlisted
- High-value flows require human approval gate

See: [`docs/SECURITY.md`](docs/SECURITY.md)

## Quickstart

```bash
pnpm install
pnpm verify
pnpm test:e2e
pnpm build
pnpm dev setup-main-wallets
pnpm dev ensure-wallet --chain starknet
pnpm dev bridge-quote --from evm --to starknet --token USDC --amount 250
```

## Repository standards

- Strict TypeScript (`noImplicitAny` + strict mode)
- ESLint + Prettier enforced
- Unit + E2E required before merge
- CI runs verify pipeline on every PR
- Architecture docs required for core modules

## E2E policy

We run user-like end-to-end flows, not only unit tests.

- `test/e2e/omni.e2e.spec.ts` simulates full user lifecycle:
  1. setup wallet on each chain
  2. fetch balances
  3. request bridge quote
  4. execute policy-checked tx
- `test/e2e/live` is reserved for real testnet integration (opt-in)

## Next milestones

- Local signer daemon with locked key material
- Adapter implementations for real chains/providers
- Bridge execution layer (Stargate/Orbiter/Layerswap)
- OpenClaw skill packaging + command adapters
