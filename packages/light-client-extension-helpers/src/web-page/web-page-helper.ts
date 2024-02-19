import type {
  PostMessage,
  ToExtension,
  ToExtensionRequest,
  ToPage,
  ToPageResponse,
} from "@/protocol"
import {
  CONTEXT,
  createBackgroundClientConnectProvider,
  createIsHelperMessage,
} from "@/shared"
import type { LightClientProvider, RawChain } from "./types"

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
  const chainsChangeCallbacks: Parameters<
    LightClientProvider["addChainsChangeListener"]
  >[0][] = []
  if (channelIds.has(channelId))
    throw new Error(`channelId "${channelId}" already in use`)
  channelIds.add(channelId)

  const pendingRequests: Record<
    string,
    { resolve(result: any): void; reject(error: string): void }
  > = {}

  window.addEventListener("message", ({ data, source }) => {
    if (source !== window || !data) return
    const { channelId: messageChannelId, msg } = data
    if (messageChannelId !== channelId) return
    if (!isHelperMessage(msg)) return
    if (msg.origin === "substrate-connect-extension")
      return rawChainCallbacks.forEach((cb) => cb(msg))
    if (msg.origin === CONTEXT.CONTENT_SCRIPT) {
      const pendingRequest = pendingRequests[msg.id]
      if (!pendingRequest) return console.warn("Unhandled response", msg)
      msg.type === "error"
        ? pendingRequest.reject(msg.error)
        : pendingRequest.resolve(msg)
      delete pendingRequests[msg.id]
      return
    }
    if (msg.origin === CONTEXT.BACKGROUND && msg.type === "onAddChains")
      return chainsChangeCallbacks.forEach((cb) =>
        cb(
          Object.fromEntries(
            Object.entries(msg.chains).map(([key, { genesisHash, name }]) => [
              key,
              createRawChain(channelId, { genesisHash, name }),
            ]),
          ),
        ),
      )

    console.warn("Unhandled message", msg)
  })

  const requestReply = <
    TReq extends ToExtensionRequest,
    TRes extends ToPageResponse & {
      type: `${TReq["type"]}Response`
    },
  >(
    channelId: string,
    msg: TReq,
  ): Promise<TRes> => {
    const promise = new Promise<TRes>((resolve, reject) => {
      pendingRequests[msg.id] = { resolve, reject }
    })
    postToExtension({ channelId, msg })
    return promise
  }

  // FIXME: improve id generation, random-id?
  const nextId = (
    (initialId) => () =>
      "" + initialId++
  )(0)

  let { chains } = await requestReply(channelId, {
    origin: CONTEXT.WEB_PAGE,
    id: nextId(),
    type: "getChains",
  })
  chainsChangeCallbacks.push((chains_) => (chains = chains_))
  return {
    async getChain(chainSpec, relayChainGenesisHash) {
      const { chain: chainInfo } = await requestReply(channelId, {
        origin: CONTEXT.WEB_PAGE,
        id: nextId(),
        type: "getChain",
        chainSpec,
        relayChainGenesisHash,
      })
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
