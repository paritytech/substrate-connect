// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { endpoints } from '../../constants';
import { useIsMountedRef, useProvider } from './..';

/**  This part isn't usable until the issues in the Substrate Light CLient implementation have been fixed **/
// import {
//   kusama,
//   LightClient,
//   polkadot,
//   WasmProvider,
//   westend,
// } from '@substrate/connect';
//
// export const PolkadotWASM = './assets/polkadot_cli_bg.wasm';
// const polkadotLocalWs = westend.fromUrl(PolkadotWASM);
// const wasmclient = new WasmProvider(polkadotLocalWs);
// const provider = new WasmProvider(polkadotLocalWs);
// const rpc = new Rpc(provider);
//
// console.log('wasmclient', wasmclient)
// console.log('polkadotLocalWs', polkadotLocalWs)


export default function useApiCreate (): ApiPromise | null {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [provider] = useProvider();
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    if(api){
      console.log('YES API')
    } else {
      console.log("NO API")
    }
    if(provider) {
      console.log('YES PROvider')
    } else {
      console.log("NO PROvider")

    }
    ApiPromise
      .create({
        provider: new WsProvider(endpoints.local),
        types: {}
      })
      .then((api): void => {
        console.log(`Connected to local chain at ${endpoints.local}`)
        console.log("API api", api)
        mountedRef.current && setApi(api);
      })
      .catch((): void => {
        console.error
      });
  }, []);

  return api;
}
