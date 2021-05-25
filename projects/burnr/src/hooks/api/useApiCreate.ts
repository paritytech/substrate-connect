// SPDX-License-Identifier: Apache-2
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Detector }  from '@substrate/connect';
import { ALL_PROVIDERS } from '../../utils/constants';
import { LazyProvider } from '../../utils/types'; 
import { useIsMountedRef, useLocalStorage } from '..';

console.log('ALL_PROVIDERS: ', ALL_PROVIDERS)

export default function useApiCreate (): ApiPromise {
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise);
  const [localEndpoint] = useLocalStorage('endpoint');

  const [provider] = useState<LazyProvider>(ALL_PROVIDERS[localEndpoint] || ALL_PROVIDERS['Westend-WsProvider']);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    const choseSmoldot = async (endpoint: string): Promise<void> => {
      try {
        const detect = new Detector('burnr wallet');
        const api = await detect.connect(endpoint);
        console.log(`Burnr is now connected to ${endpoint}`);
        mountedRef.current && setApi(api);
      } catch (err) {
        console.log('A wild error appeared:', err);
      }
    }

    const endpoint = provider.network.toLowerCase();

    endpoint === 'local network' && ApiPromise
      .create({
        provider: new WsProvider('ws://127.0.0.1:9944'),
        types: {}
      })
      .then((api): void => {
        console.log(`Burnr is now connected to local network`);
        console.log("API api", api);
        mountedRef.current && setApi(api);
      })
      .catch((err): void => {
        console.error(err);
      });

      endpoint !== 'local network' && choseSmoldot(endpoint);
  }, [mountedRef, provider.endpoint, provider.network, localEndpoint]);

  return api;
}
