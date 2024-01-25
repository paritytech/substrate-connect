import { LightClientProvider } from "./types"

export type PIP6963ProviderDetail = {
  info: PIP6963ProviderInfo
  // FIXME: update to PolkadotProvider from https://github.com/paritytech/polkadot-provider
  provider: Promise<LightClientProvider>
}

export type PIP6963OnProvider = {
  onProvider(detail: PIP6963ProviderDetail): void
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

export interface PIP6963AnnounceProviderEvent
  extends CustomEvent<PIP6963ProviderDetail> {
  type: "pip6963:announceProvider"
}

export interface PIP6963RequestProviderEvent
  extends CustomEvent<PIP6963OnProvider> {
  type: "pip6963:requestProvider"
}
