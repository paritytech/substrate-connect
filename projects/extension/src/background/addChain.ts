import type { Chain, Client } from "smoldot"
import {
  start,
  QueueFullError,
  JsonRpcDisabledError,
  AlreadyDestroyedError,
  CrashError,
} from "smoldot"

let clientReferences: number = 0
let client: Client | null = null
const getClientAndIncRef = () => {
  if (client) {
    clientReferences++
    return client
  }

  client = start({
    forbidTcp: true, // In order to avoid confusing inconsistencies between browsers and NodeJS, TCP connections are always disabled.
    forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
    maxLogLevel: 3,
    cpuRateLimit: 0.5, // Politely limit the CPU usage of the smoldot background worker.
  })

  clientReferences++
  return client
}

const decRef = () => {
  clientReferences--
  if (clientReferences < 0) throw new Error("Internal error within smoldot")

  if (clientReferences === 0) {
    client?.terminate()
    client = null
  }
}

const transformErrors = (thunk: () => void) => {
  try {
    thunk()
  } catch (e) {
    const error = e as Error | undefined
    if (error?.name === "JsonRpcDisabledError") throw new JsonRpcDisabledError()
    if (error?.name === "CrashError") throw new CrashError(error.message)
    if (error?.name === "AlreadyDestroyedError")
      throw new AlreadyDestroyedError()
    throw new CrashError(
      e instanceof Error ? e.message : `Unexpected error ${e}`,
    )
  }
}

export type ScChain = Pick<Chain, "sendJsonRpc" | "remove"> & {
  addChain: AddChain
}
export type AddChainOptions = Parameters<AddChain>
export type AddChain = (
  chainSpec: string,
  jsonRpcCallback?: (msg: string) => void,
  databaseContent?: string,
) => Promise<ScChain>

const createAddChain =
  (relayChain?: Chain): AddChain =>
  async (chainSpec, jsonRpcCallback, databaseContent) => {
    const client = await getClientAndIncRef()
    try {
      const internalChain = await client.addChain({
        chainSpec,
        disableJsonRpc: jsonRpcCallback === undefined,
        databaseContent,
        potentialRelayChains: relayChain ? [relayChain] : undefined,
      })

      ;(async () => {
        while (true) {
          let jsonRpcResponse
          try {
            jsonRpcResponse = await internalChain.nextJsonRpcResponse()
          } catch (_) {
            break
          }

          // `nextJsonRpcResponse` throws an exception if we pass `disableJsonRpc: true` in the
          // config. We pass `disableJsonRpc: true` if `jsonRpcCallback` is undefined. Therefore,
          // this code is never reachable if `jsonRpcCallback` is undefined.
          try {
            jsonRpcCallback!(jsonRpcResponse)
          } catch (error) {
            console.error("JSON-RPC callback has thrown an exception:", error)
          }
        }
      })()

      const chain: ScChain = {
        sendJsonRpc: (rpc: string) => {
          transformErrors(() => {
            try {
              internalChain.sendJsonRpc(rpc)
            } catch (error) {
              if (error instanceof QueueFullError) {
                // If the queue is full, we immediately send back a JSON-RPC response indicating
                // the error.
                try {
                  const parsedRq = JSON.parse(rpc)
                  jsonRpcCallback!(
                    JSON.stringify({
                      jsonrpc: "v2",
                      id: parsedRq.id,
                      error: {
                        code: -32000,
                        message: "JSON-RPC server is too busy",
                      },
                    }),
                  )
                } catch (_error) {
                  // An error here counts as a malformed JSON-RPC request, which are ignored.
                }
              } else {
                throw error
              }
            }
          })
        },
        remove: () => {
          try {
            transformErrors(() => {
              internalChain.remove()
            })
          } finally {
            decRef()
          }
        },
        addChain: createAddChain(internalChain),
      }

      return chain
    } catch (error) {
      decRef()
      throw error
    }
  }

export const addChain = createAddChain()
