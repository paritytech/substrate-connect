import { getObservableClient } from "@polkadot-api/client"
import type { RawChain } from "@substrate/light-client-extension-helpers/web-page"
import { createClient } from "@polkadot-api/substrate-client"
import { useEffect, useState } from "react"

export const useChain = (chain: RawChain) => {
  const [state, setState] = useState<{
    finalized?: string
    blockHeight?: number
  }>({})

  useEffect(() => {
    const client = getObservableClient(createClient(chain.connect))
    const { unfollow, finalizedHeader$ } = client.chainHead$()
    const subscription = finalizedHeader$.subscribe(({ hash, header }) =>
      setState({
        finalized: hash,
        blockHeight: header.number,
      }),
    )

    return () => {
      subscription.unsubscribe()
      unfollow()
      client.destroy()
    }
  }, [chain.connect])

  return state
}
