<br /><br />

<div align="center">
  <h1 align="center">@substrate/connect</h1>
  <h4 align="center">An NPM package that offers an innovative way to interact with <a href="https://substrate.dev/">Substrate</a>-based blockchains directly in your browser.</h4>
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

The primary implementation of the light-client provider for any Substrate-based chain.

## Using `@substrate/connect` for library authors

The `connect` package searches for a light client provider via the discovery protocol. If none is found, it will initiate a smoldot instance in the user's browser tab.

### Example Usage

To connect to a well-known chain ('polkadot', 'ksmcc3', 'westend2', 'rococo_v2_2'):

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

To connect to a custom Substrate chain using its name and chainspec:

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

### Connecting to a Parachain

To connect to a parachain, first instantiate the relay chain it is connected to, then instantiate the parachain on the same relay chain. The following example connects to a parachain on the Westend test network:

```js
import { createScClient, WellKnownChain } from '@substrate/connect';
import jsonParachainSpec from './myParaChainSpec.json';

const parachainSpec = JSON.stringify(jsonParachainSpec);

const scClient = createScClient();
const relayChain = await scClient.addWellKnownChain(WellKnownChain.westend2);
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

### PokladotJs Example

```ts
import { ScProvider } from '@polkadot/rpc-provider/substrate-connect';
import * as Sc from '@substrate/connect';

// Connect to polkadot relay chain
const provider = new ScProvider(Sc, Sc.WellKnownChain.polkadot);
await provider.connect();
const api = await ApiPromise.create({ provider })

// Connect to parachain
const provider2 = new ScProvider(Sc, Sc.WellKnownChain.people, provider);
await provider2.connect();
const api2 = await ApiPromise.create({ provider })
```

## Scripts

* `pnpm test` to run the unit tests
* `pnpm build` to build @substrate-connect
* `pnpm lint` to run linter for @substrate-connect
