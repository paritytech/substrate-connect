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

import useIsMountedRef from './useIsMountedRef';

const kusamaWs = 'wss://kusama-rpc.polkadot.io/';
const westendWs = 'wss://westend-rpc.polkadot.io';
const polkadotWs = 'wss://rpc.polkadot.io';

const localWs = 'ws://127.0.0.1:9944';
export const PolkadotWASM = './wasm/kusama_bg.wasm';
const polkadotLocalWs = polkadotLocal.fromUrl(localWs);
const wasmclient = new WasmProvider(polkadotLocalWs);

console.log('wasmclient', wasmclient)
console.log('polkadotLocalWs', polkadotLocalWs)


export default function useApiCreate (): ApiPromise | null {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    ApiPromise
      .create({
        provider: new WsProvider(westendWs),
        types: {}
      })
      .then((api): void => {
        mountedRef.current && setApi(api);
      })
      .catch(console.error);
  }, []);

  return api;
}
