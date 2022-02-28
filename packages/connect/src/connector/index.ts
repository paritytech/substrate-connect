import { getConnectorClient as slGetConnectorClient } from "./smoldot-light.js"
import { getConnectorClient as eGetConnectorClient } from "./extension.js"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

export * from "./errors.js"
export * from "./types.js"

// We detect whether the extension is installed based on the presence of a DOM element with
// a specific `id`. See `connect-extension-protocol`.
const isExtensionPresent =
  typeof document === "object" &&
  typeof document.getElementById === "function" &&
  !!document.getElementById(DOM_ELEMENT_ID)

/**
 * Returns a {SubstrateConnector} that connects to chains, either through the substrate-connect
 * extension or by executing a light client directly from JavaScript, depending on whether the
 * extension is installed and available.
 */
export const getConnectorClient = isExtensionPresent
  ? eGetConnectorClient
  : slGetConnectorClient
