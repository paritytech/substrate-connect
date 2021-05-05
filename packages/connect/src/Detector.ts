import { ApiPromise } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { SmoldotProvider }  from './SmoldotProvider';
import { ExtensionProvider } from './ExtensionProvider';
import fetch from 'node-fetch';
import westend from './specs/westend.json';
import kusama from './specs/kusama.json';
import polkadot from './specs/polkadot.json';

export class Detector {
  #chainSpecs: Record<string, unknown> = {
    'polkadot': undefined,
    'kusama': undefined,
    'westend': undefined
  }
  #name: string;
  #isExtension: boolean;
  #providers: Record<string, ProviderInterface> = {};

  get name(): string {
    return this.#name;
  }

  #getSpecs = async (chainName: string): Promise<void> => {
    let val;
    try {
      val = await fetch('https://raw.githubusercontent.com/paritytech/smoldot/main/bin/' + chainName + '.json');
    } catch (err) {
      switch (chainName) {
        case 'polkadot':
          val = polkadot;
          break;
        case 'kusama':
          val = kusama;
          break;
        case 'westend':
          val = westend;
          break;
        default:
          throw new Error('Wrong');
      }
    } finally {
      this.#chainSpecs[chainName] = val;
    }
  }

  public constructor (name: string) {
    this.#isExtension = !!document.getElementById('substrateExtension');
    this.#name = name;
    Object.keys(this.#chainSpecs).forEach(k => {
      void this.#getSpecs(k);
    });

    // this.#chainSpecs['polkadot'] = this.#getSpecs('polkadot');
    // this.#chainSpecs['kusama'] = this.#getSpecs('kusama');
    // this.#chainSpecs['westend'] = this.#getSpecs('westend');
  }

  public connect = async (chainName: string, providedChainSpec?: string): Promise<ApiPromise> => {
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
    return await ApiPromise.create({ provider });
  }

  public disconnect = async (chainName: string): Promise<void> => {
    await this.#providers[chainName].disconnect();
    delete this.#providers[chainName];
  };
}
