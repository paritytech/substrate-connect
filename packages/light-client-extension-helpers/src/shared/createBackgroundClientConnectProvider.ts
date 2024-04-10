import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"
import { getRandomChainId } from "./getRandomChainId"
import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"

type Callback<T> = (value: T) => void
type UnsubscribeFn = () => void

type CreateBackgroundClientConnectProviderOptions = {
  genesisHash: string
  chainSpec?: string
  relayChainGenesisHash?: string
  postMessage: (msg: ToExtension) => void
  addOnMessageListener: (callback: Callback<ToApplication>) => UnsubscribeFn
  addOnDisconnectListener?: (callback: Callback<any>) => UnsubscribeFn
}

export const createBackgroundClientConnectProvider = ({
  genesisHash,
  chainSpec,
  relayChainGenesisHash,
  postMessage,
  addOnMessageListener,
  addOnDisconnectListener,
}: CreateBackgroundClientConnectProviderOptions): JsonRpcProvider =>
  getSyncProvider(async () => {
    const chainId = getRandomChainId()
    await new Promise<void>((resolve, reject) => {
      const removeOnMessageListener = addOnMessageListener((msg) => {
        if (msg?.chainId !== chainId) return
        switch (msg.type) {
          case "chain-ready": {
            resolve()
            break
          }
          case "error": {
            reject(new Error(msg.errorMessage))
            break
          }
          default:
            reject(new Error(`Unrecognized message ${JSON.stringify(msg)}`))
            break
        }
        removeOnMessageListener()
      })
      postMessage(
        chainSpec
          ? {
              origin: "substrate-connect-client",
              type: "add-chain",
              chainId,
              chainSpec,
              potentialRelayChainIds: relayChainGenesisHash
                ? [relayChainGenesisHash]
                : [],
            }
          : {
              origin: "substrate-connect-client",
              type: "add-well-known-chain",
              chainId,
              chainName: genesisHash,
            },
      )
    })
    return (onMessage, onHalt) => {
      const removeOnMessageListener = addOnMessageListener((msg) => {
        if (msg.chainId !== chainId) return
        switch (msg.type) {
          case "rpc": {
            onMessage(msg.jsonRpcMessage)
            break
          }
          case "error": {
            console.error(msg.errorMessage)
            removeListeners()
            onHalt()
            break
          }
          default:
            console.warn(`Unrecognized message ${JSON.stringify(msg)}`)
            break
        }
      })
      const removeOnDisconnectListener = addOnDisconnectListener?.(onHalt)
      const removeListeners = () => {
        removeOnMessageListener()
        removeOnDisconnectListener?.()
      }
      return {
        send(jsonRpcMessage) {
          postMessage({
            origin: "substrate-connect-client",
            type: "rpc",
            chainId,
            jsonRpcMessage,
          })
        },
        disconnect() {
          removeListeners()
          postMessage({
            origin: "substrate-connect-client",
            type: "remove-chain",
            chainId,
          })
        },
      }
    }
  })
