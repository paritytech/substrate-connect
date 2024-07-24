import { SmoldotExtensionAPI } from "@substrate/smoldot-discovery/types"
import {
  createScClient as smoldotScClient,
  type Config as EmbeddedNodeConfig,
} from "./smoldot-light.js"
import type { ScClient } from "./types.js"
import { getSmoldotExtensionProviders } from "@substrate/smoldot-discovery"

export * from "./types.js"
export type { EmbeddedNodeConfig }

/**
 * Configuration that can be passed to {createScClient}.
 */
export interface Config {
  /**
   * If `true`, then the client will always use a node embedded within the page and never use
   * the substrate-connect extension.
   *
   * Defaults to `false`.
   */
  forceEmbeddedNode?: boolean

  /**
   * Configuration to use for the embedded node. Ignored if the extension is present.
   *
   * If you want to make sure that this configuration isn't ignored, use this option in
   * conjunction with {Config.forceEmbeddedNode}.
   */
  embeddedNodeConfig?: EmbeddedNodeConfig
}

/**
 * Returns a {@link ScClient} that connects to chains, either through the substrate-connect
 * extension or by executing a light client directly from JavaScript, depending on whether the
 * extension is installed and available. [< also via the new discovery protocol?]
 */
export const createScClient = (config?: Config): ScClient => {
  if (config?.forceEmbeddedNode)
    return smoldotScClient(config?.embeddedNodeConfig)

  const smoldotProviderPromise = getSmoldotProviderPromise()
  const client = smoldotProviderPromise
    ? smoldotProviderPromise
    : smoldotScClient(config?.embeddedNodeConfig)

  return {
    async addChain(chainSpec, jsonRpcCallback, databaseContent) {
      return (await client).addChain(
        chainSpec,
        jsonRpcCallback,
        databaseContent,
      )
    },
    async addWellKnownChain(id, jsonRpcCallback, databaseContent) {
      return (await client).addWellKnownChain(
        id,
        jsonRpcCallback,
        databaseContent,
      )
    },
  }
}

function getSmoldotProviderPromise(): Promise<SmoldotExtensionAPI> | undefined {
  if (typeof document !== "object" || typeof CustomEvent !== "function") return
  const lightClientProvider = getSmoldotExtensionProviders()
    .filter((detail) =>
      // Ah, so this is to additionally filter to using only using our substrate connect extension
      // to find a compatible light client. Is there any real benefit to this over just taking the
      // first smoldot compatible interface we find? Regardless, there is a security thing where we
      // can't really trust arbitrary extensions with the light client interfaces they return (and any
      // extension could advertise itself as being our one).
      detail.info.rdns.startsWith("io.github.paritytech.SubstrateConnect"),
    )
    .map((detail) => detail.provider)[0]

  return lightClientProvider
}
