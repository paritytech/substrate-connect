import type { UnstableWalletProviderDiscovery } from "@substrate/unstable-wallet-provider"
import { delay } from "@std/async"

export type GetProvidersOptions = {
  waitTimeMs?: number
  signal?: AbortSignal
}

export const getProviders = async (options: GetProvidersOptions = {}) => {
  const providers: UnstableWalletProviderDiscovery.Detail[] = []

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

  await delay(options.waitTimeMs ?? 1000, { signal: options.signal })

  return providers.slice()
}
