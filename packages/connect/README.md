# @substrate/connect

## Using `@substrate/connect` through the PolkadotJS RPC Provider

The recommended way to use `@substrate/connect` is to use PolkadotJS,
which provides a higher-level API built on top of it.
Unless you are writting your own library, you probably want to use the
PolkadotJS RPC provider.

Provide a well-known chain name ('polkadot', 'ksmcc3', 'westend2', 'rococo_v2_2'):

Note these names are the "real" names of the chains rather than the friendly 
names (e.g. "kusama" or "rococo"). 'ksmcc3' is the name for kusama.  This
matters for chains which have been hard forked. I.e. rococo - "rococo_v2" and 
"rococo_v2_2" are two completely unrelated chains.

```js
import { ApiPromise } from "@polkadot/api";
import {
  ScProvider
} from "@polkadot/rpc-provider";
import * as Sc from "@substrate/connect";

const provider = new ScProvider(Sc, Sc.WellKnownChain.polkadot);
await provider.connect();
const polkadotApi = await ApiPromise.create({ provider });
await polkadotApi.rpc.chain.subscribeNewHeads((lastHeader) => {
  console.log(lastHeader.number.toString());
});
```

...or provide your custom Substrate chain's specification:

```js
import { ApiPromise } from "@polkadot/api";
import { ScProvider } from "@polkadot/rpc-provider/substrate-connect";
import * as Sc from "@substrate/connect";

import myJsonSubstrateChainSpec from './mySubstrateChainSpec.json';

const mySubstrateChainSpec = JSON.stringify(myJsonSubstrateChainSpec);
const provider = new ScProvider(Sc, mySubstrateChainSpec);

await provider.connect();

const polkadotApi = await ApiPromise.create({ provider });
await polkadotApi.rpc.chain.subscribeNewHeads((lastHeader) => {
  console.log(lastHeader.number.toString());
});
```

In order to connect to a parachain, you must first instantiate the `ScProvider`
corresponding to the relay chain, then pass this `ScProvider` as the second
argument of the constructor of the parachain `ScProvider`. The following example
connects to a parachain of the Westend test network:

```js
import { ApiPromise } from "@polkadot/api";
import {
  ScProvider
} from "@polkadot/rpc-provider";
import * as Sc from "@substrate/connect";

import jsonParachainSpec from './myParaChainSpec.json';

const parachainSpec = JSON.stringify(jsonParachainSpec);

const relayProvider = new ScProvider(Sc, Sc.WellKnownChain.westend2);
const provider = new ScProvider(Sc, parachainSpec, relayProvider);

await provider.connect();

const polkadotApi = await ApiPromise.create({ provider });
await polkadotApi.rpc.chain.subscribeNewHeads((lastHeader) => {
  console.log(lastHeader.number.toString());
});
```

## Using `@substrate/connect` for library authors

Provide a well-known chain name ('polkadot', 'ksmcc3', 'westend2', 'rococo_v2_2'):

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

...or provide your custom substrate chain's name and chainspec:

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

In order to connect to a parachain, you must first instantiate the relay chain
this parachain is connected to, then instantiate the parachain on the same
`ScClient`. The following example connects to a parachain of the Westend test
network:

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
