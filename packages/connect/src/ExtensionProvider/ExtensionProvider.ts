// Copyright 2018-2021 @paritytech/substrate-connect authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as smoldot from 'smoldot';
import {RpcCoder} from '@polkadot/rpc-provider/coder';
import {
  JsonRpcResponse,
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from '@polkadot/rpc-provider/types';
import { logger } from '@polkadot/util';
import EventEmitter from 'eventemitter3';
import { isUndefined } from '../utils';

const EXTENSION_ORIGIN = 'extension-provider';

const l = logger(EXTENSION_ORIGIN);

interface RpcStateAwaiting {
  callback: ProviderInterfaceCallback;
  method: string;
  params: any[];
  subscription?: SubscriptionHandler;
}

interface SubscriptionHandler {
  callback: ProviderInterfaceCallback;
  // type is the value of the method property in the JSON responses to this
  // subscription
  type: string;
}

interface StateSubscription extends SubscriptionHandler {
    method: string;
    params: any[];
}

interface HealthResponse {
  isSyncing: boolean;
  peers: number;
  shouldHavePeers: boolean;
}

const ANGLICISMS: { [index: string]: string } = {
  chain_finalisedHead: 'chain_finalizedHead',
  chain_subscribeFinalisedHeads: 'chain_subscribeFinalizedHeads',
  chain_unsubscribeFinalisedHeads: 'chain_unsubscribeFinalizedHeads'
};

export class ExtensionProvider implements ProviderInterface {
  readonly #coder: RpcCoder = new RpcCoder();
  readonly #eventemitter: EventEmitter = new EventEmitter();
  readonly #handlers: Record<string, RpcStateAwaiting> = {};
  readonly #subscriptions: Record<string, StateSubscription> = {};
  readonly #waitingForId: Record<string, JsonRpcResponse> = {};
  #client: smoldot.SmoldotClient | undefined = undefined;
  #isConnected = false;

  #chainName: string;

   public constructor(name: string, spec?: string) {
     this.#chainName = name;
   }

  /**
   * @description Lets polkadot-js know we support subscriptions
   * @summary `true`
   */
  public get hasSubscriptions(): boolean {
    return true;
  }

  /**
   * @description Returns a clone of the object
   * @summary throws an error as this is not supported.
   */
  public clone(): ExtensionProvider {
    throw new Error('clone() is not supported.');
  }

  #handleRpcReponse = (res: string) => {
    l.debug(() => ['received', res]);
    const response = JSON.parse(res) as JsonRpcResponse;

    return isUndefined(response.method)
      ? this.#onMessageResult(response)
      : this.#onMessageSubscribe(response);
  }

 #onMessageResult = (response: JsonRpcResponse): void => {
    const handler = this.#handlers[response.id];

    if (!handler) {
      l.debug(() => `Unable to find handler for id=${response.id}`);

      return;
    }

    try {
      const { method, params, subscription } = handler;
      const result = this.#coder.decodeResponse(response) as string;

      // first send the result - in case of subs, we may have an update
      // immediately if we have some queued results already
      handler.callback(null, result);

      if (subscription) {
        const subId = `${subscription.type}::${result}`;

        this.#subscriptions[subId] = {
          ...subscription,
          method,
          params
        };

        // if we have a result waiting for this subscription already
        if (this.#waitingForId[subId]) {
          this.#onMessageSubscribe(this.#waitingForId[subId]);
        }
      }
    } catch (error) {
      handler.callback(error, undefined);
    }

    delete this.#handlers[response.id];
  }

  #onMessageSubscribe = (response: JsonRpcResponse): void => {
    const method = ANGLICISMS[response.method as string] || response.method || 'invalid';
    const subId = `${method}::${response.params.subscription}`;
    const handler = this.#subscriptions[subId];
    if (!handler) {
      // store the response, we could have out-of-order subid coming in
      this.#waitingForId[subId] = response;
      l.debug(() => `Unable to find handler for subscription=${subId} responseId=${response.id}`);
      return;
    }

    // housekeeping
    delete this.#waitingForId[subId];

    try {
      const result = this.#coder.decodeResponse(response);

      handler.callback(null, result);
    } catch (error) {
      handler.callback(error, undefined);
    }
  }

  /**
   * @description "Connect" the WASM client - starts the smoldot WASM client
   */
  public connect(): Promise<void> {
    const initData = {
      id: 1,
      message: JSON.stringify({
        type: 'associate',
        payload: this.#chainName
      }),
      origin: EXTENSION_ORIGIN
    }
    window.postMessage(initData, '*');
    window.addEventListener('message', ({data}) => {
      this.#handleRpcReponse(data?.message);
    });
    this.#isConnected = true;
    this.emit('connected');

    return Promise.resolve();
  }

  /**
   * @description Manually "disconnect" - drops the reference to the WASM client
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async disconnect(): Promise<void> {
    console.log('this wont be implemented');
  }

  /**
   * @summary Whether the node is connected or not.
   * @return {boolean} true if connected
   */
  public get isConnected (): boolean {
    return this.#isConnected;
  }

  /**
   * @summary Listen to provider events - in practice the smoldot provider only
   * emits a `connected` event after successfully starting the smoldot client
   * and `disconnected` after `disconnect` is called.
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
   * @summary Send an RPC request  the wasm client
   * @param method The RPC methods to execute
   * @param params Encoded paramaters as applicable for the method
   * @param subscription Subscription details (internally used by `subscribe`)
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
        const id = this.#coder.getId();

        const callback = (error?: Error | null, result?: any): void => {
          error
            ? reject(error)
            : resolve(result);
        };

        l.debug(() => ['calling', method, json]);

        this.#handlers[id] = {
          callback,
          method,
          params,
          subscription
        };

        // this.#client.send_json_rpc(json);
        // Post it to backgroudn for json_rpc (type: rpc, payload) -> And background should send it to respective client
        window.postMessage({
          id: Math.random(),
          message: JSON.stringify({
            type: 'rpc',
            payload: json,
            subscription: !!subscription
          }),
          origin: EXTENSION_ORIGIN
        }, '*');
    });
  }

  /**
   * @name subscribe
   * @summary Allows subscribing to a specific event.
   * @param  {string}                     type     Subscription type
   * @param  {string}                     method   Subscription method
   * @param  {any[]}                      params   Parameters
   * @param  {ProviderInterfaceCallback}  callback Callback
   * @return {Promise<number|string>}     Promise resolving to the id of the subscription you can use with [[unsubscribe]].
   *
   * @example
   * <BR>
   *
   * ```javascript
   * const provider = new ExtensionProvider(client);
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
    // the "method" property of the JSON response to this subscription
    type: string,
    // the "method" property of the JSON request to register the subscription
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[],
    callback: ProviderInterfaceCallback
  ): Promise<number | string> {
    const id = await this.send(method, params, { callback, type });

    return id;
  }

  /**
   * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
   */
  public async unsubscribe(
    type: string,
    method: string,
    id: number | string
  ): Promise<boolean> {
    const subscription = `${type}::${id}`;

    if (isUndefined(this.#subscriptions[subscription])) {
      l.debug(() => `Unable to find active subscription=${subscription}`);

      return false;
    }

    delete this.#subscriptions[subscription];

    return await this.send(method, [id]) as Promise<boolean>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(type: ProviderInterfaceEmitted, ...args: any[]): void {
    this.#eventemitter.emit(type, ...args);
  }
}
