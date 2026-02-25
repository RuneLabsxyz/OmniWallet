import { describe, expect, it } from 'vitest';
import { assertPolicy, enforceTxPolicy } from '../../src/security/policy.js';

describe('policy', () => {
  const policy = assertPolicy({
    allowedChains: ['evm', 'solana', 'bitcoin', 'starknet'],
    dailySpendLimitUsd: 1000,
    maxPerTxUsd: 100,
    allowContracts: { evm: ['0xabc'] },
    allowBridgeProviders: ['stargate'],
    requireHumanApprovalAboveUsd: 50
  });

  it('blocks tx above max per tx', () => {
    expect(() =>
      enforceTxPolicy(policy, { chain: 'evm', to: '0xabc', value: '1', data: '0xdeadbeef' }, 101)
    ).toThrow(/per-tx limit/);
  });

  it('allows allowlisted contract tx', () => {
    expect(() =>
      enforceTxPolicy(policy, { chain: 'evm', to: '0xabc', value: '1', data: '0x01' }, 10)
    ).not.toThrow();
  });
});
