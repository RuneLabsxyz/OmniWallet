import { describe, it } from 'vitest';

const enabled = process.env.OMNIWALLET_ENABLE_LIVE_E2E === '1';

describe('live e2e (guarded)', () => {
  it.skipIf(!enabled)('runs real testnet flow when explicitly enabled', async () => {
    // Placeholder for live adapter calls (EVM/Solana/Bitcoin/Starknet testnets)
    // Keep low-value wallets and explicit approvals.
  });
});
