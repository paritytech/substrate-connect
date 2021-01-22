# Polkadot JS Provider for Smoldot Light Client

This is a prototype for using [@polkadot/api](https://polkadot.js.org/docs/api/start)
with the [smoldot](https://npmjs.com/package/smoldot) WASM light client. It is
not published to npm.

## Usage

```js
import { ApiPromise } from '@polkadot/api';
import westend_specs as chainSpec from './examples/westend_specs';
import { SmoldotProvider } from './';

const provider = new SmoldotProvider(chainSpec());
await provider.connect();
const api = await ApiPromise.create({ provider });
```

See the examples for examples of how to interact with the API.

## Testing

* `yarn test` to run the unit tests
* `yarn examples` to run the integration tests

The examples are automated ports of the samples from the getting started guide.
