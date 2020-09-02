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
