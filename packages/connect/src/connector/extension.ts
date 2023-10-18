import type {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
  type Chain,
  type JsonRpcCallback,
  type ScClient,
} from "./types.js"
import { WellKnownChain } from "../WellKnownChain.js"
import { getSpec } from "./specs/index.js"

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
  const result = (arr[1]! << BigInt(64)) | arr[0]!
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
    type ChainState =
      | {
          state: "pending"
          waitFinished: () => void
        }
      | {
          state: "ok"
        }
      | { state: "dead"; error: AlreadyDestroyedError | CrashError }

    let resolve: undefined | (() => void)
    const initFinished = new Promise((res) => {
      resolve = () => res(null)
    })
    const chainState: { id: string; state: ChainState } = {
      id: getRandomChainId(),
      state: {
        state: "pending",
        waitFinished: resolve!,
      },
    }

    if (listeners.has(chainState.id))
      throw new Error(
        "Unexpectedly randomly generated the same chain ID twice despite 64bits of entropy",
      )

    // Setup the listener for this chain.
    // This listener should never be removed until we are no longer interested in this chain.
    // Removing then re-adding the listener could cause messages to be missed.
    listeners.set(chainState.id, (msg) => {
      switch (chainState.state.state) {
        case "pending": {
          const waitFinished = chainState.state.waitFinished
          switch (msg.type) {
            case "chain-ready": {
              chainState.state = {
                state: "ok",
              }
              break
            }
            case "error": {
              chainState.state = {
                state: "dead",
                error: new CrashError(
                  "Error while creating the chain: " + msg.errorMessage,
                ),
              }
              break
            }
            default: {
              // Unexpected message. We ignore it.
              // While it could be tempting to switch the chain to `dead`, the extension might
              // think that the chain is still alive, and the state mismatch could have
              // unpredictable and confusing consequences.
              console.warn(
                "Unexpected message of type `msg.type` received from substrate-connect extension",
              )
            }
          }
          waitFinished()
          break
        }
        case "ok": {
          switch (msg.type) {
            case "error": {
              chainState.state = {
                state: "dead",
                error: new CrashError(
                  "Extension has killed the chain: " + msg.errorMessage,
                ),
              }
              break
            }
            case "rpc": {
              if (jsonRpcCallback) {
                jsonRpcCallback(msg.jsonRpcMessage)
              } else {
                console.warn(
                  "Unexpected message of type `msg.type` received from substrate-connect extension",
                )
              }
              break
            }
            default: {
              // Unexpected message. We ignore it.
              // While it could be tempting to switch the chain to `dead`, the extension might
              // think that the chain is still alive, and the state mismatch could have
              // unpredictable and confusing consequences.
              console.warn(
                "Unexpected message of type `msg.type` received from substrate-connect extension",
              )
            }
          }
          break
        }
        case "dead": {
          // We don't expect any message anymore.
          break
        }
      }
    })

    // Now that everything is ready to receive messages back from the extension, send the
    // add-chain message.
    if (isWellKnown) {
      postToExtension({
        origin: "substrate-connect-client",
        chainId: chainState.id,
        type: "add-well-known-chain",
        chainName: chainSpecOrWellKnownName,
      })
    } else {
      postToExtension({
        origin: "substrate-connect-client",
        chainId: chainState.id,
        type: "add-chain",
        chainSpec: chainSpecOrWellKnownName,
        potentialRelayChainIds,
      })
    }

    // Wait for the extension to send back either a confirmation or an error.
    // Note that `initFinished` becomes ready when `chainState` has been modified. The outcome
    // can be known by looking into `chainState`.
    await initFinished

    // In the situation where we tried to create a well-known chain, the extension isn't supposed
    // to ever return an error. There is however one situation where errors can happen: if the
    // extension doesn't recognize the desired well-known chain because it uses a different list
    // of well-known chains than this code. To handle this, we download the chain spec of the
    // desired well-known chain and try again but this time as a non-well-known chain.
    if (isWellKnown && chainState.state.state === "dead") {
      // Note that we keep the same id for the chain for convenience.
      let resolve: undefined | (() => void)
      const initFinished = new Promise((res) => {
        resolve = () => res(null)
      })
      chainState.state = {
        state: "pending",
        waitFinished: resolve!,
      }

      postToExtension({
        origin: "substrate-connect-client",
        chainId: chainState.id,
        type: "add-chain",
        chainSpec: await getSpec(chainSpecOrWellKnownName),
        potentialRelayChainIds: [],
      })

      await initFinished
    }

    // Now check the `chainState` to know if things have succeeded.
    if (chainState.state.state === "dead") {
      throw chainState.state.error
    }

    // Everything is successful.
    const chain: Chain = {
      sendJsonRpc: (jsonRpcMessage) => {
        if (chainState.state.state === "dead") {
          throw chainState.state.error
        }

        if (!jsonRpcCallback) throw new JsonRpcDisabledError()
        postToExtension({
          origin: "substrate-connect-client",
          chainId: chainState.id,
          type: "rpc",
          jsonRpcMessage,
        })
      },
      remove: () => {
        if (chainState.state.state === "dead") {
          throw chainState.state.error
        }

        chainState.state = {
          state: "dead",
          error: new AlreadyDestroyedError(),
        }

        listeners.delete(chainState.id)
        chains.delete(chain)

        postToExtension({
          origin: "substrate-connect-client",
          chainId: chainState.id,
          type: "remove-chain",
        })
      },
    }

    // This mapping of chains is kept just for the `potentialRelayChainIds` field.
    chains.set(chain, chainState.id)

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
