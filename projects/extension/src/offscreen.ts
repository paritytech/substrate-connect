import { Chain, createScClient } from "@substrate/connect"
import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import { MalformedJsonRpcError } from "smoldot"

const client = createScClient({ embeddedNodeConfig: { maxLogLevel: 3 } })
const activeChains: Record<string, { chain: Chain | undefined }> = {}

const postMessage = (port: chrome.runtime.Port, message: ToApplication) =>
  port.postMessage(message)

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "offscreen") return

  port.onDisconnect.addListener(() => window.close())

  port.onMessage.addListener(async (msg: ToExtension) => {
    switch (msg.type) {
      // add-well-known-chain is transformed to add-chain in the background script.
      // This is because only the chrome.runtime messaging APIs are exposed to
      // the offscreen document so it is not possible to access chrome.storage
      // to get well-known-chain chain-spec
      case "add-chain": {
        if (activeChains[msg.chainId]) {
          postMessage(port, {
            origin: "substrate-connect-extension",
            type: "error",
            chainId: msg.chainId,
            errorMessage: "Requested chainId already in use",
          })
          return
        }
        try {
          activeChains[msg.chainId] = { chain: undefined }
          const chain = await client.addChain(
            msg.chainSpec,
            (jsonRpcMessage) =>
              postMessage(port, {
                origin: "substrate-connect-extension",
                type: "rpc",
                chainId: msg.chainId,
                jsonRpcMessage,
              }),
            msg.potentialRelayChainIds
              .map((chainId) => activeChains[chainId].chain)
              .filter((chain): chain is Chain => !!chain),
          )

          if (!activeChains[msg.chainId]) {
            chain.remove()
          }

          activeChains[msg.chainId] = { chain }

          postMessage(port, {
            origin: "substrate-connect-extension",
            type: "chain-ready",
            chainId: msg.chainId,
          })
        } catch (error) {
          removeChain(msg.chainId)
          postMessage(port, {
            origin: "substrate-connect-extension",
            type: "error",
            chainId: msg.chainId,
            errorMessage:
              error instanceof Error
                ? error.toString()
                : "Unknown error when adding chain",
          })
        }
        break
      }
      case "rpc": {
        if (!activeChains[msg.chainId]) return

        const { chain } = activeChains[msg.chainId]

        try {
          chain?.sendJsonRpc(msg.jsonRpcMessage)
        } catch (error) {
          // As documented in the protocol, malformed JSON-RPC requests are silently ignored.
          if (error instanceof MalformedJsonRpcError) {
            return
          } else {
            removeChain(msg.chainId)
            postMessage(port, {
              origin: "substrate-connect-extension",
              type: "error",
              chainId: msg.chainId,
              errorMessage:
                error instanceof Error
                  ? error.toString()
                  : "Unknown error when sending RPC message",
            })
          }
        }

        break
      }
      case "remove-chain": {
        removeChain(msg.chainId)
        break
      }
    }
  })
})

function removeChain(chainId: string) {
  if (!activeChains[chainId]) return

  const { chain } = activeChains[chainId]
  delete activeChains[chainId]
  try {
    chain?.remove()
  } catch (error) {
    console.error("error removing chain", error)
  }
}
