import { LightClientProvider } from "./types"

export type PIP0001ProviderDetail = {
  info: PIP0001ProviderInfo
  // FIXME: update to PolkadotProvider from https://github.com/paritytech/polkadot-provider
  provider: Promise<LightClientProvider>
}

export type PIP0001OnProvider = {
  onProvider(detail: PIP0001ProviderDetail): void
}

export type PIP0001ProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export declare global {
  interface WindowEventMap {
    "pip0001:announceProvider": PIP0001AnnounceProviderEvent
    "pip0001:requestProvider": PIP0001RequestProviderEvent
  }
}

export interface PIP0001AnnounceProviderEvent
  extends CustomEvent<PIP0001ProviderDetail> {
  type: "pip0001:announceProvider"
}

export interface PIP0001RequestProviderEvent
  extends CustomEvent<PIP0001OnProvider> {
  type: "pip0001:requestProvider"
}
