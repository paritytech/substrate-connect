import {
  Client as SmoldotClient,
  Chain as SmoldotChain,
  AddChainOptions as SmoldotAddChainOptions,
  AddChainError,
  JsonRpcCallback,
  JsonRpcDisabledError,
  CrashError,
  start as startSmoldotClient,
} from "@substrate/smoldot-light"

import {
  ToExtension,
  ToContentScript,
} from "../background/protocol"

// TODO: implement the chain info updates and database uploads

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

      // In order to be polite, we limit smoldot to 50% CPU consumption.
      cpuRateLimit: 0.5,

      maxLogLevel: 3,
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

    // Given that the chain name is user input, we have no guarantee that it is correct. The
    // extension might report that it doesn't know about this well-known chain.
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
    // Note that `options.jsonRpcCallback` is always defined. Because we override the JSON-RPC
    // callback, it doesn't make sense to give the possibility for the user to disable the
    // JSON-RPC service.

    const userJsonRpcCallback = options.jsonRpcCallback;
    options.jsonRpcCallback = (response: string) => {
      // Do the opposite of what is done when a JSON-RPC request arrives by removing the
      // prefix in front of the response.
      // Because smoldot always sends back correct answers, we can just assume that all the
      // fields are present.
      const parsed = JSON.parse(response);

      // The JSON-RPC message might not contain an id if it is a notification.
      if (parsed.id) {
        // We know that the `id` is always a string, because all the requests that we send are
        // rewritten to use a string `id`.
        const jsonRpcMessageId = parsed.id as string

        if (jsonRpcMessageId.startsWith("extern:")) {
          parsed.id = JSON.parse(jsonRpcMessageId.slice("extern:".length))
          response = JSON.stringify(parsed)
        }
      }

      if (userJsonRpcCallback)
        userJsonRpcCallback(response)
    };

    const smoldotChain = await this.#client.addChain(options);
    const chainId = getRandomChainId();
    const client = this;

    // Given that smoldot has managed to add the chain, it means that the chain spec should
    // successfully parse.
    const chainSpecChainName = JSON.parse(options.chainSpec)!.name as string;

    const chain = {
      sendJsonRpc(rpc: string) {
        // All incoming JSON-RPC requests are modified to add `extern:` in front of their id.
        try {
          const parsed = JSON.parse(rpc);
          parsed.id = 'extern:' + JSON.stringify(parsed.id);
          rpc = JSON.stringify(parsed)
        } finally {
          return smoldotChain.sendJsonRpc(rpc)
        }
      },
      remove() {
        smoldotChain.remove();
        client.#sendPort({ type: 'remove-chain', chainId })
      }
    };

    this.#sendPort({ type: 'add-chain', chainId, chainSpecChainName })
    this.#chains.set(chain, smoldotChain)
    return chain
  }

  async terminate(): Promise<void> {
    await this.#client.terminate()
    this.#port.disconnect()
  }

  // Sends a message to the extension. No response is expected.
  #sendPort(message: ToExtension) {
    this.#port.postMessage(message)
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

// Generate a random string.
function getRandomChainId(): string {
  const arr = new BigUint64Array(2)
  // It can only be used from the browser, so this is fine.
  crypto.getRandomValues(arr)
  const result = (arr[1] << BigInt(64)) | arr[0]
  return result.toString(36)
}
