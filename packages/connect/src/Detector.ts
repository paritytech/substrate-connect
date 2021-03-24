import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from './SmoldotProvider';
import { ExtensionProvider } from './ExtensionProvider';

export class Detector {
    #chainName: string;
    #chainSpec: string | undefined;
    #isExtension: boolean;
    #provider: SmoldotProvider | ExtensionProvider | undefined;

    public constructor (chainName: string, chainSpec?: string) {
        this.#chainName = chainName;
        this.#chainSpec = chainSpec;
        this.#isExtension = !!document.getElementById('substrateExtension');
    }

    public connect = async (): Promise<ApiPromise> => {
        let provider;
        if (this.#isExtension && this.#chainName) {
            provider = new ExtensionProvider(this.#chainName);
            await provider.connect();
        } else if (this.#isExtension && !this.#chainName) {
            throw new Error('You must provide at least a chainName')
        } else if (!this.#isExtension && this.#chainSpec) {
            provider = new SmoldotProvider(this.#chainSpec);
            await provider.connect();
        }
        this.#provider = provider;
        return await ApiPromise.create({ provider });
    }

    public disconnect = async (): Promise<void> => {
        if (this.#provider instanceof SmoldotProvider) {
            await this.#provider.disconnect();
        }
    };
}
