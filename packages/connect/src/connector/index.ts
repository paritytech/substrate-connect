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
 * extension is installed and available.
 */
export const createScClient = (config?: Config): ScClient => {
  if (config?.forceEmbeddedNode)
    return smoldotScClient(config?.embeddedNodeConfig)

  const providerDetails = getSmoldotExtensionProviders()
  const client =
    providerDetails.length > 0
      ? providerDetails[0]!.provider
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
