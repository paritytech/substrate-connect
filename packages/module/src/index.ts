// Copyright 2018-2020 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { clients } from './client-specs'; 
import { LightClient } from './lib/types';
import { initClient } from './lib/initClient';

export * from './lib/types';
export * from './lib/WasmProvider';
export { initClient } from './lib/initClient';

/**
 * Hosts
 */

/* tslint:disable */
// import * as wasm from './client-packages/polkadot/polkadot_cli_bg';
// export { wasm };

/**
 * Light clients
 */
export function kusama(): LightClient { return initClient(clients[0]) };
export function polkadot(): LightClient { return initClient(clients[1]) };
export function polkadotLocal(): LightClient { return initClient(clients[2]) };
export function westend(): LightClient { return initClient(clients[3]) };




