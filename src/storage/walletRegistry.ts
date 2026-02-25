import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { WalletDescriptor } from '../core/types.js';

const REGISTRY_PATH = '.data/wallets.json';

async function loadAll(): Promise<WalletDescriptor[]> {
  try {
    const raw = await readFile(REGISTRY_PATH, 'utf8');
    return JSON.parse(raw) as WalletDescriptor[];
  } catch {
    return [];
  }
}

async function saveAll(wallets: WalletDescriptor[]): Promise<void> {
  await mkdir(dirname(REGISTRY_PATH), { recursive: true });
  await writeFile(REGISTRY_PATH, JSON.stringify(wallets, null, 2));
}

export async function upsertWallet(descriptor: WalletDescriptor): Promise<void> {
  const wallets = await loadAll();
  const next = wallets.filter(
    (w) => !(w.chain === descriptor.chain && w.accountIndex === descriptor.accountIndex)
  );
  next.push(descriptor);
  await saveAll(next);
}

export async function listWallets(): Promise<WalletDescriptor[]> {
  return loadAll();
}
