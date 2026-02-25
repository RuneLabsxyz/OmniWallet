import { z } from 'zod';
import type { Chain, TxRequest } from '../core/types.js';

const ChainSchema = z.enum(['evm', 'solana', 'bitcoin', 'starknet']);

export const PolicySchema = z.object({
  allowedChains: z.array(ChainSchema).nonempty(),
  dailySpendLimitUsd: z.number().positive(),
  maxPerTxUsd: z.number().positive(),
  allowContracts: z.record(z.string(), z.array(z.string())).default({}),
  allowBridgeProviders: z.array(z.string()).default([]),
  requireHumanApprovalAboveUsd: z.number().nonnegative()
});

export type OmniPolicy = z.infer<typeof PolicySchema>;

export function assertPolicy(policy: OmniPolicy): OmniPolicy {
  return PolicySchema.parse(policy);
}

export function enforceChainAllowed(policy: OmniPolicy, chain: Chain): void {
  if (!policy.allowedChains.includes(chain)) {
    throw new Error(`Chain not allowed by policy: ${chain}`);
  }
}

export function enforceTxPolicy(policy: OmniPolicy, tx: TxRequest, txUsdValue: number): void {
  enforceChainAllowed(policy, tx.chain);

  if (txUsdValue > policy.maxPerTxUsd) {
    throw new Error(`Transaction exceeds per-tx limit: $${txUsdValue}`);
  }

  if (tx.chain === 'evm' && tx.to.startsWith('0x') && tx.data) {
    const allowed = policy.allowContracts.evm ?? [];
    if (allowed.length > 0 && !allowed.includes(tx.to.toLowerCase())) {
      throw new Error(`Contract not allowlisted: ${tx.to}`);
    }
  }
}
