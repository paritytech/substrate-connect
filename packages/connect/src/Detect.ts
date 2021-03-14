import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from '@substrate/smoldot-provider';
import { ExtensionProvider }  from '@substrate/extension-provider';

export class Detect {
    #chainName: string;
    #uAppName: string | undefined;
    #chainSpec: string | undefined;
    #isExtension: boolean;

    public constructor (chainName: string, uAppName?: string, chainSpec?: string) {
        this.#chainName = chainName;
        this.#uAppName = uAppName;
        this.#chainSpec = chainSpec;
        this.#isExtension = !!document.getElementById('substrateExtension');
    }

    public connect = async (): Promise<ApiPromise> => {
        let provider;
        if (this.#isExtension && this.#chainName) {
            provider = new ExtensionProvider(
                this.#uAppName || this.randomName(6),
                this.#chainName
            );
            await provider.connect();
        } else if (this.#isExtension && !this.#chainName) {
            throw new Error('You must provide ')
        } else if (!this.#isExtension && this.#chainSpec) {
            provider = new SmoldotProvider(this.#chainSpec);
            await provider.connect();
        }
        return await ApiPromise.create({ provider });
    }

    private randomName(length: number): string {
        let result: string = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < length; i++){
           result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
     }
}
