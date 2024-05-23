import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"
import * as SubstrateDiscovery from "@substrate/discovery"

export const useChains = (
  api?: NonNullable<SubstrateDiscovery.ChainsProvider["v1"]>,
) => {
  const [chains, setChains] = useState<SubstrateDiscovery.Chains>({})
  const isMounted = useIsMounted()

  useEffect(() => {
    const chains = api?.getChains()
    if (!isMounted()) return
    setChains(chains ?? {})
  }, [api, isMounted])

  useEffect(
    () =>
      api?.addChainsChangeListener((chains) => {
        setChains(chains)
      }),
    [api],
  )

  return { chains }
}
