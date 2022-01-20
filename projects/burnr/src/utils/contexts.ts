import { createContext } from "react"
import {
  LocalStorageAccountCtx,
  AdminCtx,
  BalanceVisibilityCtx,
  EvtMgrCtx,
  EvtTxCtx,
  CreateAccountCtx,
} from "./types"

import { ApiPromise } from "@polkadot/api"

const BalanceVisibleContext = createContext<BalanceVisibilityCtx>({
  balanceVisibility: true,
  setBalanceVisibility: () => console.log(),
})
const AccountContext = createContext<CreateAccountCtx>({
  account: {} as LocalStorageAccountCtx,
  setCurrentAccount: (t: LocalStorageAccountCtx) => console.log(t),
})
const AdminContext = createContext<AdminCtx>({} as AdminCtx)
const ApiContext = createContext<ApiPromise>({} as ApiPromise)
const EvtMgrContext = createContext<EvtMgrCtx>([])
const EvtTxContext = createContext<EvtTxCtx>([])

export {
  AccountContext,
  AdminContext,
  ApiContext,
  BalanceVisibleContext,
  EvtMgrContext,
  EvtTxContext,
}
