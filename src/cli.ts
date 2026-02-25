import { Command } from 'commander';
import { OmniWallet } from './core/omniwallet.js';
import { MockKeyVault } from './storage/keyVault.js';
import { buildDefaultAdapters } from './adapters/chains.js';
import { BridgeRouter, MockBridgeProvider } from './bridges/router.js';
import { assertPolicy } from './security/policy.js';
import type { Chain } from './core/types.js';

import { listWallets } from './storage/walletRegistry.js';

const policy = assertPolicy({
  allowedChains: ['evm', 'solana', 'bitcoin', 'starknet'],
  dailySpendLimitUsd: 500,
  maxPerTxUsd: 100,
  allowContracts: {},
  allowBridgeProviders: ['stargate', 'orbiter', 'layerswap'],
  requireHumanApprovalAboveUsd: 50
});

const omni = new OmniWallet(
  policy,
  new MockKeyVault(),
  buildDefaultAdapters(),
  new BridgeRouter([
    new MockBridgeProvider('stargate'),
    new MockBridgeProvider('orbiter'),
    new MockBridgeProvider('layerswap')
  ])
);

const program = new Command();
program.name('omniwallet').description('OmniWallet local orchestration CLI').version('0.1.0');

program
  .command('ensure-wallet')
  .requiredOption('--chain <chain>')
  .action(async ({ chain }) => {
    const out = await omni.ensureWallet(chain as Chain);
    console.log(JSON.stringify(out, null, 2));
  });

program
  .command('bridge-quote')
  .requiredOption('--from <chain>')
  .requiredOption('--to <chain>')
  .requiredOption('--token <token>')
  .requiredOption('--amount <amount>')
  .action(async ({ from, to, token, amount }) => {
    const out = await omni.bridgeQuote(from as Chain, to as Chain, token, amount);
    console.log(JSON.stringify(out, null, 2));
  });

program
  .command('execute-tx')
  .requiredOption('--chain <chain>')
  .requiredOption('--to <to>')
  .requiredOption('--value <value>')
  .option('--data <data>')
  .option('--usd <usd>', 'Approx USD value for policy checks', '1')
  .action(async ({ chain, to, value, data, usd }) => {
    const out = await omni.executeTx({ chain: chain as Chain, to, value, data }, Number(usd));
    console.log(JSON.stringify(out, null, 2));
  });

program.command('setup-main-wallets').action(async () => {
  const chains: Chain[] = ['evm', 'starknet', 'solana'];
  const wallets = await Promise.all(chains.map((chain) => omni.ensureWallet(chain)));
  const out = wallets.map((w) => ({
    chain: w.chain,
    publicKey: w.address,
    accountIndex: w.accountIndex,
    derivationPath: w.derivationPath
  }));
  console.log(JSON.stringify(out, null, 2));
});

program.command('list-wallets').action(async () => {
  const out = await listWallets();
  console.log(JSON.stringify(out, null, 2));
});

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
