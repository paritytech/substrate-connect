// @ts-nocheck 
// Copyright 2018-2021 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/**
 * A simple interface to communicate via JSONRPC with the WASM light client.
 */
export interface WasmRpcClient {
  /**
   * Destroy the WASM light client.
   */
  free(): void;
  /**
   * Allows starting an RPC request. Returns a `Promise` containing the result of that request.
   * @param rpc - The JSONRPC request to send
   */
  rpcSend(rpc: string): Promise<string>;
  /**
   * Subscribes to an RPC pubsub endpoint.
   *
   * @param rpc - The RPC request for subscribing.
   * @param callback - The callback of the subscribe.
   */
  rpcSubscribe(rpc: string, callback: (res: string) => void): void;
}

/**
 * An interface representing a light client compiled to WASM, along with some
 * metadata.
 */
export interface LightClient {
  /**
   * An identifier for the light client.
   */
  name: string;
  /**
   * Start running the light client.
   */
  startClient(): Promise<WasmRpcClient>;
  /**
   * A version for the light client.
   */
  version: string;
}

export interface ClientConfig {
  /**
   * An identifier for the light client.
   */
  name: string;
  /**
   * A version for the light client.
   */
  version: string;
    /**
   * The path to the compiled wasm light client
   */
  client: string;
}

/* tslint:disable */
/* eslint-disable */
/**
* Starts the client.
* @param {string} chain_spec
* @param {string} log_level
* @returns {any}
*/

export function start_client(chain_spec: string, log_level: string): any;
/**
* A running client.
*/
export class Client {
  free(): void;
/**
* Allows starting an RPC request. Returns a `Promise` containing the result of that request.
* @param {string} rpc
* @returns {Promise<any>}
*/
  rpcSend(rpc: string): Promise<any>;
/**
* Subscribes to an RPC pubsub endpoint.
* @param {string} rpc
* @param {Function} callback
*/
  rpcSubscribe(rpc: string, callback: Function): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly start_client: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_client_free: (a: number) => void;
  readonly client_rpcSend: (a: number, b: number, c: number) => number;
  readonly client_rpcSubscribe: (a: number, b: number, c: number, d: number) => void;
  readonly hash_test: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut___A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3ef9a03c7cd21270: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he2f1edb2d90d21bb: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hea399e52d528b58d: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h866f5fc277c74a4f: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h124f27e1e698b0be: (a: number, b: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h94dcbeb06042aa40: (a: number, b: number, c: number, d: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        