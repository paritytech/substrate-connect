import type {
  Chain as SChain,
  Client,
  ClientOptions,
} from "@substrate/smoldot-light"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
} from "./errors.js"
import { getSpec } from "./specs/index.js"
import type {
  AddChain,
  AddWellKnownChain,
  Chain,
  SubstrateConnector,
} from "./types.js"
import { WellKnownChains } from "../WellKnownChains.js"

let startPromise: Promise<(options: ClientOptions) => Client> | null = null
const getStart = () => {
  if (startPromise) return startPromise
  startPromise = import("@substrate/smoldot-light").then((sm) => sm.start)
  return startPromise
}

let totalActiveChains = 0
let clientPromise: Promise<Client> | null = null
const getClient = (): Promise<Client> => {
  if (clientPromise) return clientPromise
  clientPromise = getStart().then((start) =>
    start({
      forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
      maxLogLevel: 3 /* no debug/trace messages */,
    }),
  )
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
 * Returns a {SubstrateConnector} that connects to chains by executing a light client directly
 * from JavaScript.
 *
 * This is quite expensive in terms of CPU, but it is the only choice the substrate-connect
 * extension is not installed.
 */
export const getConnectorClient = (): SubstrateConnector => {
  const chains = new Map<Chain, SChain>()

  const addChain: AddChain = async (
    chainSpec: string,
    jsonRpcCallback?: (msg: string) => void,
  ): Promise<Chain> => {
    const client = await getClient()

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
          if (--totalActiveChains === 0) {
            clientPromise = null
            client.terminate()
          }
        }
        transformErrors(() => {
          internalChain.remove()
        })
      },
    }

    chains.set(chain, internalChain)
    totalActiveChains++
    return chain
  }

  const addWellKnownChain: AddWellKnownChain = async (
    supposedChain: WellKnownChains,
    jsonRpcCallback?: (msg: string) => void,
  ): Promise<Chain> => {
    // the following line ensures that the http request for the dynamic import
    // of smoldot-light and the request for the dynamic import of the spec
    // happen in parallel
    getClient()

    const spec = await getSpec(supposedChain)
    return await addChain(spec, jsonRpcCallback)
  }
  return { addChain, addWellKnownChain }
}
