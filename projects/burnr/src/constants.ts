import { WsProvider } from '@polkadot/api';
import { ProviderMeta } from '@polkadot/extension-inject/types';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import {
  kusama,
  polkadot,
  polkadotLocal,
  WasmProvider,
  westend,
} from '@substrate/connect';


export const endpoints = {
  'kusama': 'wss://kusama-rpc.polkadot.io/',
  'polkadot': 'wss://rpc.polkadot.io',
  'westend': 'wss://westend-rpc.polkadot.io',
  'localPolkadotNetwork': 'ws://127.0.0.1:9945',
  'local': 'ws://127.0.0.1:9944'
};

export const users = {
  'kusama': 'CzugcapJWD8CEHBYHDeFpVcxfzFBCg57ic72y4ryJfXUnk7',
  'polkadot': '11uMPbeaEDJhUxzU4ZfWW9VQEsryP9XqFcNRfPdYda6aFWJ',
  'westend': '12gG5fz9A7k7CgZeis8JesCoZiARDioonHYp5W9Vkwc6nFyB'
}

/**
 * Interface describing a Provider, lazily loaded.
 */
export interface LazyProvider extends ProviderMeta {
  description: string;
  id: string;
  endpoint?: string;
  start: () => Promise<ProviderInterface>;
}

export const JS_WASM_PROVIDERS: Record<string, LazyProvider> = {
  'Local-Network-Wasm-Light-Node': {
    description: 'Local WASM light client for polkadot-local network',
    id: 'Polkadot-WasmProvider',
    network: 'Local Polkadot Network',
    node: 'light',
    source: 'browser tab',
    endpoint: 'Light client running in Browser',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WasmProvider(polkadotLocal.fromUrl('./hooks/api/polkadot_cli_bg.wasm'))),
    transport: 'WasmProvider',
  },
  // 'Polkadot-Wasm-Light-Node': {
  //   description: 'Local WASM light client for Polkadot',
  //   id: 'Polkadot-WasmProvider',
  //   network: 'Polkadot',
  //   node: 'light',
  //   source: 'browser tab',
  //   endpoint: 'Light client running in Browser',
  //   start: (): Promise<ProviderInterface> =>
  //     Promise.resolve(new WasmProvider(polkadot.fromUrl('./hooks/api/polkadot_cli_bg.wasm'))),
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
  //     Promise.resolve(new WasmProvider(kusama.fromUrl('./hooks/api/polkadot_cli_bg.wasm'))),
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
  //     Promise.resolve(new WasmProvider(westend.fromUrl('./hooks/api/polkadot_cli_bg.wasm'))),
  //   transport: 'WasmProvider',
  // },
};

/**
 * These fallback providers connect to a centralized remote RPC node.
 */
export const REMOTE_PROVIDERS: Record<string, LazyProvider> = {
  'Local-Network-WsProvider': {
    description: `Local node running on ${endpoints.local}`,
    id: 'Local-WsProvider',
    network: 'Local Polkadot Network',
    node: 'light',
    source: 'remote',
    endpoint: endpoints.local,
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider(endpoints.local)),
    transport: 'WsProvider',
  },
  'Polkadot-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Polkadot-WsProvider',
    network: 'Polkadot',
    node: 'light',
    source: 'remote',
    endpoint: endpoints.polkadot,
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider(endpoints.polkadot)),
    transport: 'WsProvider',
  },
  'Kusama-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Kusama-WsProvider',
    network: 'Kusama',
    node: 'light',
    source: 'remote',
    endpoint: endpoints.kusama,
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider(endpoints.kusama)),
    transport: 'WsProvider',
  },
  'Westend-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Westend-WsProvider',
    network: 'Westend',
    node: 'light',
    source: 'remote',
    endpoint: endpoints.westend,
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider(endpoints.westend)),
    transport: 'WsProvider',
  },
};

export const ALL_PROVIDERS = {...REMOTE_PROVIDERS, ...JS_WASM_PROVIDERS};