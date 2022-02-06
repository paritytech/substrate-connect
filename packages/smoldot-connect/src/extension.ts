/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import type {
  AddChain,
  AddWellKnownChain,
  Chain,
  JsonRpcCallback,
} from "./types.js"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
} from "./errors.js"

export type HeaderlessToExtension<T extends ToExtension> = T extends {
  origin: "substrate-connect-client"
} & infer V
  ? Omit<V, "chainId">
  : unknown

const listeners = new Map<string, (msg: ToApplication) => void>()
window.addEventListener("message", ({ data }: MessageEvent<ToApplication>) => {
  if (data?.origin !== "substrate-connect-extension") return
  listeners.get(data.chainId)?.(data)
})

const listenToExtension = (
  chainId: string,
  callback: (msg: ToApplication) => void,
): (() => void) => {
  listeners.set(chainId, callback)
  return () => {
    listeners.delete(chainId)
  }
}

function getRandomChainId(): string {
  const arr = new BigUint64Array(2)
  // It can only be used from the browser, so this is fine.
  crypto.getRandomValues(arr)
  const result = (arr[1] << BigInt(64)) | arr[0]
  return result.toString(36)
}

const activeChains = new WeakMap<Chain, string>()

const internalAddChain = async (
  isWellKnown: boolean,
  chainSpecOrWellKnownName: string,
  jsonRpcCallback?: JsonRpcCallback,
  potentialRelayChains = [] as Chain[],
): Promise<Chain> => {
  const chainId = getRandomChainId()
  const postToExtension = (msg: HeaderlessToExtension<ToExtension>) => {
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
    const stopListening = listenToExtension(chainId, (msg) => {
      stopListening()
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
            potentialRelayChainIds: potentialRelayChains
              .map((chain) => activeChains.get(chain)!)
              .filter(Boolean),
          },
    )
  })

  const chainFn =
    <Args extends Array<unknown>>(fn: (...args: Args) => void) =>
    (...args: Args) => {
      if (crashError) throw crashError
      if (!activeChains.has(chain)) throw new AlreadyDestroyedError()
      fn(...args)
    }

  const chain: Chain = {
    sendJsonRpc: chainFn((jsonRpcMessage) => {
      if (!jsonRpcCallback) throw new JsonRpcDisabledError()
      postToExtension({ type: "rpc", jsonRpcMessage })
    }),
    remove: chainFn(() => {
      activeChains.delete(chain)
      listener()
      postToExtension({ type: "remove-chain" })
    }),
  }
  activeChains.set(chain, chainId)

  let crashError: CrashError | null = null
  const listener = listenToExtension(chainId, (msg) => {
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

export const addChain: AddChain = (
  chainSpec: string,
  jsonRpcCallback?: JsonRpcCallback,
  potentialRelayChains?: Chain[],
) => internalAddChain(false, chainSpec, jsonRpcCallback, potentialRelayChains)

export const addWellKnownChain: AddWellKnownChain = (
  name: string,
  jsonRpcCallback?: JsonRpcCallback,
) => internalAddChain(true, name, jsonRpcCallback)
