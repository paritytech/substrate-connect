import { getConnectorClient as slGetConnectorClient } from "./smoldot-light.js"
import { getConnectorClient as eGetConnectorClient } from "./extension.js"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

export * from "./errors.js"
export * from "./types.js"

const isExtension =
  typeof document === "object" &&
  typeof document.getElementById === "function" &&
  !!document.getElementById(DOM_ELEMENT_ID)

export const getConnectorClient = isExtension
  ? eGetConnectorClient
  : slGetConnectorClient
