import { type PageChain } from "@polkadot-api/light-client-extension-helpers/extension-page"
import { getObservableClient } from "@polkadot-api/client"
import {
  createClient,
  type FollowEventWithRuntime,
} from "@polkadot-api/substrate-client"
import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"
import { exhaustMap, filter, map } from "rxjs/operators"
import { fromHex } from "@polkadot-api/utils"
import { compact } from "scale-ts"

export const useChain = (chain: PageChain) => {
  const [state, setState] = useState<{
    bestBlockHash?: string
    blockHeight?: number
  }>({})

  const isMounted = useIsMounted()

  useEffect(() => {
    const client = createClient(chain.provider)
    const observableClient = getObservableClient(client)
    const { follow$, unfollow, header$ } = observableClient.chainHead$()
    const subscription = follow$
      .pipe(
        filter(
          (
            block,
          ): block is FollowEventWithRuntime & { type: "bestBlockChanged" } =>
            block.type === "bestBlockChanged" && !!block.bestBlockHash,
        ),
        exhaustMap(({ bestBlockHash }) =>
          header$(bestBlockHash).pipe(
            filter(Boolean),
            map((header) => [bestBlockHash, header] as const),
          ),
        ),
      )
      .subscribe(([bestBlockHash, header]) => {
        if (!isMounted) return
        setState({
          bestBlockHash,
          blockHeight: compact.dec(fromHex(header).slice(32)) as number,
        })
      })

    return () => {
      subscription.unsubscribe()
      unfollow()
      observableClient.destroy()
    }
  }, [chain.genesisHash])

  return state
}
