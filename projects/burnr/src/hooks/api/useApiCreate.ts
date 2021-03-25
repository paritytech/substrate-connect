// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Detector }  from '@substrate/connect';
import { ALL_PROVIDERS } from '../../utils/constants';
import { LazyProvider } from '../../utils/types'; 
import { useIsMountedRef, useLocalStorage } from '..';
import westend from '../../assets/westend.json';

console.log('ALL_PROVIDERS', ALL_PROVIDERS)

export default function useApiCreate (): ApiPromise {
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise);
  const [localEndpoint] = useLocalStorage('endpoint');

  const [provider] = useState<LazyProvider>(ALL_PROVIDERS[localEndpoint] || ALL_PROVIDERS['Polkadot-WsProvider']);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    const choseSmoldot = async () => {
      try {
        const chainSpec = JSON.stringify(westend);
        const detect = new Detector('westend', chainSpec);
        const api = await detect.connect();
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
