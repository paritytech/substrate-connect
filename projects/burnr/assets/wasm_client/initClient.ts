// Copyright 2018-2020 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line @typescript-eslint/camelcase
import init, { start_client } from './polkadot_cli';
import { LightClient, WasmRpcClient } from './types';

let client: WasmRpcClient;

/**
 * Create a light client by fetching the WASM blob from an URL.
 */
export function initClient(): LightClient {
  return {
    name: 'Polkadot Local',
    async startClient(): Promise<WasmRpcClient> {
      if (client) {
        return client;
      }

      console.log(`Loading Polkadot Wasm light client from "./polkadotLocal.json" ...`);
      await init('./polkadot_cli_bg.wasm');
      console.log('Successfully loaded WASM, starting client...');
      const { default: chainSpec } = await import('./polkadotLocal.json');

      client = await start_client(JSON.stringify(chainSpec), 'INFO');

      return client;
    },
    version: '0.8.25'
  };
}
