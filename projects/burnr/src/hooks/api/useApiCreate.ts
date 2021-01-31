// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { ALL_PROVIDERS } from '../../utils/constants';
import { LazyProvider } from '../../utils/types'; 
import { useIsMountedRef, useLocalStorage, useProvider } from '../../hooks';

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


export default function useApiCreate (): ApiPromise | null {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [localEndpoint, setLocalEndpoint] = useLocalStorage('endpoint');

  const [provider, setProvider] = useState<LazyProvider>(ALL_PROVIDERS[localEndpoint] || ALL_PROVIDERS['Polkadot-WsProvider']);
  const  mountedRef = useIsMountedRef();

  // @TODO Make dynamic once @substrate/connect is implemented
  // const instantiated = provider.source === 'browser' ? new WasmProvider(polkadotLocal()) : new WsProvider(provider.endpoint);

  useEffect((): void => {
    ApiPromise
      .create({
        provider: new WsProvider(provider.endpoint),
        types: {}
      })
      .then((api): void => {
        console.log(`Burnr is now connected to ${provider.endpoint}`)
        console.log("API api", api)
        mountedRef.current && setApi(api);
      })
      .catch((): void => {
        console.error
      });
  }, []);


  return api;
}
