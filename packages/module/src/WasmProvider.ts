// Copyright 2018-2020 @paritytech/substrate-light-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Coder from '@polkadot/rpc-provider/coder';
import {
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from '@polkadot/rpc-provider/types';
import { assert, logger } from '@polkadot/util';
import EventEmitter from 'eventemitter3';

import { LightClient, WasmRpcClient } from './types';

// Same as https://github.com/polkadot-js/api/blob/57ca9a9c3204339e1e1f693fcacc33039868dc27/packages/rpc-provider/src/ws/Provider.ts#L17
interface SubscriptionHandler {
  callback: ProviderInterfaceCallback;
  type: string;
}

const l = logger('wasm-provider');

export class WasmProvider implements ProviderInterface {
  #coder: Coder;
  #eventemitter: EventEmitter;
  #isConnected = false;
  #rpcClient: WasmRpcClient | undefined = undefined;

  public readonly light: LightClient;

  public constructor(light: LightClient) {
    this.#eventemitter = new EventEmitter();
    this.#coder = new Coder();
    this.light = light;

    this.connect();
  }

  /**
   * @summary `true` when this provider supports subscriptions
   */
  public get hasSubscriptions(): boolean {
    return true;
  }

  /**
   * @description Returns a clone of the object
   */
  public clone(): WasmProvider {
    throw new Error('clone() is unimplemented yet.');
  }

  public connect(): void {
    this.light
      .startClient()
      .then((rpcClient) => {
        this.#rpcClient = rpcClient;
        this.#isConnected = true;
        this.emit('connected');
      })
      .catch(l.error);
  }

  /**
   * @description Manually disconnect from the connection.
   */
  public disconnect(): void {
    if (this.#rpcClient) {
      l.log('Destroying WASM light client');
      this.#rpcClient.free();
    }
  }

  /**
   * @summary Whether the node is connected or not.
   * @return {boolean} true if connected
   */
  public isConnected(): boolean {
    return this.#isConnected;
  }

  /**
   * @summary Listens on events after having subscribed using the [[subscribe]] function.
   * @param type - Event
   * @param sub - Callback
   */
  public on(
    type: ProviderInterfaceEmitted,
    sub: ProviderInterfaceEmitCb
  ): () => void {
    this.#eventemitter.on(type, sub);

    return (): void => {
      this.#eventemitter.removeListener(type, sub);
    };
  }

  /**
   * @summary Send JSON data using WebSockets to the wasm node.
   * @param method The RPC methods to execute
   * @param params Encoded paramaters as appliucable for the method
   * @param subscription Subscription details (internally used)
   */
  public send(
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[],
    subscription?: SubscriptionHandler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    if (subscription) {
      const json = this.#coder.encodeJson(method, params);
      l.debug((): string[] => ['calling', method, json]);

      assert(this.#rpcClient, 'Please call `send` after WasmProvider is ready');

      this.#rpcClient.rpcSubscribe(json, (response: string) => {
        try {
          const result = this.#coder.decodeResponse(JSON.parse(response));

          subscription.callback(null, result);
        } catch (error) {
          subscription.callback(error, null);
        }
      });
      return Promise.resolve(0); // TODO subscriptionId
    }

    return new Promise((resolve, reject): void => {
      try {
        const json = this.#coder.encodeJson(method, params);

        l.debug((): string[] => ['calling', method, json]);

        assert(
          this.#rpcClient,
          'Please call `send` after WasmProvider is ready'
        );

        this.#rpcClient.rpcSend(json).then((response) => {
          try {
            const result = this.#coder.decodeResponse(JSON.parse(response));
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @name subscribe
   * @summary Allows subscribing to a specific event.
   * @param  {string}                     type     Subscription type
   * @param  {string}                     method   Subscription method
   * @param  {any[]}                 params   Parameters
   * @param  {ProviderInterfaceCallback} callback Callback
   * @return {Promise<number>}                     Promise resolving to the dd of the subscription you can use with [[unsubscribe]].
   *
   * @example
   * <BR>
   *
   * ```javascript
   * const provider = new WasmProvider(client);
   * const rpc = new Rpc(provider);
   *
   * rpc.state.subscribeStorage([[storage.balances.freeBalance, <Address>]], (_, values) => {
   *   l.log(values)
   * }).then((subscriptionId) => {
   *   l.log('balance changes subscription id: ', subscriptionId)
   * })
   * ```
   */
  public async subscribe(
    type: string,
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[],
    callback: ProviderInterfaceCallback
  ): Promise<number> {
    const id = await this.send(method, params, { callback, type });

    return id as number;
  }

  /**
   * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
   */
  public async unsubscribe(
    _type: string,
    method: string,
    id: number
  ): Promise<boolean> {
    const result = await this.send(method, [id]);

    return result as boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(type: ProviderInterfaceEmitted, ...args: any[]): void {
    this.#eventemitter.emit(type, ...args);
  }
}
