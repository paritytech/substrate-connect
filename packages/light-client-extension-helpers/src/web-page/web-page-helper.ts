import type { ToExtensionMessage } from "@/protocol"
import {
  CONTEXT,
  createBackgroundClientConnectProvider,
  createRpc,
  isRpcMessageWithOrigin,
  isSubstrateConnectToApplicationMessage,
  type RpcMethodHandlers,
} from "@/shared"
import type { LightClientProvider, RawChain, WebPageRpcSpec } from "./types"
import type { BackgroundRpcSpec } from "@/background/types"
import type { ToApplication } from "@substrate/connect-extension-protocol"

export type * from "./types"

const postToExtension = (message: ToExtensionMessage) =>
  window.postMessage(message, window.origin)

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
  const handlers: RpcMethodHandlers<WebPageRpcSpec> = {
    onAddChains([chains]) {
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
  const rpc = createRpc(
    (msg) =>
      window.postMessage(
        { channelId, msg: { origin: CONTEXT.WEB_PAGE, ...msg } },
        window.origin,
      ),
    handlers,
  ).withClient<BackgroundRpcSpec>()

  window.addEventListener("message", ({ data, source }) => {
    if (source !== window || !data) return
    const { channelId: messageChannelId, msg } = data
    if (messageChannelId !== channelId) return
    if (isRpcMessageWithOrigin(msg, CONTEXT.CONTENT_SCRIPT))
      return rpc.handle(msg)
    if (isSubstrateConnectToApplicationMessage(msg))
      return rawChainCallbacks.forEach((cb) => cb(msg))
  })

  let chains = await rpc.client.getChains()
  chainsChangeCallbacks.push((chains_) => (chains = chains_))
  return {
    async getChain(chainSpec, relayChainGenesisHash) {
      const chainInfo = await rpc.client.getChain(
        chainSpec,
        relayChainGenesisHash,
      )
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

const rawChainCallbacks: ((msg: ToApplication) => void)[] = []

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
