import type { ToExtension } from "@substrate/connect-extension-protocol"
import type { ToApplicationMessage } from "@/protocol"
import type { BackgroundRpcHandlers } from "@/background/types"
import {
  CONTEXT,
  KEEP_ALIVE_INTERVAL,
  PORT,
  Rpc,
  RpcMessage,
  createRpc,
  isRpcMessageWithOrigin,
  isSubstrateConnectToApplicationMessage,
  isSubstrateConnectToExtensionMessage,
} from "@/shared"

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
    window.postMessage(
      { channelId, msg } as ToApplicationMessage,
      window.origin,
    )

  const chainIds = new Set<string>()

  const onProxyMessage = (msg: any) => {
    if (isSubstrateConnectToApplicationMessage(msg) && msg.type === "error")
      chainIds.delete(msg.chainId)

    postToPage({
      ...msg,
      origin: isSubstrateConnectToApplicationMessage(msg)
        ? msg.origin
        : CONTEXT.CONTENT_SCRIPT,
    })
  }
  const onProxyDisconnect = () => {
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
    const { channelId: msgChannelId, msg } = data
    if (channelId !== msgChannelId) return
    if (
      !isRpcMessageWithOrigin(msg, CONTEXT.WEB_PAGE) &&
      !isSubstrateConnectToExtensionMessage(msg)
    )
      return

    await whenActivated

    await getOrCreateInternalRpc()

    getOrCreateExtensionProxy(onProxyMessage, onProxyDisconnect).postMessage(
      msg,
    )

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

  // TODO: update background-helper so this is handled in chrome.runtime.connect.onMessage
  chrome.runtime.onMessage.addListener((msg) => {
    if (isSubstrateConnectToApplicationMessage(msg) && msg.type === "error") {
      chainIds.delete(msg.chainId)
      postToPage(msg)
    }
  })
}

let extensionProxy:
  | { postMessage(msg: RpcMessage | ToExtension): void }
  | undefined
const getOrCreateExtensionProxy = (
  onMessage: (msg: any) => void,
  onDisconnect?: (port: chrome.runtime.Port) => void,
) => {
  if (extensionProxy) return extensionProxy

  const port = chrome.runtime.connect({ name: PORT.WEB_PAGE })
  port.onDisconnect.addListener((port) => {
    extensionProxy = undefined
    onDisconnect?.(port)
  })
  port.onMessage.addListener(onMessage)

  return (extensionProxy = {
    postMessage(msg) {
      port.postMessage(msg)
    },
  })
}

let internalRpc: Promise<Rpc<BackgroundRpcHandlers>> | undefined
const getOrCreateInternalRpc = async () => {
  if (internalRpc) return internalRpc

  internalRpc = new Promise(async (resolve) => {
    const port = chrome.runtime.connect({ name: PORT.CONTENT_SCRIPT })
    const rpc = createRpc<BackgroundRpcHandlers>((msg) => port.postMessage(msg))
    port.onMessage.addListener(rpc.handle)
    const keepAliveInterval = setInterval(
      () => rpc.notify("keepAlive", []),
      KEEP_ALIVE_INTERVAL,
    )
    port.onDisconnect.addListener(() => {
      internalRpc = undefined
      clearInterval(keepAliveInterval)
    })
    await rpc.request("isBackgroundScriptReady", [])
    resolve(rpc)
  })

  return internalRpc
}
