import {
  Client as SmoldotClient,
  Chain as SmoldotChain,
  AddChainOptions as SmoldotAddChainOptions,
  AddChainError,
  start as startSmoldotClient,
  QueueFullError,
  MalformedJsonRpcError,
} from "smoldot"
import { loadWellKnownChains } from "./loadWellKnownChains"
import * as environment from "../environment"

export type ChainChannel = {
  sendJsonRpc(rpc: string): void
  remove(): void
}

export class ChainMultiplex {
  #channels: Record<string, (msg: string) => void> = {}

  constructor(
    readonly smoldotChain: SmoldotChain,
    private readonly onRemove?: () => void,
  ) {
    ;(async () => {
      while (true) {
        let rawMessage
        try {
          rawMessage = await smoldotChain.nextJsonRpcResponse()
        } catch (_) {
          break
        }
        try {
          const message = JSON.parse(rawMessage)

          for (const [channelId, jsonRpcCallback] of Object.entries(
            this.#channels,
          )) {
            const id = message.id
            // notifications are complex to multiplex so they are forwarded to every channel
            if (!id) {
              jsonRpcCallback(rawMessage)
              continue
            }

            const prefix = `${channelId}:`
            if (!id.startsWith(prefix)) continue

            message.id = id.slice(prefix.length)
            jsonRpcCallback(JSON.stringify(message))
            break
          }
        } catch (error) {
          console.error("JSON-RPC callback has thrown an exception:", error)
        }
      }
    })()
  }

  channel(
    channelId: string,
    jsonRpcCallback: (rawMessage: string) => void,
  ): ChainChannel {
    if (this.#channels[channelId]) throw new Error("channel already created")
    this.#channels[channelId] = jsonRpcCallback

    const { smoldotChain, onRemove } = this
    const channels = this.#channels

    return {
      sendJsonRpc(rawMessage: string) {
        // All incoming JSON-RPC requests are modified to add `channel:` in front of their id.
        try {
          const message = JSON.parse(rawMessage)
          message.id = `${channelId}:${message.id}`
          rawMessage = JSON.stringify(message)
        } finally {
          try {
            return smoldotChain.sendJsonRpc(rawMessage)
          } catch (error) {
            if (error instanceof QueueFullError) {
              // If the queue is full, we immediately send back a JSON-RPC response indicating
              // the error.
              try {
                const parsedRq = JSON.parse(rawMessage)
                jsonRpcCallback(
                  JSON.stringify({
                    jsonrpc: "v2",
                    id: parsedRq.id,
                    error: {
                      code: -32000,
                      message: "JSON-RPC server is too busy",
                    },
                  }),
                )
              } catch (_error) {
                throw new MalformedJsonRpcError()
              }
            } else {
              throw error
            }
          }
        }
      },
      remove() {
        delete channels[channelId]

        // TODO: revisit, Is this behavior correct?
        if (Object.keys(channels).length === 0) {
          smoldotChain.remove()
          onRemove?.()
        }
      },
    }
  }

  remove() {
    for (const channelId of Object.keys(this.#channels)) {
      delete this.#channels[channelId]
    }
    this.smoldotChain.remove()
    this.onRemove?.()
  }
}

export class ClientService {
  // TODO: revisit, Do we need to cache chains?
  #chains: Record<string, ChainMultiplex> = {}

  #innerClient: SmoldotClient | undefined
  get #client() {
    if (!this.#innerClient) {
      this.#innerClient = startSmoldotClient({
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
            console.warn(
              "[substrate-connect-extension] [%s] %s",
              target,
              message,
            )
          } else if (level === 3) {
            console.info(
              "[substrate-connect-extension] [%s] %s",
              target,
              message,
            )
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
    }
    return this.#innerClient
  }

  addChain(chainId: string, options: SmoldotAddChainOptions) {
    // TODO: handle concurrent addChain calls
    if (this.#chains[chainId]) throw new Error("chainId already in use")

    return this.#client.addChain(options).then((chain) => {
      this.#chains[chainId] = new ChainMultiplex(chain)

      return this.#chains[chainId]
    })
  }

  async addWellKnownChain(chainId: string, chainName: string) {
    const chainSpec = (await loadWellKnownChains()).get(chainName)

    // Given that the chain name is user input, we have no guarantee that it is correct. The
    // extension might report that it doesn't know about this well-known chain.
    if (!chainSpec) throw new AddChainError("Couldn't find well-known chain")

    const databaseContent = await environment.get({
      type: "database",
      chainName,
    })

    return this.addChain(chainId, { chainSpec, databaseContent })
  }

  async terminate() {
    this.#innerClient?.terminate()
    return
  }
}
