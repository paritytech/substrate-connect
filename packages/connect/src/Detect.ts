import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from '@substrate/smoldot-provider';
import { ExtensionProvider }  from '@substrate/extension-provider';

export class Detect {
    private chainSpec: string;
    private isExtension: boolean;

    public constructor (name: string, spec: string) {
        this.chainSpec = spec;
        this.isExtension = !!document.getElementById('substrateExtension');
    }

    public connect = async (): Promise<ApiPromise> => {
        let provider;
        console.log('this.isExtension', this.isExtension);
        if (this.isExtension) {
            new ExtensionProvider('westend', this.chainSpec);
        } else {
            provider = new SmoldotProvider(this.chainSpec);
            await provider.connect();
        }
        return await ApiPromise.create({ provider });
    }
}
