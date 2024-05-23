import type { WalletProviderDiscovery } from "@substrate/unstable-wallet-provider"

export const getProviders = (): WalletProviderDiscovery.Detail[] => {
  const providers: WalletProviderDiscovery.Detail[] = []

  window.dispatchEvent(
    new CustomEvent<WalletProviderDiscovery.OnProvider>(
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

  return providers.slice()
}
