import { WsProvider } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';

import { LazyProvider } from './types'; 

/**
 * Temporary hard-coded work around to test Wasm Light client 
 * until @substrate/connect is properly implemented
 */


export const endpoints = {
  'kusama': 'wss://kusama-rpc.polkadot.io/',
  'polkadot': 'wss://rpc.polkadot.io',
  'westend': 'wss://westend-rpc.polkadot.io',
  'localPolkadotNetwork': 'ws://127.0.0.1:9945',
  'local': 'ws://127.0.0.1:9944'
};

export const POLKA_ACCOUNT_ENDPOINTS = {
  'polkascan': 'polkascan.io',
  'polkastats': 'polkastats.io'
};

export const users = {
  'kusama': 'CzugcapJWD8CEHBYHDeFpVcxfzFBCg57ic72y4ryJfXUnk7',
  'polkadot': '11uMPbeaEDJhUxzU4ZfWW9VQEsryP9XqFcNRfPdYda6aFWJ',
  'westend': '12gG5fz9A7k7CgZeis8JesCoZiARDioonHYp5W9Vkwc6nFyB'
}

export const JS_WASM_PROVIDERS: Record<string, LazyProvider> = {
  // 'Polkadot-Local-WasmProvider': {
  //   description: 'Local WASM light client for polkadot-local network',
  //   id: 'Polkadot-Local-WasmProvider',
  //   network: 'Local Polkadot Network',
  //   node: 'light',
  //   source: 'browser',
  //   endpoint: 'Light client running in Browser',
  //   client: 'Wasm light',
  //   start: (): Promise<ProviderInterface> =>
  //     Promise.resolve(new SmoldotProvider()),
  //   transport: 'WasmProvider',
  // }
  // 'Polkadot-Wasm-Light-Node': {
  //   description: 'Local WASM light client for Polkadot',
  //   id: 'Polkadot-WasmProvider',
  //   network: 'Polkadot',
  //   node: 'light',
  //   source: 'browser tab',
  //   endpoint: 'Light client running in Browser',
  //   start: (): Promise<ProviderInterface> =>
  //     Promise.resolve(new WasmProvider(polkadot())),
  //   transport: 'WasmProvider',
  // },
  // 'Kusama-Wasm-Light-Node': {
  //   description: 'Local WASM light client for Kusama',
  //   id: 'Kusama-WasmProvider',
  //   network: 'Kusama',
  //   node: 'light',
  //   source: 'browser tab',
  //   endpoint: 'Light client running in Browser',
  //   start: (): Promise<ProviderInterface> =>
  //     Promise.resolve(new WasmProvider(kusama())),
  //   transport: 'WasmProvider',
  // },
  // 'Westend-Wasm-Light-Node': {
  //   description: 'Local WASM light client for Westend',
  //   id: 'Westend-WasmProvider',
  //   network: 'Westend',
  //   node: 'light',
  //   source: 'browser tab',
  //   endpoint: 'Light client running in Browser',
  //   start: (): Promise<ProviderInterface> =>
  //     Promise.resolve(new WasmProvider(westend())),
  //   transport: 'WasmProvider',
  // },
};

/**
 * These fallback providers connect to a centralized remote RPC node.
 */
export const REMOTE_PROVIDERS: Record<string, LazyProvider> = {
  'Local-Polkadot-WsProvider': {
    description: `Local node running on ${endpoints.local}`,
    id: 'Local-Polkadot-WsProvider',
    network: 'Local Network',
    node: 'light',
    source: 'remote',
    endpoint: endpoints.local,
    client: 'Websocket remote',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider(endpoints.local)),
    transport: 'WsProvider',
  },
  'Westend-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Westend-WsProvider',
    network: 'Westend',
    node: 'light',
    source: 'remote',
    endpoint: endpoints.westend,
    client: 'Websocket remote',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider(endpoints.westend)),
    transport: 'WsProvider',
  },
};

export const ALL_PROVIDERS = {...REMOTE_PROVIDERS, ...JS_WASM_PROVIDERS};
