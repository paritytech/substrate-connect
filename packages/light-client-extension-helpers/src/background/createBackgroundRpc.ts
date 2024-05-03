import { ContentScriptRpcSpec } from "@/content-script/types"
import type {
  AddOnAddChainByUserListener,
  BackgroundRpcSpec as BackgroundRpcSpec,
  LightClientPageHelper,
} from "./types"
import { PORT } from "@/shared"
import {
  createRpc,
  RpcError,
  type RpcMethodHandlers,
  type RpcMessage,
  type RpcMethodMiddleware,
} from "@/utils"
import * as storage from "@/storage"
import { WebPageRpcSpec } from "@/web-page/types"

type Context = {
  port: chrome.runtime.Port
  addChainByUserListener?: Parameters<AddOnAddChainByUserListener>[0]
  lightClientPageHelper: LightClientPageHelper
  getChainData: (opts: {
    chainSpec: string
    relayChainGenesisHash?: string
  }) => Promise<{ genesisHash: string; name: string }>
}

const handlers: RpcMethodHandlers<BackgroundRpcSpec, Context> = {
  //#region content-script RPCs
  keepAlive() {},
  async getChain([chainSpec, relayChainGenesisHash], ctx) {
    if (!ctx) throw new Error("no context")

    const tabId = ctx.port.sender?.tab?.id
    if (!tabId) throw new Error("Undefined tabId")

    const chains = await storage.getChains()

    if (relayChainGenesisHash && !chains[relayChainGenesisHash])
      throw new Error(`Unknown relayChainGenesisHash ${relayChainGenesisHash}`)
    const { genesisHash, name } = await ctx.getChainData({
      chainSpec,
      relayChainGenesisHash,
    })

    if (chains[genesisHash]) return chains[genesisHash]

    const chain = {
      genesisHash,
      name,
      chainSpec,
      relayChainGenesisHash,
    }

    await ctx.addChainByUserListener?.(chain, tabId)

    return chain
  },
  getChains() {
    return storage.getChains()
  },
  //#endregion
  //#region ExtensionPage RPCs
  deleteChain([genesisHash], ctx) {
    if (!ctx) throw new Error("no context")
    return ctx.lightClientPageHelper.deleteChain(genesisHash)
  },
  persistChain([chainSpec, relayChainGenesisHash], ctx) {
    if (!ctx) throw new Error("no context")
    return ctx.lightClientPageHelper.persistChain(
      chainSpec,
      relayChainGenesisHash,
    )
  },
  async getActiveConnections([], ctx) {
    if (!ctx) throw new Error("no context")
    return (await ctx.lightClientPageHelper.getActiveConnections()).map(
      ({ tabId, chain: { provider, ...chain } }) => ({
        tabId,
        chain,
      }),
    )
  },
  disconnect([tabId, genesisHash], ctx) {
    if (!ctx) throw new Error("no context")
    return ctx.lightClientPageHelper.disconnect(tabId, genesisHash)
  },
  setBootNodes([genesisHash, bootNodes], ctx) {
    if (!ctx) throw new Error("no context")
    return ctx.lightClientPageHelper.setBootNodes(genesisHash, bootNodes)
  },
  //#endregion
}

type Method = keyof typeof handlers
const ALLOWED_WEB_METHODS: Method[] = ["getChain", "getChains"]
const ALLOWED_CONTENT_SCRIPT_METHODS: Method[] = [
  "getChain",
  "getChains",
  "keepAlive",
]
const allowedMethodsMiddleware: RpcMethodMiddleware<Context> = async (
  next,
  request,
  context,
) => {
  if (!context) throw new Error("no ctx")
  const { port } = context

  if (
    !(
      port.name === PORT.EXTENSION_PAGE ||
      (port.name === PORT.CONTENT_SCRIPT &&
        ALLOWED_CONTENT_SCRIPT_METHODS.includes(request.method as Method)) ||
      (port.name === PORT.WEB_PAGE &&
        ALLOWED_WEB_METHODS.includes(request.method as Method))
    )
  )
    throw new RpcError("Method not found", -32601)
  return next(request, context)
}

export const createBackgroundRpc = (
  sendMessage: (message: RpcMessage) => void,
) =>
  createRpc(sendMessage, handlers, [allowedMethodsMiddleware]).withClient<
    WebPageRpcSpec & ContentScriptRpcSpec
  >()
