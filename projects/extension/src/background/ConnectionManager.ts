import {
  Client as SmoldotClient,
  Chain as SmoldotChain,
} from "@substrate/smoldot-light"

import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"

import createAsyncFifoQueue from "./Stream"

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
   * Information about how the chain was inserted in the {ConnectionManager}.
   *
   * If this field is not set, it means that the chain was added with
   * {ConnectionManager.addWellKnownChain}.
   */
  apiInfo?: {
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
 * - A list of trusted "well-known" chains, outside of any sandbox. Well-known chains can be added
 * by calling {ConnectionManager.addWellKnownChain}. Once added, a well-known chain cannot be
 * removed. Chains within sandboxes can interact with all well-known chains.
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
 * The {ConnectionManager.wellKnownChainDatabaseContent} method can be used to retrieve the
 * content of the so-called "database" of a well-known chain. The string returned by this function
 * is opaque and shouldn't be interpreted in any way by the API user.
 *
 * The {ConnectionManager.addWellKnownChain} accepts a `databaseContent` parameter that can be used
 * to pass the "database" that was grabbed the last time the well-known chain was running.
 *
 */
export class ConnectionManager<SandboxId> {
  #smoldotClient: SmoldotClient
  #sandboxes: Map<SandboxId, Sandbox> = new Map()
  #wellKnownChains: Map<string, WellKnownChain> = new Map()

  constructor(smoldotClient: SmoldotClient) {
    this.#smoldotClient = smoldotClient
  }

  /**
   * Adds a new well-known chain to this state machine.
   *
   * While it is not strictly mandatory, you are strongly encouraged to call this at the
   * beginning and before adding any sandbox.
   *
   * @throws Throws an exception if a well-known chain with that name has been added in the past.
   */
  async addWellKnownChain(
    chainName: string,
    spec: string,
    databaseContent?: string,
  ): Promise<void> {
    if (this.#wellKnownChains.has(chainName)) {
      throw new Error("Duplicate well-known chain")
    }

    const chain = await this.#smoldotClient.addChain({
      chainSpec: spec,
      databaseContent,
      potentialRelayChains: [],
    })

    const wellKnownChain: WellKnownChain = {
      chain,
      spec,
      isSyncing: true,
      peers: 0,
    }

    this.#wellKnownChains.set(chainName, wellKnownChain)
  }

  /**
   * Returns the content of the database of the well-known chain with the given name.
   *
   * The `maxUtf8BytesSize` parameter is the maximum number of bytes that the string must occupy
   * in its UTF-8 encoding. The returned string is guaranteed to not be larger than this number.
   * If not provided, "infinite" is implied.
   *
   * @throws Throws an exception if the `chainName` isn't the name of a chain that has been
   *         added by a call to `addWellKnownChain`.
   */
  async wellKnownChainDatabaseContent(
    chainName: string,
    maxUtf8BytesSize?: number,
  ): Promise<string> {
    return await this.#wellKnownChains
      .get(chainName)!
      .chain.databaseContent(maxUtf8BytesSize)
  }

  /**
   * Returns a list of all chains, for display purposes only.
   *
   * This includes both well-known chains and chains added by sandbox messages.
   */
  get allChains(): ChainInfo<SandboxId>[] {
    let output: ChainInfo<SandboxId>[] = []

    for (const [chainName] of this.#wellKnownChains) {
      output.push({
        chainName,
      })
    }

    for (const [sandboxId, sandbox] of this.#sandboxes) {
      for (const [chainId, chain] of sandbox.chains) {
        output.push({
          chainName: chain.name,
          apiInfo: {
            chainId,
            sandboxId,
          },
        })
      }
    }

    return output
  }

  /**
   * Inserts a sandbox in the list of sandboxes held by this state machine.
   *
   * @throws Throws an exception if a sandbox with that identifier already exists.
   */
  addSandbox(sandboxId: SandboxId) {
    if (this.#sandboxes.has(sandboxId)) throw new Error("Duplicate sandboxId")

    const queue = createAsyncFifoQueue<ToApplication | null>()
    this.#sandboxes.set(sandboxId, {
      pushMessagesQueue: queue.push,
      pullMessagesQueue: queue.pull,
      chains: new Map(),
    })
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
    const sandbox = this.#sandboxes.get(sandboxId)!
    sandbox.chains.forEach((chain) => {
      if (chain.isReady) {
        chain.smoldotChain.remove()
      }

      // If the chain isn't ready yet, the function that asynchronously reacts to the chain
      // initialization being finished will remove it.
    })
    sandbox.pushMessagesQueue(null)
    this.#sandboxes.delete(sandboxId)
  }

  /**
   * Returns the list of all sandboxes that have been added.
   */
  get sandboxes(): IterableIterator<SandboxId> {
    return this.#sandboxes.keys()
  }

  /**
   * Returns the next {ToApplication} message that is generated spontaneously or in response to
   * `sandboxMessage`.
   *
   * If a message is generated by a sandbox before this function is called, the message is queued.
   *
   * @throws Throws an exception if the ̀`sandboxId` isn't valid.
   */
  async nextSandboxMessage(sandboxId: SandboxId): Promise<ToApplication> {
    const sandbox = this.#sandboxes.get(sandboxId)!
    const message = await sandbox.pullMessagesQueue()
    if (message === null) throw new Error("Sandbox has been destroyed")
    return message
  }

  /**
   * Injects a message into the given sandbox.
   *
   * The message and the behaviour of this function conform to the `connect-extension-protocol`.
   *
   * @throws Throws an exception if the ̀`sandboxId` isn't valid.
   */
  sandboxMessage(sandboxId: SandboxId, message: ToExtension) {
    // It is illegal to call this function with an invalid `sandboxId`.
    const sandbox = this.#sandboxes.get(sandboxId)!

    switch (message.type) {
      case "rpc": {
        const chain = sandbox.chains.get(message.chainId)
        // As documented in the protocol, RPC messages concerning an invalid chainId are simply
        // ignored.
        if (!chain) return

        // Check whether chain is ready yet
        if (!chain.isReady) {
          sandbox.pushMessagesQueue({
            origin: "substrate-connect-extension",
            type: "error",
            chainId: message.chainId,
            errorMessage: "Received RPC message while chain isn't ready yet",
          })
          return
        }

        // Everything is green for this JSON-RPC message
        chain.smoldotChain.sendJsonRpc(message.jsonRpcMessage)
        break
      }

      case "add-chain":
      case "add-well-known-chain": {
        // Refuse the chain addition if the `chainId` is already in use.
        if (sandbox.chains.has(message.chainId)) {
          sandbox.pushMessagesQueue({
            origin: "substrate-connect-extension",
            type: "error",
            chainId: message.chainId,
            errorMessage: "Requested chainId already in use",
          })
          return
        }

        // Refuse the chain addition for invalid well-known chain names.
        if (message.type === "add-well-known-chain") {
          if (!this.#wellKnownChains.has(message.chainName)) {
            sandbox.pushMessagesQueue({
              origin: "substrate-connect-extension",
              type: "error",
              chainId: message.chainId,
              errorMessage: "Unknown well-known chain",
            })
            return
          }
        }

        // Start the initialization of the chain in the background.
        const chainId = message.chainId
        const chainSpec =
          message.type === "add-chain"
            ? message.chainSpec
            : this.#wellKnownChains.get(message.chainName)!.spec
        const chainInitialization: Promise<SmoldotChain> =
          this.#smoldotClient.addChain({
            chainSpec,
            jsonRpcCallback: (jsonRpcMessage) => {
              // This JSON-RPC callback will never be called after we call `remove()` on the
              // chain. When we remove a sandbox, we call `remove()` on all of its chains.
              // Consequently, this JSON-RPC callback will never be called after we remove a
              // sandbox. Consequently, the sandbox is always alive here.
              sandbox.pushMessagesQueue({
                origin: "substrate-connect-extension",
                type: "rpc",
                chainId,
                jsonRpcMessage,
              })
            },
            potentialRelayChains:
              message.type === "add-chain"
                ? message.potentialRelayChainIds.flatMap(
                    (untrustedChainId): SmoldotChain[] => {
                      const chain = sandbox.chains.get(untrustedChainId)
                      return chain && chain.isReady ? [chain.smoldotChain] : []
                    },
                  )
                : [],
          })

        // Insert the promise in `sandbox.chains` so that the state machine is aware of the
        // fact that there is a chain with this ID currently initializing.
        const name = nameFromSpec(chainSpec)
        sandbox.chains.set(message.chainId, {
          isReady: false,
          smoldotChain: chainInitialization,
          name,
        })

        // Spawn in the background an async function to react to the initialization finishing.
        this.#handleChainInitializationFinished(
          sandboxId,
          chainId,
          chainInitialization,
          name,
        )

        break
      }

      case "remove-chain": {
        const chain = sandbox.chains.get(message.chainId)
        // As documented in the protocol, remove-chain messages concerning an invalid chainId are
        // simply ignored.
        if (!chain) return

        if (chain.isReady) {
          chain.smoldotChain.remove()
        }

        // If the chain isn't ready yet, the function that asynchronously reacts to the chain
        // initialization being finished will remove it.

        sandbox.chains.delete(message.chainId)
        break
      }
    }
  }

  /**
   * Waits until the given `chainInitialization` is finished (successfully or not), then updates
   * the given `sandboxId`/`chainId` in `this`.
   *
   * If the given `sandboxId`/`chainId` stored in `this` doesn't exist anymore or doesn't match
   * `chainInitialization`, this function assumes that we're no longer interested in this chain
   * and discards the newly-created chain.
   */
  async #handleChainInitializationFinished(
    sandboxId: SandboxId,
    chainId: string,
    chainInitialization: Promise<SmoldotChain>,
    name: string,
  ): Promise<void> {
    try {
      const chain = await chainInitialization

      // Because the chain initialization might have taken a long time, we first need to
      // check whether the chain that we're initializing is still in `this`, as it might
      // have been removed by various other functions if it no longer interests us.
      const sandbox = this.#sandboxes.get(sandboxId)
      if (
        !sandbox ||
        !(sandbox.chains.get(chainId)?.smoldotChain === chainInitialization)
      ) {
        chain.remove()
        return
      }

      const smoldotChain: SmoldotChain = chain
      const readyChain: ReadyChain = {
        isReady: true,
        name,
        smoldotChain,
        isSyncing: true,
        peers: 0,
      }
      sandbox.chains.set(chainId, readyChain)
      sandbox.pushMessagesQueue({
        origin: "substrate-connect-extension",
        type: "chain-ready",
        chainId,
      })
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Unknown error when adding chain"

      // Because the chain initialization might have taken a long time, we first need to
      // check whether the chain that we're initializing is still in `this`, as it might
      // have been removed by various other functions if it no longer interests us.
      const sandbox = this.#sandboxes.get(sandboxId)
      if (
        !sandbox ||
        !(sandbox.chains.get(chainId)?.smoldotChain === chainInitialization)
      ) {
        return
      }

      sandbox.chains.delete(chainId)
      sandbox.pushMessagesQueue({
        origin: "substrate-connect-extension",
        type: "error",
        chainId,
        errorMessage: error,
      })
    }
  }
}

