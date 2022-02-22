import {
  Client as SmoldotClient,
  Chain as SmoldotChain,
  start as smoldotStart,
} from "@substrate/smoldot-light"

import {
  healthChecker as smHealthChecker,
  HealthChecker as SmoldotHealthChecker,
  SmoldotHealth,
} from "@substrate/connect"

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
  healthStatus?: SmoldotHealth

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
 * the `@substrate/connect-extension-protocol` package. Use the {ConnectionManager.sandboxOutput}
 * function to retrieve these messages as they are generated.
 *
 * # Other
 *
 * At any point, information about all the chains contained within the {ConnectionManager} can
 * be retrieved using {ConnectionManager.allChains}. This can be used for display purposes.
 *
 * Use {ConnectionManager.waitAllChainChanged} to wait until the next time any field within the
 * value returned by {ConnectionManager.allChains} has potentially been modified.
 */
export class ConnectionManager<SandboxId> {
  #smoldotClient: SmoldotClient = smoldotStart()
  #sandboxes: Map<SandboxId, Sandbox> = new Map()
  #wellKnownChains: Map<string, WellKnownChain> = new Map()
  #allChainsChangedCallbacks: (() => void)[] = []

  /**
   * Adds a new well-known chain to this state machine.
   *
   * While it is not strictly mandatory, you are strongly encouraged to call this at the
   * beginning and before adding any sandbox.
   */
  async addWellKnownChain(
    chainName: string,
    spec: string,
    databaseContent?: string,
  ): Promise<void> {
    const healthChecker = smHealthChecker()

    const chain = await this.#smoldotClient.addChain({
      chainSpec: spec,
      jsonRpcCallback: (response) => {
        healthChecker.responsePassThrough(response)
      },
      databaseContent,
      potentialRelayChains: [],
    })

    const wellKnownChain: WellKnownChain = { chain, spec, healthChecker }

    healthChecker.setSendJsonRpc((rq) => chain.sendJsonRpc(rq))
    healthChecker.start((health) => {
      wellKnownChain.latestHealthStatus = health
      this.#allChainsChangedCallbacks.forEach((cb) => cb())
      this.#allChainsChangedCallbacks = []
    })

    this.#wellKnownChains.set(chainName, wellKnownChain)

    this.#allChainsChangedCallbacks.forEach((cb) => cb())
    this.#allChainsChangedCallbacks = []
  }

  /**
   * Returns the content of the database of the well-known chain with the given name.
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

    for (const [chainName, chain] of this.#wellKnownChains) {
      output.push({
        chainName,
        healthStatus: chain.latestHealthStatus,
      })
    }

    for (const [sandboxId, sandbox] of this.#sandboxes) {
      for (const [chainId, chain] of sandbox.chains) {
        output.push({
          chainName: chain.name,
          healthStatus: chain.isReady ? chain.latestHealthStatus : undefined,
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
   * Waits for the value of `allChains` to change.
   */
  async waitAllChainChanged(): Promise<void> {
    await new Promise<void>((resolve, _) => {
      this.#allChainsChangedCallbacks.push(resolve)
    })
  }

  /**
   * Inserts a sandbox in the list of sandboxes held by this state machine.
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
   * The `messageSendBack` callback will not be called again on this sandbox.
   *
   * @throws Throws an exception if the ̀`sandboxId` isn't valid.
   */
  deleteSandbox(sandboxId: SandboxId) {
    const sandbox = this.#sandboxes.get(sandboxId)!
    sandbox.chains.forEach((chain) => {
      if (chain.isReady) {
        chain.healthChecker.stop()
        chain.smoldotChain.remove()
      }

      // If the chain isn't ready yet, the function that reacts to the chain initialization
      // being finished will remove it.
    })
    sandbox.pushMessagesQueue(null)
    this.#sandboxes.delete(sandboxId)

    this.#allChainsChangedCallbacks.forEach((cb) => cb())
    this.#allChainsChangedCallbacks = []
  }

  /**
   * Returns the list of all sandboxes that have been added.
   */
  get sandboxes(): IterableIterator<SandboxId> {
    return this.#sandboxes.keys()
  }

  /**
   * Asynchronous iterator that yields all the `ToApplication` messages that are generated
   * spontaneously or in response to `sandboxMessage`.
   *
   * The iterator is guaranteed to always yield messages from sandboxes that are still alive. As
   * soon as you call `deleteSandbox`, no new message will be generated and the iterator will
   * end.
   */
  async *sandboxOutput(sandboxId: SandboxId): AsyncGenerator<ToApplication> {
    while (true) {
      const sandbox = this.#sandboxes.get(sandboxId)
      if (!sandbox) break

      const message = await sandbox.pullMessagesQueue()

      // While we were waiting for a message, the user might have removed the sandbox using
      // `deleteSandbox`. We therefore check again whether the sandbox is still in
      // `this.#sandboxes` in order to make sure to not give messages concerning destroyed
      // sandboxes.
      if (!this.#sandboxes.has(sandboxId)) break

      // `message` can be either a `ToApplication` or `null`, but `null` is only ever pushed to
      // the queue when the sandbox is destroyed, in which case the check the line above should
      // have caught that. In other words, if `message` is `null` here, there's a bug in the code.
      yield message!
    }
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
        chain.healthChecker.sendJsonRpc(message.jsonRpcMessage)
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
        const healthChecker = smHealthChecker()
        const chainInitialization: Promise<SmoldotChain> =
          this.#smoldotClient.addChain({
            chainSpec,
            jsonRpcCallback: (jsonRpcMessage) => {
              const filtered = healthChecker.responsePassThrough(jsonRpcMessage)
              if (!filtered) return
              // This JSON-RPC callback will never be called after we call `remove()` on the
              // chain. When we remove a sandbox, we call `remove()` on all of its chains.
              // Consequently, this JSON-RPC callback will never be called after we remove a
              // sandbox. Consequently, the sandbox is always alive here.
              sandbox.pushMessagesQueue({
                origin: "substrate-connect-extension",
                type: "rpc",
                chainId,
                jsonRpcMessage: filtered,
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
        this.#allChainsChangedCallbacks.forEach((cb) => cb())
        this.#allChainsChangedCallbacks = []

        // Spawn in the background an async function to react to the initialization finishing.
        this.#handleChainInitializationFinished(
          sandboxId,
          chainId,
          chainInitialization,
          name,
          healthChecker,
        )

        break
      }

      case "remove-chain": {
        const chain = sandbox.chains.get(message.chainId)
        // As documented in the protocol, remove-chain messages concerning an invalid chainId are
        // simply ignored.
        if (!chain) return

        if (chain.isReady) {
          chain.healthChecker.stop()
          chain.smoldotChain.remove()
        }

        // If the chain isn't ready yet, the function that reacts to the chain initialization
        // being finished will remove it.

        sandbox.chains.delete(message.chainId)
        this.#allChainsChangedCallbacks.forEach((cb) => cb())
        this.#allChainsChangedCallbacks = []
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
    healthChecker: SmoldotHealthChecker,
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
      healthChecker.setSendJsonRpc((rq) => smoldotChain.sendJsonRpc(rq))
      const readyChain: ReadyChain = {
        isReady: true,
        name,
        smoldotChain,
        healthChecker,
      }
      healthChecker.start((health) => {
        readyChain.latestHealthStatus = health
        this.#allChainsChangedCallbacks.forEach((cb) => cb())
        this.#allChainsChangedCallbacks = []
      })
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
  chains: Map<string, InitializingChain | ReadyChain>
  pullMessagesQueue: () => Promise<ToApplication | null>
  pushMessagesQueue: (message: ToApplication | null) => void
}

interface InitializingChain {
  isReady: false
  name: string
  smoldotChain: Promise<SmoldotChain>
}

interface ReadyChain {
  isReady: true
  name: string
  smoldotChain: SmoldotChain
  healthChecker: SmoldotHealthChecker
  latestHealthStatus?: SmoldotHealth
}

interface WellKnownChain {
  chain: SmoldotChain
  spec: string
  healthChecker: SmoldotHealthChecker
  latestHealthStatus?: SmoldotHealth
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
