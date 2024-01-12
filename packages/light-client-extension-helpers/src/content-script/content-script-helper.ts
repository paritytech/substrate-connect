import type { BackgroundRpcHandlers } from "@/background/types"
import type {
  PostMessage,
  ToBackground,
  ToContent,
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
    msg: ToExtension | ToBackground,
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
      rpc = createRpc<BackgroundRpcHandlers>((message) =>
        port!.postMessage(message),
      )
      port.onMessage.addListener((msg: ToPage | ToContent) => {
        rpc!.handle(msg as any)
        if (
          msg.origin === "substrate-connect-extension" &&
          msg.type === "error"
        )
          chainIds.delete(msg.chainId)
        else if (
          msg.origin === CONTEXT.BACKGROUND &&
          msg.type === "keep-alive-ack"
        )
          return
        postToPage(msg, origin)
      })
      const keepAliveInterval = setInterval(() => {
        if (!port || !rpc) return
        // portPostMessage(port, {
        //   origin: CONTEXT.CONTENT_SCRIPT,
        //   type: "keep-alive",
        // })
        rpc.notify("keepAlive", [])
      }, KEEP_ALIVE_INTERVAL)
      port.onDisconnect.addListener(() => {
        port = undefined
        rpc = undefined
        clearInterval(keepAliveInterval)
        handleExtensionError("Disconnected from extension", origin)
      })
    }

    // FIXME: use better types
    if (!rpc) throw new Error("no rpc")

    await rpc.call("isBackgroundScriptReady", [])

    // TODO: revisit when 2 webpage helper send message with same id
    if (msg.origin === CONTEXT.WEB_PAGE) {
      try {
        switch (msg.type) {
          case "getChain": {
            postToPage(
              {
                origin: CONTEXT.CONTENT_SCRIPT,
                type: "getChainResponse",
                id: msg.id,
                chain: await rpc.call("getChain", [
                  msg.chainSpec,
                  msg.relayChainGenesisHash,
                ]),
              },
              origin,
            )
            break
          }
          case "getChains": {
            postToPage(
              {
                origin: CONTEXT.CONTENT_SCRIPT,
                type: "getChainsResponse",
                id: msg.id,
                chains: await rpc.call("getChains", []),
              },
              origin,
            )
            break
          }
          default: {
            const unrecognizedMsg: never = msg
            console.warn("Unrecognized message", unrecognizedMsg)
            break
          }
        }
      } catch (error) {
        postToPage(
          {
            origin: CONTEXT.CONTENT_SCRIPT,
            type: "error",
            id: msg.id,
            error: error instanceof Error ? error.toString() : "Unknown error",
          },
          origin,
        )
      }

      return
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
  chrome.runtime.onMessage.addListener((msg) => {
    if (!isBackgroundHelperMessage(msg)) return
    if (msg.origin === "substrate-connect-extension" && msg.type === "error")
      chainIds.delete(msg.chainId)
    postToPage(msg, window.origin)
  })
}
