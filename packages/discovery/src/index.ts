import * as Unstable from "./UnstableWalletProvider"
import * as V1 from "./V1WalletProvider"

export type Detail = {
  info: ProviderInfo
  provider: Promise<Unstable.Provider | V1.Provider>
}

export type OnProvider = {
  onProvider(detail: Detail): void
}

export type ProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface AnnounceProviderEvent extends CustomEvent<Detail> {
  type: "substrateDiscovery:announceProvider"
}

export interface RequestProviderEvent extends CustomEvent<OnProvider> {
  type: "substrateDiscovery:requestProvider"
}

export type { V1, Unstable }

declare global {
  interface WindowEventMap {
    "substrateDiscovery:announceProvider": AnnounceProviderEvent
    "substrateDiscovery:requestProvider": RequestProviderEvent
  }
}
