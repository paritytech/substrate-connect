import { RpcCoder } from "@polkadot/rpc-provider/coder"
import {
  JsonRpcResponse,
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from "@polkadot/rpc-provider/types"
import { assert, logger } from "@polkadot/util"
import EventEmitter from "eventemitter3"
import { WellKnownChains } from "../WellKnownChains.js"
import { getConnectorClient, Chain } from "../connector/index.js"
import { HealthCheckError } from "./Health.js"

const { addChain, addWellKnownChain } = getConnectorClient()
const l = logger("smoldot-provider")

interface RpcStateAwaiting {
  callback: ProviderInterfaceCallback
  method: string
  subscription?: SubscriptionHandler
}

interface SubscriptionHandler {
  callback: ProviderInterfaceCallback
  // type is the value of the method property in the JSON responses to this
  // subscription
  type: string
}

interface StateSubscription extends SubscriptionHandler {
  method: string
}

interface HealthResponse {
  //indicates whether GrandPa wrap syncing is done
  isSyncing: boolean
  //indicates the amount of connected peers
  peers: number
  shouldHavePeers: boolean
}

const ANGLICISMS: { [index: string]: string } = {
  chain_finalisedHead: "chain_finalizedHead",
  chain_subscribeFinalisedHeads: "chain_subscribeFinalizedHeads",
  chain_unsubscribeFinalisedHeads: "chain_unsubscribeFinalizedHeads",
}

/*
 * Number of milliseconds to wait between checks to see if we have any
 * connected peers in the smoldot client
 */
const CONNECTION_STATE_PINGER_INTERVAL = 2000

/**
 * ScProvider is an API for providing an instance of a PolkadotJS Provider
 * to use a WASM-based light client. It takes care of detecting whether the
 * user has the substrate connect browser extension installed or not and
 * configures the PolkadotJS API appropriately; falling back to a provider
 * which instantiates the WASM light client in the page when the extension is
 * not available.
 *
 * @example
 *
 * ```
 * import { ScProvider, WellKnownChains } from '@substrate/connect';
 * import { ApiPromise } from '@polkadot/api';
 *
 * // Create a new UApp with a unique name
 * const westendProvider = ScProvider(WellKnownChains.westend2)
 * const westend = await ApiPromise.create({ provider: westendProvider })
 *
 * const kusamaProvider = ScProvider(WellKnownChains.ksmcc3)
 * const kusama = await ApiPromise.create({ provider: kusamaProvider })
 *
 * await westendProvider.rpc.chain.subscribeNewHeads((lastHeader) => {
 *   console.log(lastHeader.hash);
 * );
 * await kusamaProvider.rpc.chain.subscribeNewHeads((lastHeader) => {
 *   console.log(lastHeader.hash);
 * });
 *
 * // Interact with westend and kusama APIs ...
 *
 * await westendProvider.disconnect();
 * await kusamaProvider.disconnect();
 * ```
 */
export class ScProvider implements ProviderInterface {
  #chainSpec: string
  readonly #coder: RpcCoder = new RpcCoder()
  readonly #eventemitter: EventEmitter = new EventEmitter()
  readonly #handlers: Record<string, RpcStateAwaiting> = {}
  readonly #subscriptions: Record<string, StateSubscription> = {}
  readonly #waitingForId: Record<string, JsonRpcResponse> = {}
  #connectionStatePingerId: ReturnType<typeof setInterval> | null
  #isConnected = false
  #chain: Chain | undefined = undefined
  #parachainSpecs: string | undefined = undefined

  /*
   * How frequently to see if we have any peers
   */
  healthPingerInterval = CONNECTION_STATE_PINGER_INTERVAL

  /**
   * @param knownChain - the name of a supported chain ({@link WellKnownChains})
   * @param parachainSpec - optional param of the parachain chainSpecs to connect to
   * @param autoConnect - whether the ScProvider should eagerly connect while its being instantiated. Defaults to `true`
   *
   */
  public constructor(
    knownChain: WellKnownChains,
    parachainSpec?: string,
    autoConnect?: boolean,
  )
  /**
   * @param chainSpec - a string with the spec of the chain
   * @param parachainSpec - optional param of the parachain chainSpecs to connect to
   * @param autoConnect - whether the ScProvider should eagerly connect while its being instantiated. Defaults to `true`
   *
   */
  public constructor(
    chainSpec: string,
    parachainSpec?: string,
    autoConnect?: boolean,
  )
  public constructor(
    chainSpec: string,
    parachain?: string,
    autoConnect = true,
  ) {
    this.#chainSpec = chainSpec
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#connectionStatePingerId = null
    if (parachain) {
      this.#parachainSpecs = parachain
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (autoConnect) this.connect()
  }

  /**
   * Lets polkadot-js know we support subscriptions
   * @returns `true`
   */
  public get hasSubscriptions(): boolean {
    return true
  }

  /**
   * Returns a clone of the object
   * @throws throws an error as this is not supported.
   */
  public clone(): ScProvider {
    throw new Error("clone() is not supported.")
  }

  #handleRpcReponse = (res: string): void => {
    l.debug(() => ["received", res])

    const response = JSON.parse(res) as JsonRpcResponse

    return response.method === undefined
      ? this.#onMessageResult(response)
      : this.#onMessageSubscribe(response)
  }

  #onMessageResult = (response: JsonRpcResponse): void => {
    const handler = this.#handlers[response.id]

    if (!handler) {
      l.debug(() => `Unable to find handler for id=${response.id}`)

      return
    }

    try {
      const { method, subscription } = handler
      const result = this.#coder.decodeResponse(response) as string

      // first send the result - in case of subs, we may have an update
      // immediately if we have some queued results already
      handler.callback(null, result)

      if (subscription) {
        const subId = `${subscription.type}::${result}`

        this.#subscriptions[subId] = {
          ...subscription,
          method,
        }

        // if we have a result waiting for this subscription already
        if (this.#waitingForId[subId]) {
          this.#onMessageSubscribe(this.#waitingForId[subId])
        }
      }
    } catch (error) {
      handler.callback(error as Error, undefined)
    }

    delete this.#handlers[response.id]
  }

  #onMessageSubscribe = (response: JsonRpcResponse): void => {
    const method =
      ANGLICISMS[response.method as string] || response.method || "invalid"
    const subId = `${method}::${response.params.subscription}`
    const handler = this.#subscriptions[subId]

    if (!handler) {
      // store the response, we could have out-of-order subid coming in
      this.#waitingForId[subId] = response

      l.debug(
        () =>
          `Unable to find handler for subscription=${subId} responseId=${response.id}`,
      )

      return
    }

    // housekeeping
    delete this.#waitingForId[subId]

    try {
      const result = this.#coder.decodeResponse(response)

      handler.callback(null, result)
    } catch (error) {
      handler.callback(error as Error, undefined)
    }
  }

  #simulateLifecycle = (health: HealthResponse): void => {
    // development chains should not have peers so we only emit connected
    // once and never disconnect
    if (health.shouldHavePeers == false) {
      if (!this.#isConnected) {
        this.#isConnected = true
        this.emit("connected")
        l.debug(`emitted CONNECTED`)
        return
      }

      return
    }

    const peerCount = health.peers
    const peerChecks =
      (peerCount > 0 || !health.shouldHavePeers) && !health.isSyncing

    l.debug(`Simulating lifecylce events from system_health`)
    l.debug(
      `isConnected: ${this.#isConnected.toString()}, new peerCount: ${peerCount}`,
    )

    if (this.#isConnected && peerChecks) {
      // still connected
      return
    }

    if (this.#isConnected && peerCount === 0) {
      this.#isConnected = false
      this.emit("disconnected")
      l.debug(`emitted DISCONNECTED`)
      return
    }

    if (!this.#isConnected && peerChecks) {
      this.#isConnected = true
      this.emit("connected")
      l.debug(`emitted CONNECTED`)
      return
    }

    // still not connected
  }

  #checkClientPeercount = (): void => {
    this.send("system_health", [])
      .then(this.#simulateLifecycle)
      .catch((error) => this.emit("error", new HealthCheckError(error)))
  }

  /**
   * "Connect" the WASM client - starts the smoldot WASM client
   */
  public connect = async (): Promise<void> => {
    try {
      if (this.#parachainSpecs) {
        const relay = await (this.#chainSpec in WellKnownChains
          ? addWellKnownChain(this.#chainSpec as WellKnownChains)
          : addChain(this.#chainSpec))

        this.#chain = await addChain(
          this.#parachainSpecs,
          (response: string) => {
            this.#handleRpcReponse(response)
          },
        )

        const parachainRemove = this.#chain.remove.bind(this.#chain)
        this.#chain.remove = () => {
          parachainRemove()
          relay.remove()
        }
      } else {
        const jsonRpcCallback = (response: string) => {
          this.#handleRpcReponse(response)
        }

        this.#chain = await (this.#chainSpec in WellKnownChains
          ? addWellKnownChain(
              this.#chainSpec as WellKnownChains,
              jsonRpcCallback,
            )
          : addChain(this.#chainSpec, jsonRpcCallback))
      }
      this.#connectionStatePingerId = setInterval(
        this.#checkClientPeercount,
        this.healthPingerInterval,
      )
    } catch (error: unknown) {
      this.emit("error", error)
    }
  }

  /**
   * Manually "disconnect" - drops the reference to the WASM client
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async disconnect(): Promise<void> {
    try {
      if (this.#chain) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.#chain.remove()
      }
    } catch (error: unknown) {
      this.emit("error", error)
    } finally {
      if (this.#connectionStatePingerId !== null) {
        clearInterval(this.#connectionStatePingerId)
      }

      this.#isConnected = false
      this.emit("disconnected")
    }
  }

  /**
   * Whether the node is connected or not.
   * @returns true if connected
   */
  public get isConnected(): boolean {
    return this.#isConnected
  }

  /**
   * Listen to provider events - in practice the smoldot provider only
   * emits a `connected` event after successfully starting the smoldot client
   * and `disconnected` after `disconnect` is called.
   * @param type - Event
   * @param sub  - Callback
   */
  public on(
    type: ProviderInterfaceEmitted,
    sub: ProviderInterfaceEmitCb,
  ): () => void {
    this.#eventemitter.on(type, sub)

    return (): void => {
      this.#eventemitter.removeListener(type, sub)
    }
  }

  /**
   * Send an RPC request  the wasm client
   * @param method       - The RPC methods to execute
   * @param params       - Encoded paramaters as applicable for the method
   * @param subscription - Subscription details (internally used by `subscribe`)
   */
  public async send(
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: unknown[],
    isCacheable?: boolean,
    subscription?: SubscriptionHandler,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return new Promise((resolve, reject): void => {
      assert(this.#chain, "Chain is not initialised")
      const json = this.#coder.encodeJson(method, params)
      const id = this.#coder.getId()

      const callback = (error?: Error | null, result?: unknown): void => {
        error ? reject(error) : resolve(result)
      }

      l.debug(() => ["calling", method, json])

      this.#handlers[id] = {
        callback,
        method,
        subscription,
      }
      this.#chain.sendJsonRpc(json)
    })
  }

  /**
   * subscribe
   * Allows subscribing to a specific event.
   * @param  type     - Subscription type
   * @param  method   - Subscription method
   * @param  params   - Parameters of type any[]
   * @param  callback - ProviderInterfaceCallback
   * @returns A promise (Promise\<number|string\>) resolving to the id of the subscription you can use with [[unsubscribe]].
   *
   * @example
   * <BR>
   *
   * ```javascript
   * const provider = new SmoldotProvider(client);
   * const rpc = new Rpc(provider);
   *
   * rpc.state.subscribeStorage([[storage.balances.freeBalance, <Address>]], (_, values) => {
   *   console.log(values)
   * }).then((subscriptionId) => {
   *   console.log('balance changes subscription id: ', subscriptionId)
   * })
   * ```
   */
  public async subscribe(
    // the "method" property of the JSON response to this subscription
    type: string,
    // the "method" property of the JSON request to register the subscription
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[],
    callback: ProviderInterfaceCallback,
  ): Promise<number | string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.send(method, params, false, { callback, type })
  }

  /**
   * Allows unsubscribing to subscriptions made with [[subscribe]].
   */
  public async unsubscribe(
    type: string,
    method: string,
    id: number | string,
  ): Promise<boolean> {
    const subscription = `${type}::${id}`

    if (!this.#subscriptions[subscription]) {
      l.debug(() => `Unable to find active subscription=${subscription}`)

      return false
    }

    delete this.#subscriptions[subscription]

    return (await this.send(method, [id])) as Promise<boolean>
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(type: ProviderInterfaceEmitted, ...args: unknown[]): void {
    this.#eventemitter.emit(type, ...args)
  }
}
