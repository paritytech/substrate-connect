import {
  Client as SmoldotClient,
  Chain as SmoldotChain,
  AddChainOptions as SmoldotAddChainOptions,
  JsonRpcCallback,
  CrashError,
  start as startSmoldotClient,
} from "@substrate/smoldot-light"

import {
  ToExtension,
  ToContentScript,
} from "../background/protocol"

export class SmoldotClientWithExtension {
  #client: SmoldotClient
  #port: chrome.runtime.Port
  #chains: WeakMap<ChainWithExtension, SmoldotChain>

  constructor() {
    this.#chains = new WeakMap()
    this.#port = chrome.runtime.connect()
    this.#client = startSmoldotClient({
      cpuRateLimit: 0.5,
      // TODO: more options
    })
  }

  async addChain(options: { chainSpec: string, jsonRpcCallback: JsonRpcCallback }): Promise<ChainWithExtension> {
    // TODO: other options
    return this.#addChainWithOptions({
      chainSpec: options.chainSpec,
      jsonRpcCallback: options.jsonRpcCallback,
      databaseContent: undefined,
    })
  }

  async addWellKnownChain(options: { chainName: string, jsonRpcCallback: JsonRpcCallback }) {
    const response = await this.#sendPortThenWaitResponse(
      { type: 'get-well-known-chain', chainName: options.chainName },
      (msg: ToContentScript) => {
        if (msg.type === 'get-well-known-chain' && msg.chainName === options.chainName) { return msg }
      }
    );

    // TODO: other options
    return this.#addChainWithOptions({
      chainSpec: response.chainSpec,
      databaseContent: response.databaseContent,
      jsonRpcCallback: options.jsonRpcCallback
    })
  }

  async #addChainWithOptions(options: SmoldotAddChainOptions): Promise<ChainWithExtension> {
    const smoldotChain = await this.#client.addChain(options);

    const chain = {
      sendJsonRpc(rpc: string) {
        return smoldotChain.sendJsonRpc(rpc)
      },
      remove() {
        return smoldotChain.remove();
      }
    };

    this.#chains.set(chain, smoldotChain)
    return chain
  }

  async terminate(): Promise<void> {
    await this.#client.terminate()
    this.#port.disconnect()
  }

  // Sends a message to the extension. The closure passed as parameter then gets passed every
  // single message sent back by the extension. If the message is a response, then the closure
  // must return the message itself, and the function as a whole returns. If the message isn't a
  // response, the closure should return `undefined`.
  async #sendPortThenWaitResponse<T>(
    message: ToExtension,
    responseFilter: (message: ToContentScript) => T | undefined
  ): Promise<T> {
    return new Promise((resolve) => {
      const listener = (msg: ToContentScript) => {
        const filtered = responseFilter(msg);
        if (filtered) {
          resolve(filtered);
          this.#port.onMessage.removeListener(listener);
        }
      };

      this.#port.onMessage.addListener(listener)
      this.#port.postMessage(message)
    })
  }
}

export interface ChainWithExtension {
  sendJsonRpc(rpc: string): void
  remove(): void
}
