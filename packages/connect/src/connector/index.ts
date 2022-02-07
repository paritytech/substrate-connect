import type { ClientOptions } from "@substrate/smoldot-light"
import type { SubstrateConnector } from "./types.js"
import { getPublicApi } from "./smoldot-light.js"
import * as extension from "./extension.js"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

export * from "./errors.js"
export * from "./types.js"

const isExtension =
  typeof document === "object" &&
  typeof document.getElementById === "function" &&
  !!document.getElementById(DOM_ELEMENT_ID)

export const getSubstrateConnector = (
  options: ClientOptions = {
    forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
    maxLogLevel: 3 /* no debug/trace messages */,
  },
): SubstrateConnector => (isExtension ? extension : getPublicApi(options))
