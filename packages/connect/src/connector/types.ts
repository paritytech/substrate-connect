import {
  AddChain,
  AddWellKnownChain,
} from "@substrate/smoldot-discovery/smoldot"

/**
 * Client that allows connecting to chains.
 *
 * Use {ScClient.addChain} or {ScClient.addWellKnownChain} to connect to a
 * chain.
 *
 * If you want to connect to a parachain, you **must** have connected to its corresponding relay
 * chain with the same instance of {ScClient}. The matching between relay chains and
 * parachains is done through the `relay_chain` field in the parachain specification.
 */
export interface ScClient {
  /**
   * Connects to a chain.
   *
   * Throws an exception if the chain specification isn't valid, or if the chain specification
   * concerns a parachain but no corresponding relay chain can be found.
   *
   * Substrate-connect will automatically de-duplicate chains if multiple identical chains are
   * added, in order to save resources. In other words, it is not a problem to call `addChain`
   * multiple times with the same chain specifications and obtain multiple `Chain`.
   * When the same client is used for multiple different purposes, you are in fact strongly
   * encouraged to trust substrate-connect and not attempt to de-duplicate chains yourself, as
   * determining whether two chains are identical is complicated and might have security
   * implications.
   *
   * Substrate-connect tries to distribute CPU resources equally between all active `Chain`
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

  /**
   * Connects to a chain, by its `id`.
   *
   * Throws an exception if no chain with this name is known.
   *
   * Substrate-connect will automatically de-duplicate chains if multiple identical chains are
   * added, in order to save resources. In other words, it is not a problem to call `addChain`
   * multiple times with the same chain specifications and obtain multiple `Chain`.
   * When the same client is used for multiple different purposes, you are in fact strongly
   * encouraged to trust substrate-connect and not attempt to de-duplicate chains yourself, as
   * determining whether two chains are identical is complicated and might have security
   * implications.
   *
   * Substrate-connect tries to distribute CPU resources equally between all active `Chain`
   * objects.
   *
   * @param id Name of the well-known chain to add.
   * @param jsonRpcCallback Same parameter as for {ScClient.addChain}
   *
   * @throws {AddChainError} If no chain with this name is known.
   * @throws {CrashError} If the background client has crashed.
   */
  addWellKnownChain: AddWellKnownChain
}

export * from "@substrate/smoldot-discovery/smoldot"
