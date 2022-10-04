import {
  Client as SmoldotClient,
  Chain as SmoldotChain,
  AddChainOptions as SmoldotAddChainOptions,
  AddChainError,
  JsonRpcCallback,
  start as startSmoldotClient,
} from "@substrate/smoldot-light"

import { ToExtension, ToContentScript } from "../background/protocol"

export class SmoldotClientWithExtension {
  #client: SmoldotClient
  #port: chrome.runtime.Port
  #chains: Map<
    ChainWithExtension,
    { inner: SmoldotChain; wellKnownName?: string }
  >
  #nextRpcRqId: number

  constructor() {
    this.#nextRpcRqId = 0
    this.#chains = new Map()
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
          console.error(
            "[substrate-connect-extension] [%s] %s",
            target,
            message,
          )
        } else if (level === 2) {
          console.warn("[substrate-connect-extension] [%s] %s", target, message)
        } else if (level === 3) {
          console.info("[substrate-connect-extension] [%s] %s", target, message)
        } else if (level === 4) {
          console.debug(
            "[substrate-connect-extension] [%s] %s",
            target,
            message,
          )
        } else {
          console.trace(
            "[substrate-connect-extension] [%s] %s",
            target,
            message,
          )
        }
      },
    })

    // At a periodic interval, we ask each chain for its number of peers.
    setInterval(() => {
      for (const { inner } of this.#chains.values()) {
        inner.sendJsonRpc(
          JSON.stringify({
            jsonrpc: "2.0",
            id: "health-check:" + this.#nextRpcRqId,
            method: "system_health",
            params: [],
          }),
        )
        this.#nextRpcRqId += 1
      }
    }, 3000)

    // At a periodic interval, we ask each well-known chain for its database.
    setInterval(() => {
      for (const { inner, wellKnownName } of this.#chains.values()) {
        if (wellKnownName) {
          inner.sendJsonRpc(
            JSON.stringify({
              jsonrpc: "2.0",
              id: "database-content:" + this.#nextRpcRqId,
              method: "chainHead_unstable_finalizedDatabase",
              params: [], // TODO: pass a max value? tricky
            }),
          )
          this.#nextRpcRqId += 1
        }
      }
    }, 60000)
  }

  async addChain(options: {
    chainSpec: string
    potentialRelayChains: ChainWithExtension[]
    jsonRpcCallback: JsonRpcCallback
  }): Promise<ChainWithExtension> {
    const potentialRelayChainsAdj = options.potentialRelayChains
      .filter((c) => this.#chains.has(c))
      .map((c) => this.#chains.get(c)!.inner)

    return this.#addChainWithOptions({
      chainSpec: options.chainSpec,
      jsonRpcCallback: options.jsonRpcCallback,
      potentialRelayChains: potentialRelayChainsAdj,
      databaseContent: undefined,
    })
  }

  async addWellKnownChain(options: {
    chainName: string
    potentialRelayChains: ChainWithExtension[]
    jsonRpcCallback: JsonRpcCallback
  }) {
    const response = await this.#sendPortThenWaitResponse(
      { type: "get-well-known-chain", chainName: options.chainName },
      (msg: ToContentScript) => {
        if (
          msg.type === "get-well-known-chain" &&
          msg.chainName === options.chainName
        ) {
          return msg
        }
      },
    )

    const potentialRelayChainsAdj = options.potentialRelayChains
      .filter((c) => this.#chains.has(c))
      .map((c) => this.#chains.get(c)!.inner)

    // Given that the chain name is user input, we have no guarantee that it is correct. The
    // extension might report that it doesn't know about this well-known chain.
    if (!response.found)
      throw new AddChainError("Couldn't find well-known chain")

    return this.#addChainWithOptions(
      {
        chainSpec: response.found.chainSpec,
        databaseContent: response.found.databaseContent,
        jsonRpcCallback: options.jsonRpcCallback,
        potentialRelayChains: potentialRelayChainsAdj,
      },
      options.chainName,
    )
  }

  async #addChainWithOptions(
    options: SmoldotAddChainOptions,
    wellKnownName?: string,
  ): Promise<ChainWithExtension> {
    // Note that `options.jsonRpcCallback` is always defined. Because we override the JSON-RPC
    // callback, it doesn't make sense to give the possibility for the user to disable the
    // JSON-RPC service.

    const chainInfo: {
      // Note that once subscribed, we never unsubscribe.
      //
      // Blocks get unpinned when they become ancestor of the current finalized block. In other words,
      // the current finalized block and all its descendants are kept pinned. This is necessary in
      // order to be able to query the header of the best block, as the best block can be the
      // current finalized block or any of its descendants.
      readySubscriptionId?: string
      isSyncing: boolean
      peers: number
      // Height of the current best block of the chain, or undefined if not known yet or if the
      // height couldn't be defined.
      bestBlockHeight?: number
      // If defined, contains the id of the RPC request whose response contains the header of the
      // best block of the chain.
      bestBlockHeaderRequestId?: string
      // Hash of the current finalized block of the chain in hexadecimal, or undefined if not known
      // yet.
      finalizedBlockHashHex?: string
    } = {
      isSyncing: false,
      peers: 0,
    }

    const userJsonRpcCallback = options.jsonRpcCallback
    options.jsonRpcCallback = (response: string) => {
      // Do the opposite of what is done when a JSON-RPC request arrives by removing the
      // prefix in front of the response.
      // Because smoldot always sends back correct answers, we can just assume that all the
      // fields are present.
      const parsed = JSON.parse(response)

      // The JSON-RPC message might not contain an id if it is a notification.
      if (parsed.id) {
        // We know that the `id` is always a string, because all the requests that we send are
        // rewritten to use a string `id`.
        const jsonRpcMessageId = parsed.id as string

        if (jsonRpcMessageId.startsWith("extern:")) {
          parsed.id = JSON.parse(jsonRpcMessageId.slice("extern:".length))
          response = JSON.stringify(parsed)
        } else if (jsonRpcMessageId.startsWith("health-check:")) {
          // Store the health status in the locally-held information.
          const result: { peers: number } = parsed.result
          chainInfo.peers = result.peers
          this.#sendPort({
            type: "chain-info-update",
            chainId,
            bestBlockNumber: chainInfo.bestBlockHeight,
            peers: chainInfo.peers,
          })
          return
        } else if (jsonRpcMessageId.startsWith("ready-sub:")) {
          chainInfo.readySubscriptionId = parsed.result
          return
        } else if (jsonRpcMessageId.startsWith("block-unpin:")) {
          return
        } else if (jsonRpcMessageId.startsWith("best-block-header:")) {
          // We might receive responses to header requests concerning blocks that were but are
          // no longer the best block of the chain. Ignore these responses.
          if (jsonRpcMessageId === chainInfo.bestBlockHeaderRequestId) {
            delete chainInfo.bestBlockHeaderRequestId
            // The RPC call might return `null` if the subscription is dead.
            if (parsed.result) {
              try {
                chainInfo.bestBlockHeight = headerToHeight(parsed.result)
              } catch (error) {
                delete chainInfo.bestBlockHeight
              }
              this.#sendPort({
                type: "chain-info-update",
                chainId,
                bestBlockNumber: chainInfo.bestBlockHeight,
                peers: chainInfo.peers,
              })
            }
          }
          return
        } else if (jsonRpcMessageId.startsWith("database-content:")) {
          console.assert(wellKnownName)
          this.#sendPort({
            type: "database-content",
            chainName: wellKnownName!,
            databaseContent: parsed.result as string,
          })
          return
        } else {
          // Never supposed to happen. Indicates a bug somewhere.
          console.assert(false)
          return
        }
      } else {
        if (
          parsed.method === "chainHead_unstable_followEvent" &&
          parsed.params.subscription === chainInfo.readySubscriptionId
        ) {
          // We've received a notification on our `chainHead_unstable_followEvent`
          // subscription.
          switch (parsed.params.result.event) {
            case "initialized": {
              // The chain is now in sync and has downloaded the runtime.
              chainInfo.isSyncing = false
              chainInfo.finalizedBlockHashHex =
                parsed.params.result.finalizedBlockHash

              // Immediately send a single health request to the chain.
              smoldotChain.sendJsonRpc(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: "health-check:" + this.#nextRpcRqId,
                  method: "system_health",
                  params: [],
                }),
              )
              this.#nextRpcRqId += 1

              // Also immediately request the header of the finalized block.
              smoldotChain.sendJsonRpc(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: "best-block-header:" + this.#nextRpcRqId,
                  method: "chainHead_unstable_header",
                  params: [
                    chainInfo.readySubscriptionId,
                    chainInfo.finalizedBlockHashHex,
                  ],
                }),
              )
              chainInfo.bestBlockHeaderRequestId =
                "best-block-header:" + this.#nextRpcRqId
              this.#nextRpcRqId += 1

              return
            }
            case "stop": {
              // Our subscription has been force-killed by the client. This is normal and can
              // happen for example if the client is overloaded. Restart the subscription.
              delete chainInfo.readySubscriptionId
              delete chainInfo.bestBlockHeaderRequestId
              delete chainInfo.finalizedBlockHashHex
              delete chainInfo.bestBlockHeight
              this.#sendPort({
                type: "chain-info-update",
                chainId,
                bestBlockNumber: chainInfo.bestBlockHeight,
                peers: chainInfo.peers,
              })
              smoldotChain.sendJsonRpc(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: "ready-sub:" + this.#nextRpcRqId,
                  method: "chainHead_unstable_follow",
                  params: [false],
                }),
              )
              this.#nextRpcRqId += 1
              return
            }
            case "bestBlockChanged": {
              // The best block has changed. Request the header of this new best block in
              // order to know its height.
              smoldotChain.sendJsonRpc(
                JSON.stringify({
                  jsonrpc: "2.0",
                  id: "best-block-header:" + this.#nextRpcRqId,
                  method: "chainHead_unstable_header",
                  params: [
                    chainInfo.readySubscriptionId,
                    parsed.params.result.bestBlockHash,
                  ],
                }),
              )
              chainInfo.bestBlockHeaderRequestId =
                "best-block-header:" + this.#nextRpcRqId
              this.#nextRpcRqId += 1
              return
            }
            case "finalized": {
              // When one or more new blocks get finalized, we unpin all blocks except for
              // the new current finalized.
              let finalized = parsed.params.result.finalizedBlocksHashes as [
                string,
              ]
              let pruned = parsed.params.result.prunedBlocksHashes as [string]
              let newCurrentFinalized = finalized.pop()
              ;[
                chainInfo.finalizedBlockHashHex,
                ...pruned,
                ...finalized,
              ].forEach((blockHash) => {
                // `chain.finalizedBlockHashHex` can be undefined
                if (blockHash === undefined) return
                smoldotChain.sendJsonRpc(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id: "block-unpin:" + this.#nextRpcRqId,
                    method: "chainHead_unstable_unpin",
                    params: [chainInfo.readySubscriptionId, blockHash],
                  }),
                )
                this.#nextRpcRqId += 1
                chainInfo.finalizedBlockHashHex = newCurrentFinalized
              })
              return
            }
          }
        }
      }

      if (userJsonRpcCallback) userJsonRpcCallback(response)
    }

    const smoldotChain = await this.#client.addChain(options)

    smoldotChain.sendJsonRpc(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "ready-sub:" + this.#nextRpcRqId,
        method: "chainHead_unstable_follow",
        params: [false],
      }),
    )
    this.#nextRpcRqId += 1

    const chainId = getRandomChainId()
    const client = this

    // Given that smoldot has managed to add the chain, it means that the chain spec should
    // successfully parse.
    const chainSpecChainName = JSON.parse(options.chainSpec)!.name as string

    const chain = {
      sendJsonRpc(rpc: string) {
        // All incoming JSON-RPC requests are modified to add `extern:` in front of their id.
        try {
          const parsed = JSON.parse(rpc)
          parsed.id = "extern:" + JSON.stringify(parsed.id)
          rpc = JSON.stringify(parsed)
        } finally {
          return smoldotChain.sendJsonRpc(rpc)
        }
      },
      remove() {
        smoldotChain.remove()
        client.#sendPort({ type: "remove-chain", chainId })
        client.#chains.delete(this)
      },
    }

    this.#sendPort({ type: "add-chain", chainId, chainSpecChainName })
    this.#chains.set(chain, { inner: smoldotChain, wellKnownName })
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
    responseFilter: (message: ToContentScript) => T | undefined,
  ): Promise<T> {
    return new Promise((resolve) => {
      const listener = (msg: ToContentScript) => {
        const filtered = responseFilter(msg)
        if (filtered) {
          resolve(filtered)
          this.#port.onMessage.removeListener(listener)
        }
      }

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

// Converts a block header, as a hexadecimal string, to a block height.
//
// This function should give the accurate block height in most situations, but it is possible that
// the value is erroneous.
//
// This function assumes that the block header is a block header generated using Substrate. This
// is not necessarily always true. When that happens, an error is thrown.
//
// Additionally, this function assumes that the block height is 32bits, which is the case for the
// vast majority of the chains. There is currently no way to know the size of the block height.
// This is a huge flaw in Substrate that we can't do much about here. Fortuntely, since the block
// height is implemented in compact SCALE encoding, as long as the field containing the number is
// at least 32 bits and the value is less than 2^32, it will encode the same regardless.
function headerToHeight(hexHeader: String): number {
  // Remove the initial prefix.
  if (!(hexHeader.startsWith("0x") || hexHeader.startsWith("0X")))
    throw new Error("Not a hexadecimal number")
  hexHeader = hexHeader.slice(2)

  // The header should start with 32 bytes containing the parent hash.
  if (hexHeader.length < 64) throw new Error("Too short")
  hexHeader = hexHeader.slice(64)

  // The next field is the block number (which is what interests us) encoded in SCALE compact.
  // Unfortunately this format is a bit complicated to decode.
  // See https://docs.substrate.io/v3/advanced/scale-codec/#compactgeneral-integers
  if (hexHeader.length < 2) throw new Error("Too short")
  const b0 = parseInt(hexHeader.slice(0, 2), 16)

  switch ((b0 & 3) as 0 | 1 | 2 | 3) {
    case 0: {
      return b0 >> 2
    }
    case 1: {
      if (hexHeader.length < 4) throw new Error("Too short")
      const b1 = parseInt(hexHeader.slice(2, 4), 16)
      return (b0 >> 2) + b1 * 2 ** 6
    }
    case 2: {
      if (hexHeader.length < 8) throw new Error("Too short")
      const b1 = parseInt(hexHeader.slice(2, 4), 16)
      const b2 = parseInt(hexHeader.slice(4, 6), 16)
      const b3 = parseInt(hexHeader.slice(6, 8), 16)
      return (b0 >> 2) + b1 * 2 ** 6 + b2 * 2 ** 14 + b3 * 2 ** 22
    }
    case 3: {
      hexHeader = hexHeader.slice(2)
      let len = (4 + b0) >> 2
      let output = 0
      let base = 0
      while (len--) {
        if (hexHeader.length < 2) throw new Error("Too short")
        // Note that we assume that value can't overflow. This function is a helper and not.
        output += parseInt(hexHeader.slice(0, 2)) << base
        hexHeader = hexHeader.slice(2)
        base += 8
      }
      return output
    }
  }
}
