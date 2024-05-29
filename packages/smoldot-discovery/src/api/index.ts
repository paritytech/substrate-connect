import type { ProviderDetail, ProviderInfo } from "@substrate/discovery"
import { AddChain, AddWellKnownChain } from "../smoldot"

export namespace V1 {
  export const Kind = "smoldot-v1"

  export type SmoldotExtensionAPI = {
    addChain: AddChain
    addWellKnownChain: AddWellKnownChain
  }

  export type SmoldotExtensionProviderDetail = {
    kind: typeof Kind
    info: ProviderInfo
    provider: SmoldotExtensionAPI
  }

  export const isSmoldotExtension = (
    provider: ProviderDetail,
  ): provider is SmoldotExtensionProviderDetail => {
    if (provider.kind !== Kind) return false

    return true
  }
}
