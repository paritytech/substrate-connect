import { ToExtension } from "@substrate/connect-extension-protocol"

/**
 * Checks whether a message sent on the `window` matches the `ToExtension` interface.
 *
 * Do not forget to update this function if the `ToExtension` interface changes!
 */
export default function checkReceivedMessage(msg: any): msg is ToExtension {
  const message = msg as ToExtension

  if (message.origin !== "substrate-connect-client") return false
  if (typeof message.type !== "string") return false

  switch (message.type) {
    case "add-chain": {
      if (typeof message.chainId !== "string") return false
      if (typeof message.chainSpec !== "string") return false
      if (!Array.isArray(message.potentialRelayChainIds)) return false
      for (const element of message.potentialRelayChainIds) {
        if (typeof element !== "string") return false
      }
      break
    }

    case "add-well-known-chain": {
      if (typeof message.chainId !== "string") return false
      if (typeof message.chainName !== "string") return false
      break
    }

    case "rpc": {
      if (typeof message.chainId !== "string") return false
      if (typeof message.jsonRpcMessage !== "string") return false
      break
    }

    case "remove-chain": {
      if (typeof message.chainId !== "string") return false
      break
    }

    default:
      return false
  }

  return true
}
