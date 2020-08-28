
import { ClientConfig } from '../lib/types';

export const clients: { [name: string]: ClientConfig } = {
  'kusama': {
    'name': 'ksmcc',
    'version': 'v0.8.19',
    'client': './../clients/polkadot/polkadot_cli_bg.wasm'
  },
  'polkadot': {
    'name': 'polkadot',
    'version': 'v0.8.19',
    'client': './../clients/polkadot/polkadot_cli_bg.wasm'
  },
  'polkadotLocal': {
    'name': 'local_testnet',
    'version': 'v0.8.19',
    'client': './../clients/polkadot/polkadot_cli_bg.wasm'
  },
  'westend': {
    'name': 'westend2',
    'version': 'v0.8.19',
    'client': './../clients/polkadot/polkadot_cli_bg.wasm'
  }
}