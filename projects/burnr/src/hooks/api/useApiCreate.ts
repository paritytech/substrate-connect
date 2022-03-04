import { useEffect, useState } from "react"
import { ApiPromise } from "@polkadot/api"
import { logger } from "@polkadot/util"
import { createPolkadotJsScClient, WellKnownChain } from "@substrate/connect"
import { NETWORK, BURNR_WALLET } from "../../utils/constants"
import { useIsMountedRef } from "./useIsMountedRef"

const scClient = createPolkadotJsScClient()
const l = logger(BURNR_WALLET)

export const useApiCreate = (): ApiPromise => {
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise)

  const [network] = useState<string>(NETWORK.id)
  const mountedRef = useIsMountedRef()

  useEffect((): void => {
    const choseSmoldot = async (endpoint: string): Promise<void> => {
      try {
        const provider = await scClient.addWellKnownChain(
          endpoint as WellKnownChain,
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
