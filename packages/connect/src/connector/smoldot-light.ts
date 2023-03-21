import {
  Chain as SChain,
  Client,
  ClientOptions,
  MalformedJsonRpcError,
  QueueFullError,
} from "smoldot"
import { getSpec } from "./specs/index.js"
import {
  AddChain,
  AddWellKnownChain,
  Chain,
  ScClient,
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
} from "./types.js"
import { WellKnownChain } from "../WellKnownChain.js"

let startPromise: Promise<(options: ClientOptions) => Client> | null = null
const getStart = () => {
  if (startPromise) return startPromise
  startPromise = import("smoldot").then((sm) => sm.start)
  return startPromise
}

const clientReferences: Config[] = [] // Note that this can't be a set, as the same config is added/removed multiple times
let clientPromise: Promise<Client> | Client | null = null
let clientReferencesMaxLogLevel = 3
const getClientAndIncRef = (config: Config): Promise<Client> => {
  if (config.maxLogLevel && config.maxLogLevel > clientReferencesMaxLogLevel)
    clientReferencesMaxLogLevel = config.maxLogLevel

  if (clientPromise) {
    clientReferences.push(config)
    if (clientPromise instanceof Promise) return clientPromise
    else return Promise.resolve(clientPromise)
  }

  const newClientPromise = getStart().then((start) =>
    start({
      forbidTcp: true, // In order to avoid confusing inconsistencies between browsers and NodeJS, TCP connections are always disabled.
      forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
      maxLogLevel: 9999999, // The actual level filtering is done in the logCallback
      cpuRateLimit: 0.5, // Politely limit the CPU usage of the smoldot background worker.
      logCallback: (level, target, message) => {
        if (level > clientReferencesMaxLogLevel) return

        // The first parameter of the methods of `console` has some printf-like substitution
        // capabilities. We don't really need to use this, but not using it means that the logs
        // might not get printed correctly if they contain `%`.
        if (level <= 1) {
          console.error("[%s] %s", target, message)
        } else if (level === 2) {
          console.warn("[%s] %s", target, message)
        } else if (level === 3) {
          console.info("[%s] %s", target, message)
        } else if (level === 4) {
          console.debug("[%s] %s", target, message)
        } else {
          console.trace("[%s] %s", target, message)
        }
      },
    }),
  )

  clientPromise = newClientPromise

  newClientPromise.then((client) => {
    // Make sure that the client we have just created is still desired
    if (clientPromise === newClientPromise) clientPromise = client
    else client.terminate()
    // Note that if clientPromise != newClientPromise we know for sure that the client that we
    // return isn't going to be used. We would rather not return a terminated client, but this
    // isn't possible for type check reasons.
    return client
  })

  clientReferences.push(config)
  return clientPromise
}

// Must be passed the exact same object as was passed to {getClientAndIncRef}
const decRef = (config: Config) => {
  const idx = clientReferences.indexOf(config)
  if (idx === -1) throw new Error("Internal error within smoldot")
  clientReferences.splice(idx, 1)

  // Update `clientReferencesMaxLogLevel`
  // Note how it is set back to 3 if there is no reference anymore
  clientReferencesMaxLogLevel = 3
  for (const cfg of clientReferences.values()) {
    if (cfg.maxLogLevel && cfg.maxLogLevel > clientReferencesMaxLogLevel)
      clientReferencesMaxLogLevel = cfg.maxLogLevel
  }

  if (clientReferences.length === 0) {
    if (clientPromise && !(clientPromise instanceof Promise))
      clientPromise.terminate()
    clientPromise = null
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

/**
 * Configuration that can be passed to {createScClient}.
 */
export interface Config {
  /**
   * The client prints logs in the console. By default, only log levels 1, 2, and 3 (corresponding
   * respectively to ERROR, WARN, and INFO) are printed.
   *
   * In order to more easily debug problems, you can pass 4 (DEBUG) or more.
   *
   * This setting is only taken into account between the moment when you use this chain to add a
   * chain for the first time, and the moment when all the chains that you have added have been
   * removed.
   *
   * If {createScClient} is called multiple times with multiple different log levels, the highest
   * value will be used.
   */
  maxLogLevel?: number
}

/**
 * Returns a {ScClient} that connects to chains by executing a light client directly
 * from JavaScript.
 *
 * This is quite expensive in terms of CPU, but it is the only choice when the substrate-connect
 * extension is not installed.
 */
export const createScClient = (config?: Config): ScClient => {
  const configOrDefault = config || { maxLogLevel: 3 }

  const chains = new Map<Chain, SChain>()

  const addChain: AddChain = async (
    chainSpec: string,
    jsonRpcCallback?: (msg: string) => void,
  ): Promise<Chain> => {
    const client = await getClientAndIncRef(configOrDefault)

    try {
      const internalChain = await client.addChain({
        chainSpec,
        potentialRelayChains: [...chains.values()],
        disableJsonRpc: jsonRpcCallback === undefined,
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

      const chain: Chain = {
        sendJsonRpc: (rpc) => {
          transformErrors(() => {
            try {
              internalChain.sendJsonRpc(rpc)
            } catch (error) {
              if (error instanceof MalformedJsonRpcError) {
                // In order to expose the same behavior as the extension client, we silently
                // discard malformed JSON-RPC requests.
                return
              } else if (error instanceof QueueFullError) {
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
            chains.delete(chain)
            decRef(configOrDefault)
          }
        },
      }

      chains.set(chain, internalChain)
      return chain
    } catch (error) {
      decRef(configOrDefault)
      throw error
    }
  }

  const addWellKnownChain: AddWellKnownChain = async (
    supposedChain: WellKnownChain,
    jsonRpcCallback?: (msg: string) => void,
  ): Promise<Chain> => {
    // the following line ensures that the http request for the dynamic import
    // of smoldot and the request for the dynamic import of the spec
    // happen in parallel
    getClientAndIncRef(configOrDefault)

    try {
      const spec = getSpec(supposedChain)
      return await addChain(spec, jsonRpcCallback)
    } finally {
      decRef(configOrDefault)
    }
  }
  return { addChain, addWellKnownChain }
}
