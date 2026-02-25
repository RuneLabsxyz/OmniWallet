# OmniWallet Architecture

## Core components

1. **OmniWallet Orchestrator** (`src/core/omniwallet.ts`)
   - Public intent API
   - Orchestrates policy + vault + chain adapters + bridge router

2. **Policy Engine** (`src/security/policy.ts`)
   - Chain allowlist
   - Spend controls
   - Contract allowlist
   - Bridge provider allowlist

3. **KeyVault Interface** (`src/storage/keyVault.ts`)
   - Non-exportable signing contract
   - Abstracts local secure key backend

4. **Chain Adapters** (`src/adapters/chains.ts`)
   - Broadcast tx
   - Balance checks
   - Chain-specific interaction boundary

5. **Bridge Router** (`src/bridges/router.ts`)
   - Quotes from providers
   - Route selection strategy (best receive)

## Data flow

User Intent -> OmniWallet -> Policy check -> Signer -> Chain Adapter -> Receipt

Bridge Intent -> OmniWallet -> Policy check -> Bridge Router -> Selected Quote

## Security boundary

- Orchestrator process must not own export-capable keys
- KeyVault implementation must expose signing only
- Logs must never include secrets

## Why this shape

This structure lets us swap backends per chain and increase security independently without changing UX-level intents.
