import type { ProviderInfo } from "@substrate/discovery"
export type * from "@substrate/discovery"

export type SmoldotExtensionAPI = {
  addChain: AddChain
  addWellKnownChain: AddWellKnownChain
}

export type SmoldotExtensionProviderDetail = {
  kind: "smoldot-v1"
  info: ProviderInfo
  provider: Promise<SmoldotExtensionAPI>
}

/**
 * List of popular chains that are likely to be connected to.
 *
 * The values in this enum correspond to the `id` field of the relevant chain specification.
 */
export enum WellKnownChain {
  polkadot = "polkadot",
  ksmcc3 = "ksmcc3",
  rococo_v2_2 = "rococo_v2_2",
  westend2 = "westend2",
  paseo = "paseo",
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
  sendJsonRpc(rpc: string): void

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
   * @throws {AlreadyDestroyedError} If the chain has already been removed.
   * @throws {CrashError} If the background client has crashed.
   */
  remove(): void

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
   
   * @param jsonRpcCallback Callback invoked in response to calling {Chain.sendJsonRpc}.
   * This field is optional. If no callback is provided, the client will save up resources by not
   * starting the JSON-RPC endpoint, and it is forbidden to call {Chain.sendJsonRpc}.
   * Will never be called after ̀{Chain.remove} has been called or if a {CrashError} has been
   * generated.
   *
   * @throws {AddChainError} If the chain can't be added.
   * @throws {CrashError} If the background client has crashed.
   */
  addChain: AddChain
}

export type JsonRpcCallback = (response: string) => void

export type AddChain = (
  chainSpec: string,
  jsonRpcCallback?: JsonRpcCallback,
  databaseContent?: string,
) => Promise<Chain>

export type AddWellKnownChain = (
  id: WellKnownChain,
  jsonRpcCallback?: JsonRpcCallback,
  databaseContent?: string,
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
