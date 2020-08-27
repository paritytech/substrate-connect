import { LightClient } from './lib/types';
export * from './lib/types';
export * from './lib/WasmProvider';
export { initClient } from './lib/initClient';
/**
 * Hosts
 */
/**
 * Light clients
 */
export declare function kusama(): LightClient;
export declare function polkadot(): LightClient;
export declare function polkadotLocal(): LightClient;
export declare function westend(): LightClient;
