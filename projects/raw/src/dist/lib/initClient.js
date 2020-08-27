// Copyright 2018-2020 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// eslint-disable-next-line @typescript-eslint/camelcase
import init, { start_client } from '../clients/polkadot/polkadot_cli';
import { clients } from './client-specs';

/**
 * When using a bundler like webpack
 */


let client;
/**
 * Create a light client by fetching the WASM blob from an URL.
 */
export async function initClient(config) {
    const { default: chainSpec } = await import(config.spec_path);
    return {
        name: config.name,
        startClient() {
            return __awaiter(this, void 0, void 0, function* () {
                if (client) {
                    return client;
                }
                console.log(`Loading light client "${config.name}-${config.version}" from ${config.spec_path}...`);
                yield init();
                console.log('Successfully loaded WASM, starting client...');
                // Dynamic import, because the JSON is quite big.
                console.log('config.spec_path', config.spec_path)
                const path = config.spec_path;
                // const { default: chainSpec } = yield import(path);
                client = yield start_client(JSON.stringify(chainSpec), 'INFO');
                return client;
            });
        },
        version: config.version
    };
}