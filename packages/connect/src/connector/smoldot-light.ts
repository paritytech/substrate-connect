/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {
  Chain as SChain,
  Client,
  ClientOptions,
  AlreadyDestroyedError as IAlreadyDestroyedError,
  CrashError as ICrashError,
  JsonRpcDisabledError as IJsonRpcDisabledError,
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

let SdAlreadyDestroyedError: typeof IAlreadyDestroyedError
let SdCrashError: typeof ICrashError
let SdJsonRpcDisabledError: typeof IJsonRpcDisabledError

let startPromise: Promise<(options: ClientOptions) => Client> | null = null
const getStart = () => {
  if (startPromise) return startPromise
  return (startPromise = import("@substrate/smoldot-light").then((sm) => {
    SdJsonRpcDisabledError = sm.JsonRpcDisabledError
    SdCrashError = sm.CrashError
    SdAlreadyDestroyedError = sm.AlreadyDestroyedError
    return sm.start
  }))
}

let totalActiveChains = 0
let clientPromise: Promise<Client> | null = null
const getClient = (): Promise<Client> => {
  if (clientPromise) return clientPromise
  return (clientPromise = getStart().then((start) =>
    start({
      forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
      maxLogLevel: 3 /* no debug/trace messages */,
    }),
  ))
}

const transformErrors = (thunk: () => void) => {
  try {
    thunk()
  } catch (e) {
    if (e instanceof SdJsonRpcDisabledError) throw new JsonRpcDisabledError()
    if (e instanceof SdCrashError) throw new CrashError(e.message)
    if (e instanceof SdAlreadyDestroyedError) throw new AlreadyDestroyedError()
    throw new CrashError(
      e instanceof Error ? e.message : `Unexpected error ${e}`,
    )
  }
}

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
