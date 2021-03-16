import { AppMediator } from './AppMediator';
import { AppMessage, ConnectionManagerInterface } from './types';

export class MockPort implements chrome.runtime.Port {
  sender: any;
  #messageListeners = [];
  #disconnectListeners = [];
  readonly name: string;

  constructor(name: string) {
    this.name = name;
    this.sender = { url: 'http://test.com/', tab: { id: 1234 } };
  }

  triggerMessage(message: AppMessage) {
    this.#messageListeners.forEach((l: any) => {
      l(message);
    });
  }

  triggerDisconnect() {
    this.#disconnectListeners.forEach((l: any) => {
      l();
    });
  }

  postMessage = jest.fn();
  disconnect = () => {};
  onMessage = {
    addListener: (listener: never) => {
      this.#messageListeners.push(listener);
    }
  } as any;
  onDisconnect = {
    addListener: (listener: never) => {
      this.#disconnectListeners.push(listener);
    }
  } as any;
}

export class MockConnectionManager implements ConnectionManagerInterface {
  readonly #willFindClient: boolean;
  lastId = 0;


  constructor(willFindClient: boolean) {
    this.#willFindClient = willFindClient;
  }

  registerAppWithSmoldot(app: AppMediator, name: string) {
    return;
  }

  hasClientFor = (name: string) => {
    return this.#willFindClient;
  };

  sendRpcMessageTo = (name: string, message: any) => {
    return ++this.lastId;
  };
}


