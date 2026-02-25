import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';

function runCli(args: string): unknown {
  const raw = execSync(`pnpm -s dev ${args}`, {
    cwd: process.cwd(),
    encoding: 'utf8'
  });
  return JSON.parse(raw);
}

describe('cli e2e user journey', () => {
  it('sets up main wallets and outputs public keys', () => {
    const out = runCli('setup-main-wallets') as Array<{
      chain: string;
      publicKey: string;
      accountIndex: number;
      derivationPath: string;
    }>;

    expect(out.map((w) => w.chain)).toEqual(['evm', 'starknet', 'solana']);
    for (const wallet of out) {
      expect(wallet.publicKey.length).toBeGreaterThan(6);
      expect(wallet.accountIndex).toBe(0);
      expect(wallet.derivationPath.length).toBeGreaterThan(4);
    }
  });

  it('full flow: setup -> quote -> execute -> list', () => {
    const quote = runCli('bridge-quote --from evm --to starknet --token USDC --amount 25') as {
      provider: string;
      estimatedReceive: string;
    };
    expect(['stargate', 'orbiter', 'layerswap']).toContain(quote.provider);
    expect(Number(quote.estimatedReceive)).toBeGreaterThan(0);

    const receipt = runCli('execute-tx --chain starknet --to 0xabc --value 0.1 --usd 5') as {
      status: string;
      chain: string;
      txHash: string;
    };
    expect(receipt.status).toBe('submitted');
    expect(receipt.chain).toBe('starknet');
    expect(receipt.txHash.length).toBeGreaterThan(8);

    const wallets = runCli('list-wallets') as Array<{ chain: string }>;
    const chains = new Set(wallets.map((w) => w.chain));
    expect(chains.has('evm')).toBe(true);
    expect(chains.has('starknet')).toBe(true);
    expect(chains.has('solana')).toBe(true);
  });
});
