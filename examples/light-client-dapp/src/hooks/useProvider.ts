import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"
import type { UnstableOnProvider, UnstableProvider } from "../types"

export const useProvider = () => {
  const isMounted = useIsMounted()
  const [provider, setProvider] = useState<UnstableProvider>()
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<UnstableOnProvider>("unstableWallet:requestProvider", {
        detail: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          async onProvider(detail: any) {
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
      }),
    )
  }, [isMounted])
  return { provider }
}
