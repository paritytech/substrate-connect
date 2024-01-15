import {
  PORT,
  createBackgroundClientConnectProvider,
  createRpc,
} from "@/shared"
import * as storage from "@/storage"
import type { LightClientPageHelper } from "./types"
import type { BackgroundRpcHandlers } from "@/background/types"

export type * from "./types"

// FIXME: re-connect?
const port = chrome.runtime.connect({ name: PORT.EXTENSION_PAGE })
const rpc = createRpc<BackgroundRpcHandlers>((msg) => port.postMessage(msg))
port.onMessage.addListener(rpc.handle)

export const helper: LightClientPageHelper = {
  async deleteChain(genesisHash) {
    await rpc.request("deleteChain", [genesisHash])
  },
  async persistChain(chainSpec, relayChainGenesisHash) {
    await rpc.request("persistChain", [chainSpec, relayChainGenesisHash])
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
    const connections = await rpc.request("getActiveConnections", [])
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
    await rpc.request("disconnect", [tabId, genesisHash])
  },
  async setBootNodes(genesisHash, bootNodes) {
    await rpc.request("setBootNodes", [genesisHash, bootNodes])
  },
}
