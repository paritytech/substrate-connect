// SPDX-License-Identifier: Apache-2

import { AccountCtx, AdminCtx, EvtMgrCtx, EvtTxCtx } from './types';

import React from 'react';
import { ApiPromise } from '@polkadot/api';

const AccountContext = React.createContext<AccountCtx>({} as AccountCtx);
const AdminContext = React.createContext<AdminCtx>({} as AdminCtx);
const ApiContext = React.createContext<ApiPromise>({} as ApiPromise);
const EvtMgrContext = React.createContext<EvtMgrCtx>([]);
const EvtTxContext = React.createContext<EvtTxCtx>([]);

export {
  AccountContext,
  AdminContext,
  ApiContext,
  EvtMgrContext,
  EvtTxContext
};
