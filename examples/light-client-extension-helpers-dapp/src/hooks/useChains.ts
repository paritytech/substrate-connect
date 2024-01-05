import type {
  RawChain,
  LightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"
import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"

export const useChains = (provider: LightClientProvider) => {
  const [chains, setChains] = useState<Record<string, RawChain>>({})
  const isMounted = useIsMounted()

  useEffect(() => {
    ;(async () => {
      const chains = await provider.getChains()
      if (!isMounted()) return
      setChains(chains)
    })()
  }, [provider, isMounted])

  useEffect(
    () => provider.addChainsChangeListener((chains) => setChains(chains)),
    [provider],
  )

  return { chains }
}
