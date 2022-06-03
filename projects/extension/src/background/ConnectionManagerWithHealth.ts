import { Client as SmoldotClient } from "@substrate/smoldot-light"

import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"

import {
  ConnectionManager,
  ToConnectionManager,
  ToOutsideDatabaseContent,
} from "./ConnectionManager"

export type { ToConnectionManager, ToOutsideDatabaseContent }

/**
 * Information about a chain that the {ConnectionManager} manages.
 *
 * This interface is as minimal as possible, as to allow as much flexibility as possible for the
 * internals of the {ConnectionManager}.
 */
export interface ChainInfo<SandboxId> {
  /**
   * Name of the chain found in the chain specification.
   *
   * Important: this name is untrusted user input! It could be extremely long, contain weird
   * characters (e.g. HTML tags), etc. Do not make any assumption about its content.
   */
  chainName: string

  /**
   * Whether the chain is still in its syncing phase.
   */
  isSyncing: boolean

  /**
   * Latest known number of peers the chain is connected to.
   */
  peers: number

  /**
   * Identifier of the chain obtained through the initial `add-chain`.
   *
   * Important: this name is untrusted user input! It could be extremely long, contain weird
   * characters (e.g. HTML tags), etc. Do not make any assumption about its content.
   */
  chainId: string

  /**
   * The identifier for the sandbox that has received the message that requests to add a chain.
   */
  sandboxId: SandboxId
}

/**
 * Message that notifies of the fact that {ConnectionManagerWithHealth.allChains} will now return
 * a different value.
 *
 * Note that the list of chains also changes if chains are added or removed by the user or by
 * the {ConnectionManagerWithHealth}. This isn't covered by this message.
 */
export interface ChainsStatusChanged {
  origin: "connection-manager"
  type: "chains-status-changed"
}

/**
 * # Overview
 *
 * This class primarily contains two lists:
 *
 * - A list of sandboxes. Each sandbox contains a list of chain connections. A chain within a
 * sandbox cannot interact in any way with a chain of a different sandbox. Pragmatically speaking,
 * a sandbox corresponds to a browser tab, however what a sandbox corresponds to is out of concern
 * of this module. You can add and remove sandboxes using {ConnectionManager.addSandbox} and
 * {ConnectionManager.deleteSandbox}.
 *
 * - A list of "well-known" chains specifications. Well-known chain specifications are passed to
 * the constructor and cannot be modified afterwards.
 *
 * # Sandboxes usage
 *
 * A sandbox can be added using {ConnectionManager.addSandbox}. Each sandbox is identified by a
 * `SandboxId`, which is a generic argument of the {ConnectionManager}. This `SandboxId` must be
 * provided every time you want to call a method that relates to a specific sandbox. Once a sandbox
 * has been removed (using {ConnectionManager.deleteSandbox}), the {ConnectionManager} instantly
 * removes all traces of this sandbox. Calling a method (other than {ConnectionManager.addSandbox})
 * with an unknown `SandboxId` leads to an exception being thrown.
 *
 * Once a sandbox has been added using {ConnectionManager.addSandbox}, you can inject messages
 * that concern this sandbox using {ConnectionManager.sandboxMessage}. These messages must conform
 * to the {ToExtension} interface and to the protocol described in the
 * `@substrate/connect-extension-protocol` package.
 *
 * A sandbox will spontaneously generate messages that conform to the {ToApplication} interface of
 * the `@substrate/connect-extension-protocol` package. Use the
 * {ConnectionManager.nextSandboxMessage} function to retrieve these messages as they are
 * generated.
 *
 * # Information about the list of chains
 *
 * At any point, information about all the chains contained within the {ConnectionManager} can
 * be retrieved using {ConnectionManager.allChains}. This can be used for display purposes.
 *
 * # Database
 *
 * In addition to {@link ToExtension} messages, one can also inject {@link ToConnectionManager}
 * messages.
 *
 * This can be used to retrieve the content of the so-called "database" of a chain.
 * The string sent back in the {@link ToOutsideDatabaseContent} is opaque and shouldn't be
 * interpreted in any way by the API user.
 *
 * The {@link ToConnectionManagerAddWellKnownChain} accepts a `databaseContent` field that can
 * be used to pass the "database" that was grabbed the last time the chain was running.
 *
 */
export class ConnectionManagerWithHealth<SandboxId> {
  #inner: ConnectionManager<SandboxId>
  // List of all chains, including chains that are still initializing. Kept in parallel of the list
  // in the `ConnectionManager`. Note that because this list is updated only when
  // `nextSandboxMessage` is called, it is possible for the list of chains here to contain chains
  // that the underlying `ConnectionManager` has already removed.
  #sandboxesChains: Map<SandboxId, Map<string, Chain>> = new Map()
  #pingInterval: ReturnType<typeof globalThis.setInterval>
  #nextRpcRqId: number = 0

