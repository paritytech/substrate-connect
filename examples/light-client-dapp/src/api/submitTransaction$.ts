import { map } from "rxjs"
import type { Unstable } from "@substrate/connect-discovery"
import { getClient } from "./getClient"

export const submitTransaction$ = (
  provider: Unstable.Provider,
  chainId: string,
  tx: string,
) =>
  getClient(provider, chainId)
    .submitAndWatch(tx)
    .pipe(map((txEvent) => ({ tx, txEvent })))
