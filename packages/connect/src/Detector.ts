import type { ApiPromise } from "@polkadot/api"
import { ApiOptions } from "@polkadot/api/types"
import { ProviderInterface } from "@polkadot/rpc-provider/types"
import { SupportedChains, getSpec } from "./specs/index.js"

/**
 * Detector is an API for providing an instance of the PolkadotJS API configured
 * to use a WASM-based light client.  It takes care of detecting whether the
 * user has the substrate connect browser extension installed or not and
 * configures the PolkadotJS API appropriately; falling back to a provider
 * which instantiates the WASM light client in the page when the extension is
 * not available.
 *
 * @example
 *
 * ```
 * import { Detector } from '@substrate/connect';
 *
 * // Create a new UApp with a unique name
 * const app = new Detector('burnr-wallet');
 * const westend = await app.connect('westend');
 * const kusama = await app.connect('kusama');
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
export class Detector {
  #name: string
  #isExtension: boolean
  #providers: Record<string, ProviderInterface> = {}
  #nextProviderId: number

  /**
   * name is the name of the app. This is used by the extension to identify
   * your app in the user interface
   */
  get name(): string {
    return this.#name
  }

  /**
   * Returns `true` if the user has the extension installed otherwise false
   * @remarks
   * You should check this if you wish to show UI to encourage users to download and install the extension or if you wish your app only to work with the extension installed.
   */
  public hasExtension(): boolean {
    return this.#isExtension
  }

  /**
   * @param name - the name of your app.
   *
   * @remarks
   *
   * You should make a best effort to make your app name unique to avoid
   * confusion for users in the extension user interface
   */
  public constructor(name: string) {
    this.#isExtension = !!document.getElementById("substrateExtension")
    this.#name = name
    this.#nextProviderId = 1
  }

  /**
   * connect attempts to detect the extension and configures the PolkadotJS
   * API instance to return appropriately.
   *
   * There are 4 bundled networks: "polkadot", "kusama", "rococo" and
   * "westend" which require no further configuration.
   *
   * Alternatively you may supply a chain spec and options to connect to a
   * custom chain with a light client .
   *
   * @param chainSpec - string of the chainSpec to connect to a network
   * @param parachainSpec - an optional param. This param is the parachain spec to connect to a different network)
   * @param options - an optional param for any extra API options to passed to
   * PolkadotJS when constructing it.
   * @returns a promise that resolves to an instance of the PolkadotJS API
   *
   * @remarks
   *
   * Typically options is used to pass custom types to PolkadotJS API.
   *
   * See the PolkadotJS docs for documentation on using PolkadotJS.
   *
   * {@link https://polkadot.js.org/docs/}
   */
  public async connect(
    chainSpec: string,
    parachainSpec?: string,
    options?: ApiOptions,
  ): Promise<ApiPromise>

  /**
   * connect attempts to detect the extension and configures the PolkadotJS
   * API instance to return appropriately.
   *
   * There are 4 bundled networks: "polkadot", "kusama", "rococo" and
   * "westend" which require no further configuration.
   *
   * Alternatively you may supply a chain spec and options to connect to a
   * custom chain with a light client.
   *
   * @param knownChain - {@link SupportedChains} one of the predefined chainSpecs
   * @param parachainSpec - an optional param. This param is the parachain spec to connect to a different network)
   * @param options - an optional param for any extra API options to passed to
   * PolkadotJS when constructing it.
   * @returns a promise that resolves to an instance of the PolkadotJS API
   *
   * @remarks
   *
   * Typically options is used to pass custom types to PolkadotJS API.
   *
   * See the PolkadotJS docs for documentation on using PolkadotJS.
   *
   * {@link https://polkadot.js.org/docs/}
   */
  public async connect(
    knownChain: SupportedChains,
    parachainSpec?: string,
    options?: ApiOptions,
  ): Promise<ApiPromise>
  public async connect(
    chain: string | SupportedChains,
    parachainSpec?: string,
    options?: ApiOptions,
  ): Promise<ApiPromise> {
    const id = this.#nextProviderId++
    const spec = SupportedChains[chain as SupportedChains] ?? chain

    const [provider, { ApiPromise }] = await Promise.all([
      this.internalProvider(id, spec, parachainSpec),
      import("@polkadot/api"),
    ])
    this.#providers[id] = provider

    const originalDisconnect = provider.disconnect.bind(provider)
    provider.disconnect = () => {
      delete this.#providers[id]
      return originalDisconnect()
    }

    provider.connect().catch(console.error)
    return await ApiPromise.create(Object.assign(options ?? {}, { provider }))
  }

  /**
   * Detects and returns an appropriate PolkadotJS provider depending on whether the user has the substrate connect extension installed
   *
   * @param providerId - anId that uniquely identifies the provider in the context of this instance of the Detector
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
    providerId: number,
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

    if (this.#isExtension) {
      const [{ ExtensionProvider }, chainSpec] = await Promise.all([
        import("./ExtensionProvider/ExtensionProvider.js"),
        chainSpecPromise,
      ])

      return new ExtensionProvider(
        this.#name,
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
   * Detects and returns an appropriate PolkadotJS provider depending on whether the user has the substrate connect extension installed
   *
   * @param chainSpec - string of the chainSpec to connect to a network
   * @param parachainSpec - optional param of the parachain chainSpecs to connect to
   * @returns a provider will be used in a ApiPromise create for PolkadotJS API
   *
   * @internal
   *
   * @remarks
   * This is used internally for advanced PolkadotJS use cases and is not supported.  Use {@link connect} instead.
   */
  public provider(
    chainSpec: string,
    parachainSpec?: string,
  ): Promise<ProviderInterface>
  /**
   * Detects and returns an appropriate PolkadotJS provider depending on whether the user has the substrate connect extension installed
   *
   * @param knownChain - {@link SupportedChains} one of the predefined chainSpecs
   * @param parachainSpec - optional param of the parachain chainSpecs to connect to
   * @returns a provider will be used in a ApiPromise create for PolkadotJS API
   *
   * @internal
   *
   * @remarks
   * This is used internally for advanced PolkadotJS use cases and is not supported.  Use {@link connect} instead.
   */
  public provider(
    knownChain: SupportedChains,
    parachainSpec?: string,
  ): Promise<ProviderInterface>
  public provider(
    chain: string | SupportedChains,
    parachainSpec?: string,
  ): Promise<ProviderInterface> {
    return this.internalProvider(this.#nextProviderId++, chain, parachainSpec)
  }
}