interface Sandbox {
  /**
   * List of chains within this sandbox, identified by the user-provided `id`. Chains can be
   * removed from this list at any time, even if they are still initializing. Be aware that
   * the `id`s (i.e. the keys of this map) are untrusted user input.
   */
  chains: Map<string, InitializingChain | ReadyChain>

  /**
   * Function that pulls a message from the queue of messages, to give it to the API user. Used
   * by {ConnectionManager.nextSandboxMessage}.
   */
  pullMessagesQueue: () => Promise<ToApplication | null>

  /**
   * Function that adds a message to the queue in {Sandbox.pullMessagesQueue}.
   */
  pushMessagesQueue: (message: ToApplication | null) => void
}

interface InitializingChain {
  /**
   * Used to differentiate {ReadyChain} from {InitializingChain}.
   */
  isReady: false

  /**
   * Name of the chain found in its chain specification.
   *
   * Beware that this is untrusted user input.
   */
  name: string

  /**
   * Promise provided by the smoldot client. Will be ready once the chain initialization has
   * finished. For each chain currently initializing, there is an asynchronous function running
   * in the background that waits on this promise and will transition the chain to a {ReadyChain}.
   *
   * The `Promise` is stored here so that this asynchronous function can make sure that the chain
   * found in {Sandbox.chains} is still the same as the one that we waited on.
   * For example, if the user adds a chain with id "foo", then removes the chain with id "foo",
   * then adds another chain with id "foo", then once the first chain has finished its
   * initialization it will notice that the `Promise` here is not the same as the one it has.
   */
  smoldotChain: Promise<SmoldotChain>
}

