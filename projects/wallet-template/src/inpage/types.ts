import { Account } from "../background/types"

export type InPageRpcSpec = {
  onAccountsChanged(accounts: Account[]): void
}
