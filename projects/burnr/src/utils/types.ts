// SPDX-License-Identifier: Apache-2
import { Balance, Index, RefCount } from '@polkadot/types/interfaces';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { ProviderMeta } from '@polkadot/extension-inject/types';
import { u32 } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';

import { ApiPromise } from '@polkadot/api';
import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';

/**
 * Interface describing a Provider, lazily loaded.
 */
export interface LazyProvider extends ProviderMeta {
  description: string;
  id: string;
  endpoint?: string | undefined;
  client?: string;
  start: () => Promise<ProviderInterface>;
}

export interface Account {
  address: string;
  name: string;
}
export interface DeriveCtx {
  deriveAddress?: (userName: string) => string;
}

export interface AccountCtx extends DeriveCtx {
  userAddress: string;
  userPair?: KeyringPair;
  userName: string;
}

export interface LocalStorageAccountCtx extends AccountCtx{
  userSeed: string;
  userJson: KeyringPair$Json;
  userHistory: EvtTxCtx;
}

export interface CreateAccountCtx {
  account: LocalStorageAccountCtx,
  setCurrentAccount: (account: LocalStorageAccountCtx) => void  
}

export interface AdminCtx extends DeriveCtx {
  adminAddress: string;
  adminPair: KeyringPair;
  deriveAdmin: (userName: string) => string;
  treasuryAddress: string;
  userName: string;
}

export interface ApiCtx {
  api: ApiPromise;
}

export interface BalanceVisibilityCtx {
  balanceVisibility: boolean;
  setBalanceVisibility: (bal: boolean) => void
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
  withWhom: string;
  extrinsic: string;
  value: string|number;
  status: string|number;
  // amount: Balance;
  // key: string;
  // from: string;
  // to: string;
  // wasSent: boolean;
  // when: Date;
  // method: string;
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

export interface Data extends ExtrinsicInfo {
  withWhom: string;
  value: string|number;
  extrinsic: string;
}
export interface SizeScale {
  size?: 'large'|'medium'|'small';
}

export interface Column {
  id: 'withWhom' | 'extrinsic' | 'value' | 'status';
  label: string;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  align?: 'right';
}
