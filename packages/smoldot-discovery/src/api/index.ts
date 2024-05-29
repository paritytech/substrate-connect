import type { ProviderDetail, ProviderInfo } from "@substrate/discovery"
import { AddChain, AddWellKnownChain } from "../smoldot"

export namespace V1 {
  export const TAG = "smoldot-v1"

  export type SmoldotExtensionAPI = {
    addChain: AddChain
    addWellKnownChain: AddWellKnownChain
  }

  export type SmoldotExtensionProviderDetail = {
    _tag: typeof TAG
    info: ProviderInfo
    provider: Promise<SmoldotExtensionAPI>
  }

  export const isSmoldotExtension = (
    provider: ProviderDetail,
  ): provider is SmoldotExtensionProviderDetail => {
    if (provider._tag !== TAG) return false

    return true
  }
}
