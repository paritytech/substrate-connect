import { ApiPromise } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { SmoldotProvider }  from './SmoldotProvider';
import { ExtensionProvider } from './ExtensionProvider';

export class Detector {
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

    public connect = async (chainName: string, chainSpec?: string): Promise<ApiPromise> => {
        let provider;

        if (this.#isExtension && chainName) {
            provider = new ExtensionProvider(this.#name, chainName);
            await provider.connect();
        } else if (this.#isExtension && !chainName) {
            throw new Error('You must provide at least a chainName')
        } else if (!this.#isExtension && chainSpec) {
            provider = new SmoldotProvider(chainSpec);
            await provider.connect();
        }
        this.#providers[chainName] = provider as ProviderInterface;
        return await ApiPromise.create({ provider });
    }

    public disconnect = async (chainName: string): Promise<void> => {
        await this.#providers[chainName].disconnect();
        delete this.#providers[chainName];
    };
}
