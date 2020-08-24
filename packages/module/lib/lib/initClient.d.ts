import { ClientConfig, LightClient } from './types';
/**
 * Create a light client by fetching the WASM blob from an URL.
 */
export declare function initClient(config: ClientConfig): LightClient;
