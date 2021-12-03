import {
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from "@polkadot/rpc-provider/types"
import { SupportedChains, getSpec } from "./specs/index.js"

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
 * import { ScProvider } from '@substrate/connect';
 * import { ApiPromise } from '@polkadot/api';
 *
 * // Create a new UApp with a unique name
 * const westendProvider = ScProvider('westendApp', 'westend')
 * const westend = await ApiPromise.create({ provider: westendProvider })
 *
 * const kusamaProvider = ScProvider('kusamaApp', 'kusama')
 * const kusama = await ApiPromise.create({ provider: kusamaProvider })
 *
 * await westend.rpc.chain.subscribeNewHeads((lastHeader) => {
 *   console.log(lastHeader.hash);
 * );
 * await kusama.rpc.chain.subscribeNewHeads((lastHeader) => {
 *   console.log(lastHeader.hash);
 * });
 *
 * // Interact with westend and kusama APIs ...
 *
 * await westend.disconnect();
 * await kusama.disconnect();
 * ```
 */

export class ScProvider implements ProviderInterface {
  #providerP: Promise<ProviderInterface>
  #provider: ProviderInterface | undefined = undefined

  public get hasSubscriptions(): boolean {
    return true
  }

  public get isConnected(): boolean {
    return this.#provider?.isConnected ?? false
  }

  /**
   * @param displayName - a display name that will be used from the dev-tools of the Extension (if installed)
   * @param knownChain - the name of a supported chain ({@link SupportedChains})
   * @param parachainSpec - optional param of the parachain chainSpecs to connect to
   *
   * @remarks
   *
   * You should make a best effort to make the displayName of your app name unique to avoid
   * confusion for users in the extension user interface
   */
  public constructor(
    displayName: string,
    knownChain: SupportedChains,
    parachainSpec?: string,
  )
  /**
   * @param displayName - a display name that will be used from the dev-tools of the Extension (if installed)
   * @param chainSpec - a string with the spec of the chain
   * @param parachainSpec - optional param of the parachain chainSpecs to connect to
   *
   * @remarks
   *
   * You should make a best effort to make the displayName of your app name unique to avoid
   * confusion for users in the extension user interface
   */
  public constructor(
    displayName: string,
    chainSpec: string,
    parachainSpec?: string,
  )
  public constructor(
    displayName: string,
    chainSpec: string,
    parachainSpec?: string,
  ) {
    const isExtension = !!document.getElementById("substrateExtension")

    const id = parseInt((Math.random() * 1000000000).toString(), 0)

    this.#providerP = this.internalProvider(
      displayName,
      id,
      isExtension,
      chainSpec,
      parachainSpec,
    ).then((provider) => (this.#provider = provider))
  }

  /**
   * Detects and returns an appropriate PolkadotJS provider depending on whether the user has the substrate connect extension installed
   *
   * @param displayName - a display name used by the dev-tools of the extension
   * @param isExtension - whether the extension is installed
   * @param chain - either a string with the spec of the chain or the name of a supported chain ({@link SupportedChains})
   * @param parachainSpec - optional param of the parachain chainSpecs to connect to
   * @returns a provider will be used in a ApiPromise create for PolkadotJS API
   *
   * @internal
   *
   * @remarks
   * This is used internally for advanced PolkadotJS use cases and is not supported.  Use {@link connect} instead.
   */
  private internalProvider = async (
    displayName: string,
    providerId: number,
    isExtension: boolean,
    chain: string | SupportedChains,
    parachainSpec?: string,
  ): Promise<ProviderInterface> => {
    if (chain.length === 0) {
      throw new Error(
        `No known Chain was detected and no chainSpec was provided. Either give a known chain name ('${Object.keys(
          SupportedChains,
        ).join("', '")}') or provide valid chainSpecs.`,
      )
    }

    const chainSpecPromise = SupportedChains[chain as SupportedChains]
      ? getSpec(chain as SupportedChains)
      : Promise.resolve(chain)

    if (isExtension) {
      const [{ ExtensionProvider }, chainSpec] = await Promise.all([
        import("./ExtensionProvider/ExtensionProvider.js"),
        chainSpecPromise,
      ])

      return new ExtensionProvider(
        displayName,
        providerId,
        chainSpec,
        parachainSpec,
      ) as ProviderInterface
    }

    const [{ SmoldotProvider }, chainSpec] = await Promise.all([
      import("./SmoldotProvider/SmoldotProvider.js"),
      chainSpecPromise,
    ])
    return new SmoldotProvider(chainSpec, parachainSpec)
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

  /**
   * "Connect" to a Smoldot instance
   *
   * @returns a resolved Promise
   * @remarks this is async to fulfill the interface with PolkadotJS
   */
  public async connect(): Promise<void> {
    const provider = await this.#providerP
    return provider.connect()
  }

  /**
   * Manually "disconnect"
   */
  public async disconnect(): Promise<void> {
    const provider = await this.#providerP
    return provider.disconnect()
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
    if (this.#provider) return this.#provider.on(type, sub)

    let isActive = true
    let innerCb: () => void = () => {
      return
    }

    this.#providerP
      .then((provider) => {
        innerCb = isActive ? provider.on(type, sub) : innerCb
      })
      .catch(() => {
        return
      })

    return () => {
      if (!isActive) return

      isActive = false
      innerCb()
    }
  }

  /**
   * Send an RPC request  the wasm client
   *
   * @param method - The RPC methods to execute
   * @param params - Encoded paramaters as applicable for the method
   */
  public async send<T>(method: string, params: unknown[]): Promise<T> {
    const provider = await this.#providerP
    return provider.send(method, params)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[],
    callback: ProviderInterfaceCallback,
  ): Promise<number | string> {
    const provider = await this.#providerP
    return provider.subscribe(type, method, params, callback)
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
    const provider = await this.#providerP
    return provider.unsubscribe(type, method, id)
  }
}
