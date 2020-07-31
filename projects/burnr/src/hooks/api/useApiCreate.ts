// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

import {
  kusama,
  LightClient,
  polkadotLocal,
  WasmProvider,
  westend,
} from '@substrate/connect';

import { endpoints } from '../../constants';

import useIsMountedRef from './useIsMountedRef';

export const PolkadotWASM = './wasm/kusama_bg.wasm';
const polkadotLocalWs = polkadotLocal.fromUrl(endpoints.localHost);
const wasmclient = new WasmProvider(polkadotLocalWs);

console.log('wasmclient', wasmclient)
console.log('polkadotLocalWs', polkadotLocalWs)


export default function useApiCreate (): ApiPromise | null {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    ApiPromise
      .create({
        provider: new WsProvider(endpoints.localPolkadotNetwork),
        types: {}
      })
      .then((api): void => {
        mountedRef.current && setApi(api);
      })
      .catch(console.error);
  }, []);

  return api;
}
