<br /><br />

<div align="center">
  <h1 align="center">@substrate/connect</h1>
  <h4 align="center"> NPM package that offers an innovative way to interact with <a href="https://substrate.dev/">Substrate</a>-based blockchains directly in your browser.</h4>
  <p align="center">
    <a href="https://www.npmjs.com/package/@substrate/connect">
      <img alt="npm" src="https://img.shields.io/npm/v/@substrate/connect" />
    </a>
    <a href="https://github.com/paritytech/substrate-connect/blob/master/LICENSE">
      <img alt="GPL-3.0-or-later" src="https://img.shields.io/npm/l/@substrate/connect" />
    </a>
  </p>
</div>

<br /><br />

The main implementation of the light-client provider for a given substrate-based chain.

## Using `@substrate/connect` for library authors

/*
Can this package be used in isolation to connect to a light client, and then it uses the discovery protocol behind the scenes to see whether it can use one there instead? Or should somebody always use PAPI (which IIRC implements its own decision making around when to use what, but cant recall)?
*/

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
relay chain. The following example connects to a parachain of the Westend test
network:

```js
import { createScClient, WellKnownChain } from '@substrate/connect';
import jsonParachainSpec from './myParaChainSpec.json';

const parachainSpec = JSON.stringify(jsonParachainSpec);

const scClient = createScClient();
const relayChain = await scClient.addWellKnownChain(WellKnownChain.westend2)
const parachain = await relayChain.addChain(
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

* `pnpm test` to run the unit tests
* `pnpm build` to build @substrate-connect
* `pnpm lint` to run linter for @substrate-connect
