/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useEffect, useState } from "react"
import { ApiPromise } from "@polkadot/api"
import { logger } from "@polkadot/util"
import { createScClient, WellKnownChains } from "@substrate/connect"
import { ALL_PROVIDERS, BURNR_WALLET } from "../../utils/constants"
import { useIsMountedRef } from "./useIsMountedRef"

const scClient = createScClient()
const l = logger(BURNR_WALLET)

export const useApiCreate = (): ApiPromise => {
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise)

  const [network] = useState<string>(ALL_PROVIDERS.network.toLowerCase())
  const mountedRef = useIsMountedRef()

  useEffect((): void => {
    const choseSmoldot = async (endpoint: string): Promise<void> => {
      try {
        const provider = await scClient.addWellKnownChain(
          endpoint as WellKnownChains,
        )
        const api = await ApiPromise.create({ provider })
        l.log(`Burnr is now connected to ${endpoint}`)
        mountedRef.current && setApi(api)
      } catch (err) {
        l.error("Error:", err)
      }
    }

    void choseSmoldot(network)
  }, [mountedRef, network])

  return api
}
