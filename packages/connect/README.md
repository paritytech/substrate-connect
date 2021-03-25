# Polkadot JS Provider for Smoldot Light Client

This is a prototype for using [@polkadot/api](https://polkadot.js.org/docs/api/start)
with the [smoldot](https://npmjs.com/package/smoldot) WASM light client either by 
passing chainspecs or using the extension by predefined chains (e.g. westend, kusama).

Detector check existence of substrate extension. If it is installed and activated then
smoldot clients of extension will be used. If not, a new smoldot client will start and
sync with given chainspecs.

## Usage

```js
import { Detector }  from '@substrate/connect';
import substrateChainSpec from './substrateChainSpec.json';

const chainSpec =  JSON.stringify(substrateChainSpec);
const detect = new Detector('westend', chainSpec());

const api = await detect.connect();
```

## Scripts

* `yarn test` to run the unit tests
* `yarn build` to build @substrate-connect
* `yarn lint` to run linter for @substrate-connect
