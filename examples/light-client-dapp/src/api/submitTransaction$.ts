import { map } from "rxjs"
import type { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { getClient } from "./getClient"

export const submitTransaction$ = (
  provider: UnstableWallet.Provider,
  chainId: string,
  tx: string,
) =>
  getClient(provider, chainId)
    .submitAndWatch(tx)
    .pipe(map((txEvent) => ({ tx, txEvent })))
