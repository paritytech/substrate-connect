import { ApiPromise } from '@polkadot/api';
import { ApiOptions } from '@polkadot/api/types';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { SmoldotProvider }  from './SmoldotProvider/SmoldotProvider.js';
import { ExtensionProvider } from './ExtensionProvider/ExtensionProvider.js';
import westend from './specs/westend.json';
import kusama from './specs/kusama.json';
import polkadot from './specs/polkadot.json';

export class Detector {
  #chainSpecs: Record<string, unknown> = {
    'polkadot': polkadot,
    'kusama': kusama,
    'westend': westend
  }
  #name: string;
  #isExtension: boolean;
  #providers: Record<string, ProviderInterface> = {};

  get name(): string {
    return this.#name;
  }

  public constructor (name: string) {
    this.#isExtension = !!document.getElementById('substrateExtension');
    this.#name = name;
  }

  public connect = async (chainName: string, providedChainSpec?: string, options?: ApiOptions): Promise<ApiPromise> => {
    let provider: ExtensionProvider | SmoldotProvider = {} as ExtensionProvider | SmoldotProvider;

    if (Object.keys(this.#chainSpecs).includes(chainName)) {
      if (this.#isExtension) {
        provider = new ExtensionProvider(this.#name, chainName);
      } else if (!this.#isExtension) {
        const chainSpec = JSON.stringify(this.#chainSpecs[chainName]);
        provider = new SmoldotProvider(chainSpec);
      }
    } else if (providedChainSpec) {
        provider = new SmoldotProvider(providedChainSpec);
    } else if (!providedChainSpec) {
      throw new Error(`No known Chain was detected and no chainSpec was provided. Either give a known chain name ('${Object.keys(this.#chainSpecs).join('\', \'')}') or provide valid chainSpecs.`)
    }
    await provider.connect();

    this.#providers[chainName] = provider as ProviderInterface;
    return await ApiPromise.create(Object.assign(options ?? {}, {provider}));
  }

  public disconnect = async (chainName: string): Promise<void> => {
    await this.#providers[chainName].disconnect();
    delete this.#providers[chainName];
  };
}
