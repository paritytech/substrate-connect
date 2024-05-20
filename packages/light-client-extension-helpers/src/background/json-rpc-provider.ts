import type * as smoldot from "../smoldot"

import type { JsonRpcConnection } from "@polkadot-api/json-rpc-provider"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"

export type Client = Pick<smoldot.Client, "addChain">
export type AddChainOptions = smoldot.AddChainOptions

/**
 * Adds a chain to check if the add chain options are valid and then
 * subsequently removes it, so that it is not included in smoldot's internal
 * reference count.
 *
 */
const validateAddChainOptions = async (
  client: Client,
  options: AddChainOptions,
) => {
  const chain = await client.addChain(options)
  try {
    chain.remove()
  } catch (_) {}
}

/**
 * Creates a new JSON RPC provider using a client and options.
 *
 * This provider will automatically re-connect to the chain if the
 * connection is lost.
 *
 * @param client - The client to use for creating the provider.
 * @param options - The options for adding a chain.
 */
export const make = async (client: Client, options: AddChainOptions) => {
  // The chain that is added in this function is removed only to be added
  // again when the provider is created. This doesn't matter from a performance
  // perspective, and is done to keep things simple rather than keep a separate
  // variable to track whether it is the first time the chain is being added.
  await validateAddChainOptions(client, options)

  const provider = getSyncProvider(async () => {
    const chain = await client.addChain(options)

    return (onMessage, onError) => {
      let connected = true
      ;(async () => {
        while (connected) {
          try {
            const message = await chain.nextJsonRpcResponse()
            onMessage(message)
          } catch (_) {
            connected = false
            try {
              onError()
            } catch (_) {}
            break
          }
        }
      })()

      const send: JsonRpcConnection["send"] = (message) => {
        try {
          chain.sendJsonRpc(message)
        } catch (_) {}
      }

      const disconnect: JsonRpcConnection["disconnect"] = () => {
        connected = false
        try {
          chain.remove()
        } catch (_) {}
      }

      return {
        send,
        disconnect,
      }
    }
  })

  return provider
}
