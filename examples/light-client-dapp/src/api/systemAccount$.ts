import { getDynamicBuilder } from "@polkadot-api/metadata-builders"

import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { distinct, filter, finalize, map, mergeMap } from "rxjs"
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
  provider: UnstableWallet.Provider,
  chainId: string,
  address: string,
) => {
  const client = getObservableClient(provider, chainId)
  const { metadata$, finalized$, unfollow, storage$ } = client.chainHead$()
  return metadata$.pipe(
    filter(Boolean),
    mergeMap((metadata) => {
      const storageAccount = getDynamicBuilder(metadata).buildStorage(
        "System",
        "Account",
      )
      return finalized$.pipe(
        mergeMap((blockInfo) =>
          storage$(blockInfo.hash, "value", () =>
            storageAccount.enc(address),
          ).pipe(
            filter(Boolean),
            distinct(),
            map((value) => storageAccount.dec(value) as SystemAccount),
          ),
        ),
      )
    }),
    finalize(unfollow),
  )
}
