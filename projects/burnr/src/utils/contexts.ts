// SPDX-License-Identifier: Apache-2

import { LocalStorageAccountCtx, AdminCtx, BalanceVisibilityCtx, EvtMgrCtx, EvtTxCtx, CreateAccountCtx } from './types';

import React from 'react';
import { ApiPromise } from '@polkadot/api';

const BalanceVisibleContext = React.createContext<BalanceVisibilityCtx>({
  balanceVisibility: true,
  setBalanceVisibility: () => console.log()
});
const AccountContext = React.createContext<CreateAccountCtx>({
    account: {} as LocalStorageAccountCtx,
    setCurrentAccount: () => console.log()
  });
const AdminContext = React.createContext<AdminCtx>({} as AdminCtx);
const ApiContext = React.createContext<ApiPromise>({} as ApiPromise);
const EvtMgrContext = React.createContext<EvtMgrCtx>([]);
const EvtTxContext = React.createContext<EvtTxCtx>([]);

export {
  AccountContext,
  AdminContext,
  ApiContext,
  BalanceVisibleContext,
  EvtMgrContext,
  EvtTxContext
};
