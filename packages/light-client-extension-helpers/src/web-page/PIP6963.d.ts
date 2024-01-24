import { LightClientProvider } from "./types"

export type PIP6963ProviderDetail = {
  info: PIP6963ProviderInfo
  // FIXME: update to PolkadotProvider from https://github.com/paritytech/polkadot-provider
  provider: LightClientProvider
}

export type PIP6963ProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export declare global {
  interface WindowEventMap {
    "pip6963:announceProvider": PIP6963AnnounceProviderEvent
    "pip6963:requestProvider": PIP6963RequestProviderEvent
  }
}

export interface PIP6963AnnounceProviderEvent extends CustomEvent {
  type: "pip6963:announceProvider"
  detail: PIP6963ProviderDetail
}

export interface PIP6963RequestProviderEvent extends Event {
  type: "pip6963:requestProvider"
}
