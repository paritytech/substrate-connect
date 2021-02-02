// Copyright 2018-2021 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line @typescript-eslint/camelcase
import init, { start_client } from '../clients/polkadot-web/polkadot_cli';
import { ClientConfig, LightClient, WasmRpcClient } from './types';
import { clients } from './../client-specs'; 

let client: WasmRpcClient;

/**
 * Create a light client by fetching the WASM blob from an URL.
 */
export function initClient(config: string): LightClient {
  return {
    name: clients[config].name,
    async startClient(): Promise<WasmRpcClient> {
      if (client) {
        return client;
      }

      console.log(`Loading light client "${config} ${clients[config].name}-${clients[config].version}" from ${'../client-specs/' + config + '.json'}...`);
      await init('../clients/polkadot/polkadot_cli_bg.wasm');
      console.log('Successfully loaded WASM, starting client...');
      // Dynamic import, because the JSON is quite big.
      // Pattern to enable dynamic imports in Webpack see:
      // https://github.com/webpack/webpack/issues/6680#issuecomment-370800037
      const { default: chainSpec } = await import('../client-specs/' + config + '.json');

      client = await start_client(JSON.stringify(chainSpec), 'INFO');

      return client;
    },
    version: clients[config].version
  };
}
