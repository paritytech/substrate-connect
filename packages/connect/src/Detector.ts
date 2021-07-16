import { ApiPromise } from '@polkadot/api';
import { ApiOptions } from '@polkadot/api/types';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { SmoldotProvider }  from './SmoldotProvider/SmoldotProvider.js';
import { ExtensionProvider } from './ExtensionProvider/ExtensionProvider.js';
import westend from './specs/westend.json';
import kusama from './specs/kusama.json';
import polkadot from './specs/polkadot.json';

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
  #chainSpecs: Record<string, unknown> = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'polkadot': polkadot,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'kusama': kusama,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    'westend': westend
  }
  #name: string;
  #isExtension: boolean;
  #providers: Record<string, ProviderInterface> = {};

  /** 
   * name is the name of the app. This is used by the extension to identify
   * your app in the user interface
   */
  get name(): string {
    return this.#name;
  }

  /**
   * @param name - the name of your app.
   *
   * @remarks
   *
   * You should make a best effort to make your app name unique to avoid
   * confusion for users in the extension user interface
   */
  public constructor (name: string) {
    this.#isExtension = !!document.getElementById('substrateExtension');
    this.#name = name;
  }

  /**
   * connect attempts to detect the extension and configures the PolkadotJS 
   * API instance to return appropriately.
   *
   * There are 3 bundled networks: "polkadot", "kusama" and "westend" which
   * require no further configuration.
   *
   * Alternatively you may supply a chain spec and options to connect to a
   * custom chain with a light client (in-page only).
   *
   * @param chainName - the name of the blockchain network to connect to
   * @param chainSpec - an optional chainSpec to connect to a different network
   * @param options - any extra API options to passed to PolkadotJS when
   * constructing it.
   * @returns a promise that resolves to an instance of the PolkadotJS API
   *
   * @remarks
   *
   * When providing a custom chain spec, detect will always configure and return
   * an in-page light client and not use the extension
   *
   * Typically options is used to pass custom types to PolkadotJS API.
   *
   * See the PolkadotJS docs for documentation on using PolkadotJS.
   *
   * {@link https://polkadot.js.org/docs/}
   */
  public connect = async (chainName: string, chainSpec?: string, options?: ApiOptions): Promise<ApiPromise> => {
    const provider: ProviderInterface = this.provider(chainName, chainSpec);
    provider.connect().catch(console.error);

    this.#providers[chainName] = provider;
    return await ApiPromise.create(Object.assign(options ?? {}, {provider}));
  }

  /** 
   * Detects and returns an appropriate PolkadotJS provider depending on whether the user has the substrate connect extension installed
   * 
   * @param chainName - the name of the blockchain network to connect to
   * @param chainSpec - an optional chainSpec to connect to a different network
   * @returns a provider will be used in a ApiPromise create for PolkadotJS API
   *
   * @internal
   * 
   * @remarks 
   * This is used internally for advanced PolkadotJS use cases and is not supported.  Use {@link connect} instead.
   */
  public provider = (chainName: string, chainSpec?: string): ProviderInterface => {
    let provider: ProviderInterface = {} as ProviderInterface;

    if (Object.keys(this.#chainSpecs).includes(chainName)) {
      if (this.#isExtension) {
        provider = new ExtensionProvider(this.#name, chainName);
      } else if (!this.#isExtension) {
        const chainSpec = JSON.stringify(this.#chainSpecs[chainName]);
        provider = new SmoldotProvider(chainSpec);
      }
    } else if (chainSpec) {
        provider = new SmoldotProvider(chainSpec);
    } else if (!chainSpec) {
      throw new Error(`No known Chain was detected and no chainSpec was provided. Either give a known chain name ('${Object.keys(this.#chainSpecs).join('\', \'')}') or provide valid chainSpecs.`)
    }
    return provider;
  }

  /**
   * disconnect disconnects the PolkadotJS API isntance
   *
   * @param chainName - the name of the blockchain network to disconnect from
   */
  public disconnect = async (chainName: string): Promise<void> => {
    await this.#providers[chainName].disconnect();
    delete this.#providers[chainName];
  };
}
