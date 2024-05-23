import { map } from "rxjs"
import * as substrateDiscovery from "@substrate/discovery"
import { getClient } from "./getClient"

export const submitTransaction$ = (
  provider: substrateDiscovery.WalletProvider,
  chainId: string,
  tx: string,
) =>
  getClient(provider, chainId)
    .submitAndWatch(tx)
    .pipe(map((txEvent) => ({ tx, txEvent })))
