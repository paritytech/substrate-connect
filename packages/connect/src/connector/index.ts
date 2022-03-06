import { createScClient as smoldotScClient } from "./smoldot-light.js"
import { createScClient as extensionScClient } from "./extension.js"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

export * from "./types.js"

// We detect whether the extension is installed based on the presence of a DOM element with
// a specific `id`. See `connect-extension-protocol`.
const isExtensionPresent =
  typeof document === "object" &&
  typeof document.getElementById === "function" &&
  !!document.getElementById(DOM_ELEMENT_ID)

/**
 * Returns a {ScClient} that connects to chains, either through the substrate-connect
 * extension or by executing a light client directly from JavaScript, depending on whether the
 * extension is installed and available.
 */
export const createScClient = isExtensionPresent
  ? extensionScClient
  : smoldotScClient
