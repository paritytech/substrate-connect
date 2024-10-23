import type { ProviderInfo } from "@substrate/discovery"
export type * from "@substrate/discovery"

export type SmoldotExtensionAPI = Readonly<{
  addChain: AddChain
  addWellKnownChain: AddWellKnownChain
}>

export type SmoldotExtensionProviderDetail = Readonly<{
  kind: "smoldot-v1"
  info: ProviderInfo
  provider: Promise<SmoldotExtensionAPI>
}>

/**
 * List of popular chains that are likely to be connected to.
 *
 * The values in this enum correspond to the `id` field of the relevant chain specification.
 */
export const WellKnownChain = {
  polkadot: "polkadot",
  ksmcc3: "ksmcc3",
  rococo_v2_2: "rococo_v2_2",
  westend2: "westend2",
  paseo: "paseo",
} as const

export type WellKnownChain =
  (typeof WellKnownChain)[keyof typeof WellKnownChain]

export namespace WellKnownChain {
  export type polkadot = typeof WellKnownChain.polkadot
  export type ksmcc3 = typeof WellKnownChain.ksmcc3
  export type rococo_v2_2 = typeof WellKnownChain.rococo_v2_2
  export type westend2 = typeof WellKnownChain.westend2
  export type paseo = typeof WellKnownChain.paseo
}

/**
 * Active connection to a blockchain.
 */
export interface Chain {
  /**
   * Enqueues a JSON-RPC request that the client will process as soon as possible.
   *
   * The response will be sent back using the callback passed when adding the chain.
   *
   * See <https://www.jsonrpc.org/specification> for a specification of the JSON-RPC format. Only
   * version 2 is supported.
   * Be aware that some requests will cause notifications to be sent back using the same callback
   * as the responses.
   *
   * No response is generated if the request isn't a valid JSON-RPC request or if the request is
   * unreasonably large (8 MiB at the time of writing of this comment). The request is then
   * silently discarded.
   * If, however, the request is a valid JSON-RPC request but that concerns an unknown method, a
   * error response is properly generated.
   *
   * Two JSON-RPC APIs are supported:
   *
   * - The "legacy" one, documented here: <https://polkadot.js.org/docs/substrate/rpc>
   * - The more recent one: <https://github.com/paritytech/json-rpc-interface-spec>
   *
   * @param rpc JSON-encoded RPC request.
   *
   * @throws {AlreadyDestroyedError} If the chain has been removed.
   * @throws {JsonRpcDisabledError} If no JSON-RPC callback was passed in the options of the chain.
   * @throws {CrashError} If the background client has crashed.
   */
  readonly sendJsonRpc: (rpc: string) => void

  /**
   * Waits for a JSON-RPC response or notification to be generated.
   *
   * Each chain contains a buffer of the responses waiting to be sent out. Calling this function
   * pulls one element from the buffer. If this function is called at a slower rate than
   * responses are generated, then the buffer will eventually become full, at which point calling
   * {@link Chain.sendJsonRpc} will throw an exception. The size of this buffer can be configured
   * through {@link AddChainOptions.jsonRpcMaxPendingRequests}.
   *
   * If this function is called multiple times "simultaneously" (generating multiple different
   * `Promise`s), each `Promise` will return a different JSON-RPC response or notification. In
   * that situation, there is no guarantee in the ordering in which the responses or notifications
   * are yielded. Calling this function multiple times "simultaneously" is in general a niche
   * corner case that you are encouraged to avoid.
   *
   * @throws {@link AlreadyDestroyedError} If the chain has been removed or the client has been terminated.
   * @throws {@link JsonRpcDisabledError} If the JSON-RPC system was disabled in the options of the chain.
   * @throws {@link CrashError} If the background client has crashed.
   */
  readonly nextJsonRpcResponse: () => Promise<string>

  /**
   * JSON-RPC responses or notifications async iterable.
   *
   * Each chain contains a buffer of the responses waiting to be sent out. Iterating over this
   * pulls one element from the buffer. If the iteration happen at a slower rate than
   * responses are generated, then the buffer will eventually become full, at which point calling
   * {@link Chain.sendJsonRpc} will throw an exception. The size of this buffer can be configured
   * through {@link AddChainOptions.jsonRpcMaxPendingRequests}.
   *
   * @throws {@link JsonRpcDisabledError} If the JSON-RPC system was disabled in the options of the chain.
   * @throws {@link CrashError} If the background client has crashed.
   */
  readonly jsonRpcResponses: AsyncIterableIterator<string>
  /**
   * Disconnects from the blockchain.
   *
   * The JSON-RPC callback will no longer be called.
   *
   * Trying to use the chain again will lead to an exception being thrown.
   *
   * If this chain is a relay chain, then all parachains that use it will continue to work. Smoldot
   * automatically keeps alive all relay chains that have an active parachains. There is no need
   * to track parachains and relaychains, or to destroy them in the correct order, as this is
   * handled automatically.
   *
   * @throws {@link AlreadyDestroyedError} If the chain has already been removed.
   * @throws {@link CrashError} If the background client has crashed.
   */
  readonly remove: () => void

  /**
   * Connects to a parachain.
   *
   * Throws an exception if the chain specification isn't valid, or if the chain specification
   * concerns a parachain but no corresponding relay chain can be found.
   *
   * Smoldot will automatically de-duplicate chains if multiple identical chains are
   * added, in order to save resources. In other words, it is not a problem to call `addChain`
   * multiple times with the same chain specifications and obtain multiple `Chain`.
   * When the same client is used for multiple different purposes, you are in fact strongly
   * encouraged to trust smoldot and not attempt to de-duplicate chains yourself, as
   * determining whether two chains are identical is complicated and might have security
   * implications.
   *
   * Smoldot tries to distribute CPU resources equally between all active `Chain`
   * objects.
   *
   * @param chainSpec Specification of the chain to add.
   *
   * @throws {@link AddChainError} If the chain can't be added.
   * @throws {@link CrashError} If the background client has crashed.
   */
  readonly addChain: AddChain
}

export type AddChainOptions = Readonly<{
  disableJsonRpc?: boolean
  databaseContent?: string | undefined
  jsonRpcMaxPendingRequests?: number
}>

export type AddChain = (
  chainSpec: string,
  options?: AddChainOptions,
) => Promise<Chain>
export type AddWellKnownChain = (
  id: WellKnownChain,
  options?: AddChainOptions,
) => Promise<Chain>

export class AlreadyDestroyedError extends Error {
  constructor() {
    super()
    this.name = "AlreadyDestroyedError"
  }
}

export class CrashError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CrashError"
  }
}

export class JsonRpcDisabledError extends Error {
  constructor() {
    super()
    this.name = "JsonRpcDisabledError"
  }
}

export class QueueFullError extends Error {
  constructor() {
    super()
    this.name = "QueueFullError"
  }
}
