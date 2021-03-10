import { ApiPromise } from '@polkadot/api';
import { SmoldotProvider }  from '@substrate/smoldot-provider';
import { ExtensionProvider }  from '@substrate/extension-provider';

export class Detect {
    private chainSpec: string;
    private isExtension: boolean;

    public constructor (spec: string) {
        this.chainSpec = spec;
        this.isExtension = !!document.getElementById('substrateExtension');
    }

    public connect = async (): Promise<ApiPromise> => {
        let provider;
        console.log('this.isExtension', this.isExtension);
        if (this.isExtension) {

          const d = new Date();
          const time = d.getMinutes() + ' ' + ' ' + d.getSeconds() + ' ' + d.getMilliseconds();
          console.log('from detect: ', time);
            window.postMessage(
                JSON.parse(
                  JSON.stringify(
                    { chainName: 'westend', chainSpec: this.chainSpec, origin: 'page' }
                  )
                ), '*'
              );
            window.addEventListener('message', ({data}) => console.log('i listend from CONTTENT', data));
            new ExtensionProvider();
        } else {
            provider = new SmoldotProvider(this.chainSpec);
            await provider.connect();
        }
        return await ApiPromise.create({ provider });
    }
}
