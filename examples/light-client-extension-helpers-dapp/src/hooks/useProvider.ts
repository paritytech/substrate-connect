import {
  type LightClientProvider,
  getLightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"
import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"

const providers = new Map<string, Promise<LightClientProvider>>()

export const useLightClientProvider = (channelId: string) => {
  const [provider, setProvider] = useState<LightClientProvider>()
  const isMounted = useIsMounted()

  useEffect(() => {
    if (!providers.has(channelId))
      providers.set(channelId, getLightClientProvider(channelId))
    providers.get(channelId)?.then((provider) => {
      if (!isMounted()) return
      setProvider(provider)
    })
  }, [channelId, isMounted])

  return { provider }
}
