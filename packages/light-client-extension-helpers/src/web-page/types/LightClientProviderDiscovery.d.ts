import { LightClientProvider } from "./LightClientProvider"

export type LightClientProviderDetail = {
  info: LightClientProviderInfo
  // FIXME: update to PolkadotProvider from https://github.com/paritytech/polkadot-provider
  provider: Promise<LightClientProvider>
}

export type LightClientOnProvider = {
  onProvider(detail: LightClientProviderDetail): void
}

export type LightClientProviderInfo = {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export declare global {
  interface WindowEventMap {
    "lightClient:announceProvider": LightClientAnnounceProviderEvent
    "lightClient:requestProvider": LightClientRequestProviderEvent
  }
}

export interface LightClientAnnounceProviderEvent
  extends CustomEvent<LightClientProviderDetail> {
  type: "lightClient:announceProvider"
}

export interface LightClientRequestProviderEvent
  extends CustomEvent<LightClientOnProvider> {
  type: "lightClient:requestProvider"
}
