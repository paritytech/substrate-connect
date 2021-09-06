/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as smoldot from '@substrate/smoldot-light';
import EventEmitter from 'eventemitter3';
import {
  MessageToManager,
  MessageFromManager
} from '@substrate/connect-extension-protocol';
import {
  AppState,
  ConnectionManagerInterface,
  StateEmitter,
} from './types';
import { SmoldotChain, HealthChecker, SmoldotHealth } from '@substrate/smoldot-light';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import polkadot from '../../public/assets/polkadot.json';

type RelayType = Map<string, string>;

export const relayChains: RelayType = new Map<string, string>([
  ["polkadot", JSON.stringify(polkadot)],
  ["kusama", JSON.stringify(kusama)],
  ["westend", JSON.stringify(westend)]
])

/**
 * AppMediator is the class that represents and manages an app's connection to
 * a blockchain network.  N.B. an app that connects to multiple nblockchain
 * networks will have multiple AppMediators in the extension.  Each app-network
 * relationship has its own communication port between the content page and the
 * background
 */
export class AppMediator extends (EventEmitter as { new(): StateEmitter }) {
  readonly #name: string;
  readonly #appName: string;
  readonly #port: chrome.runtime.Port;
  // REM: what to do about the fact these might be undefined?
  readonly #tabId: number | undefined;
  readonly #url: string | undefined;
  readonly #manager: ConnectionManagerInterface;
  #chainName: string | undefined  = undefined;
  #chain: SmoldotChain | undefined;
  #state: AppState = 'connected';
  #pendingRequests: string[] = [];
  #healthChecker: HealthChecker | undefined = undefined;
  #healthStatus: SmoldotHealth | undefined = undefined;

  /**
   * @param port - the open communication port between the app's content page
   * and the extension background.
   * @param manager - the extension's connection manager that keeps track of
   * all the apps and smoldots
   */
  constructor(port: chrome.runtime.Port, manager: ConnectionManagerInterface) {
    super();
    this.#appName = port.name.substr(0, port.name.indexOf('::'));
    this.#name = port.name;
    this.#port = port;
    this.#tabId = port.sender?.tab?.id;
    this.#url = port.sender?.url;
    this.#manager = manager;
    // Open listeners for the incoming rpc messages
    this.#port.onMessage.addListener(this.#handleMessage);
    this.#port.onDisconnect.addListener(() => { this.#handleDisconnect() });
    this.#healthChecker = (smoldot as any).healthChecker();
  }

  /** 
   * associate parses the name of the network from the port name.
   * It sends an error and disconnects the port if the port name is not in a
   * valid format.
   *
   * @remarks
   * This MUST be called straight after constructing an AppMediator
   *
   * @returns true if it associated succesfully otherwise false
   */
  public associate(): boolean {
    const splitIdx = this.#port.name.indexOf('::');
    if (splitIdx === -1) {
      this.#sendError(`Invalid port name ${this.#port.name} expected <app_name>::<chain_name>`);
      this.#port.disconnect();
      return false;
    }
    this.#chainName = this.#port.name.substr(splitIdx + 2, this.#port.name.length);
    return true;
  }

  /** 
   * name is the name of the communication port 
   * 
   * @remarks
   *
   * The name is a concatenation of the app's display name provided by the 
   * app developer and the name of the blockchain network to talk to in the
   * format \<app_name\>::\<chain_name\>
   */
  get name(): string {
    return this.#name;
  }

  /** appName is the display name of the app provided by the app developer */
  get appName(): string {
    return this.#appName;
  }

  /** healthStatus returns the latest health status
   * of app as set from the callback
   */
  get healthStatus(): SmoldotHealth {
    return this.#healthStatus as SmoldotHealth;
  }

  /** 
   * chainName is the name of the chain to talk to; this is the
   * name of the blockchain network.
   */
  get chainName(): string {
    return this.#chainName || '';
  }

  /** 
   * returns the chain that the app is connected to
   */
  get chain(): SmoldotChain | undefined {
    return this.#chain;
  }

  /** tabId is the tabId of the app in the browser */
  get tabId(): number | undefined {
    return this.#tabId;
  }

  /** url is the url of the page that is running the app */
  get url(): string | undefined {
    return this.#url;
  }

  /** state keeps track of whether the app is connected or disconnected. */
  get state(): AppState {
    return this.#state;
  }

  #sendError = (message: string): void => {
    const error: MessageFromManager = { type: 'error', payload: message };
    this.#port.postMessage(error);
  }

  #healthCheckCallback = (health: SmoldotHealth): void => {
    this.#healthStatus = health;
  }

  #handleSpecMessage = (msg: MessageToManager, chainName: string): void => {
    const chainSpec: string = relayChains.has(chainName) ?
      (relayChains.get(chainName) || '') : msg.payload;

    const rpcCallback = (rpc: string) => {
      const rpcResp = this.#healthChecker?.responsePassThrough(rpc);
      if (rpcResp)
            this.#port.postMessage({ type: 'rpc', payload: rpcResp })
    }

    this.#manager.addChain(chainName, chainSpec, rpcCallback, msg.relayChainName)
      .then(chain => {
        this.#chain = chain;
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.#chain && this.#healthChecker?.setSendJsonRpc(this.#chain.sendJsonRpc);
        this.#healthChecker?.start(this.#healthCheckCallback);
        // process any RPC requests that came in while waiting for `addChain`
        // to complete
        if (this.#pendingRequests.length > 0) {
          this.#pendingRequests.forEach(req => this.#healthChecker?.sendJsonRpc(req));
          this.#pendingRequests = [];
        }
      })
      .catch(e => {
        this.#sendError((e as Error).message);
        this.#port.disconnect();
        this.#manager.unregisterApp(this);
      });
  }

  #handleMessage = (msg: MessageToManager): void => {
    if (msg.type !== 'rpc' && msg.type !== 'spec') {
      console.warn(`Unrecognised message type ${msg.type} received from content script`);
      return;
    }

    const chainName = this.#chainName as string;

    if (msg.type === 'spec' && chainName) {
      return this.#handleSpecMessage(msg, chainName);
    }

    if (this.#chain === undefined) {
      // `addChain` hasn't resolved yet after the spec message so buffer the
      // messages to be sent when it does resolve
      this.#pendingRequests.push(msg.payload);
      return;
    }

    return this.#healthChecker?.sendJsonRpc(msg.payload);
  }

  /** 
   * disconnect tells the app to clean up its state and unsubscribe from any
  * active subscriptions and ultimately disconnects the communication port.
  */
  disconnect(): void {
    this.#handleDisconnect();
  }

  #dispose = (): void => {
    if (this.#chain !== undefined) {
      this.#chain.remove();
    }

    this.#manager.unregisterApp(this);
  }

  #handleDisconnect = (): void => {
    if (this.#state === 'disconnected') {
      throw new Error('Cannot disconnect - already disconnected');
    }
    this.#dispose();

    this.#state = 'disconnected';
  }
}
