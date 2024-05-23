import * as SubstrateDiscovery from "@substrate/discovery"

import { map } from "rxjs"
import { getClient } from "./getClient"

export const submitTransaction$ = (
  api: NonNullable<SubstrateDiscovery.ChainsProvider["v1"]>,
  chainId: string,
  tx: string,
) =>
  getClient(api, chainId)
    .submitAndWatch(tx)
    .pipe(map((txEvent) => ({ tx, txEvent })))
