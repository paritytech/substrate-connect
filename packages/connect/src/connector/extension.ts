/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import type { Chain, JsonRpcCallback, SubstrateConnector } from "./types.js"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
} from "./errors.js"
import { WellKnownChains } from "../WellKnownChains.js"

type HeaderlessToExtensionGeneric<T extends ToExtension> = T extends {
  origin: "substrate-connect-client"
} & infer V
  ? Omit<V, "chainId">
  : unknown
type HeaderlessToExtension = HeaderlessToExtensionGeneric<ToExtension>

const listeners = new Map<string, (msg: ToApplication) => void>()
window.addEventListener("message", ({ data }: MessageEvent<ToApplication>) => {
  if (data?.origin !== "substrate-connect-extension") return
  listeners.get(data.chainId)?.(data)
})

function getRandomChainId(): string {
  const arr = new BigUint64Array(2)
  // It can only be used from the browser, so this is fine.
  crypto.getRandomValues(arr)
  const result = (arr[1] << BigInt(64)) | arr[0]
  return result.toString(36)
}

export const getConnectorClient = (): SubstrateConnector => {
  const chains = new Map<Chain, string>()

  const internalAddChain = async (
    isWellKnown: boolean,
    chainSpecOrWellKnownName: string,
    jsonRpcCallback?: JsonRpcCallback,
    potentialRelayChainIds = [] as string[],
  ): Promise<Chain> => {
    const chainId = getRandomChainId()
    const postToExtension = (msg: HeaderlessToExtension) => {
      window.postMessage(
        {
          ...msg,
          origin: "substrate-connect-client",
          chainId,
        },
        "*",
      )
    }

    await new Promise<void>((res, rej) => {
      listeners.set(chainId, (msg) => {
        listeners.delete(chainId)
        if (msg.type === "chain-ready") return res()
        rej(new Error("There was an error creating the smoldot chain."))
      })

      postToExtension(
        isWellKnown
          ? {
              type: "add-well-known-chain",
              chainName: chainSpecOrWellKnownName,
            }
          : {
              type: "add-chain",
              chainSpec: chainSpecOrWellKnownName,
              potentialRelayChainIds,
            },
      )
    })

    const chainFn =
      <Args extends Array<unknown>>(fn: (...args: Args) => void) =>
      (...args: Args) => {
        if (crashError) throw crashError
        if (!chains.has(chain)) throw new AlreadyDestroyedError()
        fn(...args)
      }

    const chain: Chain = {
      sendJsonRpc: chainFn((jsonRpcMessage) => {
        if (!jsonRpcCallback) throw new JsonRpcDisabledError()
        postToExtension({ type: "rpc", jsonRpcMessage })
      }),
      remove: chainFn(() => {
        listeners.delete(chainId)
        chains.delete(chain)
        postToExtension({ type: "remove-chain" })
      }),
    }
    chains.set(chain, chainId)

    let crashError: CrashError | null = null
    listeners.set(chainId, (msg) => {
      if (msg.type !== "rpc" || !jsonRpcCallback) {
        chain.remove()
        crashError = new CrashError(
          msg.type === "error"
            ? msg.errorMessage
            : "Unexpected message received from the Extension",
        )
        return
      }
      jsonRpcCallback(msg.jsonRpcMessage)
    })
    return chain
  }

  return {
    addChain: (chainSpec: string, jsonRpcCallback?: JsonRpcCallback) =>
      internalAddChain(false, chainSpec, jsonRpcCallback, [...chains.values()]),
    addWellKnownChain: (
      name: WellKnownChains,
      jsonRpcCallback?: JsonRpcCallback,
    ) => internalAddChain(true, name, jsonRpcCallback),
  }
}