interface ReadyChain {
  /**
   * Used to differentiate {ReadyChain} from {InitializingChain}.
   */
  isReady: true

  /**
   * Name of the chain found in its chain specification.
   *
   * Beware that this is untrusted user input.
   */
  name: string

  /**
   * Chain stored within the {ConnectionManager.#client}.
   */
  smoldotChain: SmoldotChain

  /**
   * Whether the chain is still in its syncing phase.
   */
  isSyncing: boolean

  /**
   * Latest known number of peers the chain is connected to.
   */
  peers: number
}

interface WellKnownChain {
  /**
   * Chain stored within the {ConnectionManager.#client}.
   */
  chain: SmoldotChain

  /**
   * Chain specification of the well-known chain.
   */
  spec: string

  /**
   * Whether the chain is still in its syncing phase.
   */
  isSyncing: boolean

  /**
   * Latest known number of peers the chain is connected to.
   */
  peers: number
}

/**
 * Returns the `name` field of the given chain specification, or "Unknown" if the chain
 * specification is invalid or is missing the field.
 */
function nameFromSpec(chainSpec: string): string {
  // TODO: consider using a streaming parser in order to avoid allocating the memory for the entire spec
  try {
    return JSON.parse(chainSpec).name!
  } catch (_error) {
    return "Unknown"
  }
}
