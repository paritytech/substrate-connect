// Copyright 2018-2021 @paritytech/substrate-connect authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {RpcCoder} from '@polkadot/rpc-provider/coder';
import {
  JsonRpcResponse,
  ProviderInterface,
  ProviderInterfaceCallback,
  ProviderInterfaceEmitCb,
  ProviderInterfaceEmitted,
} from '@polkadot/rpc-provider/types';
import { assert, logger } from '@polkadot/util';
import EventEmitter from 'eventemitter3';
import * as smoldot from 'smoldot';
import database, { Database } from './Database';
import { HealthCheckError } from './errors';
import { isUndefined } from '../utils';

const l = logger('smoldot-provider');

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

/*
 * Number of milliseconds to wait between checks to see if we have any 
 * connected peers in the smoldot client
 */
const CONNECTION_STATE_PINGER_INTERVAL = 2000;

/**
 * @name SmoldotProvider
 *
 * @description The SmoldotProvider allows interacting with a smoldot-based
 * WASM light client.  I.e. without doing RPC to a remote node over HTTP
 * or websockets
 * 
 * @example
 * ```javascript
 * import readFileSync from 'fs';
 * import Api from '@polkadot/api/promise';
 * import { SmoldotProvider } from '../';
 *
 * const chainSpec = readFileSync('./path/to/chainSpec.json');
 * const provider = new SmoldotProvider(chainSpec);
 * const api = new Api(provider);
 * ```
 * @example
 * ```javascript
 * import readFileSync from 'fs';
 * import Api from '@polkadot/api/promise';
 * import { SmoldotProvider, database } from '../';
 *
 * const chainSpec = readFileSync('./path/to/polkadot.json');
 * const pp = new SmoldotProvider(chainSpec);
 * const polkadotApi = new Api(pp);
 *
 * const chainSpec = readFileSync('./path/to/kusama.json');
 * const kp = new SmoldotProvider(chainSpec, databse('kusama'));
 * const kusamaApi = new Api(pp);
 * ```
 */
export class SmoldotProvider implements ProviderInterface {
  #chainSpec: string;
  readonly #coder: RpcCoder = new RpcCoder();
  readonly #eventemitter: EventEmitter = new EventEmitter();
  readonly #handlers: Record<string, RpcStateAwaiting> = {};
  readonly #subscriptions: Record<string, StateSubscription> = {};
  readonly #waitingForId: Record<string, JsonRpcResponse> = {};
  #connectionStatePingerId: ReturnType<typeof setInterval> | null;
  #isConnected = false;
  #client: smoldot.SmoldotClient | undefined = undefined;
  #db: Database;
  // reference to the smoldot module so we can defer loading the wasm client
  // until connect is called
  #smoldot: smoldot.Smoldot;

  /*
   * How frequently to see if we have any peers
   */
  healthPingerInterval = CONNECTION_STATE_PINGER_INTERVAL;

   /**
   * @param {string}   chainSpec  The chainSpec for the WASM client
   * @param {Database} db         `Database` for saving chain state. Default is detected based on envionnment and 
   *                              given a generic name.  You must use a unique names if you are connecting to multiple 
   *                              chains. E.g. `database('polkadot')`
   * @param {any}      sm         Optional (only used for testing) defaults to the actual smoldot module
   */
   public constructor(chainSpec: string, db?: Database, sm?: any) {
    this.#chainSpec = chainSpec;
    this.#smoldot = sm || smoldot;
    this.#db = db || database();
    this.#connectionStatePingerId = null;
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
  public clone(): SmoldotProvider {
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

  #simulateLifecycle = (health: HealthResponse) => {
    // development chains should not have peers so we only emit connected
    // once and never disconnect
    if (health.shouldHavePeers == false) {
      
      if (!this.#isConnected) {
        this.#isConnected = true;
        this.emit('connected');
        l.debug(`emitted CONNECTED`);
        return;
      }

      return;
    }

    const peerCount = health.peers;

    l.debug(`Simulating lifecylce events from system_health`);
    l.debug(`isConnected: ${this.#isConnected}, new peerCount: ${peerCount}`);

    if (this.#isConnected && peerCount > 0) {
      // still connected
      return;
    }

    if (this.#isConnected && peerCount === 0) {
      this.#isConnected = false;
      this.emit('disconnected');
      l.debug(`emitted DISCONNECTED`);
      return;
    }

    if (!this.#isConnected && peerCount > 0) {
      this.#isConnected = true;
      this.emit('connected');
      l.debug(`emitted CONNECTED`);
      return;
    }

    // still not connected
  }

  #checkClientPeercount = () => {
    this.send('system_health', [])
      .then(this.#simulateLifecycle)
      .catch(error => this.emit('error', new HealthCheckError(error)));
  }

  /**
   * @description "Connect" the WASM client - starts the smoldot WASM client
   */
  public async connect(): Promise<void> {
    assert(!this.#client && !this.#isConnected, 'Client is already connected');

    return this.#smoldot.start({
        database_content: this.#db.load(),
        chain_spec: this.#chainSpec,
        max_log_level: 3, /* no debug/trace messages */
        json_rpc_callback: (response: string) => {
            this.#handleRpcReponse(response);
        },
        database_save_callback: (database_content: string) => { 
          l.debug('saving database', database_content);
          if (this.#db) {
            this.#db.save(database_content);
          }
        }
      })
      .then((client: smoldot.SmoldotClient) => {
        this.#client = client;
        this.#connectionStatePingerId = setInterval(
          this.#checkClientPeercount, this.healthPingerInterval);
      })
      .catch((error: Error) => {
        this.emit('error', error);
        return Promise.reject(error);
      });
  }

  /**
   * @description Manually "disconnect" - drops the reference to the WASM client
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async disconnect(): Promise<void> {
    if (this.#client) {
      this.#client = undefined;
    }

    if (this.#connectionStatePingerId !== null) {
      clearInterval(this.#connectionStatePingerId);
    }

    this.#isConnected = false;
    this.emit('disconnected');

    return Promise.resolve();
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
        assert(this.#client, 'Client is not initialised');
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

      this.#client.send_json_rpc(json);
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
   * const provider = new SmoldotProvider(client);
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
