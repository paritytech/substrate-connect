// SPDX-License-Identifier: Apache-2
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { logger } from '@polkadot/util';
import { Detector }  from '@substrate/connect';
import { ALL_PROVIDERS, BURNR_WALLET } from '../../utils/constants';
import { LazyProvider } from '../../utils/types'; 
import { useIsMountedRef, useLocalStorage } from '..';

const l = logger(BURNR_WALLET);

l.log('ALL_PROVIDERS: ', ALL_PROVIDERS)

export default function useApiCreate (): ApiPromise {
  const [api, setApi] = useState<ApiPromise>({} as ApiPromise);
  const [localEndpoint] = useLocalStorage('endpoint');

  const [provider] = useState<LazyProvider>(ALL_PROVIDERS[localEndpoint] || Object.values(ALL_PROVIDERS)[0]);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    const choseSmoldot = async (endpoint: string): Promise<void> => {
      try {
        const detect = new Detector('burnr wallet');
        const api = await detect.connect(endpoint);
        l.log(`Burnr is now connected to ${endpoint}`);
        mountedRef.current && setApi(api);
      } catch (err) {
        l.error('Error:', err);
      }
    }

    const endpoint = provider.network.toLowerCase();
    
    void choseSmoldot(endpoint);
  }, [mountedRef, provider.endpoint, provider.network, localEndpoint]);

  return api;
}
