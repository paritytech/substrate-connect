// Copyright 2018-2020 @paritytech/substrate-connect authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LightClient } from './types';
import { initClient } from './initClient';

export * from './types';
export * from './WasmProvider';

export function polkadotLocal(): LightClient { return initClient('./polkadot/polkadot-local.json') };
