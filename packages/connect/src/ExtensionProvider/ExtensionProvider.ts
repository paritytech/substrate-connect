/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RpcCoder } from "@polkadot/rpc-provider/coder"
import {
  JsonRpcResponse,
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from "@polkadot/rpc-provider/types"
import { logger } from "@polkadot/util"
import EventEmitter from "eventemitter3"
import { isUndefined, eraseRecord } from "../utils/index.js"
import { HealthCheckError } from "../errors.js"
import {
  ToExtension,
  ToApplication,
} from "@substrate/connect-extension-protocol"
import { SupportedChains } from "../specs/index.js"
import { getRandomChainId } from "./getRandomChainId.js"

const CONTENT_SCRIPT_ORIGIN = "content-script"
const EXTENSION_PROVIDER_ORIGIN = "extension-provider"

const l = logger(EXTENSION_PROVIDER_ORIGIN)

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

const sendMessage = (msg: ToExtension): void => {
  window.postMessage(msg, "*")
}

const createChain = (
  specMsg: ToExtension & {
    type: "add-well-known-chain" | "add-chain"
  },
) =>
  new Promise<void>((res, rej) => {
    const waitForChainCb = ({ data }: MessageEvent<ToApplication>) => {
      if (
        data.origin !== CONTENT_SCRIPT_ORIGIN ||
        data.chainId !== specMsg.chainId
      ) {
        return
      }

      window.removeEventListener("message", waitForChainCb)

      if (data.type === "chain-ready") return res()

      rej(
        new Error(
          data.type === "error"
            ? data.payload
            : "Unexpected message received from the extension while waiting for 'chain-ready' message",
        ),
      )
    }

    window.addEventListener("message", waitForChainCb)
    sendMessage(specMsg)
  })

/**
 * The ExtensionProvider allows interacting with a smoldot-based WASM light
 * client running in a browser extension.  It is not designed to be used
 * directly.  You should use the `\@substrate/connect` package.
 */
export class ExtensionProvider implements ProviderInterface {
  readonly #coder: RpcCoder = new RpcCoder()
  readonly #eventemitter: EventEmitter = new EventEmitter()
  readonly #handlers: Record<string, RpcStateAwaiting> = {}
  readonly #subscriptions: Record<string, StateSubscription> = {}
  readonly #waitingForId: Record<string, JsonRpcResponse> = {}
  readonly #chainId: string
  #connectionStatePingerId: ReturnType<typeof setInterval> | null
  #isConnected = false

  #chainSpecs: string
  #parachainSpecs: string

  /*
   * How frequently to see if we have any peers
   */
  healthPingerInterval = CONNECTION_STATE_PINGER_INTERVAL

  public constructor(relayChain: string, parachain?: string) {
    this.#chainSpecs = relayChain
    this.#connectionStatePingerId = null
    this.#parachainSpecs = ""
    if (parachain) {
      this.#parachainSpecs = parachain
    }
    this.#chainId = getRandomChainId()
  }

  /**
   * Lets polkadot-js know we support subscriptions
   *
   * @remarks Always returns `true` - this provider supports subscriptions.
   * PolkadotJS uses this internally.
   */
  public get hasSubscriptions(): boolean {
    return true
  }

  /**
   * clone
   *
   * @remarks This method is not supported
   * @throws {@link Error}
   */
  public clone(): ProviderInterface {
    throw new Error("clone() is not supported.")
  }

  #handleMessage = (data: ToApplication): void => {
    const { type } = data
    if (type === "error") {
      this.#isConnected = false
      const error = new Error(data.payload)
      this.emit("error", error)
      // reject all hanging requests
      eraseRecord(this.#handlers, (h) => h.callback(error, undefined))
      eraseRecord(this.#waitingForId)
      return
    }

    if (type === "rpc" && data.payload) {
      l.debug(() => ["received", data.payload])
      const response = JSON.parse(data.payload) as JsonRpcResponse

      return isUndefined(response.method)
        ? this.#onMessageResult(response)
        : this.#onMessageSubscribe(response)
    }

    const errorMessage = `Unrecognised message type from extension ${type}`
    return this.emit("error", new Error(errorMessage))
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
      handler.callback(<Error>error, undefined)
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
      handler.callback(<Error>error, undefined)
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

  async #addChain(): Promise<void> {
    const specMsg: ToExtension & {
      type: "add-well-known-chain" | "add-chain"
    } = {
      origin: EXTENSION_PROVIDER_ORIGIN,
      chainId: this.#parachainSpecs ? getRandomChainId() : this.#chainId,
      ...(SupportedChains[this.#chainSpecs as SupportedChains]
        ? {
            type: "add-well-known-chain" as const,
            payload: this.#chainSpecs,
          }
        : {
            type: "add-chain" as const,
            payload: {
              chainSpec: this.#chainSpecs,
              potentialRelayChainIds: [],
            },
          }),
    }
    await createChain(specMsg)

    if (!this.#parachainSpecs) return

    await createChain({
      origin: EXTENSION_PROVIDER_ORIGIN,
      chainId: this.#chainId,
      type: "add-chain" as const,
      payload: {
        chainSpec: this.#parachainSpecs,
        potentialRelayChainIds: [specMsg.chainId],
      },
    })
  }

  /**
   * "Connect" to the extension - sends a message to the `ExtensionMessageRouter`
   * asking it to connect to the extension background.
   *
   * @returns a resolved Promise
   * @remarks this is async to fulfill the interface with PolkadotJS
   */
  public async connect(): Promise<void> {
    try {
      await this.#addChain()
    } catch (e) {
      const error =
        e instanceof Error
          ? e
          : new Error(
              `An unnexpected error happened while trying to connect. ${e}`,
            )
      this.emit("error", error)
      eraseRecord(this.#handlers, (h) => h.callback(error, undefined))
      return
    }

    window.addEventListener(
      "message",
      ({ data }: MessageEvent<ToApplication>) => {
        if (
          data.origin === CONTENT_SCRIPT_ORIGIN &&
          data.chainId === this.#chainId
        ) {
          this.#handleMessage(data)
        }
      },
    )
    this.#connectionStatePingerId = setInterval(
      this.#checkClientPeercount,
      this.healthPingerInterval,
    )
  }

  /**
   * Manually "disconnect" - sends a message to the `ExtensionMessageRouter`
   * telling it to disconnect the port with the background manager.
   */
  public disconnect(): Promise<void> {
    if (this.#connectionStatePingerId !== null) {
      clearInterval(this.#connectionStatePingerId)
    }
    sendMessage({
      origin: EXTENSION_PROVIDER_ORIGIN,
      chainId: this.#chainId,
      type: "remove-chain",
    })
    this.#isConnected = false
    this.emit("disconnected")
    return Promise.resolve()
  }

  /**
   * Whether the node is connected or not.
   *
   * @returns true - if connected otherwise false
   */
  public get isConnected(): boolean {
    return this.#isConnected
  }

  /**
   * Listen to provider events - in practice the smoldot provider only
   * emits a `connected` event after successfully starting the smoldot client
   * and `disconnected` after `disconnect` is called.
   * @param type - Event
   * @param sub - Callback
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
   *
   * @param method - The RPC methods to execute
   * @param params - Encoded paramaters as applicable for the method
   * @param subscription - Subscription details (internally used by `subscribe`)
   */
  public async send<T = any>(
    method: string,
    params: unknown[],
    isCacheable?: boolean,
    subscription?: SubscriptionHandler,
  ): Promise<T> {
    return new Promise((resolve, reject): void => {
      const json = this.#coder.encodeJson(method, params)
      const id = this.#coder.getId()

      const callback = (error?: Error | null, result?: unknown): void => {
        error ? reject(error) : resolve(<T>result)
      }

      l.debug(() => ["calling", method, json])

      this.#handlers[id] = {
        callback,
        method,
        subscription,
      }

      const rpcMsg: ToExtension = {
        origin: EXTENSION_PROVIDER_ORIGIN,
        chainId: this.#chainId,
        type: "rpc",
        payload: json,
      }
      sendMessage(rpcMsg)
    })
  }

  /**
   * Allows subscribing to a specific event.
   *
   * @param type     - Subscription type
   * @param method   - Subscription method
   * @param params   - Parameters
   * @param callback - Callback
   * @returns Promise  - resolves to the id of the subscription you can use with [[unsubscribe]].
   *
   * @example
   * <BR>
   *
   * ```javascript
   * const provider = new ExtensionProvider(client);
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
    params: any[],
    callback: ProviderInterfaceCallback,
  ): Promise<number | string> {
    return (await this.send(method, params, false, {
      callback,
      type,
    })) as unknown as Promise<number | string>
  }

  /**
   * Allows unsubscribing to subscriptions made with [[subscribe]].
   *
   * @param type   - Subscription type
   * @param method - Subscription method
   * @param id     - Id passed for send parameter
   * @returns Promise resolving to whether the unsunscribe request was successful.
   */
  public async unsubscribe(
    type: string,
    method: string,
    id: number | string,
  ): Promise<boolean> {
    const subscription = `${type}::${id}`

    if (isUndefined(this.#subscriptions[subscription])) {
      l.debug(() => `Unable to find active subscription=${subscription}`)

      return false
    }

    delete this.#subscriptions[subscription]

    return (await this.send(method, [id])) as unknown as Promise<boolean>
  }

  private emit(type: ProviderInterfaceEmitted, ...args: unknown[]): void {
    this.#eventemitter.emit(type, ...args)
  }
}

export type ExtensionProviderClass = typeof ExtensionProvider
