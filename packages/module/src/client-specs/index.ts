
import { ClientConfig } from '../lib/types';

export const clients: { [name: string]: ClientConfig } = {
  'ksmcc': {
    'name': 'ksmcc',
    'version': 'v0.8.19',
    'spec_path': '../client-specs/kusama/kusama.json',
    'client': '../clients/polkadot/polkadot_cli_bg.wasm'
  },
  'polkadot': {
    'name': 'polkadot',
    'version': 'v0.8.19',
    'spec_path': '../client-specs/polkadot/polkadot.json',
    'client': '../clients/polkadot/polkadot_cli_bg.wasm'
  },
  'local_testnet': {
    'name': 'local_testnet',
    'version': 'v0.8.19',
    'spec_path': '../client-specs/polkadot-local/polkadot-local.json',
    'client': '../clients/polkadot/polkadot_cli_bg.wasm'
  },
  'westend2': {
    'name': 'westend2',
    'version': 'v0.8.19',
    'spec_path': '../client-specs/westend/westend.json',
    'client': '../clients/polkadot/polkadot_cli_bg.wasm'
  }
}