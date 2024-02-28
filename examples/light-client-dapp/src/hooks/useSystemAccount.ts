import { filter, firstValueFrom } from "rxjs"
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

    // eslint-disable-next-line no-extra-semi
    ;(async () => {
      const client = getObservableClient(createClient(provider))

      const { metadata$, unfollow, storage$ } = client.chainHead$()

      const metadata = await firstValueFrom(metadata$.pipe(filter(Boolean)))
      const dynamicBuilder = getDynamicBuilder(metadata)
      const storageAccount = dynamicBuilder.buildStorage("System", "Account")

      const balanceQuery$ = storage$(null, "value", () =>
        storageAccount.enc(address),
      )

      const storageResult = storageAccount.dec(
        await firstValueFrom(balanceQuery$.pipe(filter(Boolean))),
      ) as SystemAccountStorage

      unfollow()
      client.destroy()

      setBalance(storageResult.data.free)
    })()
  }, [provider, address])

  return balance
}
