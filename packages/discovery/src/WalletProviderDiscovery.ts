import { WalletProvider } from "./WalletProvider"

type WalletProviderVariantRecord = Readonly<{
  [k in WalletProvider["_tag"]]?: WalletProvider & { _tag: k }
}>

export type ProviderDetail = Readonly<{
  info: ProviderInfo
  provider: Promise<WalletProviderVariantRecord>
}>

export type OnProvider = Readonly<{
  onProvider(detail: ProviderDetail): void
}>

export type ProviderInfo = Readonly<{
  uuid: string
  name: string
  icon: string
  rdns: string
}>

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
