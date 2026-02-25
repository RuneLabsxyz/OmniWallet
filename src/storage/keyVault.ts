import type { Chain, SignedTx, TxRequest, WalletDescriptor } from '../core/types.js';
import { upsertWallet } from './walletRegistry.js';

export interface KeyVault {
  ensureWallet(chain: Chain, accountIndex?: number): Promise<WalletDescriptor>;
  sign(chain: Chain, request: TxRequest): Promise<SignedTx>;
  exportPrivateKey?: never; // intentional: non-exportable contract
}

/**
 * Mock local vault for deterministic test/e2e runs.
 * Replace with HSM/Transit-backed implementation in production.
 */
export class MockKeyVault implements KeyVault {
  async ensureWallet(chain: Chain, accountIndex = 0): Promise<WalletDescriptor> {
    const descriptor = {
      chain,
      accountIndex,
      address: `omni_${chain}_${accountIndex}_addr`,
      derivationPath: this.pathFor(chain, accountIndex)
    };
    await upsertWallet(descriptor);
    return descriptor;
  }

  async sign(chain: Chain, request: TxRequest): Promise<SignedTx> {
    return {
      chain,
      rawTx: `signed:${chain}:${request.to}:${request.value}`,
      txHashHint: `hash_${chain}_${Buffer.from(request.to).toString('hex').slice(0, 8)}`
    };
  }

  private pathFor(chain: Chain, i: number): string {
    if (chain === 'evm') return `m/44'/60'/0'/0/${i}`;
    if (chain === 'solana') return `m/44'/501'/${i}'/0'`;
    if (chain === 'bitcoin') return `m/84'/0'/0'/0/${i}`;
    return `m/2645'/1195502025'/${i}'/0/0`;
  }
}
