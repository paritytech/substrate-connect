import EventEmitter from 'eventemitter3';
import {
  AppMessage,
  ExtensionMessage
} from '../types';
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

export class AppMediator extends (EventEmitter as { new(): StateEmitter }) {
  readonly #name: string;
  readonly #appName: string;
  readonly #port: chrome.runtime.Port;
  // REM: what to do about the fact these might be undefined?
  readonly #tabId: number | undefined;
  readonly #url: string | undefined;
  readonly #manager: ConnectionManagerInterface;
  #smoldotName: string | undefined  = undefined;
  #state: AppState = 'connected';
  readonly subscriptions: SubscriptionMapping[];
  readonly requests: MessageIDMapping[];
  highestUAppRequestId = 0;
  #notifyOnDisconnected = false;

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
    this.#port.onMessage.addListener(this.#handlePortMessage);
    this.#port.onDisconnect.addListener(() => { this.#handleDisconnect(false) });
  }

  get name(): string {
    return this.#name;
  }

  get appName(): string {
    return this.#appName;
  }

  get smoldotName(): string {
    return this.#smoldotName || '';
  }

  get tabId(): number | undefined {
    return this.#tabId;
  }

  get url(): string | undefined {
    return this.#url;
  }

  get state(): AppState {
    return this.#state;
  }

  // State helpers that return clones of the internal state - useful for testing
  cloneRequests(): MessageIDMapping[] { 
    return JSON.parse(JSON.stringify(this.requests)) as MessageIDMapping[];
  }

  cloneSubscriptions(): SubscriptionMapping[] { 
    return JSON.parse(JSON.stringify(this.subscriptions)) as SubscriptionMapping[];
  }

  #sendError = (message: string): void => {
    const error: ExtensionMessage = { type: 'error', payload: message };
    this.#port.postMessage(error);
  }

  #checkForDisconnected = (): void => {
      if (this.requests.length === 0) {
        // All our unsubscription messages have been replied to
        this.#state = 'disconnected';
        this.#manager.unregisterApp(this, this.#smoldotName as string);
      }
  }

  processSmoldotMessage(message: JsonRpcResponse): boolean {
    if (this.#state === 'disconnected') {
      // Shouldn't happen - we remove the AppMediator from the smoldot's apps
      // when we disconnect (below).
      console.error(`Asked a disconnected UApp (${this.name}) to process a message from ${this.#smoldotName as string}`);
      return false;
    }

    if (this.#state === 'disconnecting') {
      // Handle responses to our unsubscription messages
      const request = this.requests.find(r => r.smoldotID === message.id);
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
    const request = this.requests.find(r => r.smoldotID === message.id);
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

  #handleRpcRequest = (message: string, subscription?: boolean): void => {
    if (this.#state !== 'ready' || this.#smoldotName === undefined) {
      const message = this.#state === 'connected'
        ? `The app is not associated with a blockchain client`
        : `The app is ${this.#state}`;

      const error: ExtensionMessage = { type: 'error', payload: message };
      this.#port.postMessage(error);
      return;
    }

    const parsed =  JSON.parse(message) as JsonRpcRequest;
    const appID = parsed.id as number;
    this.highestUAppRequestId = appID;

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

    const smoldotID = this.#manager.sendRpcMessageTo(this.#smoldotName, parsed);
    this.requests.push({ appID, smoldotID });
  }

  #handleAssociateRequest = (name: string): void => {
    if (this.#state !== 'connected' && this.#smoldotName) {
      this.#sendError(`Cannot reassociate, app is already associated with ${this.#smoldotName}`);
      return;
    }
    if (!this.#manager.hasClientFor(name)) {
      this.#sendError(`Extension does not have client for ${name}`);
      return;
    }
    this.#manager.registerApp(this, name);
    this.#smoldotName = name;
    this.#state = 'ready';
    this.emit('stateChanged');
    return;
  }

  #handlePortMessage = (message: AppMessage): void => {
    if (message.type == 'associate') {
      this.#handleAssociateRequest(message.payload);
      return;
    }

    if (message.type === 'rpc') {
      this.#handleRpcRequest(message.payload, message.subscription);
      return;
    }
  }

  disconnect(): void {
    this.#handleDisconnect(true);
  }

  #sendUnsubscribe = (sub: SubscriptionMapping): void => {
    // use one higher than we've seen before from the UApp.  The UApp is now
    // disconnnecting so this won't ever be reused as we no longer
    // accept incoming RPC send requests
    const appID = ++this.highestUAppRequestId;
    const unsubRequest = {
      id: appID,
      jsonrpc: '2.0',
      method: sub.method,
      params: [ sub.subID ]
    }

    // send the unsubscribe message
    const smoldotID = this.#manager.sendRpcMessageTo(this.#smoldotName as string,  unsubRequest);
    // track the request so we know when its completed
    this.requests.push({ appID, smoldotID });
  };

  #handleDisconnect = (notify: boolean): void => {
    if (this.#state === 'disconnecting' || this.#state === 'disconnected') {
      throw new Error('Cannot disconnect - already disconnecting / disconnected');
    }

    this.#state = 'disconnecting';
    this.#notifyOnDisconnected = notify;
    this.subscriptions.forEach(this.#sendUnsubscribe);
    // remove all the subscriptions
    this.subscriptions.splice(0, this.subscriptions.length);
    this.#checkForDisconnected();
  }
}
