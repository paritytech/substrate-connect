import { getObservableClient } from "@polkadot-api/client"
import type { RawChain } from "@substrate/light-client-extension-helpers/web-page"
import { createClient } from "@polkadot-api/substrate-client"
import { fromHex } from "@polkadot-api/utils"
import { useEffect, useState } from "react"
import { exhaustMap, filter, map } from "rxjs"
import { compact } from "scale-ts"

export const useChain = (chain: RawChain) => {
  const [state, setState] = useState<{
    finalized?: string
    blockHeight?: number
  }>({})

  useEffect(() => {
    const client = getObservableClient(createClient(chain.connect))
    const { finalized$, unfollow, header$ } = client.chainHead$()
    const subscription = finalized$
      .pipe(
        exhaustMap((finalized) =>
          header$(finalized).pipe(
            filter(Boolean),
            map((header) => [finalized, header] as const),
          ),
        ),
      )
      .subscribe(([finalized, header]) =>
        setState({
          finalized,
          blockHeight: compact.dec(fromHex(header).slice(32)) as number,
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
