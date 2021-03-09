import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from '@substrate/smoldot-provider';
import { ExtensionProvider }  from '@substrate/extension-provider';

export class Detect {
    public createConnection = async (chainSpec: string) => {
        let provider;
        new ExtensionProvider();
        provider = new SmoldotProvider(chainSpec);
        await provider.connect();
        const api = await ApiPromise.create({ provider });
        return api;
    }
}
