import type { BridgeQuote, Chain } from '../core/types.js';

export interface BridgeProvider {
  name: string;
  quote(fromChain: Chain, toChain: Chain, token: string, amount: string): Promise<BridgeQuote>;
}

export class MockBridgeProvider implements BridgeProvider {
  constructor(public readonly name: string) {}

  async quote(
    fromChain: Chain,
    toChain: Chain,
    token: string,
    amount: string
  ): Promise<BridgeQuote> {
    const n = Number(amount);
    const fee = Math.max(0.1, n * 0.005).toFixed(6);
    const receive = (n - Number(fee)).toFixed(6);
    return {
      routeId: `${this.name}:${fromChain}:${toChain}:${token}`,
      fromChain,
      toChain,
      token,
      amount,
      estimatedReceive: receive,
      fee,
      provider: this.name
    };
  }
}

export class BridgeRouter {
  constructor(private readonly providers: BridgeProvider[]) {}

  async bestQuote(
    fromChain: Chain,
    toChain: Chain,
    token: string,
    amount: string
  ): Promise<BridgeQuote> {
    const quotes = await Promise.all(
      this.providers.map((p) => p.quote(fromChain, toChain, token, amount))
    );
    return quotes.sort((a, b) => Number(b.estimatedReceive) - Number(a.estimatedReceive))[0];
  }
}
