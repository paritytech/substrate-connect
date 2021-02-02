// SPDX-License-Identifier: Apache-2
import type, { Balance, Index, RefCount } from '@polkadot/types/interfaces';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { ProviderMeta } from '@polkadot/extension-inject/types';
import { u32 } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';

import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

/**
 * Interface describing a Provider, lazily loaded.
 */
export interface LazyProvider extends ProviderMeta {
  description: string;
  id: string;
  endpoint?: string;
  client?: string;
  start: () => Promise<ProviderInterface>;
}

export interface Account {
  address: string;
  name: string;
}

export interface DeriveCtx {
  deriveAddress: (username: string) => string;
}

export interface AccountCtx extends DeriveCtx {
  userAddress: string;
  userPair: KeyringPair;
  username: string;
}

export interface AdminCtx extends DeriveCtx {
  adminAddress: string;
  adminPair: KeyringPair;
  deriveAdmin: (username: string) => string;
  treasuryAddress: string;
  username: string;
}

export interface ApiCtx {
  api: ApiPromise;
}

export interface MgrEvent {
  when: Date;
  method: string;
  amount: Balance;
  address: string;
  key: string;
  wasSent: boolean | null;
  from: string | null;
  to: string;
}

export type EvtMgrCtx = MgrEvent[];

export interface TxEvent {
  amount: Balance;
  key: string;
  from: string;
  to: string;
  wasSent: boolean;
  when: Date;
  method: string;
}

export type EvtTxCtx = TxEvent[];

export interface AccountData extends Codec {
  free: Balance;
  reserved: Balance;
  miscFrozen: Balance;
  feeFrozen: Balance;
  txCount: u32;
  sessionIndex: u32;
}

export interface AccountInfo extends Codec {
  nonce: Index;
  refcount: RefCount;
  data: AccountData;
}

export interface UserInfo {
  active: boolean; 
  address: string;
  created: Date;
  balance: Balance;
  reserved: Balance;
  feeFrozen: Balance;
  miscFrozen: Balance;
}

export interface ExtrinsicInfo {
  status: string|number;
}
export interface SizeScale {
  size?: 'large'|'medium'|'small';
}