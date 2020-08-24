// Copyright 2018-2020 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line @typescript-eslint/camelcase
import init, { start_client } from '../client-packages/polkadot/polkadot_cli';
import { ClientConfig, LightClient, WasmRpcClient } from './types';

let client: WasmRpcClient;

/**
 * Create a light client by fetching the WASM blob from an URL.
 */
export function initClient(config: ClientConfig): LightClient {
  return {
    name: config.name,
    async startClient(): Promise<WasmRpcClient> {
      if (client) {
        return client;
      }

      console.log(`Loading light client "${config.name}-${config.version}" from ${config.spec_path}...`);
      await init(config.client);
      console.log('Successfully loaded WASM, starting client...');

      // Dynamic import, because the JSON is quite big.
      const { default: chainSpec } = await import(config.spec_path);

      client = await start_client(JSON.stringify(chainSpec), 'INFO');

      return client;
    },
    version: config.version
  };
}
