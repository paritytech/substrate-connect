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
    const { unfollow, finalized$ } = client.chainHead$()
    const subscription = finalized$.subscribe(({ hash, number }) =>
      setState({
        finalized: hash,
        blockHeight: number,
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
