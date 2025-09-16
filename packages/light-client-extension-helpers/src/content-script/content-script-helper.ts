import type { ToExtension } from "@substrate/connect-extension-protocol"
import type { ToApplicationMessage } from "../protocol.js"
import type { BackgroundRpcSpec } from "../background/types.js"
import {
  CONTEXT,
  KEEP_ALIVE_INTERVAL,
  PORT,
  isRpcMessageWithOrigin,
  isSubstrateConnectToApplicationMessage,
  isSubstrateConnectToExtensionMessage,
} from "../shared/index.js"
import { createRpc, isRpcMessage, type RpcMessage } from "../utils/index.js"

let isRegistered = false
export const register = (channelId: string) => {
  if (isRegistered) throw new Error("helper already registered")
  isRegistered = true

  // Set up a promise for when the page is activated,
  // which is needed for prerendered pages.
  const whenActivated = new Promise<void>((resolve) => {
    // @ts-ignore
    if (document.prerendering) {
      // @ts-ignore
      document.addEventListener("prerenderingchange", resolve)
    } else {
      resolve()
    }
  })

  const postToPage = (msg: ToApplicationMessage["msg"]) =>
    window.postMessage({ channelId, msg } as ToApplicationMessage)

  const chainIds = new Set<string>()

  // TODO: update background-helper so this is handled in chrome.runtime.connect.onMessage
  chrome.runtime.onMessage.addListener((msg) => {
    if (isSubstrateConnectToApplicationMessage(msg) && msg.type === "error") {
      chainIds.delete(msg.chainId)
      postToPage(msg)
    }
  })

  const onRelayMessage = (msg: any) => {
    // TODO: remove on 0.0.4
    if (isRpcResponseToLegacyRequestMessage(msg))
      msg = adaptRpcResponseToLegacyToApplicationMessage(msg)

    if (isSubstrateConnectToApplicationMessage(msg) && msg.type === "error")
      chainIds.delete(msg.chainId)

    postToPage({
      ...msg,
      origin: isSubstrateConnectToApplicationMessage(msg)
        ? msg.origin
        : CONTEXT.CONTENT_SCRIPT,
    })
  }
  const onRelayerDisconnect = () => {
    chainIds.forEach((chainId) =>
      postToPage({
        origin: "substrate-connect-extension",
        chainId,
        type: "error",
        errorMessage: "Disconnected from extension",
      }),
    )
    chainIds.clear()
  }

  window.addEventListener("message", async ({ data, source }) => {
    if (source !== window || !data) return
    const { channelId: msgChannelId } = data
    if (channelId !== msgChannelId) return
    let { msg } = data
    // TODO: remove on 0.0.4
    if (isLegacyToExtensionMessage(msg))
      msg = adaptLegacyToExtensionMessageToRpcMessage(msg)

    if (
      !isRpcMessageWithOrigin(msg, CONTEXT.WEB_PAGE) &&
      !isSubstrateConnectToExtensionMessage(msg)
    )
      return

    await whenActivated

    getOrCreateInternalRpc()

    getOrCreateExtensionRelayer(
      onRelayMessage,
      onRelayerDisconnect,
    ).postMessage(msg)

    if (isSubstrateConnectToExtensionMessage(msg))
      switch (msg.type) {
        case "add-chain":
        case "add-well-known-chain": {
          chainIds.add(msg.chainId)
          break
        }
        case "remove-chain": {
          chainIds.delete(msg.chainId)
          break
        }
        default:
          break
      }
  })
}

let extensionRelayer:
  | { postMessage(msg: RpcMessage | ToExtension): void }
  | undefined
const getOrCreateExtensionRelayer = (
  onMessage: (msg: any) => void,
  onDisconnect?: (port: chrome.runtime.Port) => void,
) => {
  if (extensionRelayer) return extensionRelayer

  const port = chrome.runtime.connect({ name: PORT.WEB_PAGE })
  port.onDisconnect.addListener((port) => {
    extensionRelayer = undefined
    onDisconnect?.(port)
  })
  port.onMessage.addListener(onMessage)

  return (extensionRelayer = {
    postMessage(msg) {
      port.postMessage(msg)
    },
  })
}

let internalRpc: any | undefined
const getOrCreateInternalRpc = () => {
  if (internalRpc) return internalRpc

  const port = chrome.runtime.connect({ name: PORT.CONTENT_SCRIPT })
  const rpc = createRpc((msg) =>
    port.postMessage(msg),
  ).withClient<BackgroundRpcSpec>()
  port.onMessage.addListener(rpc.handle)
  const keepAliveInterval = setInterval(
    () => rpc.notify("keepAlive", []),
    KEEP_ALIVE_INTERVAL,
  )
  port.onDisconnect.addListener(() => {
    internalRpc = undefined
    clearInterval(keepAliveInterval)
  })

  internalRpc = rpc

  return internalRpc
}

//#region Legacy message helpers for DApps or libraries using @substrate/light-client-extension-helpers@0.0.2
// TODO: remove on v0.0.4
// TODO: breaking change for @substrate/connect@0.8.5

type LegacyToExtensionMessage =
  | {
      id: string
      origin: "@substrate/light-client-extension-helper-context-web-page"
      type: "getChains"
    }
  | {
      id: string
      origin: "@substrate/light-client-extension-helper-context-web-page"
      type: "getChain"
      chainSpec: string
      relayChainGenesisHash?: string
    }

type LegacyToApplicationMessage =
  | {
      id: string
      origin: "@substrate/light-client-extension-helper-context-background"
      type: "getChainsResponse"
      chains: any
    }
  | {
      id: string
      origin: "@substrate/light-client-extension-helper-context-background"
      type: "getChainResponse"
      chain: any
    }

const isLegacyToExtensionMessage = (
  msg: any,
): msg is LegacyToExtensionMessage => {
  if (
    typeof msg !== "object" ||
    typeof msg?.id !== "string" ||
    msg?.origin !==
      "@substrate/light-client-extension-helper-context-web-page" ||
    !(
      msg?.type === "getChains" ||
      (msg?.type === "getChain" && typeof msg?.chainSpec === "string")
    )
  )
    return false

  return true
}

const isRpcResponseToLegacyRequestMessage = (msg: any): msg is RpcMessage =>
  isRpcMessage(msg) && !!msg?.id?.startsWith("legacy:")

const adaptLegacyToExtensionMessageToRpcMessage = (
  msg: LegacyToExtensionMessage,
) => {
  return {
    id: `legacy:${msg.type}:${msg.id}`,
    origin: msg.origin,
    method: msg.type,
    params:
      msg.type === "getChains"
        ? []
        : [msg.chainSpec, msg.relayChainGenesisHash],
  } as RpcMessage
}

const adaptRpcResponseToLegacyToApplicationMessage = (msg: RpcMessage) => {
  if (!("result" in msg)) return msg
  if (msg.id.startsWith("legacy:getChains:")) {
    return {
      origin: "@substrate/light-client-extension-helper-context-background",
      id: msg.id.replace("legacy:getChains:", ""),
      type: "getChainsResponse",
      chains: msg.result,
    } as LegacyToApplicationMessage
  } else if (msg.id.startsWith("legacy:getChain:")) {
    return {
      origin: "@substrate/light-client-extension-helper-context-background",
      id: msg.id.replace("legacy:getChain:", ""),
      type: "getChainResponse",
      chain: msg.result,
    } as LegacyToApplicationMessage
  }
  return msg
}

//#endregion
