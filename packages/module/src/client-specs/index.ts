
import { ClientConfig } from '../lib/types';

export const clients: ClientConfig[] = [
  {
    "name": "ksmcc",
    "version": "v0.8.19",
    "spec_path": "./kusama/kusama.json"
  },
  {
    "name": "polkadot",
    "version": "v0.8.19",
    "spec_path": "./polkadot/polkadot.json"
  },
  {
    "name": "local_testnet",
    "version": "v0.8.19",
    "spec_path": "./polkadot-local/polkadot-local.json"
  },
  {
    "name": "westend2",
    "version": "v0.8.19",
    "spec_path": "./westend/westend.json"
  }
]