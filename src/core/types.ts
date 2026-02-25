export type Chain = 'evm' | 'solana' | 'bitcoin' | 'starknet';

export type TxRequest = {
  chain: Chain;
  to: string;
  value: string;
  data?: string;
  token?: string;
};

export type SignedTx = {
  chain: Chain;
  rawTx: string;
  txHashHint?: string;
};

export type WalletDescriptor = {
  chain: Chain;
  accountIndex: number;
  address: string;
  derivationPath: string;
};

export type BridgeQuote = {
  routeId: string;
  fromChain: Chain;
  toChain: Chain;
  token: string;
  amount: string;
  estimatedReceive: string;
  fee: string;
  provider: string;
};

export type ExecutionReceipt = {
  status: 'submitted' | 'confirmed' | 'failed';
  chain: Chain;
  txHash: string;
  explorerUrl?: string;
};
