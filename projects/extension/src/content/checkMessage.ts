import { ToExtension } from "@substrate/connect-extension-protocol"

/**
 * Checks whether a message send on the window matches the `ToExtension` interface.
 *
 * Do not forget to update this function if the `ToExtension` interface changes!
 */
export default function checkReceivedMessage(
  message: any,
): message is ToExtension {
  if (message.origin !== "substrate-connect-client") return false
  if (typeof message.type !== "string") return false

  switch (message.type) {
    case "add-chain": {
      if (typeof message.chainId !== "string") return false
      if (typeof message.chainSpec !== "string") return false
      if (!Array.isArray(message.potentialRelayChainIds)) return false
      for (const index in message.potentialRelayChainIds) {
        if (typeof message.potentialRelayChainIds[index] !== "string")
          return false
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
  }

  return true
}
