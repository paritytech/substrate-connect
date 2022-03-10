import {
  Client as SmoldotClient,
} from "@substrate/smoldot-light"

import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"

import { ChainInfo, ConnectionManager } from './ConnectionManager'

export { ChainInfo } from './ConnectionManager'

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
 * # Information about the list of chains
 *
 * At any point, information about all the chains contained within the {ConnectionManager} can
 * be retrieved using {ConnectionManager.allChains}. This can be used for display purposes.
 *
 * Use {ConnectionManager.waitAllChainChanged} to wait until the next time any field within the
 * value returned by {ConnectionManager.allChains} has potentially been modified.
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
export class ConnectionManagerWithHealth<SandboxId> {
  #inner: ConnectionManager<SandboxId>
  #sandboxesChains: Map<SandboxId, Set<string>> = new Map();

  constructor(smoldotClient: SmoldotClient) {
    this.#inner = new ConnectionManager(smoldotClient)
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
    this.#inner.addWellKnownChain(chainName, spec, databaseContent)
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
    return await this.#inner.wellKnownChainDatabaseContent(chainName, maxUtf8BytesSize)
  }

  /**
   * Returns a list of all chains, for display purposes only.
   *
   * This includes both well-known chains and chains added by sandbox messages.
   */
  get allChains(): ChainInfo<SandboxId>[] {
    return this.#inner.allChains
  }

  /**
   * Waits for the value of `allChains` to have potentially changed.
   */
  async waitAllChainChanged(): Promise<void> {
    await this.#inner.waitAllChainChanged()
  }

  /**
   * Inserts a sandbox in the list of sandboxes held by this state machine.
   *
   * @throws Throws an exception if a sandbox with that identifier already exists.
   */
  addSandbox(sandboxId: SandboxId) {
    // We don't neeed to check for duplicate `sandboxId` below, because this is done
    // by `this.#inner.addSandbox`. For this reason, we call `this.#inner` first.
    this.#inner.addSandbox(sandboxId);

    this.#sandboxesChains.set(sandboxId, new Set());
  }

  /**
   * Removes a sandbox from the list of sandboxes.
   *
   * This performs some internal clean ups.
   *
   * Any iterator concerning this sandbox that was returned by {ConnectionManager.sandboxOutput}
   * will end.
   *
   * @throws Throws an exception if the ̀`sandboxId` isn't valid.
   */
  deleteSandbox(sandboxId: SandboxId) {
    this.#inner.deleteSandbox(sandboxId);
    this.#sandboxesChains.delete(sandboxId);
  }

  /**
   * Returns the list of all sandboxes that have been added.
   */
  get sandboxes(): IterableIterator<SandboxId> {
    return this.#inner.sandboxes
  }

  /**
   * Asynchronous iterator that yields all the `ToApplication` messages that are generated
   * spontaneously or in response to `sandboxMessage`.
   *
   * The iterator is guaranteed to always yield messages from sandboxes that are still alive. As
   * soon as you call `deleteSandbox`, no new message will be generated and the iterator will
   * end.
   */
  async *sandboxOutput(sandboxId: SandboxId): AsyncGenerator<ToApplication, void> {
    const iter = this.#inner.sandboxOutput(sandboxId);
    for await (const item of iter) {
      switch (item.type) {
        case "chain-ready": {
          this.#sandboxesChains.get(sandboxId)?.add(item.chainId);
        }
        case "error": {
          // Note that this can happen during the initialization of a chain, in which case it is
          // not in the list.
          this.#sandboxesChains.get(sandboxId)?.delete(item.chainId);
        }
      }

      yield item;
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
    this.#inner.sandboxMessage(sandboxId, message);

    switch (message.type) {
      case "remove-chain": {
        // As documented in the protocol, remove-chain messages concerning an invalid chainId are
        // simply ignored.
        this.#sandboxesChains.get(sandboxId)!.delete(message.chainId);
        break;
      }
    }
  }
}
