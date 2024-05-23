import {
  UnstableAccountsAPI,
  UnstableChainsAPI,
  UnstableExtrinsicsAPI,
  V1AccountsAPI,
  V1ChainsAPI,
} from "./WalletProviderAPI"
import { RequireAtLeastOne } from "type-fest"

export type WalletProvider = RequireAtLeastOne<{
  chains?: RequireAtLeastOne<{
    v1?: V1ChainsAPI
    unstable?: UnstableChainsAPI
  }>
  accounts?: RequireAtLeastOne<{
    v1?: V1AccountsAPI
    unstable?: UnstableAccountsAPI
  }>
  extrinsics?: RequireAtLeastOne<{
    unstable?: UnstableExtrinsicsAPI
  }>
}>

export type ChainsProvider = NonNullable<WalletProvider["chains"]>
export type AccountsProvider = NonNullable<WalletProvider["accounts"]>
export type ExtrinsicsProvider = NonNullable<WalletProvider["extrinsics"]>

export type ProviderDetail = {
  info: ProviderInfo
  provider: Promise<WalletProvider>
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

export const getProviders = (): ProviderDetail[] => {
  const providers: ProviderDetail[] = []

  // When this event is dispatched, event listeners are expected to
  // respond immediately with a provider. This means the `providers`
  // array will be populated synchronously.
  window.dispatchEvent(
    new CustomEvent<OnProvider>("substrateDiscovery:requestProvider", {
      detail: {
        onProvider(detail) {
          providers.push(detail)
        },
      },
    }),
  )

  // slice the array to prevent further "asynchronous" updates. Providers
  // that did not respond synchronously will be dropped.
  const providersSliced = providers.slice()

  return providersSliced
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
