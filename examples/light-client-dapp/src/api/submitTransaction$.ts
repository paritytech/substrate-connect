import { map } from "rxjs"
import type { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { getObservableClient } from "./getObservableClient"

export const submitTransaction$ = (
  provider: UnstableWallet.Provider,
  chainId: string,
  tx: string,
) =>
  getObservableClient(provider, chainId)
    .tx$(tx)
    .pipe(map((txEvent) => ({ tx, txEvent })))
