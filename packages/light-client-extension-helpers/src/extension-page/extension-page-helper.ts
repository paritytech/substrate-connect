import { PORT, createBackgroundClientConnectProvider } from "../shared/index.js"
import { createRpc } from "../utils/index.js"
import * as storage from "../storage/index.js"
import type { LightClientPageHelper } from "./types.js"
import type { BackgroundRpcSpec } from "../background/types.js"

export type * from "./types.js"

// FIXME: re-connect?
const port = chrome.runtime.connect({ name: PORT.EXTENSION_PAGE })
const rpc = createRpc((msg) =>
  port.postMessage(msg),
).withClient<BackgroundRpcSpec>()
port.onMessage.addListener(rpc.handle)

export const helper: LightClientPageHelper = {
  async deleteChain(genesisHash) {
    await rpc.client.deleteChain(genesisHash)
  },
  async persistChain(chainSpec, relayChainGenesisHash) {
    await rpc.client.persistChain(chainSpec, relayChainGenesisHash)
  },
  async getChain(genesisHash) {
    return this.getChains()
      .then((chains) =>
        chains.find((chain) => chain.genesisHash === genesisHash),
      )
      .then((chain) => chain ?? null)
  },
  async getChains() {
    return Promise.all(
      Object.entries(await storage.getChains()).map(
        async ([genesisHash, chain]) => ({
          ...chain,
          bootNodes:
            (await storage.get({ type: "bootNodes", genesisHash })) ??
            (JSON.parse(chain.chainSpec).bootNodes as string[]),
          provider: createBackgroundClientConnectProvider({
            genesisHash,
            postMessage(msg) {
              port.postMessage(msg)
            },
            addOnMessageListener(cb) {
              port.onMessage.addListener(cb)
              return () => port.onMessage.removeListener(cb)
            },
            addOnDisconnectListener(cb) {
              port.onDisconnect.addListener(cb)
              return () => port.onDisconnect.removeListener(cb)
            },
          }),
        }),
      ),
    )
  },
  async getActiveConnections() {
    const connections = await rpc.client.getActiveConnections()
    return connections.map(({ tabId, chain }) => ({
      tabId,
      chain: {
        ...chain,
        provider: createBackgroundClientConnectProvider({
          genesisHash: chain.genesisHash,
          chainSpec: chain.chainSpec,
          relayChainGenesisHash: chain.relayChainGenesisHash,
          postMessage(msg) {
            port.postMessage(msg)
          },
          addOnMessageListener(cb) {
            port.onMessage.addListener(cb)
            return () => port.onMessage.removeListener(cb)
          },
          addOnDisconnectListener(cb) {
            port.onDisconnect.addListener(cb)
            return () => port.onDisconnect.removeListener(cb)
          },
        }),
      },
    }))
  },
  async disconnect(tabId: number, genesisHash: string) {
    await rpc.client.disconnect(tabId, genesisHash)
  },
  async setBootNodes(genesisHash, bootNodes) {
    await rpc.client.setBootNodes(genesisHash, bootNodes)
  },
}
