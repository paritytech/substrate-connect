import { ApiPromise, WsProvider } from '@polkadot/api';

import {
  LightClient,
  WasmProvider,
  polkadotLocal,
  polkadot,
  kusama
} from '@substrate/connect';

// import { wasm } from 'polkadot-cli';
// console.log("WASM", wasm)



import {
  createError, createWrapper
} from './commons';

const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

// const wsProvider = new WsProvider('ws://127.0.0.1:9944');
// const provider = new WsProvider('wss://poc3-rpc.polkadot.io/');
// const provider = new WsProvider('wss://substrate-rpc.parity.io/');
const wasmProvider = new WasmProvider(kusama());


(async function main () {
  const wrapper = createWrapper('simple-connect', 'Connect to Wasm Light Client');

  try {
    // Create our API with a connection to the node
    const api = await ApiPromise.create(wasmProvider);
    console.log('WASM api', api);

    // Retrieve the initial data
    let [ , , [data, {free: previous}] ]= await api.query.system.account(ALICE);

    console.log(`Alice has a balance of ${previous}`);

    // Subscribe and listen to balance changes
    api.query.system.account(ALICE, ([, , [data, { free }] ]) => {
      // Calculate the delta
      const change = free.sub(previous);
      // Only display positive value changes (Since we are pulling 'previous' above already,
      // the initial balance change will also be zero)
      if (!change.isZero()) {
        previous = free;
        console.log('New transaction of: '+ change);
      }
    });

  } catch (e) {
    createError(e, wrapper);
  }
}());
