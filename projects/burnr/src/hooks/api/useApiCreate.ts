// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

import {
  kusama,
  LightClient,
  polkadot,
  WasmProvider,
  westend,
} from '@substrate/connect';

import { endpoints } from '../../constants';

import useIsMountedRef from './useIsMountedRef';

export const PolkadotWASM = './assets/polkadot_cli_bg.wasm';
const polkadotLocalWs = westend.fromUrl(PolkadotWASM);
const wasmclient = new WasmProvider(polkadotLocalWs);

// const provider = new WasmProvider(polkadotLocalWs);
// const rpc = new Rpc(provider);


console.log('wasmclient', wasmclient)
console.log('polkadotLocalWs', polkadotLocalWs)


export default function useApiCreate (): ApiPromise | null {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    ApiPromise
      .create({
        provider: new WsProvider(endpoints.westend),
        types: {}
      })
      .then((api): void => {
        mountedRef.current && setApi(api);
      })
      .catch(console.error);
  }, []);

  return api;
}
