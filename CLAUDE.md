# CLAUDE.md

## Project focus

OmniWallet: multichain wallet orchestration (EVM/Solana/Bitcoin/Starknet) with strong safety controls.

## Required checks

- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm test:e2e

## Security posture

- signer API only, non-exportable keys
- strict policy checks
- high-risk actions require explicit confirmation gates
