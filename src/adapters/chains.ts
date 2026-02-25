import type { Chain, ExecutionReceipt, SignedTx } from '../core/types.js';

export interface ChainAdapter {
  chain: Chain;
  broadcast(tx: SignedTx): Promise<ExecutionReceipt>;
  getBalance(address: string, token?: string): Promise<string>;
}

class MockChainAdapter implements ChainAdapter {
  constructor(public readonly chain: Chain) {}

  async broadcast(tx: SignedTx): Promise<ExecutionReceipt> {
    return {
      status: 'submitted',
      chain: tx.chain,
      txHash: tx.txHashHint ?? `tx_${this.chain}_${Date.now()}`,
      explorerUrl: `https://explorer.local/${this.chain}/${tx.txHashHint ?? 'unknown'}`
    };
  }

  async getBalance(...args: [string, string?]): Promise<string> {
    void args;
    return '1000.000000';
  }
}

export function buildDefaultAdapters(): Record<Chain, ChainAdapter> {
  return {
    evm: new MockChainAdapter('evm'),
    solana: new MockChainAdapter('solana'),
    bitcoin: new MockChainAdapter('bitcoin'),
    starknet: new MockChainAdapter('starknet')
  };
}
