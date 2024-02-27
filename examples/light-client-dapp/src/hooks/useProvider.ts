import { useEffect, useState } from "react"
import type {
  UnstableWallet,
  UnstableWalletProviderDiscovery,
} from "@substrate/unstable-wallet-provider"
import { useIsMounted } from "./useIsMounted"

export const useProvider = () => {
  const isMounted = useIsMounted()
  const [provider, setProvider] = useState<UnstableWallet.Provider>()
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<UnstableWalletProviderDiscovery.OnProvider>(
        "unstableWallet:requestProvider",
        {
          detail: {
            async onProvider(detail) {
              if (
                detail.info.rdns ===
                "io.github.paritytech.SubstrateConnectWalletTemplate"
              ) {
                const discoveredProvider = await detail.provider
                if (!isMounted()) return
                setProvider(discoveredProvider)
              }
            },
          },
        },
      ),
    )
  }, [isMounted])
  return { provider }
}
