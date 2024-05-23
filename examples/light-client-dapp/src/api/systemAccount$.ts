import * as SubstrateDiscovery from "@substrate/discovery"

import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import { combineLatest, distinct, filter, finalize, map, mergeMap } from "rxjs"
import { getObservableClient } from "./getObservableClient"

export type SystemAccount = {
  consumers: number
  data: {
    flags: bigint
    free: bigint
    frozen: bigint
    reserved: bigint
  }
  nonce: number
  providers: number
  sufficients: number
}

export const systemAccount$ = (
  api: NonNullable<SubstrateDiscovery.ChainsProvider["v1"]>,
  chainId: string,
  address: string,
) => {
  const client = getObservableClient(api, chainId)
  const { metadata$, finalized$, unfollow, storage$ } = client.chainHead$()
  return combineLatest([
    metadata$.pipe(filter(Boolean)),
    finalized$.pipe(filter(Boolean)),
  ]).pipe(
    mergeMap(([metadata, blockInfo]) => {
      const storageAccount = getDynamicBuilder(metadata).buildStorage(
        "System",
        "Account",
      )
      return storage$(blockInfo.hash, "value", () =>
        storageAccount.enc(address),
      ).pipe(
        filter(Boolean),
        distinct(),
        map((value) => storageAccount.dec(value) as SystemAccount),
      )
    }),
    finalize(unfollow),
  )
}
