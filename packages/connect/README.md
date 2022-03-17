# Polkadot JS Provider for Smoldot Light Client

This is a prototype for using [@polkadot/api](https://polkadot.js.org/docs/api/start)
with the [smoldot](https://npmjs.com/package/smoldot) WASM light client either by 
passing chainspecs or using the extension by predefined chains (e.g. westend2, ksmcc3).

ScProvider check existence of substrate extension. If it is installed and activated then
smoldot clients of extension will be used. If not, a new smoldot client will start and
sync with given chainspecs.
## Usage
Provide a known Chain Name ('polkadot', 'ksmcc3', 'westend2', 'rococo_v2_1'):
```js
import { ApiPromise } from '@polkadot/api';
import { createPolkadotJsScClient, SupportedChains } from '@substrate/connect';

const scClient = createPolkadotJsScClient();
const provider = await scClient.addWellKnownChain(SupportedChains.westend2);
const api = await ApiPromise.create({ provider });
```

or provide your custom substrate chain's name and chainspec:

```js
import { ApiPromise } from '@polkadot/api';
import { createPolkadotJsScClient } from '@substrate/connect';
import mySubstrateChainSpec from './mySubstrateChainSpec.json';

const myChainSpec = JSON.stringify(mySubstrateChainSpec);

const scClient = createPolkadotJsScClient();
const provider = await scClient.addChain(myChainSpec);
const api = await ApiPromise.create({ provider });
```


### Parachain support

For parachain support, you can providethe parachain's specs
```js
import { ApiPromise } from '@polkadot/api';
import { createPolkadotJsScClient, SupportedChains } from '@substrate/connect';
import myParaChainSpec from './myParaChainSpec.json';

const parachainSpec =  JSON.stringify(myParaChainSpec);

const scClient = createPolkadotJsScClient();
await scClient.addWellKnownChain(SupportedChains.westend2)
const provider = await scClient.addChain(parachainSpec);
const api = await ApiPromise.create({ provider });
```

## Scripts

* `yarn test` to run the unit tests
* `yarn build` to build @substrate-connect
* `yarn lint` to run linter for @substrate-connect
