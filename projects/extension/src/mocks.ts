/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@jest/globals';
import { ConnectionManagerInterface } from './background/types';
import { 
  MessageToManager, 
  MessageFromManager 
} from '@substrate/connect-extension-protocol';
import { SmoldotChain } from 'smoldot';

export class MockPort implements chrome.runtime.Port {
  sender: any;
  #messageListeners = [];
  #disconnectListeners = [];
  readonly name: string;

  constructor(name: string) {
    this.name = name;
    this.sender = { url: 'http://test.com/', tab: { id: 1234 } };
  }

  postMessage: (message: any) => void = jest.fn();
  disconnect: () => void = jest.fn();

  setTabId(id: number): void {
    this.sender.tab.id = id;
  }

  triggerMessage(message: MessageFromManager | MessageToManager): void {
    this.#messageListeners.forEach((l: any) => {
      l(message);
    });
  }

  triggerDisconnect(): void {
    this.#disconnectListeners.forEach((l: any) => {
      l();
    });
  }

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

  addChain (): Promise<SmoldotChain> {
    return Promise.resolve({
      sendJsonRpc: jest.fn(),
      remove: jest.fn()
    } as SmoldotChain);
  }

  registerApp: () => void = jest.fn();
  unregisterApp: () => void = jest.fn();
}

export class ErroringMockConnectionManager implements ConnectionManagerInterface {

  addChain (): Promise<SmoldotChain> {
    return Promise.reject(new Error('Invalid chain spec'));
  }

  registerApp: () => void = jest.fn();
  unregisterApp: () => void = jest.fn();
}
