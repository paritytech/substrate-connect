import { AddChainError } from "smoldot"
import { loadWellKnownChains } from "./loadWellKnownChains"
import * as environment from "../environment"
import { createScClient, Chain, JsonRpcCallback } from "@substrate/connect"

export type ChainChannel = Chain
export type ChainMultiplex = {
  channel(channelId: string, jsonRpcCallback: JsonRpcCallback): ChainChannel
}

export const createClient = () => {
  const client = createScClient({
    embeddedNodeConfig: {
      // TODO: enable more options
      maxLogLevel: 3,
    },
  })
  const chainReferences = new WeakMap<ChainMultiplex, Chain>()
  return {
    async addChain({
      chainSpec,
      potentialRelayChains,
      databaseContent,
    }: {
      chainSpec: string
      potentialRelayChains?: ChainMultiplex[]
      databaseContent?: string
    }): Promise<ChainMultiplex> {
      const channels: Record<string, JsonRpcCallback> = {}
      const chain = await client.addChain(
        chainSpec,
        (rawMessage) => {
          try {
            const message = JSON.parse(rawMessage)

            for (const [channelId, jsonRpcCallback] of Object.entries(
              channels,
            )) {
              const id = message.id
              // notifications are complex to multiplex so they are forwarded to every channel
              if (!id) {
                jsonRpcCallback(rawMessage)
                continue
              }

              const prefix = `${channelId}:`
              if (!id.startsWith(prefix)) continue

              message.id = id.slice(prefix.length)
              jsonRpcCallback(JSON.stringify(message))
              break
            }
          } catch (error) {
            console.error("JSON-RPC callback has thrown an exception:", error, {
              rawMessage,
            })
          }
        },
        potentialRelayChains?.map((cm) => chainReferences.get(cm)!),
        databaseContent,
      )
      const chainMultiplex = {
        channel(channelId: string, jsonRpcCallback: JsonRpcCallback) {
          if (channels[channelId])
            throw new Error("Requested channelId already in use")
          channels[channelId] = jsonRpcCallback
          return {
            sendJsonRpc(rawMessage: string) {
              // All incoming JSON-RPC requests are modified to add `channel:` in front of their id.
              try {
                const message = JSON.parse(rawMessage)
                message.id = `${channelId}:${message.id}`
                rawMessage = JSON.stringify(message)
              } finally {
                chain.sendJsonRpc(rawMessage)
              }
            },
            remove() {
              delete channels[channelId]
              if (Object.entries(channels).length === 0) {
                chainReferences.delete(chainMultiplex)
                chain.remove()
              }
            },
          }
        },
      }
      chainReferences.set(chainMultiplex, chain)
      return chainMultiplex
    },

    async addWellKnownChain(chainName: string) {
      const chainSpec = (await loadWellKnownChains()).get(chainName)

      // Given that the chain name is user input, we have no guarantee that it is correct. The
      // extension might report that it doesn't know about this well-known chain.
      if (!chainSpec) throw new AddChainError("Unknown well-known chain")

      const databaseContent = await environment.get({
        type: "database",
        chainName,
      })

      return this.addChain({ chainSpec, databaseContent })
    },
  }
}
