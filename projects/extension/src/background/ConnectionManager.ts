import {
  Client as SmoldotClient,
  healthChecker as smHealthChecker,
  Chain as SmoldotChain,
  start as smoldotStart,
  HealthChecker as SmoldotHealthChecker,
  SmoldotHealth,
} from "@substrate/smoldot-light"

import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"

export interface ChainInfo<SandboxId> {
  chainName: string
  healthStatus?: SmoldotHealth
  apiInfo?: {
    chainId: string
    sandboxId: SandboxId
  }
}

export class ConnectionManager<SandboxId> {
  #smoldotClient: SmoldotClient = smoldotStart()
  #sandboxes: Map<SandboxId, Sandbox> = new Map()
  #wellKnownChains: Map<string, WellKnownChain> =
    new Map()

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
    const healthChecker = smHealthChecker();

    const chain = await this.#smoldotClient.addChain({
      chainSpec: spec,
      jsonRpcCallback: (response) => {
        healthChecker.responsePassThrough(response);
      },
      databaseContent,
      potentialRelayChains: [],
    })

    const wellKnownChain: WellKnownChain = { chain, spec, healthChecker };

    healthChecker.setSendJsonRpc((rq) => chain.sendJsonRpc(rq));
    healthChecker.start((health) => wellKnownChain.healthStatus = health)

    this.#wellKnownChains.set(chainName, wellKnownChain)
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
        healthStatus: chain.healthStatus,
      })
    }

    for (const [sandboxId, sandbox] of this.#sandboxes) {
      for (const [chainId, chain] of sandbox.chains) {
        output.push({
          chainName: chain.name,
          healthStatus: chain.isReady ? chain.healthObject.healthStatus : undefined,
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
   */
  addSandbox(sandboxId: SandboxId) {
    if (this.#sandboxes.has(sandboxId)) throw new Error("Duplicate sandboxId")

    let messagesQueueBack:
      | null
      | ((item: [ToApplication | null, Stream]) => void) = null
    const messagesQueueFront = new Promise<[ToApplication | null, Stream]>(
      (r, _) => {
        messagesQueueBack = r
      },
    )

    this.#sandboxes.set(sandboxId, {
      messagesQueueBack: messagesQueueBack!,
      messagesQueueFront,
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
      if (!chain.isReady) chain.smoldotChain.then((chain) => chain.remove())
      else {
        chain.healthChecker.stop()
        chain.smoldotChain.remove()
      }
    })
    sendSandbox(sandbox, null)
    this.#sandboxes.delete(sandboxId)
  }

  /**
   * Returns the list of all sandboxes that have been added.
   */
  get sandboxes(): IterableIterator<SandboxId> {
    return this.#sandboxes.keys()
  }

  /**
   * Asynchronous iterator that yields all the `ToApplication` messages that are generated in
   * response to `sandboxMessage`.
   */
  async *sandboxOutput(sandboxId: SandboxId): AsyncGenerator<ToApplication> {
    while (true) {
      const sandbox = this.#sandboxes.get(sandboxId)!

      const [message, nextFront] = await sandbox.messagesQueueFront
      sandbox.messagesQueueFront = nextFront
      if (!message) break
      yield message
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
          sendSandbox(sandbox, {
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
          sendSandbox(sandbox, {
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
            sendSandbox(sandbox, {
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
              sendSandbox(sandbox, {
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

          // Spawn in the background an async function that is called once the initialization
          // finished, either successfully or not.
          ; (async () => {
            // `result` contains either the chain (on success) or the error message (on failure).
            let result: SmoldotChain | string
            try {
              result = await chainInitialization
            } catch (err) {
              result =
                err instanceof Error
                  ? err.message
                  : "Unknown error when adding chain"
            }

            // Because the chain initialization might have taken a long time, we first need to
            // check whether the chain that we're initializing is still in `this`, as it might
            // have been removed by various other functions if it no longer interests us.
            const sandbox = this.#sandboxes.get(sandboxId)
            if (
              !sandbox ||
              !(sandbox.chains.get(chainId)?.smoldotChain === chainInitialization)
            ) {
              typeof result !== "string" && result.remove()
              return
            }

            // Update `sandbox.chains`, either updating the entry on success or removing it on
            // failure, and send back a message.
            if (typeof result !== "string") {
              const smoldotChain: SmoldotChain = result
              healthChecker.setSendJsonRpc((rq) => smoldotChain.sendJsonRpc(rq))
              const healthObject: { healthStatus?: SmoldotHealth } = {}
              healthChecker.start((health) => {
                healthObject.healthStatus = health
              })
              sandbox.chains.set(chainId, {
                isReady: true,
                name,
                smoldotChain,
                healthChecker,
                healthObject,
              })
              sendSandbox(sandbox, {
                origin: "substrate-connect-extension",
                type: "chain-ready",
                chainId: message.chainId,
              })
            } else {
              sandbox.chains.delete(chainId)
              sendSandbox(sandbox, {
                origin: "substrate-connect-extension",
                type: "error",
                chainId: message.chainId,
                errorMessage: result,
              })
            }
          })()

        break
      }

      case "remove-chain": {
        const chain = sandbox.chains.get(message.chainId)
        // As documented in the protocol, remove-chain messages concerning an invalid chainId are
        // simply ignored.
        if (!chain) return

        // If the chain isn't ready yet, we remove it anyway, and do the clean up by adding
        // a callback to the `Promise`.
        if (!chain.isReady) chain.smoldotChain.then((chain) => chain.remove())
        else {
          chain.healthChecker.stop()
          chain.smoldotChain.remove()
        }
        sandbox.chains.delete(message.chainId)
        break
      }
    }
  }
}

interface Sandbox {
  chains: Map<string, InitializingChain | ReadyChain>

  // A `Promise` that resolves to a tuple of `[ToApplication | null, Promise]`. The second
  // element of the tuple is a `Promise` to the following message.
  // In order to pull an element from the queue, wait for this promise, then overwrite
  // `messagesQueueFront` with the yielded `̀Promise`.
  messagesQueueFront: Stream
  // The `resolve` function of the last `Promise` of the queue.
  messagesQueueBack: (item: [ToApplication | null, Stream]) => void
}

type Stream = Promise<[ToApplication | null, Stream]>

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
  healthObject: { healthStatus?: SmoldotHealth }
}

interface WellKnownChain {
  chain: SmoldotChain
  spec: string
  healthChecker: SmoldotHealthChecker
  healthStatus?: SmoldotHealth
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

/**
 * Pushes a message on the queue of messages of the given `Sandbox`.
 */
function sendSandbox(sandbox: Sandbox, message: ToApplication | null) {
  let resolve: null | ((item: [ToApplication | null, Stream]) => void) = null
  const nextMessage = new Promise<[ToApplication | null, Stream]>((r, _) => {
    resolve = r
  })

  sandbox.messagesQueueBack([message, nextMessage])
  sandbox.messagesQueueBack = resolve!
}
