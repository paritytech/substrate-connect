# @substrate/connect

## Usage
Provide a known Chain Name ('polkadot', 'ksmcc3', 'westend2', 'rococo_v2_1'):

```js
import { createScClient, SupportedChains } from '@substrate/connect';

const scClient = createScClient();
const chain = await scClient.addWellKnownChain(SupportedChains.westend2);
```

or provide your custom substrate chain's name and chainspec:

```js
import { createScClient } from '@substrate/connect';
import mySubstrateChainSpec from './mySubstrateChainSpec.json';

const myChainSpec = JSON.stringify(mySubstrateChainSpec);

const scClient = createScClient();
const chain = await scClient.addChain(myChainSpec);
```


## Parachain support

For parachain support, you can providethe parachain's specs
```js
import { createScClient, SupportedChains } from '@substrate/connect';
import myParaChainSpec from './myParaChainSpec.json';

const parachainSpec =  JSON.stringify(myParaChainSpec);

const scClient = createScClient();
await scClient.addWellKnownChain(SupportedChains.westend2)
const client = await scClient.addChain(parachainSpec);
```

## Scripts

* `yarn test` to run the unit tests
* `yarn build` to build @substrate-connect
* `yarn lint` to run linter for @substrate-connect
