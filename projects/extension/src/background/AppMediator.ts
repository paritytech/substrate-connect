import { 
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcResponseSubscription,
} from './types';
import { 
  AppMessage, 
  ExtensionMessage, 
  AppState, 
  MessageIDMapping, 
  SubscriptionMapping,
  ConnectionManagerInterface
} from './types';

export class AppMediator {
  readonly #name: string;
  readonly #port: chrome.runtime.Port;
  // REM: what to do about the fact these might be undefined?
  readonly #tabId: number | undefined;
  readonly #url: string | undefined;
  readonly #manager: ConnectionManagerInterface;
  #smoldotName: string | undefined  = undefined;
  #state: AppState = 'connected';
  readonly subscriptions: SubscriptionMapping[];
  readonly requests: MessageIDMapping[];

  constructor(name: string, port: chrome.runtime.Port, manager: ConnectionManagerInterface) {
    this.subscriptions = [];
    this.requests = [];
    // Assign all necessery variables to privates
    this.#name = name;
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

  processSmoldotMessage(message: JsonRpcResponse): boolean {
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

    // is this a response telling us the subID for a subcscription?
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
    const appID = parsed.id;
    if (subscription) {
      // register a new sub that is waiting for a sub ID
      this.subscriptions.push({ 
        appIDForRequest: appID, 
        subID: undefined, 
        method: parsed.method 
      });
    }

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
    this.#manager.registerAppWithSmoldot(this, name);
    this.#smoldotName = name;
    this.#state = 'ready';
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

  #handleDisconnect = (notify: boolean): void => {
    console.log(`Disconnecting and notify is set to ${notify.toString()}`);
    this.#state = 'disconnecting';
    // TODO: clean up subs
    // TODO: send disconnected message if it was requested 
  }
}
