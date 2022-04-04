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
const chain = await scClient.addChain(
  myChainSpec,
  function jsonRpcCallback(response) {
    console.log("response", response);
    chain.remove();
  }
);

chain.sendJsonRpc(
  '{"jsonrpc":"2.0","id":"1","method":"system_health","params":[]}'
);
```


## Parachain support

For parachain support, you can providethe parachain's specs
```js
import { createScClient, SupportedChains } from '@substrate/connect';
import myParaChainSpec from './myParaChainSpec.json';

const parachainSpec =  JSON.stringify(myParaChainSpec);

const scClient = createScClient();
await scClient.addWellKnownChain(SupportedChains.westend2)
const parachain = await scClient.addChain(
  parachainSpec,
  function jsonRpcCallback(response) {
    console.log("response", response);
    parachain.remove();
  }
);

parachain.sendJsonRpc(
  '{"jsonrpc":"2.0","id":"1","method":"system_health","params":[]}'
);
```

## Using it through the Polkadot RPC Provider

PolkadotJS provides a high-level API that it's built on top of
`substrate-connect`. So, unless you are writting your own library, you probably
would want to consume `substrate-connect` through the PolkadotJS Provider.

```js
import { ApiPromise } from "@polkadot/api";
import {
  ScProvider,
  WellKnownChain,
} from "@polkadot/rpc-provider/substrate-connect";

const provider = new ScProvider(WellKnownChain.polkadot);
await provider.connect();
const polkadotApi = await ApiPromise.create({ provider });
await polkadotApi.rpc.chain.subscribeNewHeads((lastHeader) => {
  console.log(lastHeader.number.toString());
});
```

## Scripts

* `yarn test` to run the unit tests
* `yarn build` to build @substrate-connect
* `yarn lint` to run linter for @substrate-connect
