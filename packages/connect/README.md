# Polkadot JS Provider for Smoldot Light Client

This is a prototype for using [@polkadot/api](https://polkadot.js.org/docs/api/start)
with the [smoldot](https://npmjs.com/package/smoldot) WASM light client either by 
passing chainspecs or using the extension by predefined chains (e.g. westend, kusama).

Detector check existence of substrate extension. If it is installed and activated then
smoldot clients of extension will be used. If not, a new smoldot client will start and
sync with given chainspecs.

## Usage
Provide a known Chain Name ('kusama', 'polkadot', 'westend'):
```js
import { Detector } from '@substrate/connect';

const detect = new Detector('my cool unstoppable app');

const api = await detect.connect('westend');
```

or provide your custom substrate chain's name and chainspec:

```js
import { Detector }  from '@substrate/connect';
import mySubstrateChainSpec from './mySubstrateChainSpec.json';

const chainSpec =  JSON.stringify(mySubstrateChainSpec);
const detect = new Detector('my cool unstoppable app');

const api = await detect.connect('mySubstrateChainName', chainSpec());
```

In addition besides substrate chain's name and/or chainspec, a list of options can be passed
to Detector, same way as in  as passed in [@polkadot/api](https://polkadot.js.org/docs/api/start).
Without chainspec:
```js
import { Detector }  from '@substrate/connect';

const detect = new Detector('my cool unstoppable app');
const options = { /* the options as per polkadot/api */ } as ApiOptions;
const api = await detect.connect('mySubstrateChainName', undefined, options);
```
or with:
```js
import { Detector }  from '@substrate/connect';
import mySubstrateChainSpec from './mySubstrateChainSpec.json';

const chainSpec =  JSON.stringify(mySubstrateChainSpec);
const detect = new Detector('my cool unstoppable app');

const options = { /* the options as per polkadot/api */ } as ApiOptions;
const api = await detect.connect('mySubstrateChainName', chainSpec(), options);
```

## Scripts

* `yarn test` to run the unit tests
* `yarn build` to build @substrate-connect
* `yarn lint` to run linter for @substrate-connect
