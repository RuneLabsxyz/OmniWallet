import { describe, expect, it } from 'vitest';
import { OmniWallet } from '../../src/core/omniwallet.js';
import { assertPolicy } from '../../src/security/policy.js';
import { MockKeyVault } from '../../src/storage/keyVault.js';
import { buildDefaultAdapters } from '../../src/adapters/chains.js';
import { BridgeRouter, MockBridgeProvider } from '../../src/bridges/router.js';

const omni = new OmniWallet(
  assertPolicy({
    allowedChains: ['evm', 'solana', 'bitcoin', 'starknet'],
    dailySpendLimitUsd: 1000,
    maxPerTxUsd: 200,
    allowContracts: {},
    allowBridgeProviders: ['stargate', 'orbiter', 'layerswap'],
    requireHumanApprovalAboveUsd: 50
  }),
  new MockKeyVault(),
  buildDefaultAdapters(),
  new BridgeRouter([
    new MockBridgeProvider('stargate'),
    new MockBridgeProvider('orbiter'),
    new MockBridgeProvider('layerswap')
  ])
);

describe('omniwallet e2e local user flow', () => {
  it('sets up wallets for all v1 chains', async () => {
    for (const chain of ['evm', 'solana', 'bitcoin', 'starknet'] as const) {
      const wallet = await omni.ensureWallet(chain);
      expect(wallet.chain).toBe(chain);
      expect(wallet.address.length).toBeGreaterThan(6);
    }
  });

  it('gets a bridge quote and validates provider allowlist', async () => {
    const quote = await omni.bridgeQuote('evm', 'starknet', 'USDC', '250');
    expect(['stargate', 'orbiter', 'layerswap']).toContain(quote.provider);
    expect(Number(quote.estimatedReceive)).toBeGreaterThan(0);
  });

  it('executes a policy-compliant tx as a user', async () => {
    const receipt = await omni.executeTx(
      { chain: 'starknet', to: '0x01', value: '0.01', data: '0x1234' },
      5
    );
    expect(receipt.status).toBe('submitted');
    expect(receipt.txHash).toContain('hash_starknet');
  });
});
