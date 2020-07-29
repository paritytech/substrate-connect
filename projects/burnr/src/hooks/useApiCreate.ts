// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

import {
  wasm,
  kusama,
  LightClient,
  polkadotLocal,
  WasmProvider,
  westend,
} from '@substrate/connect';

import useIsMountedRef from './useIsMountedRef';

const kusamaWs = 'wss://kusama-rpc.polkadot.io/';
const polkadotWs = 'wss://rpc.polkadot.io';
const westendWs = 'wss://westend-rpc.polkadot.io';
const localWs = '127.0.0.1:9944';

export const PolkadotWASM = './wasm/kusama_bg.wasm';
const polkadotLocalWs = polkadotLocal.fromUrl(PolkadotWASM);

export default function useApiCreate (): ApiPromise | null {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    ApiPromise
      .create({
        provider: new WsProvider(localWs),
        types: {}
      })
      .then((api): void => {
        mountedRef.current && setApi(api);
      })
      .catch(console.error);
  }, []);

  return api;
}
