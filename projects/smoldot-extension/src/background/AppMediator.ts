import { 
  AppMessage, 
  ExtensionMessage, 
  AppState, 
  MessageIDMapping, 
  SubscriptionMapping,
  ClientManagerInterface
} from './types';
import { SmoldotClientManager } from './SmoldotClientManager';

export class AppMediator {
  readonly #name: string;
  readonly #port: chrome.runtime.Port;
  // REM: what to do about the fact these might be undefined?
  readonly #tabId: number | undefined;
  readonly #url: string | undefined;
  readonly #manager: ClientManagerInterface;
  #smoldotName: string | undefined  = undefined;
  #state: AppState = 'connected';
  readonly subscriptions: SubscriptionMapping[];
  readonly requests: MessageIDMapping[];

  constructor(name: string, port: chrome.runtime.Port, manager: ClientManagerInterface) {
    this.#name = name;
    this.subscriptions = [];
    this.requests = [];
    this.#port = port;
    // REM: `sender` is guaranteed to be defined because we know this port came
    // from a handler for chrome.runtime.onConnect `tab` is guaranteed to be
    // defined because our content script will only run in a tab.
    this.#tabId = port.sender?.tab?.id;
    this.#url = port.sender?.url;
    this.#manager = manager;
    this.#port.onMessage.addListener(this.#handlePortMessage);
    this.#port.onDisconnect.addListener(() => { this.#handleDisconnect(false) });
  }

  get name() {
    return this.#name;
  }

  get tabId() {
    return this.#tabId;
  }

  get url() {
    return this.#url;
  }

  get state() {
    return this.#state;
  }

  #sendError = (message: string) => {
    const error: ExtensionMessage = { type: 'error', payload: message };
    this.#port.postMessage(error);
  }

  processSmoldotMessage(message: any):  boolean {
    // subscription message
    if (message.method) {
      if(!message.result?.params?.subscription) {
        throw new Error('Got a subscription message without a subscription id');
      }

      const sub = this.subscriptions.find(s => s.subID == message.params.subscription);
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
      sub.subID = message.result;
    }

    // change the message ID to the ID the app is expecting
    message.id = request.appID
    this.#port.postMessage({ type: 'rpc', payload: JSON.stringify(message) });

    return true;
  }

  #handleRpcRequest = (message: string) => {
    if (this.#state !== 'ready' || this.#smoldotName === undefined) {
      const message = this.#state === 'connected'
        ? `The app is not associated with a blockchain client`
        : `The app is ${this.#state}`;

      const error: ExtensionMessage = { type: 'error', payload: message };
      this.#port.postMessage(error);
      return;
    }

    const parsed =  JSON.parse(message);
    const appID = parsed.id;
    const smoldotID = this.#manager.sendRpcMessageTo(this.#smoldotName, parsed);
    this.requests.push({ appID, smoldotID });
  }

  #handleAssociateRequest = (name: string) => {
    if (this.#state !== 'connected') {
      this.#sendError(`Cannot reassociate, app is already associated with ${this.#smoldotName}`);
      return;
    }

    if (!this.#manager.hasClientFor(name)) {
      this.#sendError(`Extension does not have client for ${name}`);
      return;
    }

    this.#smoldotName = name;
    this.#state = 'ready';
    return;
  }

  #handlePortMessage = (message: AppMessage) => {
    if (message.type == 'associate') {
      this.#handleAssociateRequest(message.payload);
      return;
    }

    if (message.type === 'rpc') {
      this.#handleRpcRequest(message.payload);
      return;
    }

    // Should be unreachable - you forgot to extend the AppMessageType
    throw new Error(`Unrecognised message type: ${message.type}`);
  }

  disconnect() {
    this.#handleDisconnect(true);
  }

  #handleDisconnect = (notify: boolean) => {
    this.#state = 'disconnecting';
    // TODO: clean up subs
    // TODO: send disconnected message if it was requested 
  }
}
