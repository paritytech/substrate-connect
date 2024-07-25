import { getProviders, type ProviderDetail } from "@substrate/discovery"
import { SmoldotExtensionProviderDetail } from "./types"

export const Kind: SmoldotExtensionProviderDetail["kind"] = "smoldot-v1"

export const isSmoldotExtension = (
  provider: ProviderDetail,
): provider is SmoldotExtensionProviderDetail => provider.kind === Kind

export const getSmoldotExtensionProviders = () => {
  return getProviders().filter(isSmoldotExtension)
}
