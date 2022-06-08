import type {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
  Chain,
  JsonRpcCallback,
  ScClient,
} from "./types.js"
import { WellKnownChain } from "../WellKnownChain.js"
import { getSpec } from "./specs/index.js"

type HeaderlessToExtensionGeneric<T extends ToExtension> = T extends {
  origin: "substrate-connect-client"
} & infer V
  ? Omit<V, "chainId">
  : unknown
type HeaderlessToExtension = HeaderlessToExtensionGeneric<ToExtension>

const listeners = new Map<string, (msg: ToApplication) => void>()
if (typeof window === "object") {
  window.addEventListener(
    "message",
    ({ data }: MessageEvent<ToApplication>) => {
      if (data?.origin !== "substrate-connect-extension") return
      listeners.get(data.chainId)?.(data)
    },
  )
}

function getRandomChainId(): string {
  const arr = new BigUint64Array(2)
  // It can only be used from the browser, so this is fine.
  crypto.getRandomValues(arr)
  const result = (arr[1] << BigInt(64)) | arr[0]
  return result.toString(36)
}

/**
 * Returns a {@link ScClient} that connects to chains by asking the substrate-connect extension
 * to do so.
 *
 * This function assumes that the extension is installed and available. It is out of scope of this
 * function to detect whether this is the case.
 * If you try to add a chain without the extension installed, nothing will happen and the
 * `Promise`s will never resolve.
 */
export const createScClient = (): ScClient => {
  const chains = new Map<Chain, string>()

  const internalAddChain = async (
    isWellKnown: boolean,
    chainSpecOrWellKnownName: string,
    jsonRpcCallback?: JsonRpcCallback,
    potentialRelayChainIds = [] as string[],
  ): Promise<Chain> => {
    const chainId = getRandomChainId()

    const createChain = (
      msg: HeaderlessToExtension & {
        type: "add-chain" | "add-well-known-chain"
      },
    ) =>
      new Promise<void>((res, rej) => {
        listeners.set(chainId, (msg) => {
          listeners.delete(chainId)
          if (msg.type === "chain-ready") return res()
          const errMsg =
            msg.type === "error"
              ? msg.errorMessage
              : "Unexpected message from the extension"
          rej(
            new Error(
              "There was an error creating the smoldot chain: " + errMsg,
            ),
          )
        })

        postToExtension({ ...msg, origin: "substrate-connect-client", chainId })
      })

    try {
      await createChain(
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
    } catch (e) {
      if (!isWellKnown) throw e

      const chainSpec = await getSpec(chainSpecOrWellKnownName)
      await createChain({
        type: "add-chain",
        chainSpec,
        potentialRelayChainIds: [],
      })
    }

    const chain: Chain = {
      sendJsonRpc: (jsonRpcMessage) => {
        if (crashError) throw crashError
        if (!chains.has(chain)) throw new AlreadyDestroyedError()
        if (!jsonRpcCallback) throw new JsonRpcDisabledError()
        postToExtension({
          origin: "substrate-connect-client",
          chainId,
          type: "rpc",
          jsonRpcMessage,
        })
      },
      remove: () => {
        if (crashError) throw crashError
        if (!chains.has(chain)) throw new AlreadyDestroyedError()
        listeners.delete(chainId)
        chains.delete(chain)
        postToExtension({
          origin: "substrate-connect-client",
          chainId,
          type: "remove-chain",
        })
      },
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
      name: WellKnownChain,
      jsonRpcCallback?: JsonRpcCallback,
    ) => internalAddChain(true, name, jsonRpcCallback),
  }
}

// Sends a message to the extension. This function primarly exists in order to provide strong
// typing for the message.
function postToExtension(msg: ToExtension) {
  window.postMessage(msg, "*")
}
