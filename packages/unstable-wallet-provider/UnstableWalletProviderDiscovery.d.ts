import { UnstableWallet } from "./UnstableWalletProvider"

export namespace UnstableWalletProviderDiscovery {
  export type Detail = {
    info: ProviderInfo
    // FIXME: update to PolkadotProvider from https://github.com/paritytech/polkadot-provider
    provider: Promise<UnstableWallet.Provider>
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
    type: "unstableWallet:announceProvider"
  }

  export interface RequestProviderEvent extends CustomEvent<OnProvider> {
    type: "unstableWallet:requestProvider"
  }
}

declare global {
  interface WindowEventMap {
    "unstableWallet:announceProvider": UnstableWalletProviderDiscovery.AnnounceProviderEvent
    "unstableWallet:requestProvider": UnstableWalletProviderDiscovery.RequestProviderEvent
  }
}
