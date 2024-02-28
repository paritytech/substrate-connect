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
  const [balance, setBalance] = useState(0n)

  useEffect(() => {
    if (!address) {
      return
    }

    const client = getObservableClient(createClient(provider))

    const { metadata$, unfollow, storage$ } = client.chainHead$()

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

          const storageQuery = storage$(null, "value", () =>
            storageAccount.enc(address),
          ).pipe(
            filter(Boolean),
            first(),
            map((value) => storageAccount.dec(value) as SystemAccountStorage),
            map((storageResult) => storageResult.data.free),
          )

          return storageQuery
        }),
      )
      .subscribe((balance) => {
        setBalance(balance)
      })

    return () => {
      subscription.unsubscribe()
      unfollow()
      client.destroy()
    }
  }, [provider, address])

  return balance
}
