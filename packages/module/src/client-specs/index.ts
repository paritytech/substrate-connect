
import { ClientConfig } from '../lib/types';

export const clients: ClientConfig[] = [
  {
    "name": "ksmcc",
    "version": "v0.8.19",
    "spec_path": "./kusama/kusama.json",
    "client": "./../client-packages/polkadot/polkadot_cli_bg.wasm"
  },
  {
    "name": "polkadot",
    "version": "v0.8.19",
    "spec_path": "./polkadot/polkadot.json",
    "client": "./../client-packages/polkadot/polkadot_cli_bg.wasm"
  },
  {
    "name": "local_testnet",
    "version": "v0.8.19",
    "spec_path": "./polkadot-local/polkadot-local.json",
    "client": "./../client-packages/polkadot/polkadot_cli_bg.wasm"
  },
  {
    "name": "westend2",
    "version": "v0.8.19",
    "spec_path": "./westend/westend.json",
    "client": "./../client-packages/polkadot/polkadot_cli_bg.wasm"
  }
]