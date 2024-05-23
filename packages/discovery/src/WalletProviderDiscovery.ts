import { V1WalletProvider, UnstableWalletProvider } from "./WalletProvider"

export type WalletProviderVariantRecord = {
  UnstableWalletProvider?: Promise<UnstableWalletProvider>
  V1WalletProvider?: Promise<V1WalletProvider>
}

export type ProviderDetail = {
  info: ProviderInfo
  variants: WalletProviderVariantRecord
}

export type OnProvider = {
  onProvider(detail: ProviderDetail): void
}

export type ProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export const discoverProviders = (): ProviderDetail[] => {
  const providers: ProviderDetail[] = []

  window.dispatchEvent(
    new CustomEvent<OnProvider>("substrateDiscovery:requestProvider", {
      detail: {
        onProvider(detail) {
          providers.push(detail)
        },
      },
    }),
  )

  return providers.slice()
}

// #region Events
export interface AnnounceProviderEvent extends CustomEvent<ProviderDetail> {
  type: "substrateDiscovery:announceProvider"
}

export interface RequestProviderEvent extends CustomEvent<OnProvider> {
  type: "substrateDiscovery:requestProvider"
}

declare global {
  interface WindowEventMap {
    "substrateDiscovery:announceProvider": AnnounceProviderEvent
    "substrateDiscovery:requestProvider": RequestProviderEvent
  }
}
// #endregion
