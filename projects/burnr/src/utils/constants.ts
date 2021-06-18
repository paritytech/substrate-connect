import { WsProvider } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';

import { LazyProvider } from './types'; 

/**
 * Temporary hard-coded work around to test Wasm Light client 
 * until \@substrate/connect is properly implemented
 */


export const endpoints = {
  'kusama': 'wss://kusama-rpc.polkadot.io/',
  'polkadot': 'wss://rpc.polkadot.io',
  'westend': 'wss://westend-rpc.polkadot.io',
  'localPolkadotNetwork': 'ws://127.0.0.1:9945',
  'local': 'ws://127.0.0.1:9944'
};

export const BURNR_WALLET = 'burnr-wallet'

export const POLKA_ACCOUNT_ENDPOINTS = {
  'polkascan': 'polkascan.io',
  'polkastats': 'polkastats.io'
};

export const users = {
  'kusama': 'CzugcapJWD8CEHBYHDeFpVcxfzFBCg57ic72y4ryJfXUnk7',
  'polkadot': '11uMPbeaEDJhUxzU4ZfWW9VQEsryP9XqFcNRfPdYda6aFWJ',
  'westend': '12gG5fz9A7k7CgZeis8JesCoZiARDioonHYp5W9Vkwc6nFyB'
}

export const REMOTE_PROVIDERS: Record<string, LazyProvider> = {
  'Westend-WsProvider': {
    description: 'Remote node hosted by W3F',
    id: 'Westend-WsProvider',
    network: 'Westend',
    node: 'light',
    source: 'remote',
    endpoint: endpoints.westend,
    client: 'Light client',
    start: (): Promise<ProviderInterface> =>
      Promise.resolve(new WsProvider(endpoints.westend)),
    transport: 'WsProvider',
  }
};

export const ALL_PROVIDERS = {...REMOTE_PROVIDERS};