  constructor(
    wellKnownChainSpecs: Map<string, string>,
    smoldotClient: SmoldotClient,
  ) {
    this.#inner = new ConnectionManager(wellKnownChainSpecs, smoldotClient)
    this.#pingInterval = globalThis.setInterval(() => {
      this.#sendPings()
    }, 10000)
  }

  /**
   * Returns a list of all chains, for display purposes only.
   */
  get allChains(): ChainInfo<SandboxId>[] {
    return this.#inner.allChains.map((chainInfo) => {
      const chain = this.#sandboxesChains
        .get(chainInfo.sandboxId)!
        .get(chainInfo.chainId)!

      return {
        peers: chain.peers,
        isSyncing: chain.isSyncing,
        ...chainInfo,
      }
    })
  }

  /**
   * Returns a string error message if the underlying client has crashed in the past. Returns
   * `undefined` if it hasn't crashed.
   *
   * A crash is non-reversible. The only solution is to rebuild a new manager.
   */
  get hasCrashed(): string | undefined {
    return this.#inner.hasCrashed
  }

  /**
   * Inserts a sandbox in the list of sandboxes held by this state machine.
   *
   * @throws Throws an exception if a sandbox with that identifier already exists.
   */
  addSandbox(sandboxId: SandboxId) {
    // We don't neeed to check for duplicate `sandboxId` below, because this is done
    // by `this.#inner.addSandbox`. For this reason, we call `this.#inner` first.
    this.#inner.addSandbox(sandboxId)

    this.#sandboxesChains.set(sandboxId, new Map())
  }

  /**
   * Removes a sandbox from the list of sandboxes.
   *
   * This performs some internal clean ups.
   *
   * Any `Promise` concerning this sandbox that was returned by
   * {ConnectionManager.nextSandboxMessage} will generate an error.
   *
   * @throws Throws an exception if the ̀`sandboxId` isn't valid.
   */
  deleteSandbox(sandboxId: SandboxId) {
    this.#inner.deleteSandbox(sandboxId)
    this.#sandboxesChains.delete(sandboxId)
  }

  /**
   * Returns the list of all sandboxes that have been added.
   */
  get sandboxes(): IterableIterator<SandboxId> {
    return this.#inner.sandboxes
  }

  /**
   * Returns the next {ToApplication} message that is generated spontaneously or in response to
   * `sandboxMessage`.
   *
   * Alternatively, can also generate a {@link ToOutsideDatabaseContent} to report the database
   * content, or a {@link ChainsStatusChanged} in case the status of one of the chains in the
   * sandbox has changed.
   *
   * If a message is generated by a sandbox before this function is called, the message is queued.
   *
   * @throws Throws an exception if the ̀`sandboxId` isn't valid.
   */
  async nextSandboxMessage(
    sandboxId: SandboxId,
  ): Promise<ToApplication | ToOutsideDatabaseContent | ChainsStatusChanged> {
    while (true) {
      const toApplication = await this.#inner.nextSandboxMessage(sandboxId)

      switch (toApplication.type) {
        case "chain-ready": {
          // Internal check to make sure that there's no hidden bug.
          if (!this.#sandboxesChains.get(sandboxId)!.has(toApplication.chainId))
            throw new Error(
              "Internal error: inconsistency between lists of chains",
            )

          this.#inner.sandboxMessage(sandboxId, {
            origin: "substrate-connect-client",
            type: "rpc",
            chainId: toApplication.chainId,
            jsonRpcMessage: JSON.stringify({
              jsonrpc: "2.0",
              id: "ready-sub:" + this.#nextRpcRqId,
              method: "chainHead_unstable_follow",
              params: [true],
            }),
          })
          this.#nextRpcRqId += 1
          return toApplication
        }

        case "rpc": {
          const chain = this.#sandboxesChains
            .get(sandboxId)!
            .get(toApplication.chainId)!

          // Do the opposite of what is done when a JSON-RPC request arrives by removing the
          // prefix in front of the response.
          // Because smoldot always sends back correct answers, we can just assume that all the
          // fields are present.
          let jsonRpcMessage = JSON.parse(toApplication.jsonRpcMessage)

          // The JSON-RPC message might not contain an id if it is a notification.
          if (jsonRpcMessage.id) {
            // We know that the `id` is always a string, because all the requests that we send are
            // rewritten to use a string `id`.
            const jsonRpcMessageId = jsonRpcMessage.id as string

            if (jsonRpcMessageId.startsWith("extern:")) {
              jsonRpcMessage.id = JSON.parse(
                (jsonRpcMessage.id as string).slice("extern:".length),
              )
              toApplication.jsonRpcMessage = JSON.stringify(jsonRpcMessage)
              return toApplication
            } else if (jsonRpcMessageId.startsWith("health-check:")) {
              // Store the health status in the locally-held information.
              const result: { peers: number } = jsonRpcMessage.result
              chain.peers = result.peers

              // Notify of the change in status.
              return {
                origin: "connection-manager",
                type: "chains-status-changed",
              }
            } else if (jsonRpcMessageId.startsWith("ready-sub:")) {
              chain.readySubscriptionId = jsonRpcMessage.result
            } else {
              // Never supposed to happen. Indicates a bug somewhere.
              throw new Error()
            }
          } else {
            if (
              jsonRpcMessage.method === "chainHead_unstable_followEvent" &&
              jsonRpcMessage.params.subscription === chain.readySubscriptionId
            ) {
              // We've received a notification on our `chainHead_unstable_followEvent`
              // subscription.
              switch (jsonRpcMessage.params.result.event) {
                case "initialized": {
                  // The chain is now in sync and has downloaded the runtime.
                  chain.isSyncing = false

                  // Immediately send a single health request to the chain.
                  this.#inner.sandboxMessage(sandboxId, {
                    origin: "substrate-connect-client",
                    type: "rpc",
                    chainId: toApplication.chainId,
                    jsonRpcMessage: JSON.stringify({
                      jsonrpc: "2.0",
                      id: "health-check:" + this.#nextRpcRqId,
                      method: "system_health",
                      params: [],
                    }),
                  })
                  this.#nextRpcRqId += 1

                  // Notify of the change in status.
                  return {
                    origin: "connection-manager",
                    type: "chains-status-changed",
                  }
                }
                case "stop": {
                  // Our subscription has been force-killed by the client. This is normal and can
                  // happen for example if the client is overloaded. Restart the subscription.
                  delete chain.readySubscriptionId
                  this.#inner.sandboxMessage(sandboxId, {
                    origin: "substrate-connect-client",
                    type: "rpc",
                    chainId: toApplication.chainId,
                    jsonRpcMessage: JSON.stringify({
                      jsonrpc: "2.0",
                      id: "ready-sub:" + this.#nextRpcRqId,
                      method: "chainHead_unstable_follow",
                      params: [true],
                    }),
                  })
                  this.#nextRpcRqId += 1
                  break
                }
              }
            } else {
              return toApplication
            }
          }

          break
        }

        case "error": {
          const hadChain = this.#sandboxesChains
            .get(sandboxId)!
            .delete(toApplication.chainId)
          // Internal check to make sure that there's no hidden bug.
          if (!hadChain)
            throw new Error(
              "Internal error: inconsistency between lists of chains",
            )
          return toApplication
        }

        default: {
          return toApplication
        }
      }
    }
  }

  /**
   * Injects a message into the given sandbox.
   *
   * The message and the behaviour of this function conform to the `connect-extension-protocol` or
   * to the {@link ToConnectionManager} extension defined in this module.
   *
   * @throws Throws an exception if the ̀`sandboxId` isn't valid.
   */
  sandboxMessage(
    sandboxId: SandboxId,
    message: ToExtension | ToConnectionManager,
  ) {
    switch (message.type) {
      case "add-chain":
      case "add-well-known-chain":
      case "add-well-known-chain-with-db": {
        // Note that chains that are still initializing are also kept within `this`, otherwise it
        // isn't possible to keep the list of chains synchronized with the list in the underlying
        // machine without being subject to race conditions.
        this.#sandboxesChains.get(sandboxId)!.set(message.chainId, {
          isSyncing: true,
          peers: 0,
        })
        this.#inner.sandboxMessage(sandboxId, message)
        break
      }
      case "remove-chain": {
        // As documented in the protocol, remove-chain messages concerning an invalid chainId are
        // simply ignored.
        this.#sandboxesChains.get(sandboxId)!.delete(message.chainId)
        this.#inner.sandboxMessage(sandboxId, message)
        break
      }
      case "rpc": {
        // All incoming JSON-RPC requests are modified to add `extern:` in front of their id.
        try {
          let parsedJsonRpcMessage = JSON.parse(message.jsonRpcMessage)
          parsedJsonRpcMessage.id =
            "extern:" + JSON.stringify(parsedJsonRpcMessage.id)
          message.jsonRpcMessage = JSON.stringify(parsedJsonRpcMessage)
        } finally {
          this.#inner.sandboxMessage(sandboxId, message)
        }
        break
      }
      default: {
        this.#inner.sandboxMessage(sandboxId, message)
      }
    }
  }

  #sendPings() {
    for (const [sandboxId, sandbox] of this.#sandboxesChains) {
      for (const [chainId] of sandbox) {
        this.#inner.sandboxMessage(sandboxId, {
          origin: "substrate-connect-client",
          type: "rpc",
          chainId,
          jsonRpcMessage: JSON.stringify({
            jsonrpc: "2.0",
            id: "health-check:" + this.#nextRpcRqId,
            method: "system_health",
            params: [],
          }),
        })
        this.#nextRpcRqId += 1
      }
    }
  }
}

interface Chain {
  // Note that once subscribed, we never unsubscribe. Unsubscribing adds a lot of complexity, and
  // having an active subscription might be useful in the future if we want to display, say, the
  // current block or the runtime version.
  readySubscriptionId?: string
  isSyncing: boolean
  peers: number
}

// TODO: this code uses `system_health` at the moment, because there's no alternative, even in the new JSON-RPC API, to get the number of peers
