import type {
  Chain as SChain,
  Client,
  ClientOptions,
} from "@substrate/smoldot-light"
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
  startPromise = import("@substrate/smoldot-light").then((sm) => sm.start)
  return startPromise
}

const clientReferences: Set<Config> = new Set()
let clientPromise: Promise<Client> | null = null
let clientReferencesMaxLogLevel = 3;
const getClientAndIncRef = (config: Config): Promise<Client> => {
  if (config.maxLogLevel > clientReferencesMaxLogLevel)
    clientReferencesMaxLogLevel = config.maxLogLevel;

  if (clientPromise) {
    clientReferences.add(config)
    return clientPromise
  }

  clientPromise = getStart().then((start) =>
    start({
      forbidTcp: true, // In order to avoid confusing inconsistencies between browsers and NodeJS, TCP connections are always disabled.
      forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
      maxLogLevel: 9999999, // The actual level filtering is done in the logCallback
      cpuRateLimit: 0.5, // Politely limit the CPU usage of the smoldot background worker.
      logCallback: (level, target, message) => {
        if (level > clientReferencesMaxLogLevel)
          return;

        // The first parameter of the methods of `console` has some printf-like substitution
        // capabilities. We don't really need to use this, but not using it means that the logs
        // might not get printed correctly if they contain `%`.
        if (level <= 1) {
          console.error("[%s] %s", target, message);
        } else if (level == 2) {
          console.warn("[%s] %s", target, message);
        } else if (level == 3) {
          console.info("[%s] %s", target, message);
        } else if (level == 4) {
          console.debug("[%s] %s", target, message);
        } else {
          console.trace("[%s] %s", target, message);
        }
      }
    }),
  )
  clientReferences.add(config)
  return clientPromise
}

// Must be passed the exact same object as was passed to {getClientAndIncRef}
const decRef = (config: Config) => {
  clientReferences.delete(config);

  // Update `clientReferencesMaxLogLevel`
  clientReferencesMaxLogLevel = 3;
  for (const cfg of clientReferences.values()) {
    if (cfg.maxLogLevel > clientReferencesMaxLogLevel)
      clientReferencesMaxLogLevel = cfg.maxLogLevel
  }

  if (clientReferences.size === 0) {
    if (clientPromise) clientPromise.then((client) => client.terminate())
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
  maxLogLevel: number
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
        jsonRpcCallback,
      })

      const chain: Chain = {
        sendJsonRpc: (rpc) => {
          transformErrors(() => {
            internalChain.sendJsonRpc(rpc)
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
    // of smoldot-light and the request for the dynamic import of the spec
    // happen in parallel
    getClientAndIncRef(configOrDefault)

    try {
      const spec = await getSpec(supposedChain)
      return await addChain(spec, jsonRpcCallback)
    } finally {
      decRef(configOrDefault)
    }
  }
  return { addChain, addWellKnownChain }
}
