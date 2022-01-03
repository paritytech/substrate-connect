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
  ProviderMessageToExtension,
  MessageFromManager,
  ExtensionMessage,
  ExtensionMessageData,
  provider,
} from "@substrate/connect-extension-protocol"

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
let nextChainId = 1

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
  #connectionStatePingerId: ReturnType<typeof setInterval> | null
  #isConnected = false

  #chainSpecs: string
  #parachainSpecs: string
  #commonMessageData: Pick<
    ProviderMessageToExtension,
    "appName" | "chainId" | "chainName" | "origin"
  >

  /*
   * How frequently to see if we have any peers
   */
  healthPingerInterval = CONNECTION_STATE_PINGER_INTERVAL

  public constructor(
    displayName: string,
    relayChain: string,
    parachain?: string,
  ) {
    /**
     * TODO: we should remove the chainName from the payload of the messages,
     * since this is information that doesn't have to be sent on every message and
     * the Extension can extract it from the chainSpecs, also that way we avoid
     * parsing a large JSON on the main thread.
     */
    this.#chainSpecs = relayChain
    this.#connectionStatePingerId = null
    this.#parachainSpecs = ""
    if (parachain) {
      this.#parachainSpecs = parachain
    }
    this.#commonMessageData = {
      appName: displayName,
      chainId: nextChainId++,
      chainName: JSON.parse(relayChain).name,
      origin: EXTENSION_PROVIDER_ORIGIN,
    }
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

  #handleMessage = (data: ExtensionMessageData): void => {
    if (data.disconnect && data.disconnect === true) {
      this.#isConnected = false
      this.emit("disconnected")
      const error = new Error("Disconnected from the extension")
      // reject all hanging requests
      eraseRecord(this.#handlers, (h) => h.callback(error, undefined))
      eraseRecord(this.#waitingForId)
      return
    }

    const message = data.message as MessageFromManager
    if (message.type === "error") {
      return this.emit("error", new Error(message.payload))
    }

    if (message.type === "rpc") {
      const rpcString = message.payload
      l.debug(() => ["received", rpcString])
      const response = JSON.parse(rpcString) as JsonRpcResponse

      return isUndefined(response.method)
        ? this.#onMessageResult(response)
        : this.#onMessageSubscribe(response)
    }

    const errorMessage = `Unrecognised message type from extension ${message.type}`
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

  /**
   * "Connect" to the extension - sends a message to the `ExtensionMessageRouter`
   * asking it to connect to the extension background.
   *
   * @returns a resolved Promise
   * @remarks this is async to fulfill the interface with PolkadotJS
   */
  public connect(): Promise<void> {
    const connectMsg: ProviderMessageToExtension = {
      ...this.#commonMessageData,
      action: "connect",
    }
    provider.send(connectMsg)

    // Once connect is sent - send rpc to extension that will contain the chainSpecs
    // for the extension to call addChain on smoldot
    const specMsg: ProviderMessageToExtension = {
      ...this.#commonMessageData,
      action: "forward",
      type: "spec",
      payload: this.#chainSpecs || "",
    }
    if (this.#parachainSpecs) {
      specMsg.parachainPayload = this.#parachainSpecs
    }
    provider.send(specMsg)

    provider.listen(({ data }: ExtensionMessage) => {
      if (data.origin && data.origin === CONTENT_SCRIPT_ORIGIN) {
        this.#handleMessage(data)
      }
    })
    this.#connectionStatePingerId = setInterval(
      this.#checkClientPeercount,
      this.healthPingerInterval,
    )

    return Promise.resolve()
  }

  /**
   * Manually "disconnect" - sends a message to the `ExtensionMessageRouter`
   * telling it to disconnect the port with the background manager.
   */
  public disconnect(): Promise<void> {
    const disconnectMsg: ProviderMessageToExtension = {
      ...this.#commonMessageData,
      action: "disconnect",
    }

    provider.send(disconnectMsg)
    if (this.#connectionStatePingerId !== null) {
      clearInterval(this.#connectionStatePingerId)
    }
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

      const rpcMsg: ProviderMessageToExtension = {
        ...this.#commonMessageData,
        action: "forward",
        type: "rpc",
        payload: json,
      }
      provider.send(rpcMsg)
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
