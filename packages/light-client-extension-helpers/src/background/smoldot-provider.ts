import type { ConnectProvider } from "@polkadot-api/json-rpc-provider"
import type { AddChainOptions, Client } from "smoldot"

type SmoldotProviderOptions =
  | { smoldotClient: Client; addChainOptions: AddChainOptions }
  | {
      smoldotClient: Client
      chainSpec: string
      relayChainSpec?: string
      databaseContent?: string
      relayChainDatabaseContent?: string
    }

export const smoldotProvider = async ({
  smoldotClient,
  ...options
}: SmoldotProviderOptions): Promise<ConnectProvider> => {
  const chain = await smoldotClient.addChain(
    "addChainOptions" in options
      ? options.addChainOptions
      : {
          chainSpec: options.chainSpec,
          disableJsonRpc: false,
          potentialRelayChains: options.relayChainSpec
            ? [
                await smoldotClient.addChain({
                  chainSpec: options.relayChainSpec,
                  disableJsonRpc: true,
                  databaseContent: options.relayChainDatabaseContent,
                }),
              ]
            : [],
          databaseContent: options.databaseContent,
        },
  )
  return (onMessage) => {
    let initialized = false
    return {
      disconnect() {
        try {
          chain.remove()
        } catch (error) {
          console.error("error removing chain", error)
        }
      },
      send(msg: string) {
        if (!initialized) {
          initialized = true
          ;(async () => {
            while (true) {
              let jsonRpcResponse
              try {
                jsonRpcResponse = await chain.nextJsonRpcResponse()
              } catch (_) {
                break
              }

              // `nextJsonRpcResponse` throws an exception if we pass `disableJsonRpc: true` in the
              // config. We pass `disableJsonRpc: true` if `jsonRpcCallback` is undefined. Therefore,
              // this code is never reachable if `jsonRpcCallback` is undefined.
              try {
                onMessage(jsonRpcResponse)
              } catch (error) {
                console.error(
                  "JSON-RPC callback has thrown an exception:",
                  error,
                )
              }
            }
          })()
        }
        chain.sendJsonRpc(msg)
      },
    }
  }
}
