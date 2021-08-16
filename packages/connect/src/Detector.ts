import { ApiPromise } from '@polkadot/api';
import { ApiOptions } from '@polkadot/api/types';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { SmoldotProvider }  from './SmoldotProvider/SmoldotProvider.js';
import { ExtensionProvider } from './ExtensionProvider/ExtensionProvider.js';
import westend from './specs/westend.json';
import kusama from './specs/kusama.json';
import polkadot from './specs/polkadot.json';

interface ChainInfo {
  name: string
  spec: string
}
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
    'polkadot': polkadot,
    'kusama': kusama,
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
   * Returns `true` if the user has the extension installed otherwise false
   * @remarks
   * You should check this if you wish to show UI to encourage users to download and install the extension or if you wish your app only to work with the extension installed.
   */
  public hasExtension (): boolean {
    return this.#isExtension;
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
   * @param relay - param of {@link ChainInfo} or string type. In case of {@link ChainInfo},
   * name (string - the name of the blockchain network to connect to) and
   * spec(string - a chainSpec to connect to a different network)
   * @param parachain - an optional param of {@link ChainInfo}. This para is the
   * name (string - the name of the parachain to connect to) and
   * spec(string - parachain spec to connect to a different network)
   * @param options - an optional param for any extra API options to passed to
   * PolkadotJS when constructing it.
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
  public connect = async (relay: ChainInfo | string, parachain?: ChainInfo, options?: ApiOptions): Promise<ApiPromise> => {
    const chain: ChainInfo | string = parachain || relay;
    let relayName = "";
    if (parachain) {
      relayName = this.getChainName(relay);
    }

    const provider: ProviderInterface = typeof chain === 'string' ?
      this.provider(chain, undefined, parachain && relayName) :
      this.provider(chain.name, chain.spec, parachain && relayName);

    provider.connect().catch(console.error);

    this.#providers[this.getChainName(chain)] = provider;
    return await ApiPromise.create(Object.assign(options ?? {}, {provider}));
  }

  /**
   * 
   * @param relay - Param of ChainInfo or string. In case of ChainInfo,
   * name (string - the name of the blockchain network to connect to) and
   * spec(string - a chainSpec to connect to a different network)
   * @returns a string of the name of the chain
   * 
   * @internal
   */
  private getChainName = (chain: ChainInfo | string): string =>
    typeof chain === 'string' ? chain : chain.name;

  /** 
   * Detects and returns an appropriate PolkadotJS provider depending on whether the user has the substrate connect extension installed
   * 
   * @param chainName - the name of the blockchain network to connect to
   * @param chainSpec - an optional chainSpec to connect to a different network
   * @param relayChainName - an optional param of the relay chain name that (in case of parachain)
   * the parachain will connect to
   * @returns a provider will be used in a ApiPromise create for PolkadotJS API
   *
   * @internal
   * 
   * @remarks 
   * This is used internally for advanced PolkadotJS use cases and is not supported.  Use {@link connect} instead.
   */
  public provider = (chainName: string, chainSpec?: string, relayChainName?: string): ProviderInterface => {
    let provider: ProviderInterface = {} as ProviderInterface;

    if (!chainSpec && !Object.keys(this.#chainSpecs).includes(chainName)) {
      throw new Error(`No known Chain was detected and no chainSpec was provided. Either give a known chain name ('${Object.keys(this.#chainSpecs).join('\', \'')}') or provide valid chainSpecs.`)
    }
    
    if (this.#isExtension) {
      provider = new ExtensionProvider(this.#name, chainName, chainSpec, relayChainName) as ProviderInterface;
    } else if (!this.#isExtension) {
      const spec = JSON.stringify(this.#chainSpecs[chainName]);
      provider = new SmoldotProvider(spec);
    }
    return provider;
  }

  /**
   * disconnect disconnects the PolkadotJS API isntance
   *
   * @param chainName - the name of the blockchain network to disconnect from
   */
  public disconnect = (chainName: string): void => {
    void this.#providers[chainName].disconnect();
    delete this.#providers[chainName];
  };
}
