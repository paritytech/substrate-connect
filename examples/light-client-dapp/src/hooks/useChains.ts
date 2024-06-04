import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"
import { Unstable } from "@substrate/connect-discovery"

export const useChains = (provider?: Unstable.Provider) => {
  const [chains, setChains] = useState<Unstable.RawChains>({})
  const isMounted = useIsMounted()

  useEffect(() => {
    const chains = provider?.getChains()
    if (!isMounted()) return
    setChains(chains ?? {})
  }, [provider, isMounted])

  useEffect(
    () =>
      provider?.addChainsChangeListener((chains) => {
        setChains(chains)
      }),
    [provider],
  )

  return { chains }
}
