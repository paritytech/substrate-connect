// Copyright 2018-2020 @paritytech/substrate-connect authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {RpcCoder} from '@polkadot/rpc-provider/coder';
import {
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from '@polkadot/rpc-provider/types';
import { assert } from '@polkadot/util';
import EventEmitter from 'eventemitter3';

import * as smoldot from 'smoldot';

interface SubscriptionHandler {
  callback: ProviderInterfaceCallback;
  type: string;
}

export class SmoldotProvider implements ProviderInterface {
  #chainSpec: string;
  #coder: RpcCoder;
  #eventemitter: EventEmitter;
  #isConnected = false;
  #client: smoldot.SmoldotClient | undefined = undefined;
  #smoldot: smoldot.Smoldot;

  // optional client builder for testing
  public constructor(chainSpec: string, clientBuilder?: any) {
    this.#chainSpec = chainSpec;
    this.#eventemitter = new EventEmitter();
    this.#coder = new RpcCoder();
    this.#smoldot = clientBuilder || smoldot;
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
  public clone(): SmoldotProvider {
    throw new Error('clone() is not implemented.');
  }

  public async connect(): Promise<void> {
    assert(!this.#client && !this. #isConnected, 'Client is already connected');

    return this.#smoldot.start({
        chain_spec: this.#chainSpec,
        json_rpc_callback: (response: string) => {
          //todo
        },
        database_save_callback: (database_content: string) => { 
          //todo
        }
      })
      .then((client: smoldot.SmoldotClient) => {
        this.#client = client;
        this.#isConnected = true;
        this.emit('connected');
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }

  /**
   * @description Manually disconnect from the connection.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async disconnect(): Promise<void> {
    if (this.#client) {
      this.#client = undefined;
    }
    this.#isConnected = false;
  }

  /**
   * @summary Whether the node is connected or not.
   * @return {boolean} true if connected
   */
  public get isConnected (): boolean {
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
  public async send(
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[],
    subscription?: SubscriptionHandler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    return new Promise((resolve, reject): void => {
      const json = this.#coder.encodeJson(method, params);

      console.log((): string[] => ['calling', method, json]);

      assert(this.#client, 'Client is not connected');
      // todo - implement send
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
   *   console.log(values)
   * }).then((subscriptionId) => {
   *   console.log('balance changes subscription id: ', subscriptionId)
   * })
   * ```
   */
  public async subscribe(
    type: string,
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[],
    callback: ProviderInterfaceCallback
  ): Promise<number | string> {
    const id = await this.send(method, params, { callback, type });

    return id as number;
  }

  /**
   * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
   */
  public async unsubscribe(
    _type: string,
    method: string,
    id: number | string
  ): Promise<boolean> {
    const result = await this.send(method, [id]);

    return result as boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(type: ProviderInterfaceEmitted, ...args: any[]): void {
    this.#eventemitter.emit(type, ...args);
  }
}
