// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { ALL_PROVIDERS } from '../../constants';
import { LazyProvider } from './../../utils/types'; 
import { useIsMountedRef, useLocalStorage, useProvider } from './..';

/**  This part isn't usable until the issues in the Substrate Light CLient implementation have been fixed **/
import {
  // kusama,
  LightClient,
  // polkadot,
  polkadotLocal,
  WasmProvider,
  westend,
} from '@substrate/connect';

// const rpc = new Rpc(provider);
//
// console.log('wasmclient', wasmclient)
// console.log('polkadotLocalWs', polkadotLocalWs)

console.log('ALL_PROVIDERS', ALL_PROVIDERS['Polkadot-WsProvider'])


export default function useApiCreate (): ApiPromise | null {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [localEndpoint, setLocalEndpoint] = useLocalStorage('endpoint');
  const [provider, setProvider] = useState<LazyProvider | null>(ALL_PROVIDERS[localEndpoint] || ALL_PROVIDERS['Polkadot-WsProvider']);
  const  mountedRef = useIsMountedRef();

  const instantiated = provider.source === 'browser' ? new WasmProvider(polkadotLocal()) : new WsProvider(provider.endpoint);

  useEffect((): void => {
    ApiPromise
      .create({
        provider: instantiated,
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
