import { jest } from '@jest/globals';
import { AppMediator } from './background/AppMediator';
import { ConnectionManagerInterface } from './background/types';
import { AppMessage } from './types';

export class MockPort implements chrome.runtime.Port {
  sender: any;
  #messageListeners = [];
  #disconnectListeners = [];
  readonly name: string;

  constructor(name: string) {
    this.name = name;
    this.sender = { url: 'http://test.com/', tab: { id: 1234 } };
  }

  setTabId(id: number): void {
    this.sender.tab.id = id;
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

  registerApp(app: AppMediator, name: string): void {
    return;
  }

  unregisterApp(app: AppMediator, name: string): void {
    return;
  }

  hasClientFor = (name: string): boolean => {
    return this.#willFindClient;
  };

  sendRpcMessageTo = (name: string, message: any): number => {
    return ++this.lastId;
  };
}


