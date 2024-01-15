import type { PostMessage, ToExtension, ToPage } from "@/protocol"
import {
  CONTEXT,
  createBackgroundClientConnectProvider,
  createIsHelperMessage,
  createRpc,
} from "@/shared"
import type { LightClientProvider, RawChain, WebPageRpcHandlers } from "./types"
import type { BackgroundRpcHandlers } from "@/background/types"

export type * from "./types"

const postToExtension = (message: PostMessage<ToExtension>) =>
  window.postMessage(message, window.origin)

const isHelperMessage = createIsHelperMessage<ToPage>([
  CONTEXT.CONTENT_SCRIPT,
  CONTEXT.BACKGROUND,
  "substrate-connect-extension",
])

const channelIds = new Set<string>()

export const getLightClientProvider = async (
  channelId: string,
): Promise<LightClientProvider> => {
  if (channelIds.has(channelId))
    throw new Error(`channelId "${channelId}" already in use`)
  channelIds.add(channelId)

  const chainsChangeCallbacks: Parameters<
    LightClientProvider["addChainsChangeListener"]
  >[0][] = []
  const handlers: WebPageRpcHandlers = {
    onAddChains(chains) {
      chainsChangeCallbacks.forEach((cb) =>
        cb(
          Object.fromEntries(
            Object.entries(chains).map(([key, { genesisHash, name }]) => [
              key,
              createRawChain(channelId, { genesisHash, name }),
            ]),
          ),
        ),
      )
    },
  }
  const rpc = createRpc<BackgroundRpcHandlers>(
    (msg) =>
      window.postMessage(
        { channelId, msg: { origin: CONTEXT.WEB_PAGE, ...msg } },
        window.origin,
      ),
    handlers,
  )

  window.addEventListener("message", ({ data, source }) => {
    if (source !== window || !data) return
    const { channelId: messageChannelId, msg } = data
    if (messageChannelId !== channelId) return
    if (!isHelperMessage(msg)) return
    // FIXME: isInternalRpcMessage()
    if (msg.origin !== "substrate-connect-extension")
      return rpc.handle(msg as any)
    // FIXME: isSubstrateConnectMessage()
    if (msg.origin === "substrate-connect-extension")
      return rawChainCallbacks.forEach((cb) => cb(msg))

    console.warn("Unhandled message", msg)
  })

  // FIXME: rename isBackgroundScriptReady
  // await rpc.call("isBackgroundScriptReady", [])

  let chains = await rpc.request("getChains", [])
  chainsChangeCallbacks.push((chains_) => (chains = chains_))
  return {
    async getChain(chainSpec, relayChainGenesisHash) {
      const chainInfo = await rpc.request("getChain", [
        chainSpec,
        relayChainGenesisHash,
      ])
      return createRawChain(
        channelId,
        chains[chainInfo.genesisHash]
          ? chainInfo
          : { ...chainInfo, chainSpec, relayChainGenesisHash },
      )
    },
    getChains() {
      return Object.entries(chains).reduce(
        (acc, [key, chain]) => {
          acc[key] = createRawChain(channelId, chain)
          return acc
        },
        {} as Record<string, RawChain>,
      )
    },
    addChainsChangeListener(callback) {
      chainsChangeCallbacks.push(callback)
      return () => removeArrayItem(chainsChangeCallbacks, callback)
    },
  }
}

const rawChainCallbacks: ((
  msg: ToPage & { origin: "substrate-connect-extension" },
) => void)[] = []

const createRawChain = (
  channelId: string,
  {
    name,
    genesisHash,
    chainSpec,
    relayChainGenesisHash,
  }: {
    name: string
    genesisHash: string
    chainSpec?: string
    relayChainGenesisHash?: string
  },
): RawChain => {
  return {
    name,
    genesisHash,
    connect: createBackgroundClientConnectProvider({
      genesisHash,
      chainSpec,
      relayChainGenesisHash,
      postMessage(msg) {
        postToExtension({ channelId, msg })
      },
      addOnMessageListener(cb) {
        rawChainCallbacks.push(cb)
        return () => removeArrayItem(rawChainCallbacks, cb)
      },
    }),
  }
}

const removeArrayItem = <T>(array: T[], item: T) => {
  array.splice(array.indexOf(item), 1)
}
