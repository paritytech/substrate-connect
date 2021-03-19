// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Detector }  from '../../../../../packages/connect/src'; // Temp fix for issues to pass

import { ALL_PROVIDERS } from '../../utils/constants';
import { LazyProvider } from '../../utils/types'; 
import { useIsMountedRef, useLocalStorage } from '..';

import westend from '../../assets/westend.json';

/**  This part isn't usable until the issues in the Substrate Light CLient implementation have been fixed **/
// import {
//   kusama,
//   LightClient,
//   polkadot,
//   polkadotLocal,
//   WasmProvider,
//   westend,
// } from '@substrate/connect';

console.log('ALL_PROVIDERS', ALL_PROVIDERS)

export default function useApiCreate (): ApiPromise {
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise);
  const [localEndpoint] = useLocalStorage('endpoint');

  const [provider] = useState<LazyProvider>(ALL_PROVIDERS[localEndpoint] || ALL_PROVIDERS['Polkadot-WsProvider']);
  const  mountedRef = useIsMountedRef();

  // @TODO Make dynamic once @substrate/connect is implemented
  // const instantiated = provider.source === 'browser' ? new WasmProvider(polkadotLocal()) : new WsProvider(provider.endpoint);

  useEffect((): void => {
    const choseSmoldot = async () => {
      try {
        const chainSpec = JSON.stringify(westend);
        //TODO: Here we must check if extension exists before choosing
        const detect = new Detector('westend', chainSpec);
        const api = await detect.connect();
        // const provider = new SmoldotProvider(chainSpec);
        // await provider.connect();
        // await provider.send('system_health', []);
        // TODO:  API should be included inside the substrate connect (Both SmoldotProvider and extension should return an API most probably)
        // const api = await ApiPromise.create({ provider });
        mountedRef.current && setApi(api);
      } catch (err) {
        console.log('A wild error appeared:', err);
      }
    }

    localEndpoint !== 'Westend-WsProvider' && ApiPromise
      .create({
        provider: new WsProvider(provider.endpoint),
        types: {}
      })
      .then((api): void => {
        console.log(`Burnr is now connected to ${provider.endpoint === 'string' && provider.endpoint}`);
        console.log("API api", api);
        mountedRef.current && setApi(api);
      })
      .catch((): void => {
        console.error
      });

      localEndpoint === 'Westend-WsProvider' && choseSmoldot();
  }, [mountedRef, provider.endpoint, localEndpoint]);

  return api;
}
