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
  SmoldotConnect,
} from "./types.js"

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

const chains = new WeakMap<Chain, SChain>()

export const getPublicApi = (options: ClientOptions): SmoldotConnect => {
  let clientPromise: Promise<Client> | null = null
  const getClient = (options: ClientOptions): Promise<Client> => {
    if (clientPromise) return clientPromise
    return (clientPromise = getStart().then((start) => start(options)))
  }

  let refCount = 0
  // export interface ClientOptions {
  const addChain: AddChain = async (
    chainSpec: string,
    jsonRpcCallback?: (msg: string) => void,
    potentialRelayChains: Chain[] = [],
  ): Promise<Chain> => {
    const client = await getClient(options)

    const internalChain = await client.addChain({
      chainSpec,
      potentialRelayChains: potentialRelayChains
        .map((c) => chains.get(c)!)
        .filter(Boolean),
      jsonRpcCallback,
    })

    const chain: Chain = {
      sendJsonRpc: (rpc) => {
        try {
          internalChain.sendJsonRpc(rpc)
        } catch (e) {
          if (e instanceof SdJsonRpcDisabledError)
            throw new JsonRpcDisabledError()
          if (e instanceof SdCrashError) throw new CrashError(e.message)
          if (e instanceof SdAlreadyDestroyedError)
            throw new AlreadyDestroyedError()
          throw e
        }
      },
      remove: () => {
        if (chains.has(chain)) {
          chains.delete(chain)
          if (--refCount === 0) {
            clientPromise!.then((c) => c.terminate())
            clientPromise = null
          }
        }
        try {
          internalChain.remove()
        } catch (e) {
          if (e instanceof SdCrashError) throw new CrashError(e.message)
          if (e instanceof SdAlreadyDestroyedError)
            throw new AlreadyDestroyedError()
          throw e
        }
      },
    }

    chains.set(chain, internalChain)
    refCount++
    return chain
  }

  const addWellKnownChain: AddWellKnownChain = async (
    supposedChain: string,
    jsonRpcCallback?: (msg: string) => void,
  ): Promise<Chain> => {
    // the following line ensures that the http request for the dynamic import
    // of smoldot-light and the request for the dynamic import of the spec
    // happen in parallel
    getClient(options)
    const spec = await getSpec(supposedChain)
    return await addChain(spec, jsonRpcCallback)
  }
  return { addChain, addWellKnownChain }
}
