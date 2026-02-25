import type { Chain, ExecutionReceipt, TxRequest, WalletDescriptor } from './types.js';
import type { OmniPolicy } from '../security/policy.js';
import { enforceChainAllowed, enforceTxPolicy } from '../security/policy.js';
import type { KeyVault } from '../storage/keyVault.js';
import type { BridgeRouter } from '../bridges/router.js';
import type { ChainAdapter } from '../adapters/chains.js';

export class OmniWallet {
  constructor(
    private readonly policy: OmniPolicy,
    private readonly vault: KeyVault,
    private readonly chainAdapters: Record<Chain, ChainAdapter>,
    private readonly bridgeRouter: BridgeRouter
  ) {}

  async ensureWallet(chain: Chain, accountIndex = 0): Promise<WalletDescriptor> {
    enforceChainAllowed(this.policy, chain);
    return this.vault.ensureWallet(chain, accountIndex);
  }

  async getBalance(chain: Chain, address: string, token?: string): Promise<string> {
    enforceChainAllowed(this.policy, chain);
    return this.chainAdapters[chain].getBalance(address, token);
  }

  async executeTx(tx: TxRequest, txUsdValue: number): Promise<ExecutionReceipt> {
    enforceTxPolicy(this.policy, tx, txUsdValue);
    const signed = await this.vault.sign(tx.chain, tx);
    return this.chainAdapters[tx.chain].broadcast(signed);
  }

  async bridgeQuote(from: Chain, to: Chain, token: string, amount: string) {
    enforceChainAllowed(this.policy, from);
    enforceChainAllowed(this.policy, to);
    const quote = await this.bridgeRouter.bestQuote(from, to, token, amount);
    if (
      this.policy.allowBridgeProviders.length > 0 &&
      !this.policy.allowBridgeProviders.includes(quote.provider)
    ) {
      throw new Error(`Bridge provider not allowed: ${quote.provider}`);
    }
    return quote;
  }
}
