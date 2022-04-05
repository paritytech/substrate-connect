# @substrate/connect

## Using `@substrate/connect` through the Polkadot RPC Provider

PolkadotJS provides a high-level API built on top of `@substrate/connect`.
So, unless you are writting your own library, you probably
want to use the PolkadotJS RPC Provider.

Provide a well known Chain Name ('polkadot', 'ksmcc3', 'westend2', 'rococo_v2_1'):

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

or provide your custom substrate chain's name and chainspec:

```js
import { ApiPromise } from "@polkadot/api";
import { ScProvider } from "@polkadot/rpc-provider/substrate-connect";
import myJsonSubstrateChainSpec from './mySubstrateChainSpec.json';

const mySubstrateChainSpec = JSON.stringify(myJsonSubstrateChainSpec);

const provider = new ScProvider(mySubstrateChainSpec);
await provider.connect();
const polkadotApi = await ApiPromise.create({ provider });
await polkadotApi.rpc.chain.subscribeNewHeads((lastHeader) => {
  console.log(lastHeader.number.toString());
});
```

For parachain support, you you must first instantiate the ScProvider
for the relay chain, and then pass the instance of that ScProvider
as the second argument of the constructor of the parachain ScProvider.
The following example creates a parachain for the Westend Test Network.

```js
import { ApiPromise } from "@polkadot/api";
import {
  ScProvider,
  WellKnownChain,
} from "@polkadot/rpc-provider/substrate-connect";
import jsonParachainSpec from './myParaChainSpec.json';

const parachainSpec = JSON.stringify(jsonParachainSpec);

const relayProvider = new ScProvider(WellKnownChain.westend2);
const provider = new ScProvider(parachainSpec, relayProvider);

await provider.connect();

const polkadotApi = await ApiPromise.create({ provider });
await polkadotApi.rpc.chain.subscribeNewHeads((lastHeader) => {
  console.log(lastHeader.number.toString());
});
```

## Using `@substrate/connect` for library authors

Provide a known Chain Name ('polkadot', 'ksmcc3', 'westend2', 'rococo_v2_1'):

```js
import { createScClient, WellKnownChain } from '@substrate/connect';

const scClient = createScClient();
const chain = await scClient.addWellKnownChain(
  WellKnownChain.westend2,
  function jsonRpcCallback(response) {
    console.log("response", response);
  }
);

chain.sendJsonRpc(
  '{"jsonrpc":"2.0","id":"1","method":"system_health","params":[]}'
);
```

or provide your custom substrate chain's name and chainspec:

```js
import { createScClient } from '@substrate/connect';
import myJsonChainSpec from './mySubstrateChainSpec.json';

const myChainSpec = JSON.stringify(myJsonChainSpec);

const scClient = createScClient();
const chain = await scClient.addChain(
  myChainSpec,
  function jsonRpcCallback(response) {
    console.log("response", response);
  }
);

chain.sendJsonRpc(
  '{"jsonrpc":"2.0","id":"1","method":"system_health","params":[]}'
);
```

For parachain support, you you must first instantiate the relay chain
where the parachain will be connected to, and then instantiate the parachain.
The following example creates a parachain for the Westend Test Network.

```js
import { createScClient, WellKnownChain } from '@substrate/connect';
import jsonParachainSpec from './myParaChainSpec.json';

const parachainSpec = JSON.stringify(jsonParachainSpec);

const scClient = createScClient();
await scClient.addWellKnownChain(WellKnownChain.westend2)
const parachain = await scClient.addChain(
  parachainSpec,
  function jsonRpcCallback(response) {
    console.log("response", response);
  }
);

parachain.sendJsonRpc(
  '{"jsonrpc":"2.0","id":"1","method":"system_health","params":[]}'
);
```
## Scripts

* `yarn test` to run the unit tests
* `yarn build` to build @substrate-connect
* `yarn lint` to run linter for @substrate-connect
