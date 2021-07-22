/* eslint-disable @typescript-eslint/no-unsafe-call */
import EventEmitter from 'eventemitter3';
import {
  MessageToManager,
  MessageFromManager
} from '@substrate/connect-extension-protocol';
import {
  AppState,
  ConnectionManagerInterface,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcResponseSubscription,
  MessageIDMapping,
  StateEmitter,
  SubscriptionMapping
} from './types';

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
  #state: AppState = 'connected';
  /** subscriptions is all the active message subscriptions this ap[ has */
  readonly subscriptions: SubscriptionMapping[];
  /**
   * requests is all the requests this app has sent that have not been replied
   * to yet
   */
  readonly requests: MessageIDMapping[];

  #highestUAppRequestId = 0;

  /**
   * @param port - the open communication port between the app's content page
   * and the extension background.
   * @param manager - the extension's connection manager that keeps track of
   * all the apps and smoldots
   */
  constructor(port: chrome.runtime.Port, manager: ConnectionManagerInterface) {
    super();
    this.subscriptions = [];
    this.requests = [];
    this.#appName = port.name.substr(0, port.name.indexOf('::'));
    this.#name = port.name;
    this.#port = port;
    this.#tabId = port.sender?.tab?.id;
    this.#url = port.sender?.url;
    this.#manager = manager;
    // Open listeners for the incoming rpc messages
    this.#port.onMessage.addListener(this.#handleRpcRequest);
    this.#port.onDisconnect.addListener(() => { this.#handleDisconnect() });
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

  /** 
   * chainName is the name of the smoldot client to talk to; this is the
   * name of the blockchain network.
   */
  get chainName(): string {
    return this.#chainName || '';
  }

  /** tabId is the tabId of the app in the browser */
  get tabId(): number | undefined {
    return this.#tabId;
  }

  /** url is the url of the page that is running the app */
  get url(): string | undefined {
    return this.#url;
  }

  /** 
   * state keeps track of whether the app is connected, disconnecting or 
   * disconnected.
   */
  get state(): AppState {
    return this.#state;
  }

  // State helpers that return clones of the internal state - useful for testing
  
  /**
   * cloneRequests returns a clone of the state of in flight requests for the
   * app that have not been replied to yet.
   */
  cloneRequests(): MessageIDMapping[] {
    return JSON.parse(JSON.stringify(this.requests)) as MessageIDMapping[];
  }

  /**
   * cloneSubscriptions returns a clone of the state of active RPC 
   * subscriptions
   */
  cloneSubscriptions(): SubscriptionMapping[] {
    return JSON.parse(JSON.stringify(this.subscriptions)) as SubscriptionMapping[];
  }

  #sendError = (message: string): void => {
    const error: MessageFromManager = { type: 'error', payload: message };
    this.#port.postMessage(error);
  }

  #checkForDisconnected = (): void => {
      if (this.requests.length === 0) {
        // All our unsubscription messages have been replied to
        this.#state = 'disconnected';
        this.#manager.unregisterApp(this, this.#chainName as string);
      }
  }

  /**
   * processSmoldotMessage is responsible for figuring out whether this app
   * should handle the message received by its associated smoldot client
   * and taking appropriate action. It takes care of tracking subscriptions and
   * unsubscriptions, forwarding messages to the app and keeping track of when
   * a disconnecting app can become disconnected.
   *
   * @param message - the JSON RPC message the client received
   * @returns true if this app handled the message otherwise false
   */
  processSmoldotMessage(message: JsonRpcResponse): boolean {
    if (this.#state === 'disconnected') {
      // Shouldn't happen - we remove the AppMediator from the smoldot's apps
      // when we disconnect (below).
      console.error(`Asked a disconnected UApp (${this.name}) to process a message from ${this.#chainName as string}`);
      return false;
    }

    if (this.#state === 'disconnecting') {
      // Handle responses to our unsubscription messages
      const request = this.requests.find(r => r.chainID === message.id);
      if (request !== undefined) {
        // We don't forward the RPC message to the UApp - it's not there any more
        const idx = this.requests.indexOf(request);
        this.requests.splice(idx, 1);
        this.#checkForDisconnected();
        return true;
      }
    }

    // subscription message
    if (message.method) {
      if(!(message as JsonRpcResponseSubscription).params?.subscription) {
        throw new Error('Got a subscription message without a subscription id');
      }

      const sub = this.subscriptions.find(s => s.subID == message.params?.subscription);
      if (!sub) {
        // not our subscription
        return false;
      }

      this.#port.postMessage({ type: 'rpc', payload: JSON.stringify(message) });
      return true;
    }

    // regular message
    const request = this.requests.find(r => r.chainID === message.id);
    if (request === undefined) {
      // Not our message
      return false;
    }

    // let's process this message - it's for us
    const idx = this.requests.indexOf(request);
    this.requests.splice(idx, 1);

    // is this a response telling us the subID for a subscription?
    const sub = this.subscriptions.find(s => s.appIDForRequest == request.appID);
    if (sub) {
      if (sub.subID) {
        throw new Error('Found a subscription for this request ID but it already had a sub id');
      }

      if (!message.result) {
        throw new Error('Got a message which we expected to return us a subid but it wasnt there');
      }

      sub.subID = message.result as (string | number | undefined);
    }

    // change the message ID to the ID the app is expecting
    message.id = request.appID
    this.#port.postMessage({ type: 'rpc', payload: JSON.stringify(message) });

    return true;
  }

  #handleRpcRequest = (msg: MessageToManager): void => {
    if (msg.type !== 'rpc') {
      console.warn(`Unrecognised message type ${msg.type} received from content script`);
      return;
    }

    const { payload: message, subscription } = msg;

    const parsed =  JSON.parse(message) as JsonRpcRequest;
    const appID = parsed.id as number;
    this.#highestUAppRequestId = appID;

    if (subscription) {
      // register a new sub that is waiting for a sub ID
      this.subscriptions.push({
        appIDForRequest: appID,
        subID: undefined,
        method: parsed.method
      });
    }

    // TODO: what about unsubscriptions requested by the UApp - we need to remove
    // the subscription from our subscriptions state
    const chainID = this.#manager.sendRpcMessageTo(this.#chainName as string, parsed);
    this.requests.push({ appID, chainID });
  }

  /** 
   * associate parses the name of the network from the port name and associates
   * the app with the smoldot client or sends an error and disconnects the port
   * if there is no smoldot client for the network.
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
    if (!this.#manager.hasClientFor(this.#chainName)) {
      this.#sendError(`Extension does not have client for ${this.#chainName}`);
      this.#port.disconnect();
      return false;
    }
    this.#manager.registerApp(this, this.#chainName);
    return true;
  }

  /** 
   * disconnect tells the app to clean up its state and unsubscribe from any
  * active subscriptions and ultimately disconnects the communication port.
  */
  disconnect(): void {
    this.#handleDisconnect();
  }

  #sendUnsubscribe = (sub: SubscriptionMapping): void => {
    // use one higher than we've seen before from the UApp.  The UApp is now
    // disconnnecting so this won't ever be reused as we no longer
    // accept incoming RPC send requests
    const appID = ++this.#highestUAppRequestId;
    const unsubRequest = {
      id: appID,
      jsonrpc: '2.0',
      method: sub.method,
      params: [ sub.subID ]
    }

    // send the unsubscribe message
    const chainID = this.#manager.sendRpcMessageTo(this.#chainName as string,  unsubRequest);
    // track the request so we know when its completed
    this.requests.push({ appID, chainID });
  };

  #handleDisconnect = (): void => {
    if (this.#state === 'disconnecting') {
      throw new Error('Cannot disconnect - already disconnecting / disconnected');
    } else if (this.#state === 'disconnected') {
      throw new Error('Cannot disconnect - already disconnected');
    }

    this.#state = 'disconnecting';
    this.subscriptions.forEach(this.#sendUnsubscribe);
    // remove all the subscriptions
    this.subscriptions.splice(0, this.subscriptions.length);
    this.#checkForDisconnected();
  }
}
