// Copyright 2018-2021 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LightClient } from './lib/types';
import { initClient } from './lib/initClient';

export * from './lib/types';
export * from './lib/WasmProvider';
export { initClient } from './lib/initClient';

/**
 * Light clients
 */
export function kusama(): LightClient { return initClient('kusama') };
export function polkadot(): LightClient { return initClient('polkadot') };
export function polkadotLocal(): LightClient { return initClient('polkadotLocal') };
export function westend(): LightClient { return initClient('westend') };