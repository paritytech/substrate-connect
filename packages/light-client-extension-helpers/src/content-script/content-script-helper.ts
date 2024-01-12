import type { BackgroundRpcHandlers } from "@/background/types"
import type {
  PostMessage,
  // ToBackground,
  // ToContent,
  ToExtension,
  ToPage,
} from "@/protocol"
import {
  CONTEXT,
  KEEP_ALIVE_INTERVAL,
  PORT,
  createIsHelperMessage,
  createRpc,
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

  const postToPage = (msg: ToPage, targetOrigin: string) => {
    window.postMessage({ channelId, msg } as PostMessage<ToPage>, targetOrigin)
  }

  const validWebPageOrigins = [CONTEXT.WEB_PAGE, "substrate-connect-client"]
  const isWebPageHelperMessage = (msg: any): msg is ToExtension => {
    if (!msg) return false
    if (!validWebPageOrigins.includes(msg?.origin)) return false
    if (!msg?.type && !msg?.id) return false
    return true
  }

  const portPostMessage = (
    port: chrome.runtime.Port,
    // msg: ToExtension | ToBackground,
    msg: ToExtension,
  ) => port.postMessage(msg)

  const chainIds = new Set<string>()
  const handleExtensionError = (errorMessage: string, origin: string) => {
    console.error(errorMessage)
    chainIds.forEach((chainId) =>
      postToPage(
        {
          origin: "substrate-connect-extension",
          chainId,
          type: "error",
          errorMessage,
        },
        origin,
      ),
    )
    chainIds.clear()
  }

  let port: chrome.runtime.Port | undefined
  let rpc: ReturnType<typeof createRpc<BackgroundRpcHandlers>> | undefined
  window.addEventListener("message", async ({ data, source, origin }) => {
    if (source !== window || !data) return
    const { channelId: msgChannelId, msg } = data
    if (channelId !== msgChannelId) return
    if (!isWebPageHelperMessage(msg)) return

    await whenActivated

    if (!port) {
      try {
        port = chrome.runtime.connect({ name: PORT.CONTENT_SCRIPT })
      } catch (error) {
        handleExtensionError("Cannot connect to extension", origin)
        return
      }
      port.onMessage.addListener((msg: ToPage) => {
        if (
          msg.origin === "substrate-connect-extension" &&
          msg.type === "error"
        )
          chainIds.delete(msg.chainId)

        postToPage(
          // @ts-expect-error
          {
            ...msg,
            origin: msg.origin ?? CONTEXT.CONTENT_SCRIPT,
          },
          origin,
        )
      })
      rpc = createRpc<BackgroundRpcHandlers>(
        (message) => port?.postMessage(message),
      )
      const keepAliveInterval = setInterval(() => {
        if (!port || !rpc) return
        rpc.notify("keepAlive", [])
      }, KEEP_ALIVE_INTERVAL)
      port.onDisconnect.addListener(() => {
        port = undefined
        rpc = undefined
        clearInterval(keepAliveInterval)
        handleExtensionError("Disconnected from extension", origin)
      })
    }

    portPostMessage(port, msg)

    if (msg.origin !== "substrate-connect-client") return
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

  const isBackgroundHelperMessage = createIsHelperMessage<ToPage>([
    CONTEXT.BACKGROUND,
    "substrate-connect-extension",
  ])
  // TODO: try to handle in chrome.runtime.connect.onMessage
  chrome.runtime.onMessage.addListener((msg) => {
    if (!isBackgroundHelperMessage(msg)) return
    if (msg.origin === "substrate-connect-extension" && msg.type === "error")
      chainIds.delete(msg.chainId)
    postToPage(msg, window.origin)
  })
}
