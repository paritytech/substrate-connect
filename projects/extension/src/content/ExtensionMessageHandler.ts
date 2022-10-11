import { ToApplication } from "@substrate/connect-extension-protocol"
import checkMessage from "./checkMessage"

import {
  SmoldotClientWithExtension,
  ChainWithExtension,
} from "./ClientWithExtension"

const EXTENSION_PROVIDER_ORIGIN = "substrate-connect-client"

const sendMessage = (msg: ToApplication): void => {
  window.postMessage(msg, "*")
}

export class ExtensionMessageHandler {
  #clientWithExtension?: SmoldotClientWithExtension
  #globalExtensionMessagesSendPromise: Promise<void>
  #chains: Map<string, ChainWithExtension> = new Map()

  constructor(globalExtensionMessagesSendPromise: Promise<void>) {
    this.#globalExtensionMessagesSendPromise = globalExtensionMessagesSendPromise
  }

  /**
   * connections returns the names of all the ports this `ExtensionMessageRouter`
   * is managing for the app.
   *
   * @returns A list of strings
   */
  get connections(): string[] {
    return [...this.#chains.keys()]
  }

  /** listen starts listening for messages sent by an app.  */
  listen(): void {
    window.addEventListener("message", this.#handleMessage)
  }

  /** stop stops listening for messages sent by apps.  */
  stop(): void {
    window.removeEventListener("message", this.#handleMessage)
  }

  #handleMessage = (msg: MessageEvent): void => {
    const data = msg.data
    if (!data.origin || data.origin !== EXTENSION_PROVIDER_ORIGIN) {
      return
    }

    if (!checkMessage(data)) {
      // probably someone abusing the extension
      console.warn("Malformed message - unrecognised message.type", data)
      return
    }

    if (!this.#clientWithExtension) {
      this.#clientWithExtension = new SmoldotClientWithExtension(this.#globalExtensionMessagesSendPromise)
    }

    // TODO: must handles smoldot crashes

    switch (data.type) {
      case "rpc": {
        const chain = this.#chains.get(data.chainId)

        // If the chainId is invalid, the message is silently discarded, as documented.
        if (!chain) return

        chain.sendJsonRpc(data.jsonRpcMessage)
        break
      }

      case "add-chain":
      case "add-well-known-chain": {
        if (this.#chains.has(data.chainId)) {
          sendMessage({
            origin: "substrate-connect-extension",
            type: "error",
            chainId: data.chainId,
            errorMessage: "ChainId already in use",
          })
          return
        }

        const jsonRpcCallback = (jsonRpcMessage: string) => {
          console.assert(this.#chains.has(data.chainId))
          sendMessage({
            origin: "substrate-connect-extension",
            type: "rpc",
            chainId: data.chainId,
            jsonRpcMessage,
          })
        }

        const potentialRelayChains =
          data.type !== "add-chain"
            ? []
            : data.potentialRelayChainIds
                .filter((c) => this.#chains.has(c))
                .map((c) => this.#chains.get(c)!)

        let createChainPromise
        if (data.type === "add-well-known-chain") {
          createChainPromise = this.#clientWithExtension.addWellKnownChain({
            chainName: data.chainName,
            jsonRpcCallback,
            potentialRelayChains,
          })
        } else {
          createChainPromise = this.#clientWithExtension.addChain({
            chainSpec: data.chainSpec,
            jsonRpcCallback,
            potentialRelayChains,
          })
        }

        createChainPromise.then(
          (chain) => {
            this.#chains.set(data.chainId, chain)
            sendMessage({
              origin: "substrate-connect-extension",
              type: "chain-ready",
              chainId: data.chainId,
            })
          },
          (error) => {
            sendMessage({
              origin: "substrate-connect-extension",
              type: "error",
              chainId: data.chainId,
              errorMessage: error.toString(),
            })
          },
        )

        break
      }

      case "remove-chain": {
        const chain = this.#chains.get(data.chainId)

        // If the chainId is invalid, the message is silently discarded, as documented.
        if (!chain) return

        chain.remove()
        this.#chains.delete(data.chainId)

        break
      }
    }
  }
}
