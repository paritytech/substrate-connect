import {
  createScClient as smoldotScClient,
  type Config as EmbeddedNodeConfig,
} from "./smoldot-light.js"
import { createScClient as extensionScClient } from "./extension.js"
import type { ScClient } from "./types.js"

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
  if (config?.forceEmbeddedNode || typeof document !== "object")
    return smoldotScClient(config?.embeddedNodeConfig)

  const client = isExtensionPresent().then((isPresent) =>
    isPresent
      ? extensionScClient()
      : smoldotScClient(config?.embeddedNodeConfig),
  )

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

async function isExtensionPresent() {
  let isPresent = false
  const onMessage = ({ source, origin, data }: MessageEvent) => {
    if (
      source !== window ||
      origin !== window.origin ||
      typeof data !== "object" ||
      data.origin !== "substrate-connect-extension" ||
      data.type !== "is-extension-present"
    )
      return
    isPresent = true
    window.removeEventListener("message", onMessage)
  }
  window.addEventListener("message", onMessage)
  window.postMessage({
    origin: "substrate-connect-client",
    type: "is-extension-present",
  })
  await waitMacroTasks(5)
  return isPresent
}

function waitMacroTasks(n: number) {
  return new Promise<void>((resolve) => {
    let macroTaskCount = 0
    const checkMacroTaskCount = () => {
      ++macroTaskCount
      if (macroTaskCount > n) return resolve()
      setTimeout(checkMacroTaskCount)
    }
    checkMacroTaskCount()
  })
}
