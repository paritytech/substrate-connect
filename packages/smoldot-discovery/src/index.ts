import { getProviders, type ProviderDetail } from "@substrate/discovery"
import { SmoldotExtensionProviderDetail } from "./types"

export const Kind: SmoldotExtensionProviderDetail["kind"] = "smoldot-v1"

export const isSmoldotExtension = (
  provider: ProviderDetail,
): provider is SmoldotExtensionProviderDetail => {
  if (provider.kind !== Kind) return false

  return true
}

export const getSmoldotExtensionProviders = () => {
  return getProviders().filter(isSmoldotExtension)
}

export * as connector from "./connector"
