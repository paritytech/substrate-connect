# Polkadot JS Provider for Smoldot Light Client

This is a prototype for using [@polkadot/api](https://polkadot.js.org/docs/api/start)
with the [smoldot](https://npmjs.com/package/smoldot) WASM light client either by 
passing chainspecs or using the extension by predefined chains (e.g. westend, kusama).

ScProvider check existence of substrate extension. If it is installed and activated then
smoldot clients of extension will be used. If not, a new smoldot client will start and
sync with given chainspecs.
## Usage
Provide a known Chain Name ('kusama', 'polkadot', 'westend', 'rococo'):
```js
import { ApiPromise } from '@polkadot/api';
import { ScProvider, SupportedChains } from '@substrate/connect';

const provider = new ScProvider(SupportedChains.westend);
const api = await ApiPromise.create({ provider });
```

or provide your custom substrate chain's name and chainspec:

```js
import { ApiPromise } from '@polkadot/api';
import { ScProvider } from '@substrate/connect';
import mySubstrateChainSpec from './mySubstrateChainSpec.json';

const myChainSpec =  JSON.stringify(mySubstrateChainSpec);
const provider = new ScProvider(myChainSpec);
const api = await ApiPromise.create({ provider });
```


### Parachain support

For parachain support, you can providethe parachain's specs
```js
import { ApiPromise } from '@polkadot/api';
import { ScProvider, SupportedChains } from '@substrate/connect';
import myParaChainSpec from './myParaChainSpec.json';

const parachainSpec =  JSON.stringify(myParaChainSpec);

const provider = new ScProvider(SupportedChains.westend, parachainSpec);
const api = await ApiPromise.create({ provider });
```

## Scripts

* `yarn test` to run the unit tests
* `yarn build` to build @substrate-connect
* `yarn lint` to run linter for @substrate-connect
