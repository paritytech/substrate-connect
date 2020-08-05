import { WsProvider } from '@polkadot/api';
import { ProviderMeta } from '@polkadot/extension-inject/types';
import { ProviderInterface } from '@polkadot/rpc-provider/types';

/**
 * Interface describing a Provider, lazily loaded.
 */
export interface LazyProvider extends ProviderMeta {
  description: string;
  id: string;
  start: () => Promise<ProviderInterface>;
}

export const TAB_WASM_PROVIDERS: Record<string, LazyProvider> = {
  'Kusama-tab-WasmProvider': {
    description: 'In-tab WASM light client',
    id: 'Kusama-tab-WasmProvider',
    network: 'Kusama',
    node: 'light',
    source: 'tab',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WasmProvider(kusama_cc3.fromUrl('./hooks/api/polkadot_cli_bg.wasm'))),
    transport: 'WasmProvider',
  },
  'Westend-tab-WasmProvider': {
    description: 'In-tab WASM light client',
    id: 'Westend-tab-WasmProvider',
    network: 'Westend',
    node: 'light',
    source: 'tab',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WasmProvider(westend.fromUrl('./hooks/api/polkadot_cli_bg.wasm'))),
    transport: 'WasmProvider',
  },
};

/**
 * These fallback providers connect to a centralized remote RPC node.
 */
export const FALLBACK_PROVIDERS: Record<string, LazyProvider> = {
  'Polkadot-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Polkadot-WsProvider',
    network: 'Polkadot',
    node: 'light',
    source: 'remote',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider('wss://polkadot-rpc.polkadot.io')),
    transport: 'WsProvider',
  },
  'Kusama-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Kusama-remote-WsProvider',
    network: 'Kusama',
    node: 'light',
    source: 'remote',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider('wss://kusama-rpc.polkadot.io')),
    transport: 'WsProvider',
  },
  'Westend-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Westend-WsProvider',
    network: 'Westend',
    node: 'light',
    source: 'remote',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider('wss://westend-rpc.polkadot.io')),
    transport: 'WsProvider',
  },
};

xport const endpoints = {
  'kusama': 'wss://kusama-rpc.polkadot.io/',
  'polkadot': 'wss://rpc.polkadot.io',
  'westend': 'wss://westend-rpc.polkadot.io',
  'localPolkadotNetwork': 'ws://127.0.0.1:9945',
  'localHost': 'ws://127.0.0.1:9944'
};

export const users = {
  'kusama': 'CzugcapJWD8CEHBYHDeFpVcxfzFBCg57ic72y4ryJfXUnk7',
  'polkadot': '11uMPbeaEDJhUxzU4ZfWW9VQEsryP9XqFcNRfPdYda6aFWJ',
  'westend': '12gG5fz9A7k7CgZeis8JesCoZiARDioonHYp5W9Vkwc6nFyB'
}