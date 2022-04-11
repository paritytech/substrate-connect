import type {
  Chain as SChain,
  Client,
  ClientOptions,
  LogCallback
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

/**
 *  Options to be passed to smoldot before starting the light client
 */
export interface ScOptions {
  /* Corresponds to the {@link https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/javascript/src/client.ts | Smoldot maxLogLevel}
   * Numbers higher than this value will not be passed to the {@link logCallback{.
   *
   * @remarks
   * 1 = error, 2 = warn, 3 = info, 4 = debug, 5 = trace
   */
  maxLogLevel: number,
  /* Corresponds to the {@link https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/javascript/src/client.ts | Smoldot logCallback} */
  logCallback?: LogCallback
}

const defaultOptions: ScOptions = {
  maxLogLevel: 4, /* log everything except trace level */
  logCallback: undefined
};

const otherSmoldotOptions: ClientOptions = {
  forbidTcp: true, // In order to avoid confusing inconsistencies between browsers and NodeJS, TCP connections are always disabled.
  forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
};


let clientNumReferences = 0
let clientPromise: Promise<Client> | null = null
const getClientAndIncRef = (clientOptions = defaultOptions): Promise<Client> => {
  const finalOptions: ClientOptions = Object.assign({}, otherSmoldotOptions, clientOptions);

  if (clientPromise) {
    clientNumReferences += 1
    return clientPromise
  }

  clientPromise = getStart().then((start) =>
    start(finalOptions),
  )
  clientNumReferences += 1
  return clientPromise
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
 * Returns a {ScClient} that connects to chains by executing a light client directly
 * from JavaScript.
 *
 * This is quite expensive in terms of CPU, but it is the only choice when the substrate-connect
 * extension is not installed.
 */
export const createScClient = (clientOptions = defaultOptions): ScClient => {
  const chains = new Map<Chain, SChain>()

  const addChain: AddChain = async (
    chainSpec: string,
    jsonRpcCallback?: (msg: string) => void,
  ): Promise<Chain> => {
    const client = await getClientAndIncRef(clientOptions)

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
          if (chains.has(chain)) {
            chains.delete(chain)
            if (--clientNumReferences === 0) {
              clientPromise = null
              client.terminate()
              return
            }
          }
          transformErrors(() => {
            internalChain.remove()
          })
        },
      }

      chains.set(chain, internalChain)
      return chain
    } catch (error) {
      if (--clientNumReferences === 0) {
        clientPromise = null
        client.terminate()
      }
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
    getClientAndIncRef()

    try {
      const spec = await getSpec(supposedChain)
      return await addChain(spec, jsonRpcCallback)
    } finally {
      if (--clientNumReferences === 0) {
        clientPromise?.then((client) => client.terminate())
        clientPromise = null
      }
    }
  }
  return { addChain, addWellKnownChain }
}
