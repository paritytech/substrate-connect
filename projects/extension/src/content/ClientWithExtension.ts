import {
  Client as SmoldotClient,
  Chain as SmoldotChain,
  AddChainOptions as SmoldotAddChainOptions,
  AddChainError,
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
      // Because we are in the context of a web page, trying to open TCP connections or non-secure
      // WebSocket connections to addresses other than localhost will lead to errors. As such, we
      // disable these types of connections ahead of time.
      forbidTcp: true,
      forbidNonLocalWs: true,

      cpuRateLimit: 0.5,

      maxLogLevel: 3, // TODO:
      logCallback: (level, target, message) => {
        // These logs are shown directly in the web page's console.
        // The first parameter of the methods of `console` has some printf-like substitution
        // capabilities. We don't really need to use this, but not using it means that the logs
        // might not get printed correctly if they contain `%`.
        if (level <= 1) {
          console.error("[substrate-connect-extension] [%s] %s", target, message);
        } else if (level == 2) {
          console.warn("[substrate-connect-extension] [%s] %s", target, message);
        } else if (level == 3) {
          console.info("[substrate-connect-extension] [%s] %s", target, message);
        } else if (level == 4) {
          console.debug("[substrate-connect-extension] [%s] %s", target, message);
        } else {
          console.trace("[substrate-connect-extension] [%s] %s", target, message);
        }
      }
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

    if (!response.found)
      throw new AddChainError("Couldn't find well-known chain");

    // TODO: other options
    return this.#addChainWithOptions({
      chainSpec: response.found.chainSpec,
      databaseContent: response.found.databaseContent,
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
