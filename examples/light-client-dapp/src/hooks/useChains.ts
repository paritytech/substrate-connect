import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"

export const useChains = (provider?: UnstableWallet.Provider) => {
  const [chains, setChains] = useState<UnstableWallet.RawChains>({})
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
