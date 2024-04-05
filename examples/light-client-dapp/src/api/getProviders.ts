import type { UnstableWalletProviderDiscovery } from "@substrate/unstable-wallet-provider"

export const getProviders = () => {
  const providers = [] as UnstableWalletProviderDiscovery.Detail[]
  window.dispatchEvent(
    new CustomEvent<UnstableWalletProviderDiscovery.OnProvider>(
      "unstableWallet:requestProvider",
      {
        detail: {
          onProvider(detail) {
            providers.push(detail)
          },
        },
      },
    ),
  )
  return providers
}
