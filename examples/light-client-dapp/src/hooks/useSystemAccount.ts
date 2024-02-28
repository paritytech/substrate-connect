import { filter, first, map, mergeMap } from "rxjs"
import { getObservableClient } from "@polkadot-api/client"
import { ConnectProvider, createClient } from "@polkadot-api/substrate-client"
import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import { useEffect, useState } from "react"

export type SystemAccountStorage = {
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

export const useSystemAccount = (
  provider: ConnectProvider,
  address: string | null,
) => {
  const [systemAccount, setSystemAccount] = useState<SystemAccountStorage>()

  useEffect(() => {
    if (!address) {
      return
    }

    setSystemAccount(undefined)

    const client = getObservableClient(createClient(provider))

    const { metadata$, finalized$, unfollow, storage$ } = client.chainHead$()

    const subscription = metadata$
      .pipe(
        filter(Boolean),
        first(),
        mergeMap((metadata) => {
          const dynamicBuilder = getDynamicBuilder(metadata)
          const storageAccount = dynamicBuilder.buildStorage(
            "System",
            "Account",
          )

          const storageQuery = finalized$.pipe(
            mergeMap((blockInfo) =>
              storage$(blockInfo.hash, "value", () =>
                storageAccount.enc(address),
              ).pipe(
                filter(Boolean),
                first(),
                map(
                  (value) => storageAccount.dec(value) as SystemAccountStorage,
                ),
              ),
            ),
          )

          return storageQuery
        }),
      )
      .subscribe((systemAccountStorage) => {
        setSystemAccount(systemAccountStorage)
      })

    return () => {
      subscription.unsubscribe()
      unfollow()
      client.destroy()
    }
  }, [provider, address])

  return systemAccount
}
